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
  ScrollView,
  ActivityIndicator,
} from 'react-native';

/**
 * Tela de Autenticação com Firebase
 * 
 * Suporta:
 * - Login com email/senha
 * - Cadastro com perfil completo
 * - Validação de campos
 * - Estados de loading
 * - Tratamento de erros
 */
export default function AuthScreen({ onLogin, onSignUp, authError }) {
  // Estados do formulário
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Campos de login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Campos de cadastro
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [climbingGrade, setClimbingGrade] = useState('5c');
  const [climbingType, setClimbingType] = useState('Esportiva');
  const [experience, setExperience] = useState('1 ano');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  // Estados de erro e validação
  const [errors, setErrors] = useState({});

  /**
   * Valida campos do formulário
   * @returns {boolean} true se válido
   */
  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar senha
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validações específicas para cadastro
    if (!isLoginMode) {
      if (!displayName) {
        newErrors.displayName = 'Nome é obrigatório';
      } else if (displayName.length < 2) {
        newErrors.displayName = 'Nome deve ter pelo menos 2 caracteres';
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = 'Confirme sua senha';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem';
      }

      if (!location) {
        newErrors.location = 'Localização é obrigatória';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manipula login
   */
  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setErrors({});
      
      await onLogin(email, password);
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      // Erro será mostrado via authError prop
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manipula cadastro
   */
  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setErrors({});

      const profileData = {
        displayName,
        grade: climbingGrade,
        climbingType,
        experience,
        location,
        bio: bio || `Apaixonado por escalada ${climbingType.toLowerCase()}! 🧗‍♀️`
      };

      await onSignUp(email, password, profileData);
      
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      // Erro será mostrado via authError prop
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Preenche credenciais de teste
   */
  const fillTestCredentials = () => {
    setEmail('teste@climder.com');
    setPassword('123456');
    
    if (!isLoginMode) {
      setConfirmPassword('123456');
      setDisplayName('Escalador Teste');
      setLocation('São Paulo, SP');
      setBio('Testando o Climder! 🧗‍♀️');
    }
  };

  /**
   * Alternar entre login e cadastro
   */
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    
    // Limpar campos específicos do cadastro
    if (isLoginMode) {
      setConfirmPassword('');
      setDisplayName('');
      setLocation('');
      setBio('');
    }
  };

  /**
   * Renderiza campo de input
   */
  const renderInput = (
    label,
    value,
    onChangeText,
    options = {}
  ) => {
    const { 
      placeholder = label,
      secureTextEntry = false,
      keyboardType = 'default',
      multiline = false,
      errorKey = null
    } = options;

    const hasError = errorKey && errors[errorKey];

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            hasError && styles.inputError
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          autoCorrect={false}
        />
        {hasError && (
          <Text style={styles.errorText}>{errors[errorKey]}</Text>
        )}
      </View>
    );
  };

  /**
   * Renderiza seletor de opções
   */
  const renderSelector = (label, value, onValueChange, options, errorKey = null) => {
    const hasError = errorKey && errors[errorKey];

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.selectorContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.selectorOption,
                value === option && styles.selectorOptionActive
              ]}
              onPress={() => onValueChange(option)}
            >
              <Text style={[
                styles.selectorOptionText,
                value === option && styles.selectorOptionTextActive
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {hasError && (
          <Text style={styles.errorText}>{errors[errorKey]}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Climder</Text>
            <Text style={styles.subtitle}>
              {isLoginMode ? 'Entre na sua conta' : 'Crie sua conta'}
            </Text>
          </View>

          {/* Erro de autenticação */}
          {authError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>❌ Erro</Text>
              <Text style={styles.errorMessage}>{authError}</Text>
            </View>
          )}

          {/* Formulário */}
          <View style={styles.form}>
            {/* Campos básicos */}
            {renderInput(
              'Email',
              email,
              setEmail,
              { 
                keyboardType: 'email-address',
                errorKey: 'email'
              }
            )}

            {renderInput(
              'Senha',
              password,
              setPassword,
              { 
                secureTextEntry: true,
                errorKey: 'password'
              }
            )}

            {/* Campos de cadastro */}
            {!isLoginMode && (
              <>
                {renderInput(
                  'Confirmar Senha',
                  confirmPassword,
                  setConfirmPassword,
                  { 
                    secureTextEntry: true,
                    errorKey: 'confirmPassword'
                  }
                )}

                {renderInput(
                  'Nome Completo',
                  displayName,
                  setDisplayName,
                  { 
                    placeholder: 'Seu nome para outros escaladores',
                    errorKey: 'displayName'
                  }
                )}

                {renderSelector(
                  'Grau de Escalada',
                  climbingGrade,
                  setClimbingGrade,
                  ['4º', '5a', '5b', '5c', '6a', '6b', '6c', '7a', '7b', '7c', '8a+']
                )}

                {renderSelector(
                  'Tipo de Escalada',
                  climbingType,
                  setClimbingType,
                  ['Esportiva', 'Boulder', 'Tradicional', 'Multi-pitch', 'Todos']
                )}

                {renderSelector(
                  'Experiência',
                  experience,
                  setExperience,
                  ['Iniciante', '1 ano', '2-3 anos', '4-5 anos', '5+ anos']
                )}

                {renderInput(
                  'Localização',
                  location,
                  setLocation,
                  { 
                    placeholder: 'Ex: São Paulo, SP',
                    errorKey: 'location'
                  }
                )}

                {renderInput(
                  'Bio (Opcional)',
                  bio,
                  setBio,
                  { 
                    placeholder: 'Conte um pouco sobre sua paixão pela escalada...',
                    multiline: true
                  }
                )}
              </>
            )}
          </View>

          {/* Botões de ação */}
          <View style={styles.actions}>
            {/* Botão principal */}
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
              onPress={isLoginMode ? handleLogin : handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isLoginMode ? '🚀 Entrar' : '📝 Criar Conta'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Botão de teste (apenas em desenvolvimento) */}
            {__DEV__ && isLoginMode && (
              <TouchableOpacity
                style={styles.testButton}
                onPress={fillTestCredentials}
                disabled={isLoading}
              >
                <Text style={styles.testButtonText}>
                  🧪 Usar credenciais de teste
                </Text>
              </TouchableOpacity>
            )}

            {/* Alternar modo */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleMode}
              disabled={isLoading}
            >
              <Text style={styles.toggleButtonText}>
                {isLoginMode 
                  ? '📝 Não tem conta? Cadastre-se' 
                  : '🔑 Já tem conta? Entre'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Informações de desenvolvimento */}
          {__DEV__ && (
            <View style={styles.devInfo}>
              <Text style={styles.devInfoTitle}>🔧 Desenvolvimento</Text>
              <Text style={styles.devInfoText}>
                Firebase: {isLoginMode ? 'Login' : 'Cadastro'} Mode
              </Text>
              <Text style={styles.devInfoText}>
                Ambiente: Development
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },

  // Erro de autenticação
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

  // Formulário
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputMultiline: {
    paddingVertical: 12,
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },

  // Seletor
  selectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectorOption: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectorOptionActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  selectorOptionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  selectorOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },

  // Ações
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },

  // Info de desenvolvimento
  devInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  devInfoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  devInfoText: {
    fontSize: 11,
    color: '#9ca3af',
  },
});