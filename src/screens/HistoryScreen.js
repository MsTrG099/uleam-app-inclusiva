import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { obtenerTranscripciones, eliminarTranscripcion } from '../database/operations';

export default function HistoryScreen() {
  const [transcripciones, setTranscripciones] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    cargarTranscripciones();
  }, []);

  useEffect(() => {
    if (isFocused) {
      cargarTranscripciones();
    }
  }, [isFocused]);

  const cargarTranscripciones = () => {
    const datos = obtenerTranscripciones();
    console.log('📜 Transcripciones en BD:', datos.length);
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
    const fecha = new Date(fechaString + 'Z');
    return fecha.toLocaleString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Guayaquil',
    });
  };

  const renderItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={600}
      delay={index * 100}
      style={styles.cardWrapper}
    >
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="calendar-clock" size={16} color="#1e88e5" />
            <Text style={styles.fecha}>{formatearFecha(item.fecha_creacion)}</Text>
          </View>
          <TouchableOpacity
            onPress={() => confirmarEliminar(item.id)}
            style={styles.deleteButton}
          >
            <MaterialCommunityIcons name="delete" size={22} color="#e53935" />
          </TouchableOpacity>
        </View>
        <Text style={styles.texto}>{item.texto_transcrito}</Text>
        <View style={styles.metadatos}>
          <View style={styles.metadatoItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#1e88e5" />
            <Text style={styles.metadato}>{item.duracion_audio}s</Text>
          </View>
          <View style={styles.metadatoItem}>
            <MaterialCommunityIcons name="target" size={16} color="#1e88e5" />
            <Text style={styles.metadato}>{Math.round(item.precision_ia)}%</Text>
          </View>
        </View>
      </LinearGradient>
    </Animatable.View>
  );

  if (transcripciones.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Animatable.View
          animation="fadeIn"
          duration={800}
          style={styles.emptyContent}
        >
          <MaterialCommunityIcons name="text-box-remove-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No hay transcripciones</Text>
          <Text style={styles.emptySubtitle}>Las transcripciones aparecerán aquí</Text>
        </Animatable.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e88e5', '#1565c0']}
        style={styles.headerBar}
      >
        <MaterialCommunityIcons name="history" size={20} color="#fff" />
        <Text style={styles.contador}>
          {transcripciones.length} {transcripciones.length === 1 ? 'transcripción' : 'transcripciones'}
        </Text>
      </LinearGradient>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  contador: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  lista: {
    padding: 15,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fecha: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },
  texto: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  metadatos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  metadatoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadato: {
    fontSize: 13,
    color: '#1e88e5',
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
  },
});