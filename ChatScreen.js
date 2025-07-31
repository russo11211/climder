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
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function ChatScreen({ visible, onClose, matchedUser, userProfile }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef(null);

  // Carregar mensagens quando o chat abrir
  useEffect(() => {
    if (visible && matchedUser) {
      loadMessages();
    }
  }, [visible, matchedUser]);

  // Auto-scroll para baixo quando novas mensagens chegarem
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const getChatId = (userId1, userId2) => {
    // Criar ID único para o chat baseado nos IDs dos usuários
    const sortedIds = [userId1, userId2].sort();
    return `chat_${sortedIds[0]}_${sortedIds[1]}`;
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const chatId = getChatId(userProfile?.uid || 'user', matchedUser.id);
      const savedMessages = await AsyncStorage.getItem(chatId);
      
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Primeira vez no chat - mensagem de boas-vindas
        const welcomeMessage = {
          id: Date.now(),
          text: `🎉 Vocês fizeram match! Que tal se conhecerem melhor e marcarem uma escalada juntos?`,
          sender: 'system',
          senderName: 'Climder',
          timestamp: Date.now(),
          isSystem: true
        };
        setMessages([welcomeMessage]);
        await saveMessages(chatId, [welcomeMessage]);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMessages = async (chatId, messagesToSave) => {
    try {
      await AsyncStorage.setItem(chatId, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Erro ao salvar mensagens:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const userMessage = {
        id: Date.now(),
        text: messageText,
        sender: userProfile?.uid || 'user',
        senderName: userProfile?.displayName || 'Você',
        timestamp: Date.now(),
        isSystem: false
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      const chatId = getChatId(userProfile?.uid || 'user', matchedUser.id);
      await saveMessages(chatId, updatedMessages);

      // Simular resposta automática (para demonstração)
      setTimeout(() => {
        simulateAutoReply(updatedMessages, chatId);
      }, 1000 + Math.random() * 2000);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      Alert.alert('Erro', 'Falha ao enviar mensagem');
    } finally {
      setIsSending(false);
    }
  };

  const simulateAutoReply = async (currentMessages, chatId) => {
    // Simular resposta automática baseada na última mensagem
    const lastMessage = currentMessages[currentMessages.length - 1];
    let replyText = getAutoReply(lastMessage.text);

    const autoReply = {
      id: Date.now(),
      text: replyText,
      sender: matchedUser.id,
      senderName: matchedUser.name,
      timestamp: Date.now(),
      isSystem: false
    };

    const updatedMessages = [...currentMessages, autoReply];
    setMessages(updatedMessages);
    await saveMessages(chatId, updatedMessages);
  };

  const getAutoReply = (messageText) => {
    const text = messageText.toLowerCase();
    
    // Respostas baseadas em palavras-chave relacionadas à escalada
    if (text.includes('escalada') || text.includes('escalar')) {
      return "Amo escalada também! Qual tipo você mais curte?";
    }
    if (text.includes('local') || text.includes('onde')) {
      return "Conheço vários locais bacanas! Que tal marcarmos para ir em algum?";
    }
    if (text.includes('grade') || text.includes('dificuldade')) {
      return `Escalo principalmente ${matchedUser.grade}, mas gosto de tentar coisas mais difíceis às vezes!`;
    }
    if (text.includes('quando') || text.includes('dia')) {
      return "Sou bem flexível com horários! E você, prefere manhã ou tarde?";
    }
    if (text.includes('equipamento') || text.includes('gear')) {
      return "Tenho equipamento completo! Se precisar de algo posso levar.";
    }
    if (text.includes('experiência') || text.includes('tempo')) {
      return `Escalo há ${matchedUser.experience || '5 anos'}! E você, há quanto tempo escala?`;
    }
    if (text.includes('oi') || text.includes('olá') || text.includes('hello')) {
      return "Oi! Que legal que fizemos match! 🧗‍♀️";
    }
    if (text.includes('obrigad') || text.includes('valeu')) {
      return "De nada! É sempre bom conhecer outros escaladores! 😊";
    }
    
    // Respostas genéricas variadas
    const genericReplies = [
      "Interessante! Conta mais sobre isso!",
      "Concordo totalmente! 👍",
      "Que bacana! Também penso assim.",
      "Show! Vamos marcar uma escalada em breve?",
      "Perfeito! Acho que vamos nos dar bem escalando juntos! 🧗‍♀️",
      "Legal! Qual foi sua melhor experiência escalando?",
      "Massa! Tenho certeza que será uma ótima parceria!"
    ];
    
    return genericReplies[Math.floor(Math.random() * genericReplies.length)];
  };

  const proposeClimbing = () => {
    const proposal = {
      id: Date.now(),
      text: `🏔️ Que tal escalarmos juntos no final de semana? Posso sugerir alguns locais incríveis que conheço!`,
      sender: userProfile?.uid || 'user',
      senderName: userProfile?.displayName || 'Você',
      timestamp: Date.now(),
      isSystem: false,
      isProposal: true
    };

    const updatedMessages = [...messages, proposal];
    setMessages(updatedMessages);

    const chatId = getChatId(userProfile?.uid || 'user', matchedUser.id);
    saveMessages(chatId, updatedMessages);
  };

  const askLocation = () => {
    const question = {
      id: Date.now(),
      text: `📍 Qual local de escalada você mais gosta? Sempre estou procurando novos lugares para explorar!`,
      sender: userProfile?.uid || 'user',
      senderName: userProfile?.displayName || 'Você',
      timestamp: Date.now(),
      isSystem: false,
      isQuestion: true
    };

    const updatedMessages = [...messages, question];
    setMessages(updatedMessages);

    const chatId = getChatId(userProfile?.uid || 'user', matchedUser.id);
    saveMessages(chatId, updatedMessages);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  if (!visible || !matchedUser) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerIcon}>{matchedUser.image}</Text>
            <View>
              <Text style={styles.headerName}>{matchedUser.name}</Text>
              <Text style={styles.headerDetails}>
                {matchedUser.grade} • {matchedUser.climbingType}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.infoButton} 
            onPress={() => 
              Alert.alert(
                `${matchedUser.name}`,
                `${matchedUser.bio}\n\n📍 ${matchedUser.location}\n🧗‍♀️ ${matchedUser.experience} de experiência\n⏰ Prefere: ${matchedUser.preference}`
              )
            }
          >
            <Text style={styles.infoButtonText}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        {/* Messages Container */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando conversa...</Text>
            </View>
          ) : (
            messages.map((message, index) => {
              const showDate = index === 0 || 
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
              
              return (
                <View key={message.id}>
                  {showDate && (
                    <View style={styles.dateContainer}>
                      <Text style={styles.dateText}>
                        {formatDate(message.timestamp)}
                      </Text>
                    </View>
                  )}
                  
                  <View
                    style={[
                      styles.messageContainer,
                      message.isSystem 
                        ? styles.systemMessage
                        : message.sender === (userProfile?.uid || 'user')
                        ? styles.userMessage
                        : styles.otherMessage
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        message.isSystem 
                          ? styles.systemBubble
                          : message.sender === (userProfile?.uid || 'user')
                          ? styles.userBubble
                          : styles.otherBubble,
                        message.isProposal && styles.proposalBubble,
                        message.isQuestion && styles.questionBubble
                      ]}
                    >
                      {!message.isSystem && (
                        <Text style={styles.senderName}>
                          {message.senderName}
                        </Text>
                      )}
                      
                      <Text
                        style={[
                          styles.messageText,
                          message.isSystem 
                            ? styles.systemText
                            : message.sender === (userProfile?.uid || 'user')
                            ? styles.userText
                            : styles.otherText
                        ]}
                      >
                        {message.text}
                      </Text>
                      
                      <Text
                        style={[
                          styles.timeText,
                          message.sender === (userProfile?.uid || 'user')
                            ? styles.userTimeText
                            : styles.otherTimeText
                        ]}
                      >
                        {formatTime(message.timestamp)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Quick Action Buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickButton} onPress={proposeClimbing}>
            <Text style={styles.quickButtonText}>🏔️ Propor Escalada</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickButton} onPress={askLocation}>
            <Text style={styles.quickButtonText}>📍 Perguntar Local</Text>
          </TouchableOpacity>
        </View>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#9ca3af"
            multiline={true}
            maxLength={500}
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!newMessage.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || isSending}
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
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoButton: {
    padding: 8,
  },
  infoButtonText: {
    fontSize: 20,
    color: '#6b7280',
  },

  // Messages Styles
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  
  // Date Separator
  dateContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Message Containers
  messageContainer: {
    marginBottom: 12,
  },
  systemMessage: {
    alignItems: 'center',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },

  // Message Bubbles
  messageBubble: {
    maxWidth: width * 0.75,
    padding: 12,
    borderRadius: 16,
    position: 'relative',
  },
  systemBubble: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderBottomLeftRadius: 4,
  },
  proposalBubble: {
    borderColor: '#10b981',
    borderWidth: 2,
  },
  questionBubble: {
    borderColor: '#f59e0b',
    borderWidth: 2,
  },

  // Message Text
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#6b7280',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  systemText: {
    color: '#3b82f6',
    textAlign: 'center',
    fontWeight: '500',
  },
  userText: {
    color: 'white',
  },
  otherText: {
    color: '#1f2937',
  },
  timeText: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  userTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimeText: {
    color: '#9ca3af',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#eff6ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  quickButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },

  // Input Container
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'flex-end',
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
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendButtonText: {
    fontSize: 20,
  },
});