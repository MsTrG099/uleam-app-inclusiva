import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { guardarConfiguracion, obtenerConfiguracion } from '../database/operations';

export default function SettingsScreen() {
  const [volumen, setVolumen] = useState(50);
  const [notificaciones, setNotificaciones] = useState(true);

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  const cargarConfiguraciones = () => {
    const volGuardado = obtenerConfiguracion('volumen');
    const notiGuardadas = obtenerConfiguracion('notificaciones');
    
    if (volGuardado) setVolumen(parseInt(volGuardado));
    if (notiGuardadas) setNotificaciones(notiGuardadas === 'true');
  };

  const handleVolumenChange = (value) => {
    setVolumen(Math.round(value));
  };

  const handleVolumenComplete = (value) => {
    const volumenFinal = Math.round(value);
    guardarConfiguracion('volumen', volumenFinal.toString());
    Alert.alert('Guardado', `Volumen ajustado a ${volumenFinal}%`);
  };

  const handleNotificacionesToggle = (value) => {
    setNotificaciones(value);
    guardarConfiguracion('notificaciones', value.toString());
    Alert.alert(
      'Guardado',
      value ? 'Notificaciones activadas' : 'Notificaciones desactivadas'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.label}>Volumen del Micrófono</Text>
          <Text style={styles.value}>{volumen}%</Text>
        </View>
        
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={volumen}
          onValueChange={handleVolumenChange}
          onSlidingComplete={handleVolumenComplete}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#007AFF"
        />
        
        <Text style={styles.description}>
          Ajusta la sensibilidad del micrófono para capturar audio
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.label}>Notificaciones Visuales</Text>
          <Switch
            value={notificaciones}
            onValueChange={handleNotificacionesToggle}
            trackColor={{ false: '#d3d3d3', true: '#81b0ff' }}
            thumbColor={notificaciones ? '#007AFF' : '#f4f3f4'}
          />
        </View>
        
        <Text style={styles.description}>
          Muestra alertas visuales cuando ocurran eventos importantes
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ Información</Text>
        <Text style={styles.infoText}>
          Las configuraciones se guardan automáticamente y se aplican en la próxima transcripción.
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
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    margin: 15,
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#1565c0',
    lineHeight: 20,
  },
});