import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function CroquisGallery({ visible, onClose, onOpenCroquis }) {
  const [croquisList, setCroquisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadAllCroquis();
    }
  }, [visible]);

  const loadAllCroquis = async () => {
    setLoading(true);
    try {
      // Buscar todas as chaves do AsyncStorage que começam com "croquis_"
      const allKeys = await AsyncStorage.getAllKeys();
      const croquisKeys = allKeys.filter(key => key.startsWith('croquis_'));
      
      const allCroquis = [];
      
      for (const key of croquisKeys) {
        try {
          const croquisData = await AsyncStorage.getItem(key);
          if (croquisData) {
            const parsed = JSON.parse(croquisData);
            allCroquis.push({
              key,
              ...parsed,
              locationName: `Local ${parsed.locationId}`, // Pode ser melhorado depois
            });
          }
        } catch (error) {
          console.error(`Erro ao carregar croqui ${key}:`, error);
        }
      }
      
      // Ordenar por data de modificação (mais recente primeiro)
      allCroquis.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      
      setCroquisList(allCroquis);
    } catch (error) {
      console.error('Erro ao carregar lista de croquis:', error);
      Alert.alert('Erro', 'Falha ao carregar galeria de croquis');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllCroquis();
    setRefreshing(false);
  };

  const deleteCroquis = async (croquisKey, locationName) => {
    Alert.alert(
      'Excluir Croqui',
      `Tem certeza que deseja excluir o croqui de ${locationName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(croquisKey);
              await loadAllCroquis(); // Recarregar lista
              Alert.alert('Sucesso', 'Croqui excluído com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir croqui:', error);
              Alert.alert('Erro', 'Falha ao excluir o croqui');
            }
          }
        }
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

  const getToolEmoji = (tool) => {
    const toolMap = {
      route: '📍',
      holds: '🔴',
      anchor: '⚓'
    };
    return toolMap[tool] || '🎨';
  };

  if (!visible) return null;

  return (
    <View style={styles.fullScreen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Galeria de Croquis</Text>
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
          <Text style={styles.emptyTitle}>Nenhum croqui encontrado</Text>
          <Text style={styles.emptyText}>
            Crie seu primeiro croqui visitando um local de escalada e tocando em "📋 Criar Croqui"
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.totalText}>
            {croquisList.length} croqui{croquisList.length !== 1 ? 's' : ''} encontrado{croquisList.length !== 1 ? 's' : ''}
          </Text>

          {croquisList.map((croqui, index) => (
            <View key={croqui.key} style={styles.croquisCard}>
              {/* Preview da imagem */}
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: croqui.image }} 
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <Text style={styles.drawingCount}>{croqui.totalDrawings} desenhos</Text>
                </View>
              </View>

              {/* Informações do croqui */}
              <View style={styles.croquisInfo}>
                <View style={styles.croquisHeader}>
                  <Text style={styles.locationName}>{croqui.locationName}</Text>
                  <Text style={styles.croquisDate}>
                    {formatDate(croqui.lastModified)}
                  </Text>
                </View>

                {/* Ferramentas usadas */}
                <View style={styles.toolsUsed}>
                  <Text style={styles.toolsLabel}>Ferramentas: </Text>
                  {croqui.tools && croqui.tools.map((tool, idx) => (
                    <Text key={idx} style={styles.toolEmoji}>
                      {getToolEmoji(tool)}
                    </Text>
                  ))}
                  {(!croqui.tools || croqui.tools.length === 0) && (
                    <Text style={styles.noTools}>Nenhuma</Text>
                  )}
                </View>

                {/* Estatísticas */}
                <View style={styles.stats}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{croqui.totalDrawings}</Text>
                    <Text style={styles.statLabel}>Desenhos</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{croqui.tools ? croqui.tools.length : 0}</Text>
                    <Text style={styles.statLabel}>Ferramentas</Text>
                  </View>
                </View>

                {/* Ações */}
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      onClose();
                      onOpenCroquis(croqui.locationId);
                    }}
                  >
                    <Text style={styles.actionButtonText}>✏️ Editar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deleteCroquis(croqui.key, croqui.locationName)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.bottomPadding} />
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
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
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  totalText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
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
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 150,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  drawingCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  croquisInfo: {
    padding: 16,
  },
  croquisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  croquisDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  toolsUsed: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  toolEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  noTools: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    marginRight: 24,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});