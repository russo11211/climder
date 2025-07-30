import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useAuth } from './AuthContext';

const { width } = Dimensions.get('window');

// Componente de Input personalizado
const CustomInput = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false, 
  keyboardType = 'default',
  icon 
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputIcon}>{icon}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  </View>
);

// Tela de Login COM DEBUG
export function LoginScreen({ onSwitchToSignup }) {
  const [email, setEmail] = useState('teste@climder.com'); // Email de teste
  const [password, setPassword] = useState('123456'); // Senha de teste
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();

  const handleLogin = async () => {
    console.log('🎯 INICIO: handleLogin chamado');
    console.log('📧 Email atual:', email);
    console.log('🔒 Senha atual:', password);
    
    if (!email || !password) {
      console.log('❌ Campos vazios!');
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    console.log('✅ Campos preenchidos, iniciando login...');
    setLoading(true);
    
    try {
      console.log('🚀 Chamando signIn...');
      const result = await signIn(email, password);
      console.log('📥 Resultado do signIn:', result);
      
      if (result && result.success) {
        console.log('✅ Login bem-sucedido!');
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
      } else {
        console.log('❌ Login falhou:', result?.error);
        Alert.alert('Erro', getErrorMessage(result?.error));
      }
    } catch (error) {
      console.log('💥 ERRO CAPTURADO no try/catch:', error);
      console.log('💥 Tipo do erro:', typeof error);
      console.log('💥 Stack do erro:', error.stack);
      Alert.alert('Erro', 'Falha no login. Tente novamente.');
    } finally {
      console.log('🏁 Finalizando login...');
      setLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    console.log('🔍 Processando erro:', error);
    switch (error) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado';
      case 'auth/wrong-password':
        return 'Senha incorreta';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde';
      default:
        return 'Erro no login. Verifique suas credenciais';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>🧗‍♀️</Text>
          <Text style={styles.appName}>Climder</Text>
          <Text style={styles.tagline}>Conecte-se com escaladores</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Entrar</Text>
          
          <CustomInput
            icon="📧"
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              console.log('📧 Email alterado para:', text);
              setEmail(text);
            }}
            keyboardType="email-address"
          />
          
          <CustomInput
            icon="🔒"
            placeholder="Senha"
            value={password}
            onChangeText={(text) => {
              console.log('🔒 Senha alterada para:', text);
              setPassword(text);
            }}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={() => {
              console.log('🖱️ Botão de login pressionado');
              handleLogin();
            }}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <View style={styles.testCredentials}>
            <Text style={styles.testTitle}>🧪 Credenciais de Teste:</Text>
            <Text style={styles.testText}>Email: teste@climder.com</Text>
            <Text style={styles.testText}>Senha: 123456</Text>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onSwitchToSignup}
          >
            <Text style={styles.secondaryButtonText}>
              Criar nova conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Tela de Cadastro (mantém a mesma)
export function SignupScreen({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    climbingGrade: '5c',
    climbingTypes: ['Esportiva'],
    location: '',
    experience: 'Iniciante'
  });
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async () => {
    console.log('🎯 INICIO: handleSignup chamado');
    const { displayName, email, password, confirmPassword } = formData;

    if (!displayName || !email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Chamando signUp...');
      const result = await signUp(email, password, formData);
      console.log('📥 Resultado do signUp:', result);
      
      if (result.success) {
        Alert.alert(
          'Sucesso', 
          'Conta criada com sucesso! Bem-vindo ao Climder!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erro', getSignupErrorMessage(result.error));
      }
    } catch (error) {
      console.log('💥 ERRO no cadastro:', error);
      Alert.alert('Erro', 'Falha ao criar conta. Tente novamente.');
    }
    setLoading(false);
  };

  const getSignupErrorMessage = (error) => {
    switch (error) {
      case 'auth/email-already-in-use':
        return 'Este email já está em uso';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/weak-password':
        return 'Senha muito fraca';
      default:
        return 'Erro ao criar conta. Tente novamente';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>🧗‍♀️</Text>
          <Text style={styles.appName}>Climder</Text>
          <Text style={styles.tagline}>Junte-se à comunidade</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Criar Conta</Text>
          
          <CustomInput
            icon="👤"
            placeholder="Nome de usuário *"
            value={formData.displayName}
            onChangeText={(value) => updateFormData('displayName', value)}
          />
          
          <CustomInput
            icon="📧"
            placeholder="Email *"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
          />
          
          <CustomInput
            icon="🔒"
            placeholder="Senha *"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            secureTextEntry
          />
          
          <CustomInput
            icon="🔒"
            placeholder="Confirmar senha *"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            secureTextEntry
          />

          <View style={styles.optionalSection}>
            <Text style={styles.optionalTitle}>🧗‍♀️ Informações de Escalada</Text>
            
            <CustomInput
              icon="📊"
              placeholder="Graduação atual (ex: 5c, 6a, 7b)"
              value={formData.climbingGrade}
              onChangeText={(value) => updateFormData('climbingGrade', value)}
            />
            
            <CustomInput
              icon="📍"
              placeholder="Localização (ex: São Paulo - SP)"
              value={formData.location}
              onChangeText={(value) => updateFormData('location', value)}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onSwitchToLogin}
          >
            <Text style={styles.secondaryButtonText}>
              Já tenho uma conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testCredentials: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  testTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  testText: {
    fontSize: 12,
    color: '#92400e',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  optionalSection: {
    marginVertical: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  optionalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6b7280',
    fontSize: 14,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
});