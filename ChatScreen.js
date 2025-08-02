import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  Keyboard,
  Dimensions,
} from 'react-native';
import ChatService from './services/ChatService';

const { width, height } = Dimensions.get('window');

export default function ChatScreen({ visible, onClose, matchedUser, userProfile }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [chatId, setChatId] = useState(null);
  const scrollViewRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Inicializar chat quando abrir
  useEffect(() => {
    if (visible && matchedUser && userProfile) {
      initializeChat();
    }
    
    // Cleanup quando fechar
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [visible, matchedUser, userProfile]);

  // Auto-scroll para baixo quando novas mensagens chegarem
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      console.log('💬 Inicializando chat com:', matchedUser.name);

      // Criar/obter chat
      const newChatId = await ChatService.createOrGetChat(
        userProfile.uid,
        matchedUser.id,
        { displayName: userProfile.displayName },
        { displayName: matchedUser.name }
      );

      setChatId(newChatId);

      // Iniciar listener de mensagens em tempo real
      unsubscribeRef.current = ChatService.listenToMessages(newChatId, (newMessages) => {
        console.log(`📱 ${newMessages.length} mensagens recebidas em tempo real`);
        setMessages(newMessages);
        setLoading(false);
      });

      // Marcar mensagens como lidas
      await ChatService.markAsRead(newChatId, userProfile.uid);

    } catch (error) {
      console.error('❌ Erro ao inicializar chat:', error);
      setLoading(false);
      Alert.alert('Erro', 'Não foi possível carregar o chat. Tente novamente.');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending || !chatId) return;

    setIsSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      console.log('📤 Enviando mensagem:', messageText.substring(0, 50) + '...');

      await ChatService.sendMessage(
        chatId,
        messageText,
        userProfile.uid,
        userProfile.displayName || 'Você'
      );

      console.log('✅ Mensagem enviada com sucesso');

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      Alert.alert('Erro', 'Não foi possível enviar a mensagem. Tente novamente.');
      
      // Restaurar mensagem no campo se falhou
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseChat = () => {
    // Marcar mensagens como lidas antes de fechar
    if (chatId) {
      ChatService.markAsRead(chatId, userProfile.uid);
    }
    
    // Parar listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    // Resetar estados
    setMessages([]);
    setLoading(true);
    setChatId(null);
    
    onClose();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const renderMessage = (message, index) => {
    const isMyMessage = message.senderId === userProfile?.uid;
    const isSystem = message.isSystem;
    
    return (
      <View
        key={message.id || index}
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
          isSystem && styles.systemMessage
        ]}
      >
        {!isMyMessage && !isSystem && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          isSystem && styles.systemMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText,
            isSystem && styles.systemMessageText
          ]}>
            {message.text}
          </Text>
          
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
            isSystem && styles.systemMessageTime
          ]}>
            {formatTimestamp(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleCloseChat}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleCloseChat}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.matchName}>{matchedUser?.name || 'Chat'}</Text>
            <Text style={styles.matchStatus}>
              {loading ? 'Conectando...' : 'Online'}
            </Text>
          </View>
          
          <View style={styles.matchAvatar}>
            <Text style={styles.matchAvatarText}>{matchedUser?.image || '🧗‍♂️'}</Text>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>🔥 Carregando mensagens...</Text>
              <Text style={styles.loadingSubtext}>Conectando ao Firebase</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>💬 Comece a conversa!</Text>
              <Text style={styles.emptySubtext}>Envie a primeira mensagem</Text>
            </View>
          ) : (
            messages.map(renderMessage)
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={500}
            editable={!isSending}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (isSending || !newMessage.trim()) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={isSending || !newMessage.trim()}
          >
            <Text style={styles.sendButtonText}>
              {isSending ? '⏳' : '📤'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  matchStatus: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 2,
  },
  matchAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchAvatarText: {
    fontSize: 20,
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Message Bubbles
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  systemMessage: {
    alignSelf: 'center',
    maxWidth: '90%',
  },
  senderName: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myMessageBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  systemMessageBubble: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#1f2937',
  },
  systemMessageText: {
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: '#e5e7eb',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#9ca3af',
  },
  systemMessageTime: {
    color: '#9ca3af',
    textAlign: 'center',
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    fontSize: 18,
  },
});