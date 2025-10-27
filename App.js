import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { initDB } from './src/database/db';
import MainTabs from './src/navigation/MainTabs';
import TranscriptionScreen from './src/screens/TranscriptionScreen';

const Stack = createStackNavigator();

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDB().then(() => {
      setDbReady(true);
    });
  }, []);

  if (!dbReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Transcription" component={TranscriptionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}