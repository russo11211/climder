// Versão simplificada para desenvolvimento local
// SUBSTITUA por configuração real do Firebase em produção

import AsyncStorage from '@react-native-async-storage/async-storage';

// Simulação do Firebase Auth para desenvolvimento
class MockAuth {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  async signInWithEmailAndPassword(email, password) {
    // Simular login
    if (email === 'teste@climder.com' && password === '123456') {
      this.currentUser = {
        uid: 'test-user-123',
        email: email,
        displayName: 'Usuário Teste'
      };
      await AsyncStorage.setItem('user', JSON.stringify(this.currentUser));
      this.notifyListeners(this.currentUser);
      return { user: this.currentUser };
    } else {
      throw new Error('auth/invalid-credentials');
    }
  }

  async createUserWithEmailAndPassword(email, password) {
    // Simular criação de conta
    const newUser = {
      uid: Date.now().toString(),
      email: email,
      displayName: 'Novo Usuário'
    };
    this.currentUser = newUser;
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    this.notifyListeners(newUser);
    return { user: newUser };
  }

  async signOut() {
    this.currentUser = null;
    await AsyncStorage.removeItem('user');
    this.notifyListeners(null);
  }

  async updateProfile(updates) {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(this.currentUser));
    }
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    
    // Verificar se há usuário salvo
    AsyncStorage.getItem('user').then(userData => {
      if (userData) {
        this.currentUser = JSON.parse(userData);
        callback(this.currentUser);
      } else {
        callback(null);
      }
    });

    // Retornar função de cleanup
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners(user) {
    this.listeners.forEach(listener => listener(user));
  }
}

// Simulação do Firestore para desenvolvimento
class MockFirestore {
  async setDoc(docRef, data, options = {}) {
    const key = `firestore_${docRef.path}`;
    const existing = await AsyncStorage.getItem(key);
    let finalData = data;
    
    if (options.merge && existing) {
      finalData = { ...JSON.parse(existing), ...data };
    }
    
    await AsyncStorage.setItem(key, JSON.stringify(finalData));
  }

  async getDoc(docRef) {
    const key = `firestore_${docRef.path}`;
    const data = await AsyncStorage.getItem(key);
    
    return {
      exists: () => !!data,
      data: () => data ? JSON.parse(data) : null
    };
  }
}

// Mock functions
const doc = (db, collection, id) => ({
  path: `${collection}/${id}`
});

// Instâncias simuladas
export const auth = new MockAuth();
export const db = new MockFirestore();

// Funções de autenticação
export const onAuthStateChanged = (auth, callback) => auth.onAuthStateChanged(callback);
export const signInWithEmailAndPassword = (auth, email, password) => auth.signInWithEmailAndPassword(email, password);
export const createUserWithEmailAndPassword = (auth, email, password) => auth.createUserWithEmailAndPassword(email, password);
export const signOut = (auth) => auth.signOut();
export const updateProfile = (user, updates) => auth.updateProfile(updates);

// Funções do Firestore
export const setDoc = (docRef, data, options) => db.setDoc(docRef, data, options);
export const getDoc = (docRef) => db.getDoc(docRef);
export { doc };

console.log('🔥 Firebase simulado carregado para desenvolvimento');
