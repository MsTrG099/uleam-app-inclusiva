import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { guardarTranscripcion, crearNotificacion } from '../database/operations';

export default function TranscriptionScreen({ navigation }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripcion, setTranscripcion] = useState('');

  const simularTranscripcion = () => {
    if (isRecording) {
      // Detener "grabación"
      setIsRecording(false);
      
      // Simular transcripción (en Sprint 3 será real)
      const textoSimulado = 'Esta es una transcripción de prueba. En el Sprint 3 esto será voz real convertida a texto.';
      const duracion = (Math.random() * 5 + 2).toFixed(1); // 2-7 segundos
      const precision = (Math.random() * 10 + 90).toFixed(1); // 90-100%
      
      setTranscripcion(textoSimulado);
      
      // Guardar en base de datos
      const id = guardarTranscripcion(textoSimulado, parseFloat(duracion), parseFloat(precision));
      
      if (id) {
        crearNotificacion('Transcripción completada exitosamente', 'transcripcion');
        Alert.alert(
          'Transcripción guardada',
          'La transcripción se ha guardado correctamente',
          [
            { text: 'Ver historial', onPress: () => navigation.navigate('History') },
            { text: 'Nueva transcripción', onPress: () => setTranscripcion('') }
          ]
        );
      }
    } else {
      // Iniciar "grabación"
      setIsRecording(true);
      setTranscripcion('');
      
      // Simular que se detiene automáticamente después de 3 segundos
      setTimeout(() => {
        if (isRecording) {
          simularTranscripcion();
        }
      }, 3000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {isRecording ? '🎤 Grabando...' : '🎤 Presiona para hablar'}
        </Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          onPress={simularTranscripcion}
        >
          <Text style={styles.micIcon}>🎤</Text>
        </TouchableOpacity>

        <Text style={styles.status}>
          {isRecording ? 'Escuchando...' : 'Toca el micrófono para comenzar'}
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
          ℹ️ Funcionalidad STT real en Sprint 3
        </Text>
        <Text style={styles.footerNote}>
          Por ahora es una simulación
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
    backgroundColor: '#fff9e6',
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ffd700',
  },
  footerNote: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
});