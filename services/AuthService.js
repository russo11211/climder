import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, firestore } from '../firebase-config-real';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Serviço de Autenticação Real com Firebase
 * 
 * Gerencia toda a autenticação de usuários incluindo:
 * - Login/cadastro com email/senha
 * - Login com Google (futuro)
 * - Gerenciamento de perfil
 * - Persistência de sessão
 * - Sincronização com Firestore
 */
class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListener = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa o serviço de autenticação
   * @returns {Promise<Object|null>} Usuário atual ou null
   */
  async initialize() {
    try {
      console.log('🔐 Inicializando AuthService...');
      
      return new Promise((resolve) => {
        // Listener para mudanças no estado de autenticação
        this.authStateListener = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            if (firebaseUser) {
              // Usuário logado - carregar dados completos
              const userData = await this.loadUserProfile(firebaseUser.uid);
              this.currentUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || userData?.displayName || 'Escalador',
                photoURL: firebaseUser.photoURL || userData?.photoURL || null,
                emailVerified: firebaseUser.emailVerified,
                ...userData
              };

              // Salvar no AsyncStorage para acesso offline
              await AsyncStorage.setItem('climder_user', JSON.stringify(this.currentUser));
              console.log('✅ Usuário autenticado:', this.currentUser.displayName);
              
            } else {
              // Usuário deslogado
              this.currentUser = null;
              await AsyncStorage.removeItem('climder_user');
              console.log('🚪 Usuário deslogado');
            }

            if (!this.isInitialized) {
              this.isInitialized = true;
              resolve(this.currentUser);
            }
            
          } catch (error) {
            console.error('❌ Erro no auth state listener:', error);
            if (!this.isInitialized) {
              this.isInitialized = true;
              resolve(null);
            }
          }
        });
      });
      
    } catch (error) {
      console.error('❌ Erro ao inicializar AuthService:', error);
      return null;
    }
  }

  /**
   * Login com email e senha
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário logado
   */
  async signInWithEmail(email, password) {
    try {
      console.log('🔑 Tentando login com email:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Atualizar último login
      await this.updateLastLogin(firebaseUser.uid);
      
      console.log('✅ Login realizado com sucesso');
      return this.currentUser;
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw this.parseAuthError(error);
    }
  }

  /**
   * Cadastro com email e senha
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {Object} profileData - Dados adicionais do perfil
   * @returns {Promise<Object>} Dados do usuário cadastrado
   */
  async signUpWithEmail(email, password, profileData = {}) {
    try {
      console.log('📝 Criando conta:', email);
      
      // Criar conta no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Atualizar perfil no Firebase Auth
      await updateProfile(firebaseUser, {
        displayName: profileData.displayName || 'Escalador Climder'
      });
      
      // Criar documento do usuário no Firestore
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: profileData.displayName || 'Escalador Climder',
        
        // Dados específicos do Climder
        climbingProfile: {
          grade: profileData.grade || '5c',
          climbingType: profileData.climbingType || 'Esportiva',
          experience: profileData.experience || '1 ano',
          location: profileData.location || 'Brasil',
          bio: profileData.bio || 'Apaixonado por escalada! 🧗‍♀️'
        },
        
        // Metadados
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isActive: true,
        matches: [],
        groups: [],
        notifications: {
          matches: true,
          groups: true,
          chat: true,
          reminders: true
        }
      };
      
      await setDoc(doc(firestore, 'users', firebaseUser.uid), userData);
      console.log('✅ Perfil de usuário criado no Firestore');
      
      return this.currentUser;
      
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      throw this.parseAuthError(error);
    }
  }

  /**
   * Logout do usuário
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      await signOut(auth);
      console.log('👋 Logout realizado');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      throw error;
    }
  }

  /**
   * Redefinir senha
   * @param {string} email - Email para redefinição
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('📧 Email de redefinição enviado');
    } catch (error) {
      console.error('❌ Erro ao enviar email de redefinição:', error);
      throw this.parseAuthError(error);
    }
  }

  /**
   * Carrega perfil completo do usuário do Firestore
   * @param {string} uid - ID do usuário
   * @returns {Promise<Object|null>} Dados do perfil
   */
  async loadUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
      return null;
    }
  }

  /**
   * Atualiza perfil do usuário
   * @param {Object} updates - Dados para atualizar
   * @returns {Promise<void>}
   */
  async updateUserProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const userRef = doc(firestore, 'users', this.currentUser.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Atualizar dados locais
      this.currentUser = { ...this.currentUser, ...updates };
      await AsyncStorage.setItem('climder_user', JSON.stringify(this.currentUser));
      
      console.log('✅ Perfil atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Atualiza timestamp do último login
   * @param {string} uid - ID do usuário
   */
  async updateLastLogin(uid) {
    try {
      const userRef = doc(firestore, 'users', uid);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar último login:', error);
    }
  }

  /**
   * Obtém usuário atual
   * @returns {Object|null} Usuário atual
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Verifica se usuário está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Converte erros do Firebase em mensagens amigáveis
   * @param {Error} error - Erro do Firebase
   * @returns {Error} Erro com mensagem amigável
   */
  parseAuthError(error) {
    const errorMessages = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Este email já está sendo usado',
      'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres',
      'auth/invalid-email': 'Email inválido',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
      'auth/user-disabled': 'Esta conta foi desabilitada',
      'auth/invalid-credential': 'Credenciais inválidas'
    };

    const friendlyMessage = errorMessages[error.code] || error.message || 'Erro desconhecido';
    return new Error(friendlyMessage);
  }

  /**
   * Limpa recursos quando necessário
   */
  cleanup() {
    if (this.authStateListener) {
      this.authStateListener();
      this.authStateListener = null;
    }
    this.currentUser = null;
    this.isInitialized = false;
    console.log('🧹 AuthService limpo');
  }

  /**
   * Informações de debug
   * @returns {Object} Informações de debug
   */
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      hasCurrentUser: !!this.currentUser,
      userEmail: this.currentUser?.email || null,
      hasAuthListener: !!this.authStateListener,
      timestamp: new Date().toISOString()
    };
  }
}

// Exportar instância singleton
export default new AuthService();