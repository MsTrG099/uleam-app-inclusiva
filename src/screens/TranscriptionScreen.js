import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { guardarTranscripcion, crearNotificacion } from '../database/operations';
import { ASSEMBLYAI_API_KEY } from '@env';

const ASSEMBLYAI_API_URL = 'https://api.assemblyai.com/v2';

export default function TranscriptionScreen({ navigation }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcripcion, setTranscripcion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Se requiere acceso al micrófono para usar esta función');
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
    }
  };

  const startRecording = async () => {
    try {
      if (!hasPermission) {
        await requestPermissions();
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setTranscripcion('');
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      Alert.alert('Error', 'No se pudo iniciar la grabación');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        await transcribeAudio(uri);
      }
    } catch (error) {
      console.error('Error al detener grabación:', error);
      Alert.alert('Error', 'No se pudo detener la grabación');
    }
  };

  const transcribeAudio = async (audioUri) => {
    setIsProcessing(true);
    try {
      console.log('1. Subiendo audio a AssemblyAI...');

      const uploadResult = await FileSystem.uploadAsync(
        `${ASSEMBLYAI_API_URL}/upload`,
        audioUri,
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: {
            'authorization': ASSEMBLYAI_API_KEY,
          },
        }
      );

      const uploadData = JSON.parse(uploadResult.body);
      const audioUrl = uploadData.upload_url;

      console.log('2. Audio subido, URL:', audioUrl);
      console.log('3. Solicitando transcripción...');

      const transcriptResponse = await fetch(`${ASSEMBLYAI_API_URL}/transcript`, {
        method: 'POST',
        headers: {
          'authorization': ASSEMBLYAI_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: audioUrl,
          language_code: 'es',
        }),
      });

      const transcriptData = await transcriptResponse.json();
      const transcriptId = transcriptData.id;

      console.log('4. Transcripción iniciada, ID:', transcriptId);
      console.log('5. Esperando resultado...');

      let transcriptResult = await pollTranscript(transcriptId);

      if (transcriptResult.status === 'completed') {
        const textoTranscrito = transcriptResult.text;
        setTranscripcion(textoTranscrito);

        const duracion = transcriptResult.audio_duration || 5.0;
        const precision = transcriptResult.confidence * 100 || 95.0;

        const id = guardarTranscripcion(textoTranscrito, duracion, precision);
        if (id) {
          crearNotificacion('Transcripción completada con AssemblyAI', 'transcripcion');
          Alert.alert(
            'Transcripción exitosa',
            'La transcripción se ha guardado correctamente',
            [
              { text: 'Ver historial', onPress: () => navigation.navigate('History') },
              { text: 'Nueva transcripción', onPress: () => setTranscripcion('') }
            ]
          );
        }
      } else {
        throw new Error(`Transcripción falló: ${transcriptResult.status}`);
      }
    } catch (error) {
      console.error('ERROR COMPLETO:', error);
      Alert.alert('Error', `No se pudo transcribir el audio: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const pollTranscript = async (transcriptId) => {
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`${ASSEMBLYAI_API_URL}/transcript/${transcriptId}`, {
        headers: {
          'authorization': ASSEMBLYAI_API_KEY,
        },
      });

      const data = await response.json();

      if (data.status === 'completed' || data.status === 'error') {
        return data;
      }

      console.log(`Intento ${attempts + 1}: Estado ${data.status}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    throw new Error('Timeout esperando transcripción');
  };

  const toggleRecording = () => {
    if (Platform.OS === 'web') {
      Alert.alert('No disponible', 'Use un dispositivo móvil');
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🎤 Transcripción con IA</Text>
        <Text style={styles.modeText}>🇪🇸 Modelo: AssemblyAI Spanish</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          onPress={toggleRecording}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <Text style={styles.micIcon}>🎤</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.status}>
          {isProcessing
            ? 'Procesando con IA...'
            : isRecording
            ? 'Grabando... (toca para detener)'
            : 'Toca el micrófono para grabar'}
        </Text>

        <ScrollView style={styles.transcriptionContainer}>
          {transcripcion ? (
            <Text style={styles.transcriptionText}>{transcripcion}</Text>
          ) : (
            <Text style={styles.placeholderText}>
              La transcripción aparecerá aquí...
            </Text>
          )}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerNote}>
          Token API: {ASSEMBLYAI_API_KEY ? 'Configurado ✓' : 'No configurado ⚠️'}
        </Text>
        <Text style={styles.footerNote}>
          Permisos: {hasPermission ? 'Concedidos ✓' : 'No concedidos ⚠️'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  modeText: {
    fontSize: 14,
    color: '#e0f0ff',
    marginTop: 5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: '#ff3b30',
  },
  micIcon: {
    fontSize: 50,
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  transcriptionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transcriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    alignItems: 'center',
  },
  footerNote: {
    fontSize: 12,
    color: '#1565c0',
    marginBottom: 5,
  },
});