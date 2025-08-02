import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Configuração Firebase Real para Produção
 * 
 * IMPORTANTE: Substitua as configurações abaixo pelas suas chaves reais do Firebase
 * 1. Acesse https://console.firebase.google.com/
 * 2. Crie um novo projeto ou use existente
 * 3. Vá em "Configurações do projeto" > "Geral"
 * 4. Role até "Seus apps" e clique em "Adicionar app" > "Web"
 * 5. Copie as configurações e cole abaixo
 */

const firebaseConfig = {
  // ⚠️ COLE SUAS CONFIGURAÇÕES REAIS AQUI APÓS OBTER DO FIREBASE CONSOLE
  apiKey: "AIzaSyAiESY6fDMrF2Z_eyXg3f62rXtGxMVAAoc",  // ← Substitua por sua API Key
  authDomain: "climderapp.firebaseapp.com",  // ← Substitua pelo seu domínio
  projectId: "climderapp",  // ← Substitua pelo seu Project ID
  storageBucket: "climderapp.appspot.com",  // ← Substitua pelo seu bucket
  messagingSenderId: "1044235026690",  // ← Substitua pelo seu Sender ID
  appId: "1:1044235026690:ios:76b983c918906460f9c21b",  // ← Substitua pelo seu App ID
  measurementId: "SUA_MEASUREMENT_ID"  // ← Opcional
};

// Configuração para desenvolvimento local (opcional)
const isDevelopment = __DEV__;

let app;
let auth;
let firestore;
let storage;

try {
  // Inicializar Firebase App
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase App inicializado');

  // Configurar Auth com persistência
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('✅ Firebase Auth configurado');

  // Configurar Firestore
  firestore = getFirestore(app);
  console.log('✅ Firestore configurado');

  // Configurar Storage
  storage = getStorage(app);
  console.log('✅ Firebase Storage configurado');

} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  throw new Error('Falha na inicialização do Firebase');
}

/**
 * Serviços Firebase exportados
 */
export { auth, firestore, storage };
export default app;

/**
 * Configurações e utilitários
 */
export const firebaseUtils = {
  // Verificar se Firebase está inicializado
  isInitialized: () => !!app,
  
  // Obter configurações atuais
  getConfig: () => firebaseConfig,
  
  // Status da conexão
  isConnected: () => {
    try {
      return !!auth && !!firestore && !!storage;
    } catch {
      return false;
    }
  },
  
  // Informações de debug
  getDebugInfo: () => ({
    app: !!app,
    auth: !!auth,
    firestore: !!firestore,
    storage: !!storage,
    isDevelopment,
    projectId: firebaseConfig.projectId,
    timestamp: new Date().toISOString()
  })
};

console.log('🔥 Firebase configurado para produção:', firebaseUtils.getDebugInfo());