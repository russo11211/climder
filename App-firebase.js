import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import AuthScreen from './AuthScreen';
import ClimderApp from './ClimderApp';
import AuthService from './services/AuthService';

/**
 * App Principal com Firebase Real
 * 
 * Gerencia autenticação e estado global da aplicação usando Firebase Auth
 */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Inicializar AuthService na montagem do app
  useEffect(() => {
    initializeAuth();
    
    // Cleanup ao desmontar
    return () => {
      AuthService.cleanup();
    };
  }, []);

  /**
   * Inicializa o serviço de autenticação
   */
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);
      
      console.log('🚀 Inicializando Climder com Firebase...');
      
      // Inicializar AuthService (vai escutar mudanças de auth state)
      const currentUser = await AuthService.initialize();
      
      if (currentUser) {
        setUserProfile(currentUser);
        setIsAuthenticated(true);
        console.log('✅ Usuário autenticado automaticamente:', currentUser.displayName);
      } else {
        setIsAuthenticated(false);
        setUserProfile(null);
        console.log('ℹ️ Nenhum usuário autenticado');
      }
      
    } catch (error) {
      console.error('❌ Erro ao inicializar autenticação:', error);
      setAuthError(error.message);
      setIsAuthenticated(false);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manipula login via AuthService
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   */
  const handleLogin = async (email, password) => {
    try {
      setAuthError(null);
      console.log('🔑 Tentando login via Firebase:', email);
      
      const user = await AuthService.signInWithEmail(email, password);
      
      if (user) {
        setUserProfile(user);
        setIsAuthenticated(true);
        console.log('🎉 Login realizado com sucesso:', user.displayName);
      }
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      setAuthError(error.message);
      throw error; // Re-throw para o AuthScreen mostrar o erro
    }
  };

  /**
   * Manipula cadastro via AuthService
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {Object} profileData - Dados do perfil
   */
  const handleSignUp = async (email, password, profileData) => {
    try {
      setAuthError(null);
      console.log('📝 Tentando cadastro via Firebase:', email);
      
      const user = await AuthService.signUpWithEmail(email, password, profileData);
      
      if (user) {
        setUserProfile(user);
        setIsAuthenticated(true);
        console.log('🎉 Cadastro realizado com sucesso:', user.displayName);
      }
      
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      setAuthError(error.message);
      throw error; // Re-throw para o AuthScreen mostrar o erro
    }
  };

  /**
   * Manipula logout via AuthService
   */
  const handleLogout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      
      await AuthService.signOut();
      
      // Estados são limpos automaticamente pelo auth state listener
      // mas vamos garantir:
      setUserProfile(null);
      setIsAuthenticated(false);
      setAuthError(null);
      
      console.log('✅ Logout realizado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
      setAuthError(error.message);
    }
  };

  /**
   * Tenta reconectar se houve erro
   */
  const handleRetry = () => {
    console.log('🔄 Tentando reconectar...');
    initializeAuth();
  };

  // Exibir loading durante inicialização
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Inicializando Climder...</Text>
        <Text style={styles.loadingSubtext}>Conectando com Firebase</Text>
      </View>
    );
  }

  // Exibir erro se não conseguiu inicializar
  if (authError && !isAuthenticated) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>❌ Erro de Conexão</Text>
        <Text style={styles.errorText}>{authError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>🔄 Tentar Novamente</Text>
        </TouchableOpacity>
        <Text style={styles.offlineNote}>
          Nota: Verifique sua conexão com a internet e as configurações do Firebase
        </Text>
      </View>
    );
  }

  // Renderizar app principal ou tela de autenticação
  return (
    <View style={styles.container}>
      {isAuthenticated && userProfile ? (
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
  errorContainer: {
    flex: 1,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#991b1b',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  offlineNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});