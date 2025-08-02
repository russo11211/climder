import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import AuthScreen from './AuthScreen';
import ClimderApp from './ClimderApp';
import AuthService from './services/AuthService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Inicializar AuthService Firebase
  useEffect(() => {
    initializeAuth();
    
    return () => {
      AuthService.cleanup();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      console.log('🔥 Inicializando Climder com Firebase...');
      
      const currentUser = await AuthService.initialize();
      
      if (currentUser) {
        setUserProfile(currentUser);
        setIsAuthenticated(true);
        console.log('✅ Usuário autenticado:', currentUser.displayName);
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
        console.log('ℹ️ Nenhum usuário autenticado');
      }
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Firebase:', error);
      setAuthError(error.message);
      setIsAuthenticated(false);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      setAuthError(null);
      console.log('🔑 Login via Firebase:', email);
      
      const user = await AuthService.signInWithEmail(email, password);
      
      if (user) {
        setUserProfile(user);
        setIsAuthenticated(true);
        console.log('🎉 Login realizado:', user.displayName);
      }
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  const handleSignUp = async (email, password, profileData) => {
    try {
      setAuthError(null);
      console.log('📝 Cadastro via Firebase:', email);
      
      const user = await AuthService.signUpWithEmail(email, password, profileData);
      
      if (user) {
        setUserProfile(user);
        setIsAuthenticated(true);
        console.log('🎉 Cadastro realizado:', user.displayName);
      }
      
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logout via Firebase...');
      
      await AuthService.signOut();
      
      setUserProfile(null);
      setIsAuthenticated(false);
      setAuthError(null);
      
      console.log('✅ Logout realizado');
      
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      setAuthError(error.message);
    }
  };

  // Exibir loading durante inicialização Firebase
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Inicializando Climder...</Text>
        <Text style={styles.loadingSubtext}>Conectando com Firebase</Text>
      </View>
    );
  }

  // Renderizar tela de autenticação ou app principal
  return (
    <View style={styles.container}>
      {isAuthenticated ? (
        <ClimderApp 
          userProfile={userProfile} 
          onLogout={handleLogout} 
        />
      ) : (
        <AuthScreen 
          onLogin={handleLogin}
          onSignUp={handleSignUp}
          authError={authError}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});