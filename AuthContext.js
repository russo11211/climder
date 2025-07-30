import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db, doc, setDoc, getDoc } from './firebaseConfig';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Configurando AuthContext...');
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      console.log('👤 Estado do usuário mudou:', firebaseUser);
      if (firebaseUser) {
        setUser(firebaseUser);
        loadUserProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      console.log('📖 Carregando perfil do usuário:', userId);
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data();
        console.log('✅ Perfil carregado:', profile);
        setUserProfile(profile);
      } else {
        console.log('📝 Criando perfil padrão...');
        // Criar perfil padrão para novos usuários
        const defaultProfile = {
          uid: userId,
          displayName: user?.displayName || 'Escalador',
          email: user?.email,
          bio: '',
          climbingGrade: '5c',
          climbingTypes: ['Esportiva'],
          location: '',
          experience: 'Iniciante',
          availability: [],
          profileImage: '🧗‍♀️',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        
        await setDoc(docRef, defaultProfile);
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      console.log('🚀 Iniciando cadastro...');
      const result = await auth.createUserWithEmailAndPassword(email, password);
      console.log('✅ Usuário criado:', result.user);
      
      // Atualizar displayName
      if (userData.displayName) {
        await auth.updateProfile({
          displayName: userData.displayName
        });
      }

      // Criar perfil no Firestore
      const userProfile = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: userData.displayName || 'Escalador',
        bio: userData.bio || '',
        climbingGrade: userData.climbingGrade || '5c',
        climbingTypes: userData.climbingTypes || ['Esportiva'],
        location: userData.location || '',
        experience: userData.experience || 'Iniciante',
        availability: userData.availability || [],
        profileImage: userData.profileImage || '🧗‍♀️',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', result.user.uid), userProfile);
      setUser(result.user);
      setUserProfile(userProfile);

      return { success: true };
    } catch (error) {
      console.log('❌ Erro no cadastro:', error);
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('🚀 Iniciando login...');
      const result = await auth.signInWithEmailAndPassword(email, password);
      console.log('✅ Login bem-sucedido:', result.user);
      
      setUser(result.user);
      return { success: true };
    } catch (error) {
      console.log('❌ Erro no login:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      await auth.signOut();
      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      console.log('❌ Erro no logout:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUserProfile = async (newData) => {
    try {
      if (!user) return { success: false, error: 'Usuário não logado' };

      const updatedProfile = {
        ...userProfile,
        ...newData,
        lastModified: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), updatedProfile);
      setUserProfile(updatedProfile);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    logout,
    updateUserProfile,
    loadUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
