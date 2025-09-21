import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { initDB } from './src/database/db';

export default function App() {
  const [dbStatus, setDbStatus] = useState('Verificando plataforma...');

  useEffect(() => {
    const setupDatabase = async () => {
      if (Platform.OS === 'web') {
        setDbStatus('Web detectada - SQLite no disponible');
      } else {
        try {
          setDbStatus('Inicializando base de datos...');
          await initDB();
          setDbStatus('Base de datos y tabla creada correctamente ✓');
        } catch (error) {
          setDbStatus('Error: ' + error.message);
        }
      }
    };

    setupDatabase();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ULEAM App Inclusiva</Text>
      <Text style={styles.subtitle}>Sprint 0 - Configuración inicial</Text>
      <Text style={styles.status}>{dbStatus}</Text>
      <Text style={styles.platform}>Plataforma: {Platform.OS}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 10,
  },
  platform: {
    fontSize: 14,
    color: 'gray',
    marginTop: 10,
  },
});