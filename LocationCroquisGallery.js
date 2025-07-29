import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LocationCroquisGallery({ visible, onClose, locationId, locationName, onOpenCroquis, onViewCroquis }) {
  const [croquisList, setCroquisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (visible && locationId) {
      loadLocationCroquis();
    }
  }, [visible, locationId]);

  const loadLocationCroquis = async () => {
    setLoading(true);
    try {
      const croquisKey = `croquis_${locationId}`;
      const savedCroquis = await AsyncStorage.getItem(croquisKey);
      
      if (savedCroquis) {
        const croquisData = JSON.parse(savedCroquis);
        setCroquisList([croquisData]);
      } else {
        setCroquisList([]);
      }
    } catch (error) {
      console.error('Erro ao carregar croquis do local:', error);
      setCroquisList([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocationCroquis();
    setRefreshing(false);
  };

  const deleteCroquis = async () => {
    Alert.alert(
      'Excluir Croqui',
      `Tem certeza que deseja excluir o croqui de ${locationName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            const croquisKey = `croquis_${locationId}`;
            await AsyncStorage.removeItem(croquisKey);
            await loadLocationCroquis();
            Alert.alert('Sucesso', 'Croqui excluído com sucesso!');
          } catch (error) {
            Alert.alert('Erro', 'Falha ao excluir o croqui');
          }
        }}
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!visible) return null;

  return (
    <View style={styles.fullScreen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Croquis - {locationName}</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.refreshButton}>🔄</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando croquis...</Text>
        </View>
      ) : croquisList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>Nenhum croqui para {locationName}</Text>
          <Text style={styles.emptyText}>
            Crie seu primeiro croqui para este local tocando no botão abaixo
          </Text>
          <TouchableOpacity 
            style={styles.createFirstButton}
            onPress={() => {
              onClose();
              onOpenCroquis(locationId);
            }}
          >
            <Text style={styles.createFirstText}>📋 + Criar Primeiro Croqui</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={styles.locationInfo}>
            📍 {croquisList.length} croqui{croquisList.length !== 1 ? 's' : ''} para este local
          </Text>

          {croquisList.map((croqui, index) => (
            <View key={index} style={styles.croquisCard}>
              {/* Preview da imagem - AGORA CLICÁVEL */}
              <TouchableOpacity 
                style={styles.imageContainer}
                onPress={() => {
                  onClose();
                  onViewCroquis(locationId, locationName);
                }}
              >
                <Image source={{ uri: croqui.image }} style={styles.imagePreview} resizeMode="cover" />
                <View style={styles.viewOverlay}>
                  <Text style={styles.viewOverlayText}>👁️ Toque para ver em tela cheia</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.croquisInfo}>
                <View style={styles.croquisHeader}>
                  <Text style={styles.croquisTitle}>Croqui de {locationName}</Text>
                  <Text style={styles.croquisDate}>
                    {formatDate(croqui.lastModified)}
                  </Text>
                </View>

                <View style={styles.stats}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{croqui.totalDrawings || 0}</Text>
                    <Text style={styles.statLabel}>Desenhos</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{croqui.tools ? croqui.tools.length : 0}</Text>
                    <Text style={styles.statLabel}>Ferramentas</Text>
                  </View>
                </View>

                {croqui.tools && croqui.tools.length > 0 && (
                  <View style={styles.toolsUsed}>
                    <Text style={styles.toolsLabel}>Ferramentas usadas: </Text>
                    {croqui.tools.map((tool, idx) => (
                      <Text key={idx} style={styles.toolEmoji}>
                        {tool === 'route' ? '📍' : tool === 'holds' ? '🔴' : '⚓'}
                      </Text>
                    ))}
                  </View>
                )}

                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => {
                      onClose();
                      onViewCroquis(locationId, locationName);
                    }}
                  >
                    <Text style={styles.viewButtonText}>👁️ Ver Tela Cheia</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => {
                      onClose();
                      onOpenCroquis(locationId);
                    }}
                  >
                    <Text style={styles.editButtonText}>✏️ Editar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={deleteCroquis}
                  >
                    <Text style={styles.deleteButtonText}>��️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0f9ff',
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 50,
  },
  closeButton: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    flex: 1,
  },
  refreshButton: {
    fontSize: 18,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  locationInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 6,
  },
  croquisCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  viewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewOverlayText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  croquisInfo: {
    padding: 16,
  },
  croquisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  croquisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  croquisDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 24,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  toolsUsed: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toolsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  toolEmoji: {
    fontSize: 18,
    marginRight: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
