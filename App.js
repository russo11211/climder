import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './AuthContext';
import AuthScreen from './AuthScreen';
import ClimderApp from './ClimderApp';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>🧗‍♀️</Text>
        <Text style={styles.loadingSubtext}>Carregando Climder...</Text>
      </View>
    );
  }

  return user ? <ClimderApp /> : <AuthScreen />;
};

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
  },
  loadingText: {
    fontSize: 60,
    marginBottom: 16,
  },
  loadingSubtext: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
});