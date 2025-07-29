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
              locationName: `Local ${parsed.locationId}`,
            });
          }
        } catch (error) {
          console.error(`Erro ao carregar croqui ${key}:`, error);
        }
      }
      
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
        { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await AsyncStorage.removeItem(croquisKey);
            await loadAllCroquis();
            Alert.alert('Sucesso', 'Croqui excluído com sucesso!');
          } catch (error) {
            Alert.alert('Erro', 'Falha ao excluir o croqui');
          }
        }}
      ]
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.fullScreen}>
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
            Crie seu primeiro croqui visitando um local de escalada
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {croquisList.map((croqui) => (
            <View key={croqui.key} style={styles.croquisCard}>
              <Image source={{ uri: croqui.image }} style={styles.imagePreview} />
              <View style={styles.croquisInfo}>
                <Text style={styles.locationName}>{croqui.locationName}</Text>
                <Text style={styles.drawingCount}>{croqui.totalDrawings} desenhos</Text>
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => { onClose(); onOpenCroquis(croqui.locationId); }}
                  >
                    <Text style={styles.editButtonText}>✏️ Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteCroquis(croqui.key, croqui.locationName)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
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
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  croquisCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  imagePreview: {
    width: '100%',
    height: 120,
  },
  croquisInfo: {
    padding: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  drawingCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
