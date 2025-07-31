import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Alert,
  Switch,
  RefreshControl,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';

const { width } = Dimensions.get('window');

/**
 * Central de Notificações do Climder
 * 
 * Componente responsável por:
 * - Exibir histórico de notificações
 * - Gerenciar configurações de notificação
 * - Permitir ações como marcar como lida, excluir, etc.
 * - Navegação contextual a partir das notificações
 */
export default function NotificationCenter({ visible, onClose, onNavigate }) {
  // Estados principais
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Configurações de notificação
  const [settings, setSettings] = useState({
    matches: true,
    groups: true,
    chat: true,
    reminders: true,
  });

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (visible) {
      loadNotifications();
      loadSettings();
    }
  }, [visible]);

  /**
   * Carrega o histórico de notificações do storage
   */
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const history = await NotificationService.getNotificationHistory();
      
      // Ordenar por timestamp (mais recentes primeiro)
      const sortedHistory = history.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setNotifications(sortedHistory);
      console.log(`📋 ${sortedHistory.length} notificações carregadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      Alert.alert('Erro', 'Falha ao carregar notificações');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carrega as configurações de notificação salvas
   */
  const loadSettings = useCallback(async () => {
    try {
      const settingsKey = 'climder_notification_settings';
      const savedSettings = await AsyncStorage.getItem(settingsKey);
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        console.log('⚙️ Configurações carregadas:', parsedSettings);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
    }
  }, []);

  /**
   * Salva as configurações de notificação
   * @param {Object} newSettings - Novas configurações
   */
  const saveSettings = useCallback(async (newSettings) => {
    try {
      const settingsKey = 'climder_notification_settings';
      await AsyncStorage.setItem(settingsKey, JSON.stringify(newSettings));
      setSettings(newSettings);
      console.log('💾 Configurações salvas:', newSettings);
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      Alert.alert('Erro', 'Falha ao salvar configurações');
    }
  }, []);

  /**
   * Manipula o toque em uma notificação
   * @param {Object} notification - Notificação tocada
   */
  const handleNotificationPress = useCallback(async (notification) => {
    try {
      // Marcar como lida se ainda não foi lida
      if (!notification.read) {
        await NotificationService.markNotificationAsRead(notification.id);
        
        // Atualizar lista local
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      }

      // Navegar se tiver dados de navegação e callback disponível
      if (notification.data && onNavigate) {
        console.log('🧭 Navegando de notificação:', notification.data);
        onNavigate(notification.data);
        onClose();
      } else {
        console.log('ℹ️ Notificação sem dados de navegação');
      }
    } catch (error) {
      console.error('❌ Erro ao processar notificação:', error);
    }
  }, [onNavigate, onClose]);

  /**
   * Confirma e exclui uma notificação específica
   * @param {string} notificationId - ID da notificação
   */
  const handleDeleteNotification = useCallback((notificationId) => {
    Alert.alert(
      'Excluir Notificação',
      'Tem certeza que deseja excluir esta notificação?',
      [
        { 
          text: 'Cancelar', 
          style: 'cancel' 
        },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteNotification(notificationId)
        }
      ]
    );
  }, []);

  /**
   * Exclui uma notificação do histórico
   * @param {string} notificationId - ID da notificação
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      setNotifications(updatedNotifications);
      
      // Salvar lista atualizada
      const historyKey = 'climder_notification_history';
      await AsyncStorage.setItem(historyKey, JSON.stringify(updatedNotifications));
      
      // Atualizar badge count
      await NotificationService.updateBadgeCount();
      
      console.log('🗑️ Notificação excluída');
    } catch (error) {
      console.error('❌ Erro ao excluir notificação:', error);
      Alert.alert('Erro', 'Falha ao excluir notificação');
    }
  }, [notifications]);

  /**
   * Confirma e limpa todas as notificações
   */
  const handleClearAll = useCallback(() => {
    if (notifications.length === 0) {
      Alert.alert('Info', 'Não há notificações para limpar');
      return;
    }

    Alert.alert(
      'Limpar Todas as Notificações',
      `Tem certeza que deseja excluir todas as ${notifications.length} notificações?`,
      [
        { 
          text: 'Cancelar', 
          style: 'cancel' 
        },
        { 
          text: 'Limpar Tudo', 
          style: 'destructive',
          onPress: clearAllNotifications
        }
      ]
    );
  }, [notifications.length]);

  /**
   * Limpa todas as notificações
   */
  const clearAllNotifications = useCallback(async () => {
    try {
      await NotificationService.clearNotificationHistory();
      setNotifications([]);
      console.log('🧹 Todas as notificações limpas');
    } catch (error) {
      console.error('❌ Erro ao limpar notificações:', error);
      Alert.alert('Erro', 'Falha ao limpar notificações');
    }
  }, []);

  /**
   * Marca todas as notificações como lidas
   */
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updatedNotifications);
      
      const historyKey = 'climder_notification_history';
      await AsyncStorage.setItem(historyKey, JSON.stringify(updatedNotifications));
      await NotificationService.updateBadgeCount();
      
      console.log('✅ Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error);
      Alert.alert('Erro', 'Falha ao atualizar notificações');
    }
  }, [notifications]);

  /**
   * Atualiza a lista de notificações (pull to refresh)
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadNotifications();
    } finally {
      setRefreshing(false);
    }
  }, [loadNotifications]);

  /**
   * Formata timestamp para exibição amigável
   * @param {string} timestamp - Timestamp ISO
   * @returns {string} Tempo formatado
   */
  const formatTime = useCallback((timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Agora';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `${diffDays}d`;
      
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    } catch (error) {
      console.error('❌ Erro ao formatar tempo:', error);
      return '?';
    }
  }, []);

  /**
   * Retorna ícone apropriado baseado no tipo de notificação
   * @param {Object} data - Dados da notificação
   * @returns {string} Emoji do ícone
   */
  const getNotificationIcon = useCallback((data) => {
    if (!data?.type) return '🔔';
    
    const iconMap = {
      match: '🎉',
      chat: '💬',
      group: '👥',
      reminder: '⏰',
    };
    
    return iconMap[data.type] || '🔔';
  }, []);

  /**
   * Retorna label do tipo de notificação
   * @param {string} type - Tipo da notificação
   * @returns {string} Label formatado
   */
  const getNotificationTypeLabel = useCallback((type) => {
    const labelMap = {
      match: '🎉 Novo Match',
      chat: '💬 Mensagem',
      group: '👥 Grupo',
      reminder: '⏰ Lembrete',
    };
    
    return labelMap[type] || '🔔 Notificação';
  }, []);

  /**
   * Atualiza configuração específica de notificação
   * @param {string} key - Chave da configuração
   * @param {boolean} value - Novo valor
   */
  const updateSetting = useCallback((key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Calcular estatísticas
  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.length - unreadCount;

  // Não renderizar se não estiver visível
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.closeButton}>← Fechar</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Notificações</Text>
          
          <View style={styles.headerRight}>
            <Text style={styles.settingsButton}>⚙️</Text>
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{notifications.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#ef4444' }]}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Não Lidas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#10b981' }]}>{readCount}</Text>
            <Text style={styles.statLabel}>Lidas</Text>
          </View>
        </View>

        {/* Botões de Ação */}
        {notifications.length > 0 && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, unreadCount === 0 && styles.actionButtonDisabled]} 
              onPress={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Text style={[styles.actionButtonText, unreadCount === 0 && styles.actionButtonTextDisabled]}>
                ✅ Marcar Todas como Lidas
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]} 
              onPress={handleClearAll}
            >
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                🗑️ Limpar Tudo
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Notificações */}
        <ScrollView 
          style={styles.notificationsList}
          contentContainerStyle={styles.notificationsContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando notificações...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
              <Text style={styles.emptyText}>
                Quando você receber notificações sobre matches, grupos ou mensagens, elas aparecerão aqui.
              </Text>
            </View>
          ) : (
            notifications.map((notification, index) => (
              <TouchableOpacity
                key={notification.id || `notification-${index}`}
                style={[
                  styles.notificationCard,
                  !notification.read && styles.unreadCard
                ]}
                onPress={() => handleNotificationPress(notification)}
                onLongPress={() => handleDeleteNotification(notification.id)}
                activeOpacity={0.7}
              >
                <View style={styles.notificationContent}>
                  {/* Header da Notificação */}
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationIcon}>
                      {getNotificationIcon(notification.data)}
                    </Text>
                    <Text style={styles.notificationTitle} numberOfLines={1}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatTime(notification.timestamp)}
                    </Text>
                  </View>
                  
                  {/* Corpo da Notificação */}
                  <Text style={styles.notificationBody} numberOfLines={2}>
                    {notification.body}
                  </Text>
                  
                  {/* Metadados */}
                  {notification.data?.type && (
                    <View style={styles.notificationMeta}>
                      <Text style={styles.notificationType}>
                        {getNotificationTypeLabel(notification.data.type)}
                      </Text>
                    </View>
                  )}
                </View>
                
                {/* Indicador de não lida */}
                {!notification.read && (
                  <View style={styles.unreadDot} />
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Painel de Configurações */}
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsTitle}>🔔 Tipos de Notificação</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🎉 Novos Matches</Text>
            <Switch
              value={settings.matches}
              onValueChange={(value) => updateSetting('matches', value)}
              trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
              thumbColor={settings.matches ? "#ffffff" : "#9ca3af"}
              style={styles.switch}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>👥 Grupos de Escalada</Text>
            <Switch
              value={settings.groups}
              onValueChange={(value) => updateSetting('groups', value)}
              trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
              thumbColor={settings.groups ? "#ffffff" : "#9ca3af"}
              style={styles.switch}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>💬 Mensagens do Chat</Text>
            <Switch
              value={settings.chat}
              onValueChange={(value) => updateSetting('chat', value)}
              trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
              thumbColor={settings.chat ? "#ffffff" : "#9ca3af"}
              style={styles.switch}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>⏰ Lembretes</Text>
            <Switch
              value={settings.reminders}
              onValueChange={(value) => updateSetting('reminders', value)}
              trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
              thumbColor={settings.reminders ? "#ffffff" : "#9ca3af"}
              style={styles.switch}
            />
          </View>
          
          <Text style={styles.settingsNote}>
            💡 Dica: Pressione e segure uma notificação para excluí-la
          </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  headerRight: {
    padding: 8,
    minWidth: 60,
    alignItems: 'flex-end',
  },
  settingsButton: {
    fontSize: 20,
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextDisabled: {
    color: '#9ca3af',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  dangerButtonText: {
    color: 'white',
  },

  // Notifications List
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Notification Cards
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    position: 'relative',
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  unreadCard: {
    backgroundColor: '#eff6ff',
    borderLeftColor: '#3b82f6',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  notificationBody: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationType: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },

  // Settings Panel
  settingsPanel: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  switch: {
    marginLeft: 16,
  },
  settingsNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});