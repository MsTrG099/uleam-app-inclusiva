import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e88e5', '#1565c0']}
        style={styles.header}
      >
        <Animatable.Text 
          animation="fadeInDown" 
          duration={800}
          style={styles.title}
        >
          ULEAM App Inclusiva
        </Animatable.Text>
        <Animatable.Text 
          animation="fadeInDown" 
          delay={200}
          duration={800}
          style={styles.subtitle}
        >
          Transcripción de Voz a Texto
        </Animatable.Text>
      </LinearGradient>

      <View style={styles.centerContent}>
        <Animatable.View
          animation="pulse"
          easing="ease-out"
          iterationCount="infinite"
          duration={2000}
        >
          <TouchableOpacity
            style={styles.mainButtonShadow}
            onPress={() => navigation.navigate('Transcription')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#1e88e5', '#1565c0']}
              style={styles.mainButton}
            >
              <MaterialCommunityIcons name="microphone" size={80} color="#fff" />
              <Text style={styles.buttonText}>Iniciar Transcripción</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      </View>

      <Animatable.View 
        animation="fadeInUp" 
        delay={400}
        duration={800}
        style={styles.footer}
      >
        <MaterialCommunityIcons name="school" size={20} color="#666" />
        <Text style={styles.footerText}>
          Sistema de transcripción con IA
        </Text>
        <Text style={styles.footerSubtext}>
          Powered by AssemblyAI
        </Text>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mainButtonShadow: {
    borderRadius: 110,
    shadowColor: '#1e88e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  mainButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
});