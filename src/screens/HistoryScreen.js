import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { obtenerTranscripciones, eliminarTranscripcion } from '../database/operations';

export default function HistoryScreen() {
  const [transcripciones, setTranscripciones] = useState([]);

  useEffect(() => {
    cargarTranscripciones();
  }, []);

  const cargarTranscripciones = () => {
    const datos = obtenerTranscripciones();
    setTranscripciones(datos);
  };

  const confirmarEliminar = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de eliminar esta transcripción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminarTranscripcion(id);
            cargarTranscripciones();
          },
        },
      ]
    );
  };

  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.fecha}>{formatearFecha(item.fecha_creacion)}</Text>
        <TouchableOpacity
          onPress={() => confirmarEliminar(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.texto}>{item.texto_transcrito}</Text>
      
      <View style={styles.metadatos}>
        <Text style={styles.metadato}>⏱️ {item.duracion_audio}s</Text>
        <Text style={styles.metadato}>🎯 {item.precision_ia}%</Text>
      </View>
    </View>
  );

  if (transcripciones.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📝</Text>
        <Text style={styles.emptyTitle}>No hay transcripciones</Text>
        <Text style={styles.emptySubtitle}>Las transcripciones aparecerán aquí</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.contador}>
        {transcripciones.length} {transcripciones.length === 1 ? 'transcripción' : 'transcripciones'}
      </Text>
      <FlatList
        data={transcripciones}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contador: {
    padding: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#666',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  lista: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fecha: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  texto: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    lineHeight: 22,
  },
  metadatos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  metadato: {
    fontSize: 13,
    color: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
  },
});