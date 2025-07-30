// Versão com debug detalhado
import AsyncStorage from '@react-native-async-storage/async-storage';

export const auth = {
  currentUser: null,
  
  signInWithEmailAndPassword: async (email, password) => {
    console.log('🔥 Firebase: Tentando login');
    console.log('📧 Email recebido:', JSON.stringify(email));
    console.log('🔒 Senha recebida:', JSON.stringify(password));
    console.log('📧 Email esperado:', JSON.stringify('teste@climder.com'));
    console.log('🔒 Senha esperada:', JSON.stringify('123456'));
    
    // Limpar espaços em branco
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    
    console.log('📧 Email limpo:', JSON.stringify(cleanEmail));
    console.log('🔒 Senha limpa:', JSON.stringify(cleanPassword));
    
    if (cleanEmail === 'teste@climder.com' && cleanPassword === '123456') {
      const user = {
        uid: 'test-123',
        email: cleanEmail,
        displayName: 'Escalador Teste'
      };
      console.log('✅ Login bem-sucedido! Retornando:', user);
      return { user };
    } else {
      console.log('❌ Credenciais não conferem');
      console.log('🔍 Email confere?', cleanEmail === 'teste@climder.com');
      console.log('🔍 Senha confere?', cleanPassword === '123456');
      throw new Error('auth/invalid-credentials');
    }
  },

  createUserWithEmailAndPassword: async (email, password) => {
    const user = {
      uid: Date.now().toString(),
      email: email,
      displayName: 'Novo Usuário'
    };
    console.log('✅ Conta criada:', user);
    return { user };
  },

  signOut: async () => {
    console.log('🚪 Logout realizado');
    this.currentUser = null;
  },

  updateProfile: async (updates) => {
    console.log('📝 Perfil atualizado:', updates);
  },

  onAuthStateChanged: (callback) => {
    console.log('👂 Listener de auth configurado');
    setTimeout(() => callback(this.currentUser), 100);
    return () => {};
  }
};

export const db = {
  setDoc: async (docRef, data) => {
    console.log('💾 Salvando no Firestore:', docRef.path, data);
    const key = `firestore_${docRef.path}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
  },
  
  getDoc: async (docRef) => {
    console.log('📖 Lendo do Firestore:', docRef.path);
    const key = `firestore_${docRef.path}`;
    const data = await AsyncStorage.getItem(key);
    return {
      exists: () => !!data,
      data: () => data ? JSON.parse(data) : null
    };
  }
};

export const doc = (db, collection, id) => ({ path: `${collection}/${id}` });

export const onAuthStateChanged = (auth, callback) => auth.onAuthStateChanged(callback);
export const signInWithEmailAndPassword = (auth, email, password) => auth.signInWithEmailAndPassword(email, password);
export const createUserWithEmailAndPassword = (auth, email, password) => auth.createUserWithEmailAndPassword(email, password);
export const signOut = (auth) => auth.signOut();
export const updateProfile = (user, updates) => auth.updateProfile(updates);
export const setDoc = (docRef, data) => db.setDoc(docRef, data);
export const getDoc = (docRef) => db.getDoc(docRef);

console.log('🔥 Firebase DEBUG carregado');
