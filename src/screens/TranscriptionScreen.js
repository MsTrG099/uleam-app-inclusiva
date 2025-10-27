import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { guardarTranscripcion, crearNotificacion } from '../database/operations';
import { ASSEMBLYAI_API_KEY } from '@env';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

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
      <LinearGradient
        colors={['#1e88e5', '#1565c0']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="waveform" size={24} color="#fff" style={styles.headerIcon} />
          <Text style={styles.headerText}>Transcripción con IA</Text>
        </View>
        <Text style={styles.modeText}>Modelo: AssemblyAI Spanish</Text>
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.micButtonShadow}
          onPress={toggleRecording}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isRecording ? ['#e53935', '#c62828'] : ['#1e88e5', '#1565c0']}
            style={styles.micButton}
          >
            {isProcessing ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <MaterialCommunityIcons 
                name={isRecording ? "stop-circle" : "microphone"} 
                size={70} 
                color="#fff" 
              />
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.status}>
          {isProcessing
            ? 'Procesando con IA...'
            : isRecording
            ? 'Grabando... (toca para detener)'
            : 'Toca el micrófono para grabar'}
        </Text>

        <Animatable.View
          animation={transcripcion ? "fadeIn" : undefined}
          duration={600}
          style={{ width: '100%' }}
        >
          <ScrollView style={styles.transcriptionContainer}>
            {transcripcion ? (
              <Text style={styles.transcriptionText}>{transcripcion}</Text>
            ) : (
              <View style={styles.placeholderContainer}>
                <MaterialCommunityIcons name="text-box-outline" size={40} color="#ccc" />
                <Text style={styles.placeholderText}>
                  La transcripción aparecerá aquí...
                </Text>
              </View>
            )}
          </ScrollView>
        </Animatable.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="key" size={14} color="#1565c0" />
          <Text style={styles.footerNote}>
            API: {ASSEMBLYAI_API_KEY ? 'Configurada' : 'No configurada'}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="mic" size={14} color="#1565c0" />
          <Text style={styles.footerNote}>
            Permisos: {hasPermission ? 'Concedidos' : 'No concedidos'}
          </Text>
        </View>
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
    padding: 20,
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  modeText: {
    fontSize: 14,
    color: '#e3f2fd',
    marginTop: 5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  micButtonShadow: {
    borderRadius: 70,
    shadowColor: '#1e88e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
    marginBottom: 20,
  },
  micButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '500',
  },
  transcriptionContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
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
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  footer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  footerNote: {
    fontSize: 12,
    color: '#1565c0',
    marginLeft: 6,
  },
});