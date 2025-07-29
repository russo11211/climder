import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  PanResponder,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function CroquisEditor({ visible, onClose, locationId }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPath, setCurrentPath] = useState('');
  const [drawings, setDrawings] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState('route');
  const [isSaving, setIsSaving] = useState(false);

  const drawingTools = [
    { id: 'route', name: 'Via', icon: '📍', color: '#ef4444' },
    { id: 'holds', name: 'Agarras', icon: '🔴', color: '#10b981' },
    { id: 'anchor', name: 'Ancoragem', icon: '⚓', color: '#3b82f6' },
  ];

  // CORRIGIDO: useEffect sempre é chamado, mas com condição interna
  useEffect(() => {
    if (visible && locationId) {
      loadExistingCroquis();
    }
  }, [visible, locationId]);

  const loadExistingCroquis = async () => {
    try {
      const croquisKey = `croquis_${locationId}`;
      const savedCroquis = await AsyncStorage.getItem(croquisKey);
      
      if (savedCroquis) {
        const croquisData = JSON.parse(savedCroquis);
        setSelectedImage(croquisData.image);
        setDrawings(croquisData.drawings || []);
        console.log('Croqui carregado:', croquisData);
      }
    } catch (error) {
      console.error('Erro ao carregar croqui:', error);
    }
  };

  const saveCroquis = async () => {
    if (!selectedImage) {
      Alert.alert('Atenção', 'Adicione uma imagem antes de salvar o croqui');
      return;
    }

    setIsSaving(true);
    
    try {
      const croquisData = {
        locationId,
        image: selectedImage,
        drawings,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        totalDrawings: drawings.length,
        tools: [...new Set(drawings.map(d => d.tool))],
      };

      const croquisKey = `croquis_${locationId}`;
      await AsyncStorage.setItem(croquisKey, JSON.stringify(croquisData));
      
      Alert.alert(
        'Sucesso! 🎉', 
        `Croqui salvo com ${drawings.length} desenhos!\n\nFoi salvo permanentemente para este local.`,
        [
          { text: 'Continuar Editando', style: 'cancel' },
          { text: 'Fechar', onPress: onClose }
        ]
      );
      
    } catch (error) {
      console.error('Erro ao salvar croqui:', error);
      Alert.alert('Erro', 'Falha ao salvar o croqui. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const takePicture = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!cameraPermission.granted) {
        Alert.alert('Permissão Negada', 'Acesso à câmera é necessário para capturar fotos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setDrawings([]);
      }
    } catch (error) {
      console.log('Camera error:', error);
      Alert.alert('Erro', 'Falha ao abrir câmera. Tente usar a galeria.');
    }
  };

  const pickImage = async () => {
    try {
      const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!galleryPermission.granted) {
        Alert.alert('Permissão Negada', 'Acesso à galeria é necessário para selecionar fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setDrawings([]);
      }
    } catch (error) {
      console.log('Gallery error:', error);
      Alert.alert('Erro', 'Falha ao acessar galeria');
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setIsDrawing(true);
      setCurrentPath(`M${locationX || 0},${locationY || 0}`);
    },
    
    onPanResponderMove: (evt) => {
      if (!isDrawing) return;
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath(prev => `${prev} L${locationX || 0},${locationY || 0}`);
    },
    
    onPanResponderRelease: () => {
      if (!isDrawing) return;
      
      if (currentPath) {
        const newDrawing = {
          id: Date.now(),
          path: currentPath,
          color: drawingTools.find(t => t.id === selectedTool)?.color || '#ef4444',
          tool: selectedTool,
          timestamp: new Date().toISOString(),
        };
        
        setDrawings(prev => [...prev, newDrawing]);
      }
      
      setCurrentPath('');
      setIsDrawing(false);
    },
  });

  const clearDrawings = () => {
    if (drawings.length === 0) return;
    
    Alert.alert(
      'Limpar Todos os Desenhos',
      `Tem certeza que deseja remover todos os ${drawings.length} desenhos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar Tudo', style: 'destructive', onPress: () => setDrawings([]) },
      ]
    );
  };

  const undoLastDrawing = () => {
    if (drawings.length > 0) {
      setDrawings(prev => prev.slice(0, -1));
    }
  };

  const resetEditor = () => {
    Alert.alert(
      'Nova Imagem',
      'Isso irá remover a imagem atual e todos os desenhos. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Continuar', 
          style: 'destructive',
          onPress: () => {
            setSelectedImage(null);
            setDrawings([]);
            setCurrentPath('');
            setIsDrawing(false);
          }
        },
      ]
    );
  };

  // RETORNO CONDICIONAL DEPOIS DOS HOOKS
  if (!visible) return null;

  return (
    <View style={styles.fullScreen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Croqui Local {locationId}</Text>
        <TouchableOpacity 
          onPress={saveCroquis} 
          disabled={isSaving}
          style={[styles.saveButtonContainer, isSaving && styles.savingButton]}
        >
          <Text style={styles.saveButton}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>

      {!selectedImage ? (
        // Image selection screen
        <View style={styles.imageSelection}>
          <Text style={styles.selectionTitle}>Selecione uma imagem da parede de escalada</Text>
          
          <TouchableOpacity style={styles.imageButton} onPress={takePicture}>
            <Text style={styles.imageButtonIcon}>📷</Text>
            <Text style={styles.imageButtonText}>Capturar Foto</Text>
            <Text style={styles.imageButtonSubtext}>Tire uma foto da parede</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonIcon}>🖼️</Text>
            <Text style={styles.imageButtonText}>Galeria</Text>
            <Text style={styles.imageButtonSubtext}>Escolha uma foto existente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Drawing interface
        <>
          {/* Drawing tools */}
          <View style={styles.toolsContainer}>
            {drawingTools.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.tool, selectedTool === tool.id && styles.selectedTool]}
                onPress={() => setSelectedTool(tool.id)}
              >
                <Text style={styles.toolIcon}>{tool.icon}</Text>
                <Text style={styles.toolName}>{tool.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Drawing canvas */}
          <View style={styles.canvasContainer}>
            <Image source={{ uri: selectedImage }} style={styles.backgroundImage} resizeMode="contain" />
            
            <View style={styles.svgContainer} {...panResponder.panHandlers}>
              <Svg style={styles.drawingOverlay} width="100%" height="100%">
                {drawings.map((drawing) => (
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
                
                {currentPath && (
                  <Path
                    d={currentPath}
                    stroke={drawingTools.find(t => t.id === selectedTool)?.color || '#ef4444'}
                    strokeWidth={6}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.9}
                  />
                )}
              </Svg>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={resetEditor}>
              <Text style={styles.actionButtonText}>📷 Nova</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={undoLastDrawing}
              disabled={drawings.length === 0}
            >
              <Text style={[
                styles.actionButtonText,
                drawings.length === 0 && styles.disabledText
              ]}>↶ Desfazer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={clearDrawings}
              disabled={drawings.length === 0}
            >
              <Text style={[
                styles.actionButtonText,
                drawings.length === 0 && styles.disabledText
              ]}>🗑️ Limpar ({drawings.length})</Text>
            </TouchableOpacity>
          </View>
        </>
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
  },
  saveButtonContainer: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  savingButton: {
    backgroundColor: '#6b7280',
  },
  saveButton: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  imageSelection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  selectionTitle: {
    fontSize: 20,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
    fontWeight: '600',
  },
  imageButton: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    width: width * 0.8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  imageButtonIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  imageButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  imageButtonSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  toolsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    justifyContent: 'space-around',
  },
  tool: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 80,
  },
  selectedTool: {
    backgroundColor: '#dbeafe',
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  toolName: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    marginHorizontal: 3,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  disabledText: {
    color: '#9ca3af',
  },
});
