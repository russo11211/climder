import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Serviço de Notificações Push para o Climder
 * 
 * Gerencia todas as funcionalidades de notificações push incluindo:
 * - Inicialização e permissões
 * - Envio de notificações locais
 * - Gestão de histórico e badges
 * - Cleanup de recursos
 */
class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa o serviço de notificações
   * @returns {Promise<string|null>} Token do Expo Push ou null se falhar
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return this.expoPushToken;
      }

      console.log('🔔 Inicializando serviço de notificações...');

      // Verificar se é um dispositivo físico
      if (!Device.isDevice) {
        console.log('⚠️ Notificações push só funcionam em dispositivos físicos');
        return null;
      }

      // Solicitar permissões
      const permission = await this.requestPermissions();
      if (!permission) {
        console.log('❌ Permissão para notificações negada');
        return null;
      }

      // Obter token do Expo Push
      this.expoPushToken = await this.getExpoPushToken();
      
      // Configurar listeners
      this.setupNotificationListeners();
      
      // Configurar canal de notificação (Android)
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }

      this.isInitialized = true;
      console.log('✅ Serviço de notificações inicializado');
      
      return this.expoPushToken;
    } catch (error) {
      console.error('❌ Erro ao inicializar notificações:', error);
      return null;
    }
  }

  /**
   * Solicita permissões de notificação do usuário
   * @returns {Promise<boolean>} true se permissão concedida
   */
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permissão para notificações push negada');
        return false;
      }

      console.log('✅ Permissão para notificações concedida');
      return true;
    } catch (error) {
      console.error('❌ Erro ao solicitar permissões:', error);
      return false;
    }
  }

  /**
   * Obtém o token do Expo Push
   * @returns {Promise<string|null>} Token ou null se falhar
   */
  async getExpoPushToken() {
    try {
      // IMPORTANTE: Substitua 'your-expo-project-id' pelo ID real do seu projeto
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // ⚠️ ALTERE AQUI
      })).data;
      
      // Salvar token localmente para uso futuro
      await AsyncStorage.setItem('climder_push_token', token);
      
      return token;
    } catch (error) {
      console.error('❌ Erro ao obter token push:', error);
      return null;
    }
  }

  /**
   * Configura canais de notificação para Android
   * Cada tipo de notificação tem seu próprio canal
   */
  async setupAndroidChannels() {
    try {
      // Canal padrão
      await Notifications.setNotificationChannelAsync('climder-default', {
        name: 'Climder Notificações',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
        description: 'Notificações gerais do Climder'
      });

      // Canal para matches
      await Notifications.setNotificationChannelAsync('climder-matches', {
        name: 'Novos Matches',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10b981',
        description: 'Notificações de novos matches'
      });

      // Canal para grupos
      await Notifications.setNotificationChannelAsync('climder-groups', {
        name: 'Grupos de Escalada',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#f59e0b',
        description: 'Notificações sobre grupos de escalada'
      });

      // Canal para chat
      await Notifications.setNotificationChannelAsync('climder-chat', {
        name: 'Mensagens do Chat',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8b5cf6',
        description: 'Notificações de mensagens do chat'
      });

      console.log('✅ Canais de notificação Android configurados');
    } catch (error) {
      console.error('❌ Erro ao configurar canais Android:', error);
    }
  }

  /**
   * Configura listeners para notificações recebidas e tocadas
   */
  setupNotificationListeners() {
    // Listener para quando a notificação é recebida (app aberto)
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notificação recebida:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener para quando o usuário toca na notificação
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notificação tocada:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Processa notificação recebida
   * @param {Object} notification - Objeto da notificação recebida
   */
  async handleNotificationReceived(notification) {
    try {
      // Salvar notificação no histórico
      await this.saveNotificationToHistory(notification);
      
      // Atualizar badge count
      await this.updateBadgeCount();
    } catch (error) {
      console.error('❌ Erro ao processar notificação recebida:', error);
    }
  }

  /**
   * Processa resposta à notificação (quando tocada)
   * @param {Object} response - Resposta da notificação
   */
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    // Aqui você pode integrar com seu sistema de navegação
    if (data?.type) {
      console.log(`🧭 Navegando para: ${data.screen || 'tela padrão'}`, data);
      // Exemplo: navigation.navigate(data.screen, data.params);
    }
  }

  /**
   * Salva notificação no histórico local
   * @param {Object} notification - Notificação para salvar
   */
  async saveNotificationToHistory(notification) {
    try {
      const historyKey = 'climder_notification_history';
      const existingHistory = await AsyncStorage.getItem(historyKey);
      const notifications = existingHistory ? JSON.parse(existingHistory) : [];
      
      const newNotification = {
        id: notification.request.identifier,
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      // Adicionar no início da lista
      notifications.unshift(newNotification);
      
      // Manter apenas as últimas 50 notificações para evitar sobrecarga
      if (notifications.length > 50) {
        notifications.splice(50);
      }
      
      await AsyncStorage.setItem(historyKey, JSON.stringify(notifications));
      console.log('📝 Notificação salva no histórico');
    } catch (error) {
      console.error('❌ Erro ao salvar notificação:', error);
    }
  }

  /**
   * Atualiza o contador de badge com notificações não lidas
   */
  async updateBadgeCount() {
    try {
      const history = await this.getNotificationHistory();
      const unreadCount = history.filter(n => !n.read).length;
      
      await Notifications.setBadgeCountAsync(unreadCount);
      console.log(`📱 Badge atualizado: ${unreadCount} não lidas`);
    } catch (error) {
      console.error('❌ Erro ao atualizar badge:', error);
    }
  }

  // ===========================================
  // MÉTODOS PARA ENVIAR NOTIFICAÇÕES LOCAIS
  // ===========================================

  /**
   * Envia notificação de novo match
   * @param {Object} matchedUser - Usuário que fez match
   */
  async sendMatchNotification(matchedUser) {
    try {
      const identifier = `match-${matchedUser.id}-${Date.now()}`;
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Novo Match!',
          body: `Você fez match com ${matchedUser.name}! Que tal começar uma conversa?`,
          data: {
            type: 'match',
            screen: 'Matches',
            userId: matchedUser.id,
            userName: matchedUser.name
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          channelId: 'climder-matches',
        },
        trigger: { seconds: 1 },
        identifier,
      });

      console.log('✅ Notificação de match enviada');
      return identifier;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de match:', error);
      return null;
    }
  }

  /**
   * Envia notificação de nova mensagem no chat
   * @param {string} senderName - Nome do remetente
   * @param {string} message - Conteúdo da mensagem
   * @param {string} chatId - ID do chat
   */
  async sendChatNotification(senderName, message, chatId) {
    try {
      // Truncar mensagem se muito longa
      const truncatedMessage = message.length > 50 
        ? `${message.substring(0, 50)}...` 
        : message;

      const identifier = `chat-${chatId}-${Date.now()}`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `💬 ${senderName}`,
          body: truncatedMessage,
          data: {
            type: 'chat',
            screen: 'Chat',
            chatId: chatId,
            senderName: senderName
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          channelId: 'climder-chat',
        },
        trigger: { seconds: 2 },
        identifier,
      });

      console.log('✅ Notificação de chat enviada');
      return identifier;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de chat:', error);
      return null;
    }
  }

  /**
   * Envia notificação relacionada a grupos
   * @param {string} groupTitle - Título do grupo
   * @param {string} organizerName - Nome do organizador
   * @param {string} type - Tipo da notificação ('created', 'joined', 'reminder', 'invite')
   */
  async sendGroupNotification(groupTitle, organizerName, type = 'created') {
    try {
      const notificationContent = this.getGroupNotificationContent(groupTitle, organizerName, type);
      const identifier = `group-${type}-${Date.now()}`;

      await Notifications.scheduleNotificationAsync({
        content: {
          ...notificationContent,
          data: {
            type: 'group',
            screen: 'Groups',
            groupTitle: groupTitle,
            organizerName: organizerName,
            notificationType: type
          },
          sound: true,
          priority: type === 'reminder' 
            ? Notifications.AndroidNotificationPriority.HIGH 
            : Notifications.AndroidNotificationPriority.DEFAULT,
          channelId: 'climder-groups',
        },
        trigger: { seconds: 1 },
        identifier,
      });

      console.log(`✅ Notificação de grupo (${type}) enviada`);
      return identifier;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de grupo:', error);
      return null;
    }
  }

  /**
   * Gera conteúdo da notificação baseado no tipo de grupo
   * @param {string} groupTitle - Título do grupo
   * @param {string} organizerName - Nome do organizador
   * @param {string} type - Tipo da notificação
   * @returns {Object} Objeto com title e body da notificação
   */
  getGroupNotificationContent(groupTitle, organizerName, type) {
    switch (type) {
      case 'created':
        return {
          title: '👥 Novo Grupo Disponível!',
          body: `${organizerName} criou o grupo "${groupTitle}". Participe!`
        };
      case 'joined':
        return {
          title: '🎉 Alguém se juntou ao seu grupo!',
          body: `Um escalador se juntou ao grupo "${groupTitle}"`
        };
      case 'reminder':
        return {
          title: '⏰ Lembrete de Grupo',
          body: `O grupo "${groupTitle}" é amanhã! Não esqueça.`
        };
      case 'invite':
        return {
          title: '📨 Convite para Grupo',
          body: `${organizerName} te convidou para o grupo "${groupTitle}"`
        };
      default:
        return {
          title: '👥 Atualização de Grupo',
          body: `Novidade no grupo "${groupTitle}"`
        };
    }
  }

  /**
   * Envia lembrete de escalada
   * @param {string} groupTitle - Título do grupo
   * @param {string} timeUntil - Tempo até a escalada ('1day', '2hours', etc.)
   */
  async sendClimbingReminder(groupTitle, timeUntil) {
    try {
      const body = this.getReminderMessage(groupTitle, timeUntil);
      const identifier = `reminder-${groupTitle}-${timeUntil}-${Date.now()}`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏔️ Lembrete de Escalada',
          body,
          data: {
            type: 'reminder',
            screen: 'Groups',
            groupTitle: groupTitle,
            timeUntil: timeUntil
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          channelId: 'climder-groups',
        },
        trigger: { seconds: 1 },
        identifier,
      });

      console.log('✅ Lembrete de escalada enviado');
      return identifier;
    } catch (error) {
      console.error('❌ Erro ao enviar lembrete:', error);
      return null;
    }
  }

  /**
   * Gera mensagem de lembrete baseada no tempo restante
   * @param {string} groupTitle - Título do grupo
   * @param {string} timeUntil - Tempo até a escalada
   * @returns {string} Mensagem formatada
   */
  getReminderMessage(groupTitle, timeUntil) {
    switch (timeUntil) {
      case '1day':
        return `Sua escalada no grupo "${groupTitle}" é amanhã! 🧗‍♀️`;
      case '2hours':
        return `Sua escalada no grupo "${groupTitle}" é em 2 horas! ⏰`;
      case '30min':
        return `Sua escalada no grupo "${groupTitle}" começa em 30 minutos! 🚨`;
      default:
        return `Lembrete: escalada no grupo "${groupTitle}" se aproxima!`;
    }
  }

  // ===========================================
  // MÉTODOS DE UTILIDADE E GESTÃO
  // ===========================================

  /**
   * Cancela notificação específica
   * @param {string} identifier - ID da notificação
   */
  async cancelNotification(identifier) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log(`✅ Notificação cancelada: ${identifier}`);
    } catch (error) {
      console.error('❌ Erro ao cancelar notificação:', error);
    }
  }

  /**
   * Cancela todas as notificações agendadas
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ Todas as notificações canceladas');
    } catch (error) {
      console.error('❌ Erro ao cancelar notificações:', error);
    }
  }

  /**
   * Obtém lista de notificações agendadas
   * @returns {Promise<Array>} Array de notificações agendadas
   */
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log('📋 Notificações agendadas:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('❌ Erro ao obter notificações agendadas:', error);
      return [];
    }
  }

  /**
   * Marca notificação como lida
   * @param {string} notificationId - ID da notificação
   */
  async markNotificationAsRead(notificationId) {
    try {
      const historyKey = 'climder_notification_history';
      const existingHistory = await AsyncStorage.getItem(historyKey);
      const notifications = existingHistory ? JSON.parse(existingHistory) : [];
      
      const updatedNotifications = notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      );
      
      await AsyncStorage.setItem(historyKey, JSON.stringify(updatedNotifications));
      await this.updateBadgeCount();
      
      console.log('✅ Notificação marcada como lida');
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
    }
  }

  /**
   * Obtém histórico de notificações
   * @returns {Promise<Array>} Array de notificações do histórico
   */
  async getNotificationHistory() {
    try {
      const historyKey = 'climder_notification_history';
      const history = await AsyncStorage.getItem(historyKey);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('❌ Erro ao obter histórico:', error);
      return [];
    }
  }

  /**
   * Limpa histórico de notificações
   */
  async clearNotificationHistory() {
    try {
      await AsyncStorage.removeItem('climder_notification_history');
      await Notifications.setBadgeCountAsync(0);
      console.log('✅ Histórico de notificações limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar histórico:', error);
    }
  }

  /**
   * Limpa recursos e remove listeners
   * Deve ser chamado ao fazer logout ou fechar o app
   */
  cleanup() {
    try {
      if (this.notificationListener) {
        Notifications.removeNotificationSubscription(this.notificationListener);
        this.notificationListener = null;
      }
      
      if (this.responseListener) {
        Notifications.removeNotificationSubscription(this.responseListener);
        this.responseListener = null;
      }
      
      this.isInitialized = false;
      console.log('🧹 Cleanup de notificações realizado');
    } catch (error) {
      console.error('❌ Erro no cleanup:', error);
    }
  }

  /**
   * Verifica se o serviço está inicializado
   * @returns {boolean} true se inicializado
   */
  isServiceInitialized() {
    return this.isInitialized;
  }

  /**
   * Obtém o token push atual
   * @returns {string|null} Token ou null se não disponível
   */
  getCurrentPushToken() {
    return this.expoPushToken;
  }
}

// Exportar instância singleton
export default new NotificationService();