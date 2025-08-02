import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { firestore } from '../firebase-config-real';

/**
 * Serviço Firestore para gerenciar todos os dados do Climder
 * 
 * Coleções principais:
 * - users: Perfis de usuários e escaladores
 * - matches: Sistema de matches entre usuários
 * - groups: Grupos de escalada
 * - chats: Mensagens e conversas
 * - locations: Locais de escalada
 * - croquis: Croquis de rotas
 */
class FirestoreService {
  constructor() {
    this.listeners = new Map();
  }

  // ===========================================
  // USUÁRIOS E PERFIS
  // ===========================================

  /**
   * Busca escaladores para descoberta
   * @param {string} currentUserId - ID do usuário atual
   * @param {number} limitCount - Limite de resultados
   * @returns {Promise<Array>} Lista de escaladores
   */
  async getClimbersForDiscovery(currentUserId, limitCount = 10) {
    try {
      console.log('🔍 Buscando escaladores no Firestore...');
      
      const usersRef = collection(firestore, 'users');
      // Query muito simples para evitar problemas de índice e permissão
      const q = query(usersRef, limit(limitCount));
      
      const snapshot = await getDocs(q);
      const climbers = [];
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        // Filtrar no cliente para evitar problema de índice
        if (userData.uid !== currentUserId) {
          climbers.push({
            id: doc.id,
            // Mapear campos para compatibilidade com UI existente
            name: userData.displayName || userData.name || 'Escalador',
            age: userData.age || 25,
            grade: userData.climbingGrades?.sport || '5.8',
            type: userData.preferences?.climbingStyles?.[0] || 'Esportiva',
            experience: '2 anos',
            location: userData.location || 'Brasil',
            bio: userData.bio || 'Apaixonado por escalada!',
            image: userData.image || '🧗‍♂️',
            lastActive: 'Online',
            ...userData
          });
        }
      });
      
      console.log(`🔍 ${climbers.length} escaladores encontrados`);
      return climbers;
      
    } catch (error) {
      console.error('❌ Erro ao buscar escaladores:', error);
      return [];
    }
  }

  /**
   * Obtém perfil de usuário específico
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object|null>} Dados do usuário
   */
  async getUserProfile(userId) {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao obter perfil:', error);
      return null;
    }
  }

  // ===========================================
  // SISTEMA DE MATCHES
  // ===========================================

  /**
   * Registra um like/match
   * @param {string} fromUserId - ID de quem deu like
   * @param {string} toUserId - ID de quem recebeu like
   * @returns {Promise<boolean>} true se foi match mútuo
   */
  async recordLike(fromUserId, toUserId) {
    try {
      // Verificar se já existe like reverso (match!)
      const reverseMatchQuery = query(
        collection(firestore, 'matches'),
        where('fromUserId', '==', toUserId),
        where('toUserId', '==', fromUserId),
        where('status', '==', 'liked')
      );
      
      const reverseSnapshot = await getDocs(reverseMatchQuery);
      const isMatch = !reverseSnapshot.empty;
      
      // Registrar o like atual
      await addDoc(collection(firestore, 'matches'), {
        fromUserId,
        toUserId,
        status: 'liked',
        isMatch,
        createdAt: serverTimestamp()
      });
      
      // Se foi match, atualizar ambos os registros
      if (isMatch) {
        const reverseDocId = reverseSnapshot.docs[0].id;
        await updateDoc(doc(firestore, 'matches', reverseDocId), {
          isMatch: true,
          matchedAt: serverTimestamp()
        });
        
        console.log('🎉 MATCH! Entre', fromUserId, 'e', toUserId);
      }
      
      return isMatch;
      
    } catch (error) {
      console.error('❌ Erro ao registrar like:', error);
      return false;
    }
  }

  /**
   * Obtém matches do usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} Lista de matches
   */
  async getUserMatches(userId) {
    try {
      const matchesQuery = query(
        collection(firestore, 'matches'),
        where('isMatch', '==', true)
      );
      
      const snapshot = await getDocs(matchesQuery);
      const matches = [];
      
      for (const docSnap of snapshot.docs) {
        const matchData = docSnap.data();
        
        // Verificar se o usuário está envolvido no match
        let matchedUserId = null;
        if (matchData.fromUserId === userId) {
          matchedUserId = matchData.toUserId;
        } else if (matchData.toUserId === userId) {
          matchedUserId = matchData.fromUserId;
        }
        
        if (matchedUserId) {
          // Buscar dados do usuário matched
          const matchedUser = await this.getUserProfile(matchedUserId);
          if (matchedUser) {
            matches.push({
              matchId: docSnap.id,
              user: matchedUser,
              matchedAt: matchData.matchedAt,
              ...matchData
            });
          }
        }
      }
      
      console.log(`💕 ${matches.length} matches encontrados`);
      return matches;
      
    } catch (error) {
      console.error('❌ Erro ao obter matches:', error);
      return [];
    }
  }

  // ===========================================
  // SISTEMA DE GRUPOS
  // ===========================================

  /**
   * Cria um novo grupo de escalada
   * @param {string} organizerId - ID do organizador
   * @param {Object} groupData - Dados do grupo
   * @returns {Promise<string>} ID do grupo criado
   */
  async createGroup(organizerId, groupData) {
    try {
      const group = {
        ...groupData,
        organizerId,
        participants: [organizerId],
        participantCount: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };
      
      const docRef = await addDoc(collection(firestore, 'groups'), group);
      console.log('👥 Grupo criado:', docRef.id);
      return docRef.id;
      
    } catch (error) {
      console.error('❌ Erro ao criar grupo:', error);
      throw error;
    }
  }

  /**
   * Busca grupos disponíveis
   * @param {number} limitCount - Limite de resultados
   * @returns {Promise<Array>} Lista de grupos
   */
  async getAvailableGroups(limitCount = 20) {
    try {
      const groupsQuery = query(
        collection(firestore, 'groups'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(groupsQuery);
      const groups = [];
      
      for (const docSnap of snapshot.docs) {
        const groupData = docSnap.data();
        
        // Buscar dados do organizador
        const organizer = await this.getUserProfile(groupData.organizerId);
        
        groups.push({
          id: docSnap.id,
          ...groupData,
          organizerName: organizer?.displayName || 'Organizador',
          organizerData: organizer
        });
      }
      
      console.log(`👥 ${groups.length} grupos encontrados`);
      return groups;
      
    } catch (error) {
      console.error('❌ Erro ao buscar grupos:', error);
      return [];
    }
  }

  /**
   * Participar de um grupo
   * @param {string} groupId - ID do grupo
   * @param {string} userId - ID do usuário
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async joinGroup(groupId, userId) {
    try {
      const groupRef = doc(firestore, 'groups', groupId);
      
      await updateDoc(groupRef, {
        participants: arrayUnion(userId),
        participantCount: increment(1),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Usuário', userId, 'entrou no grupo', groupId);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao entrar no grupo:', error);
      return false;
    }
  }

  /**
   * Sair de um grupo
   * @param {string} groupId - ID do grupo
   * @param {string} userId - ID do usuário
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async leaveGroup(groupId, userId) {
    try {
      const groupRef = doc(firestore, 'groups', groupId);
      
      await updateDoc(groupRef, {
        participants: arrayRemove(userId),
        participantCount: increment(-1),
        updatedAt: serverTimestamp()
      });
      
      console.log('🚪 Usuário', userId, 'saiu do grupo', groupId);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao sair do grupo:', error);
      return false;
    }
  }

  // ===========================================
  // SISTEMA DE CHAT
  // ===========================================

  /**
   * Envia uma mensagem no chat
   * @param {string} chatId - ID do chat
   * @param {string} senderId - ID do remetente
   * @param {string} message - Texto da mensagem
   * @returns {Promise<string>} ID da mensagem
   */
  async sendMessage(chatId, senderId, message) {
    try {
      const messageData = {
        chatId,
        senderId,
        message,
        timestamp: serverTimestamp(),
        isRead: false
      };
      
      const docRef = await addDoc(collection(firestore, 'messages'), messageData);
      
      // Atualizar último timestamp do chat
      await setDoc(doc(firestore, 'chats', chatId), {
        lastMessage: message,
        lastMessageAt: serverTimestamp(),
        participants: arrayUnion(senderId)
      }, { merge: true });
      
      console.log('💬 Mensagem enviada:', docRef.id);
      return docRef.id;
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Escuta mensagens em tempo real
   * @param {string} chatId - ID do chat
   * @param {Function} callback - Callback para novas mensagens
   * @returns {Function} Função para parar de escutar
   */
  listenToMessages(chatId, callback) {
    try {
      const messagesQuery = query(
        collection(firestore, 'messages'),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'asc')
      );
      
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messages = [];
        snapshot.forEach(doc => {
          messages.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(messages);
      });
      
      this.listeners.set(chatId, unsubscribe);
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erro ao escutar mensagens:', error);
      return () => {};
    }
  }

  // ===========================================
  // UTILITÁRIOS
  // ===========================================

  /**
   * Remove todos os listeners ativos
   */
  cleanup() {
    this.listeners.forEach((unsubscribe, key) => {
      unsubscribe();
      console.log('🧹 Listener removido:', key);
    });
    this.listeners.clear();
  }

  // ===========================================
  // GRUPOS
  // ===========================================

  /**
   * Busca todos os grupos disponíveis
   * @param {number} limitCount - Limite de resultados
   * @returns {Promise<Array>} Lista de grupos
   */
  async getAllGroups(limitCount = 50) {
    try {
      console.log('🏔️ Buscando grupos no Firestore...');
      
      const groupsRef = collection(firestore, 'groups');
      // Query simples sem orderBy para evitar problemas de índice
      const groupsQuery = query(groupsRef, limit(limitCount));
      
      const snapshot = await getDocs(groupsQuery);
      const groups = [];
      
      snapshot.forEach((doc) => {
        groups.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Ordenar no cliente por data
      groups.sort((a, b) => {
        const dateA = new Date(a.date || '2025-01-01');
        const dateB = new Date(b.date || '2025-01-01');
        return dateA - dateB;
      });
      
      console.log(`✅ ${groups.length} grupos encontrados`);
      return groups;
      
    } catch (error) {
      console.error('❌ Erro ao buscar grupos:', error);
      return [];
    }
  }

  /**
   * Cria um novo grupo
   * @param {Object} groupData - Dados do grupo
   * @returns {Promise<string>} ID do grupo criado
   */
  async createGroup(groupData) {
    try {
      const docRef = await addDoc(collection(firestore, 'groups'), {
        ...groupData,
        participants: [groupData.organizerId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Grupo criado:', docRef.id);
      return docRef.id;
      
    } catch (error) {
      console.error('❌ Erro ao criar grupo:', error);
      throw error;
    }
  }

  // ===========================================
  // MATCHES
  // ===========================================

  /**
   * Cria match/like
   * @param {Object} matchData - Dados do match
   * @returns {Promise<boolean>} Sucesso
   */
  async createMatch(matchData) {
    try {
      await addDoc(collection(firestore, 'matches'), {
        ...matchData,
        createdAt: serverTimestamp()
      });
      
      console.log('✅ Match criado');
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao criar match:', error);
      return false;
    }
  }

  /**
   * Busca matches do usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} Lista de matches
   */
  async getUserMatches(userId) {
    try {
      console.log('💕 Buscando matches do usuário:', userId);
      
      const matchesRef = collection(firestore, 'matches');
      // Query simples sem orderBy para evitar índice composto
      const matchesQuery = query(
        matchesRef,
        where('userId', '==', userId),
        where('action', '==', 'like')
      );
      
      const snapshot = await getDocs(matchesQuery);
      const matches = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.climberData) {
          matches.push(data.climberData);
        }
      });
      
      // Ordenar no cliente para evitar índice
      matches.sort((a, b) => {
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateB - dateA;
      });
      
      console.log(`✅ ${matches.length} matches encontrados`);
      return matches;
      
    } catch (error) {
      console.error('❌ Erro ao buscar matches:', error);
      return [];
    }
  }

  /**
   * Verifica conectividade com Firestore
   * @returns {Promise<boolean>} Status da conexão
   */
  async checkConnection() {
    try {
      // Tentar fazer uma operação simples
      await getDocs(query(collection(firestore, 'users'), limit(1)));
      return true;
    } catch (error) {
      console.error('❌ Firestore não conectado:', error);
      return false;
    }
  }

  // ===========================================
  // DADOS DE TESTE
  // ===========================================

  /**
   * Popula Firestore com dados de teste
   * @returns {Promise<boolean>} Sucesso
   */
  async populateTestData() {
    try {
      console.log('🌱 Populando Firestore com dados de teste...');

      // Dados de escaladores de teste
      const testClimbers = [
        {
          uid: 'test-climber-1',
          displayName: 'Ana Silva',
          email: 'ana@teste.com',
          age: 28,
          bio: 'Apaixonada por escalada esportiva! 🧗‍♀️',
          location: 'Rio de Janeiro, RJ',
          climbingGrades: {
            sport: '6a',
            boulder: 'V4',
            trad: '5.8'
          },
          preferences: {
            climbingStyles: ['sport', 'boulder'],
            maxDistance: 50,
            daysAvailable: ['weekend']
          },
          image: '🧗‍♀️',
          lastActive: new Date().toISOString(),
          createdAt: serverTimestamp()
        },
        {
          uid: 'test-climber-2',
          displayName: 'Carlos Mendes',
          email: 'carlos@teste.com',
          age: 32,
          bio: 'Boulder é vida! 🪨',
          location: 'São Paulo, SP',
          climbingGrades: {
            sport: '7a',
            boulder: 'V6',
            trad: '5.10a'
          },
          preferences: {
            climbingStyles: ['boulder'],
            maxDistance: 30,
            daysAvailable: ['saturday', 'sunday']
          },
          image: '🧗‍♂️',
          lastActive: new Date().toISOString(),
          createdAt: serverTimestamp()
        }
      ];

      // Adicionar escaladores
      for (const climber of testClimbers) {
        await setDoc(doc(firestore, 'users', climber.uid), climber);
      }

      // Dados de grupos de teste
      const testGroups = [
        {
          title: 'Escalada no Pão de Açúcar',
          organizer: 'Ana Silva',
          organizerId: 'test-climber-1',
          date: '2025-08-15',
          time: '08:00',
          location: 'Pão de Açúcar - RJ',
          difficulty: '4º - 6º grau',
          participants: 3,
          maxParticipants: 6,
          equipment: 'Corda 60m, capacete obrigatório',
          description: 'Escalada clássica no Rio!',
          type: 'Esportiva',
          createdAt: serverTimestamp()
        },
        {
          title: 'Boulder em Petrópolis',
          organizer: 'Carlos Mendes',
          organizerId: 'test-climber-2',
          date: '2025-08-12',
          time: '14:00',
          location: 'Vale das Videiras - RJ',
          difficulty: 'V2 - V8',
          participants: 4,
          maxParticipants: 8,
          equipment: 'Crashpad obrigatório',
          description: 'Session de boulder!',
          type: 'Boulder',
          createdAt: serverTimestamp()
        }
      ];

      // Adicionar grupos
      for (const group of testGroups) {
        await addDoc(collection(firestore, 'groups'), group);
      }

      console.log('✅ Dados de teste adicionados ao Firestore');
      return true;

    } catch (error) {
      console.error('❌ Erro ao popular dados de teste:', error);
      return false;
    }
  }

  /**
   * Informações de debug
   * @returns {Object} Informações de debug
   */
  getDebugInfo() {
    return {
      activeListeners: this.listeners.size,
      listenerKeys: Array.from(this.listeners.keys()),
      timestamp: new Date().toISOString()
    };
  }
}

// Exportar instância singleton
export default new FirestoreService();