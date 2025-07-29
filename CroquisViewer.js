import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';

export default function CroquisViewer({ visible, onClose, locationId, locationName, onEdit }) {
  const [croquisData, setCroquisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDrawings, setShowDrawings] = useState(true);

  useEffect(() => {
    if (visible && locationId) {
      loadCroquis();
    }
  }, [visible, locationId]);

  const loadCroquis = async () => {
    setLoading(true);
    try {
      const croquisKey = `croquis_${locationId}`;
      const savedCroquis = await AsyncStorage.getItem(croquisKey);
      
      if (savedCroquis) {
        const data = JSON.parse(savedCroquis);
        setCroquisData(data);
      } else {
        setCroquisData(null);
        Alert.alert('Aviso', 'Nenhum croqui encontrado para este local');
      }
    } catch (error) {
      console.error('Erro ao carregar croquis:', error);
      Alert.alert('Erro', 'Falha ao carregar o croquis');
    } finally {
      setLoading(false);
    }
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

  const getToolInfo = (tool) => {
    const toolMap = {
      route: { name: 'Via', icon: '📍', color: '#ef4444' },
      holds: { name: 'Agarras', icon: '🔴', color: '#10b981' },
      anchor: { name: 'Ancoragem', icon: '⚓', color: '#3b82f6' }
    };
    return toolMap[tool] || { name: tool, icon: '🎨', color: '#6b7280' };
  };

  if (!visible) return null;

  if (loading) {
    return (
      <Modal visible={visible} transparent={false} animationType="slide">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando croquis...</Text>
        </View>
      </Modal>
    );
  }

  if (!croquisData) {
    return (
      <Modal visible={visible} transparent={false} animationType="slide">
        <View style={styles.emptyContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.emptyTitle}>Nenhum croquis encontrado</Text>
          <Text style={styles.emptyText}>Este local ainda não possui croquis criados.</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent={false} animationType="slide">
      <View style={styles.fullScreen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Text style={styles.headerButtonText}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{locationName}</Text>
            <Text style={styles.headerSubtitle}>
              {croquisData.totalDrawings} desenhos • {formatDate(croquisData.lastModified)}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.headerButton} onPress={() => onEdit(locationId)}>
            <Text style={styles.headerButtonText}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Área principal do croquis */}
        <View style={styles.croquisContainer}>
          <View style={styles.imageContainer}>
            {/* Imagem de fundo */}
            <Image 
              source={{ uri: croquisData.image }} 
              style={styles.croquisImage}
              resizeMode="contain"
            />
            
            {/* Overlay com desenhos */}
            {showDrawings && (
              <Svg style={styles.drawingOverlay} width="100%" height="100%">
                {croquisData.drawings && croquisData.drawings.map((drawing) => (
                  <Path
                    key={drawing.id}
                    d={drawing.path}
                    stroke={drawing.color}
                    strokeWidth={6}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.8}
                  />
                ))}
              </Svg>
            )}
          </View>
        </View>

        {/* Controles inferiores */}
        <View style={styles.controls}>
          {/* Legenda das ferramentas */}
          <View style={styles.toolsInfo}>
            <Text style={styles.toolsTitle}>Legenda:</Text>
            <View style={styles.toolsLegend}>
              {croquisData.tools && croquisData.tools.map((tool, index) => {
                const toolInfo = getToolInfo(tool);
                return (
                  <View key={index} style={styles.legendItem}>
                    <Text style={styles.legendIcon}>{toolInfo.icon}</Text>
                    <Text style={styles.legendText}>{toolInfo.name}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Botões de controle */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.controlButton, !showDrawings && styles.controlButtonInactive]}
              onPress={() => setShowDrawings(!showDrawings)}
            >
              <Text style={styles.controlButtonText}>
                {showDrawings ? '👁️ Ocultar' : '👁️ Mostrar'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => {
                onClose();
                onEdit(locationId);
              }}
            >
              <Text style={styles.editButtonText}>✏️ Editar Croqui</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingTop: 50,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
  },
  headerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  croquisContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  croquisImage: {
    width: '100%',
    height: '100%',
  },
  drawingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  controls: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 30,
  },
  toolsInfo: {
    marginBottom: 16,
  },
  toolsTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  toolsLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  legendIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  legendText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  controlButtonInactive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 32,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
