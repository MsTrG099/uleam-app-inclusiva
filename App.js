import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { initDB } from './src/database/db';

// Importar pantallas
import HomeScreen from './src/screens/HomeScreen';
import TranscriptionScreen from './src/screens/TranscriptionScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Inicializar base de datos al cargar la app
    const setupDatabase = async () => {
      try {
        await initDB();
        console.log('Base de datos inicializada correctamente');
      } catch (error) {
        console.log('Error al inicializar base de datos:', error);
      }
    };

    setupDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Inicio' }}
        />
        <Stack.Screen 
          name="Transcription" 
          component={TranscriptionScreen}
          options={{ title: 'Transcripción' }}
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen}
          options={{ title: 'Historial' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Configuración' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}