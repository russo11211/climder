import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export default function ChatScreen({ visible, onClose, matchedUser }) {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (visible && matchedUser) {
      loadMessages();
    }
  }, [visible, matchedUser]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const chatId = getChatId(userProfile?.uid, matchedUser.id);
      const savedMessages = await AsyncStorage.getItem(`chat_${chatId}`);
      
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Mensagens iniciais automáticas
        const initialMessages = [
          {
            id: 1,
            text: `🎉 Vocês fizeram match! Que tal planejar uma escalada juntos?`,
            sender: 'system',
            timestamp: Date.now() - 1000,
            isSystem: true
          }
        ];
        setMessages(initialMessages);
        await saveMessages(chatId, initialMessages);
      }
    } catch (error) {
      console.log('Erro ao carregar mensagens:', error);
    }
    setLoading(false);
  };

  const getChatId = (userId1, userId2) => {
    return [userId1, userId2].sort().join('_');
  };

  const saveMessages = async (chatId, messagesToSave) => {
    try {
      await AsyncStorage.setItem(`chat_${chatId}`, JSON.stringify(messagesToSave));
    } catch (error) {
      console.log('Erro ao salvar mensagens:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: userProfile?.uid || 'user',
      senderName: userProfile?.displayName || 'Você',
      timestamp: Date.now(),
      isSystem: false
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    setNewMessage('');

    // Simular resposta automática (para demonstração)
    setTimeout(() => {
      const autoReply = {
        id: Date.now() + 1,
        text: getAutoReply(),
        sender: matchedUser.id,
        senderName: matchedUser.name,
        timestamp: Date.now(),
        isSystem: false
      };
      
      const finalMessages = [...updatedMessages, autoReply];
      setMessages(finalMessages);
      
      const chatId = getChatId(userProfile?.uid, matchedUser.id);
      saveMessages(chatId, finalMessages);
    }, 1500);

    // Salvar mensagens
    const chatId = getChatId(userProfile?.uid, matchedUser.id);
    await saveMessages(chatId, updatedMessages);

    // Scroll para o final
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const getAutoReply = () => {
    const replies = [
      "Oi! Que legal que fizemos match! 🧗‍♀️",
      "Olá! Também curto escalada! Qual seu local preferido?",
      "Opa! Que tal escalarmos juntos no fim de semana?",
      "Oi! Vi que você escala no mesmo nível que eu. Bora trocar uma ideia?",
      "Olá! Adoro conhecer outros escaladores. Conta mais sobre você!",
      "Oi! Que coincidência, também estou procurando parceiros para escalar!",
      "Olá! Seu perfil é interessante. Qual tipo de escalada você mais curte?"
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const proposeClimbingSession = () => {
    const suggestion = {
      id: Date.now(),
      text: `🏔️ Que tal escalarmos juntos? Posso sugerir alguns locais bacanas!`,
      sender: userProfile?.uid || 'user',
      senderName: userProfile?.displayName || 'Você',
      timestamp: Date.now(),
      isSystem: false,
      isProposal: true
    };

    const updatedMessages = [...messages, suggestion];
    setMessages(updatedMessages);

    const chatId = getChatId(userProfile?.uid, matchedUser.id);
    saveMessages(chatId, updatedMessages);
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
          
          <TouchableOpacity style={styles.infoButton} onPress={() => 
            Alert.alert('Perfil', `${matchedUser.name}\n\n${matchedUser.bio}`)
          }>
            <Text style={styles.infoButtonText}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando conversa...</Text>
            </View>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.isSystem 
                    ? styles.systemMessage
                    : message.sender === (userProfile?.uid || 'user')
                    ? styles.myMessage
                    : styles.theirMessage
                ]}
              >
                {message.isSystem ? (
                  <Text style={styles.systemMessageText}>{message.text}</Text>
                ) : (
                  <>
                    <Text style={[
                      styles.messageText,
                      message.sender === (userProfile?.uid || 'user')
                        ? styles.myMessageText
                        : styles.theirMessageText
                    ]}>
                      {message.text}
                    </Text>
                    <Text style={[
                      styles.messageTime,
                      message.sender === (userProfile?.uid || 'user')
                        ? styles.myMessageTime
                        : styles.theirMessageTime
                    ]}>
                      {formatTime(message.timestamp)}
                    </Text>
                  </>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={proposeClimbingSession}
          >
            <Text style={styles.quickActionText}>🏔️ Propor Escalada</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => setNewMessage('Qual seu local favorito para escalar?')}
          >
            <Text style={styles.quickActionText}>📍 Perguntar Local</Text>
          </TouchableOpacity>
        </View>

        {/* Input */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#9ca3af"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Text style={styles.sendButtonText}>📤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    fontSize: 18,
  },
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
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
  },
  systemMessageText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
  },
  theirMessageText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  theirMessageTime: {
    color: '#9ca3af',
    textAlign: 'left',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    color: '#1f2937',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendButtonText: {
    fontSize: 18,
  },
});