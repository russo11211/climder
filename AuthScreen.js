import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

export default function AuthScreen({ onLogin, onSignUp, authError }) {
  const [email, setEmail] = useState('teste@climder.com');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('João Escalador');
  const [location, setLocation] = useState('São Paulo, SP');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      // Chamar função de login do Firebase
      await onLogin(email, password);
    } catch (error) {
      console.error('Erro no login:', error);
      // Erro será mostrado via authError prop
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !name.trim() || !location.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      // Chamar função de cadastro do Firebase
      const profileData = {
        displayName: name,
        location: location,
        age: 25,
        bio: 'Escalador iniciante buscando parceiros de escalada!',
        climbingGrades: {
          sport: '5.8',
          boulder: 'V2',
          trad: '5.6'
        },
        preferences: {
          climbingStyles: ['sport', 'boulder'],
          maxDistance: 50,
          daysAvailable: ['weekend']
        }
      };
      
      await onSignUp(email, password, profileData);
    } catch (error) {
      console.error('Erro no cadastro:', error);
      // Erro será mostrado via authError prop
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail('teste@climder.com');
    setPassword('123456');
    setName('João Escalador');
    setLocation('São Paulo, SP');
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🧗‍♀️</Text>
          <Text style={styles.title}>Climder</Text>
          <Text style={styles.subtitle}>
            {isSignUpMode ? 'Criar sua conta no Firebase' : 'Conectando escaladores com Firebase'}
          </Text>
        </View>

        {/* Erro de autenticação */}
        {authError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>❌ Erro</Text>
            <Text style={styles.errorMessage}>{authError}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Campos para cadastro */}
          {isSignUpMode && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Localização</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Sua cidade, estado"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                />
              </View>
            </>
          )}

          {/* Campos comuns */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Sua senha"
              placeholderTextColor="#9ca3af"
              secureTextEntry
            />
          </View>

          {/* Botão principal */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={isSignUpMode ? handleSignUp : handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>
                {isSignUpMode ? '📝 Criar Conta Firebase' : '🔥 Entrar com Firebase'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Botão para alternar modo */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleMode}
            disabled={isLoading}
          >
            <Text style={styles.toggleButtonText}>
              {isSignUpMode 
                ? '🔑 Já tem conta? Faça login' 
                : '📝 Não tem conta? Cadastre-se'
              }
            </Text>
          </TouchableOpacity>

          {/* Credenciais de teste */}
          <View style={styles.testCredentials}>
            <Text style={styles.testTitle}>
              {isSignUpMode ? 'Dados de Teste para Cadastro:' : 'Credenciais de Teste:'}
            </Text>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={fillTestCredentials}
            >
              <Text style={styles.testButtonText}>
                📋 {isSignUpMode ? 'Usar dados de teste' : 'Usar credenciais de teste'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.testInfo}>
              Email: teste@climder.com{'\n'}
              Senha: 123456
              {isSignUpMode && `\nNome: João Escalador\nLocalização: São Paulo, SP`}
            </Text>
            {!isSignUpMode && (
              <Text style={styles.testNote}>
                ⚠️ Se o login falhar, crie a conta primeiro clicando em "Cadastre-se"
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Climder com Firebase{'\n'}
            Sistema de autenticação real
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  // Header Styles
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },

  // Form Styles
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },

  // Button Styles
  loginButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Test Credentials Styles
  testCredentials: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  testInfo: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Error Styles
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
  },

  // Toggle Button Styles
  toggleButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },

  // Test Note Styles
  testNote: {
    fontSize: 11,
    color: '#f59e0b',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },

  // Footer Styles
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
});