import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { firestore } from '../firebase-config-real';

/**
 * Serviço de Chat em Tempo Real com Firestore
 * 
 * Funcionalidades:
 * - Mensagens em tempo real
 * - Chats entre matches
 * - Histórico de mensagens
 * - Status de leitura
 */
class ChatService {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Gera ID único para chat entre dois usuários
   * @param {string} userId1 - ID do primeiro usuário
   * @param {string} userId2 - ID do segundo usuário
   * @returns {string} - ID único do chat
   */
  getChatId(userId1, userId2) {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * Cria ou obtém um chat entre dois usuários
   * @param {string} userId1 - ID do primeiro usuário
   * @param {string} userId2 - ID do segundo usuário
   * @param {Object} user1Data - Dados do primeiro usuário
   * @param {Object} user2Data - Dados do segundo usuário
   * @returns {Promise<string>} - ID do chat
   */
  async createOrGetChat(userId1, userId2, user1Data = {}, user2Data = {}) {
    try {
      const chatId = this.getChatId(userId1, userId2);
      const chatRef = doc(firestore, 'chats', chatId);
      
      // Criar documento do chat se não existir
      await setDoc(chatRef, {
        participants: [userId1, userId2],
        participantsData: {
          [userId1]: {
            uid: userId1,
            displayName: user1Data.displayName || 'Usuário',
            lastSeen: serverTimestamp()
          },
          [userId2]: {
            uid: userId2,
            displayName: user2Data.displayName || 'Usuário',
            lastSeen: serverTimestamp()
          }
        },
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null
      }, { merge: true });

      // Enviar mensagem de boas-vindas se for novo chat
      const messagesQuery = query(
        collection(firestore, 'messages'),
        where('chatId', '==', chatId),
        limit(1)
      );
      
      const existingMessages = await getDocs(messagesQuery);
      
      if (existingMessages.empty) {
        await this.sendWelcomeMessage(chatId);
      }

      console.log('✅ Chat criado/obtido:', chatId);
      return chatId;
      
    } catch (error) {
      console.error('❌ Erro ao criar/obter chat:', error);
      throw error;
    }
  }

  /**
   * Envia mensagem de boas-vindas do sistema
   * @param {string} chatId - ID do chat
   */
  async sendWelcomeMessage(chatId) {
    try {
      await addDoc(collection(firestore, 'messages'), {
        chatId,
        text: '🎉 Vocês fizeram match! Que tal se conhecerem melhor e marcarem uma escalada juntos?',
        senderId: 'system',
        senderName: 'Climder',
        isSystem: true,
        createdAt: serverTimestamp(),
        readBy: []
      });
      
      console.log('✅ Mensagem de boas-vindas enviada');
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem de boas-vindas:', error);
    }
  }

  /**
   * Envia uma mensagem
   * @param {string} chatId - ID do chat
   * @param {string} text - Texto da mensagem
   * @param {string} senderId - ID do remetente
   * @param {string} senderName - Nome do remetente
   * @returns {Promise<string>} - ID da mensagem enviada
   */
  async sendMessage(chatId, text, senderId, senderName) {
    try {
      if (!text.trim()) {
        throw new Error('Mensagem não pode estar vazia');
      }

      console.log('💬 Enviando mensagem:', { chatId, senderId, text: text.substring(0, 50) + '...' });

      // Enviar mensagem
      const messageRef = await addDoc(collection(firestore, 'messages'), {
        chatId,
        text: text.trim(),
        senderId,
        senderName,
        isSystem: false,
        createdAt: serverTimestamp(),
        readBy: [senderId] // Marcar como lida pelo remetente
      });

      // Atualizar última mensagem do chat
      await updateDoc(doc(firestore, 'chats', chatId), {
        lastMessage: text.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: senderId
      });

      console.log('✅ Mensagem enviada:', messageRef.id);
      return messageRef.id;
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  /**
   * Escuta mensagens em tempo real
   * @param {string} chatId - ID do chat
   * @param {Function} callback - Função chamada quando mensagens mudam
   * @returns {Function} - Função para parar de escutar
   */
  listenToMessages(chatId, callback) {
    try {
      console.log('👂 Iniciando listener de mensagens para:', chatId);

      const messagesQuery = query(
        collection(firestore, 'messages'),
        where('chatId', '==', chatId),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messages = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            text: data.text,
            senderId: data.senderId,
            senderName: data.senderName,
            isSystem: data.isSystem || false,
            timestamp: data.createdAt?.toMillis() || Date.now(),
            readBy: data.readBy || []
          });
        });

        console.log(`📱 ${messages.length} mensagens recebidas`);
        callback(messages);
      }, (error) => {
        console.error('❌ Erro no listener de mensagens:', error);
        callback([]);
      });

      // Salvar listener para cleanup
      this.listeners.set(chatId, unsubscribe);
      
      return unsubscribe;
      
    } catch (error) {
      console.error('❌ Erro ao configurar listener:', error);
      return () => {};
    }
  }

  /**
   * Marca mensagens como lidas
   * @param {string} chatId - ID do chat
   * @param {string} userId - ID do usuário que leu
   */
  async markAsRead(chatId, userId) {
    try {
      const messagesQuery = query(
        collection(firestore, 'messages'),
        where('chatId', '==', chatId),
        where('senderId', '!=', userId) // Apenas mensagens de outros usuários
      );

      const snapshot = await getDocs(messagesQuery);
      
      const batch = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.readBy?.includes(userId)) {
          batch.push(
            updateDoc(doc.ref, {
              readBy: [...(data.readBy || []), userId]
            })
          );
        }
      });

      await Promise.all(batch);
      console.log('✅ Mensagens marcadas como lidas');
      
    } catch (error) {
      console.error('❌ Erro ao marcar como lida:', error);
    }
  }

  /**
   * Obtém chats do usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} - Lista de chats
   */
  async getUserChats(userId) {
    try {
      const chatsQuery = query(
        collection(firestore, 'chats'),
        where('participants', 'array-contains', userId)
      );

      const snapshot = await getDocs(chatsQuery);
      const chats = [];

      snapshot.forEach((doc) => {
        chats.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ ${chats.length} chats encontrados para usuário:`, userId);
      return chats;
      
    } catch (error) {
      console.error('❌ Erro ao buscar chats:', error);
      return [];
    }
  }

  /**
   * Para de escutar mensagens de um chat específico
   * @param {string} chatId - ID do chat
   */
  stopListening(chatId) {
    const unsubscribe = this.listeners.get(chatId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(chatId);
      console.log('🔇 Listener parado para chat:', chatId);
    }
  }

  /**
   * Para todos os listeners ativos
   */
  cleanup() {
    console.log('🧹 Limpando listeners de chat...');
    this.listeners.forEach((unsubscribe, chatId) => {
      unsubscribe();
      console.log('🔇 Listener parado:', chatId);
    });
    this.listeners.clear();
  }
}

// Exportar instância singleton
export default new ChatService();