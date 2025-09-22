import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { initDB } from './src/database/db';
import { 
  guardarTranscripcion, 
  obtenerTranscripciones, 
  crearNotificacion, 
  obtenerNotificaciones,
  guardarConfiguracion,
  obtenerConfiguracion 
} from './src/database/operations';

export default function App() {
  const [dbStatus, setDbStatus] = useState('Inicializando...');
  const [transcripciones, setTranscripciones] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [config, setConfig] = useState('');

  useEffect(() => {
    setupDatabase();
  }, []);

  const setupDatabase = async () => {
    if (Platform.OS === 'web') {
      setDbStatus('Web detectada - SQLite no disponible');
    } else {
      try {
        await initDB();
        setDbStatus('Base de datos lista para pruebas CRUD');
        await cargarDatos();
      } catch (error) {
        setDbStatus('Error: ' + error.message);
      }
    }
  };

  const cargarDatos = async () => {
    setTranscripciones(obtenerTranscripciones());
    setNotificaciones(obtenerNotificaciones());
    const volumen = obtenerConfiguracion('volumen');
    setConfig(volumen || 'No configurado');
  };

  const probarTranscripcion = () => {
    const id = guardarTranscripcion('Hola, esta es una prueba de transcripción', 3.5, 95.2);
    if (id) {
      crearNotificacion('Nueva transcripción guardada', 'transcripcion');
      cargarDatos();
    }
  };

  const probarConfiguracion = () => {
    guardarConfiguracion('volumen', '75');
    guardarConfiguracion('idioma', 'es');
    crearNotificacion('Configuración actualizada', 'sistema');
    cargarDatos();
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>ULEAM App Inclusiva</Text>
        <Text style={styles.status}>Solo disponible en dispositivos móviles</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>ULEAM App Inclusiva</Text>
        <Text style={styles.subtitle}>Sprint 1 - Pruebas CRUD</Text>
        <Text style={styles.status}>{dbStatus}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={probarTranscripcion}>
            <Text style={styles.buttonText}>Probar Transcripción</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={probarConfiguracion}>
            <Text style={styles.buttonText}>Probar Configuración</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transcripciones ({transcripciones.length})</Text>
          {transcripciones.slice(0, 3).map((item, index) => (
            <Text key={index} style={styles.item}>
              {item.texto_transcrito.substring(0, 40)}...
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones ({notificaciones.length})</Text>
          {notificaciones.slice(0, 3).map((item, index) => (
            <Text key={index} style={styles.item}>
              {item.mensaje}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          <Text style={styles.item}>Volumen: {config}</Text>
        </View>

        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    fontSize: 14,
    padding: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 5,
    borderRadius: 4,
  },
});