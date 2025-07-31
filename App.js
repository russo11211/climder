import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthScreen from './AuthScreen';
import ClimderApp from './ClimderApp';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se usuário já está logado
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('climder_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setUserProfile(user);
        setIsAuthenticated(true);
        console.log('✅ Usuário encontrado:', user.displayName);
      } else {
        console.log('ℹ️ Nenhum usuário salvo encontrado');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (userData) => {
    try {
      // Salvar dados do usuário
      await AsyncStorage.setItem('climder_user', JSON.stringify(userData));
      setUserProfile(userData);
      setIsAuthenticated(true);
      console.log('🚀 Login realizado:', userData.displayName);
    } catch (error) {
      console.error('❌ Erro ao salvar dados do usuário:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('climder_user');
      setUserProfile(null);
      setIsAuthenticated(false);
      console.log('👋 Logout realizado');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    }
  };

  // Exibir loading durante verificação inicial
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Você pode adicionar um componente de loading aqui */}
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
        <AuthScreen onLogin={handleLogin} />
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
  },
});