import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView, 
  StatusBar, 
  ScrollView,
  Image,
  Alert,
  PanResponder
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const climberProfiles = [
  {
    id: 1,
    name: "Ana Silva",
    age: 28,
    grade: "7a",
    location: "São Paulo - SP",
    bio: "Apaixonada por escalada! Procurando parceiros para explorar novas vias 🧗‍♀️",
    specialties: ["Escalada Esportiva", "Boulder"],
  },
  {
    id: 2,
    name: "Carlos Rocha", 
    age: 32,
    grade: "8b",
    location: "Rio de Janeiro - RJ",
    bio: "Escalador tradicional em busca de aventuras épicas ⛰️",
    specialties: ["Trad", "Multi-pitch"],
  },
  {
    id: 3,
    name: "Marina Costa",
    age: 25,
    grade: "6b", 
    location: "Belo Horizonte - MG",
    bio: "Começando na escalada outdoor. Quem topa me ensinar? 💪",
    specialties: ["Boulder", "Indoor"],
  }
];

const locations = [
  {
    id: 1,
    name: "Pedra Grande",
    city: "Atibaia - SP",
    type: "Escalada Esportiva",
    difficulty: "5a - 8b",
    routes: 45,
    description: "Um dos locais mais clássicos de SP, com vias para todos os níveis. Excelente para iniciantes e escaladores experientes.",
    photos: ["🏔️", "📸", "🧗‍♀️"],
    croquis: ["📋", "🗺️"],
    rating: 4.8,
    access: "Fácil - Estacionamento próximo",
    gear: "Quickdraws, cordas 60m",
    coordinates: "-23.1089, -46.5477"
  },
  {
    id: 2,
    name: "Morro do Diabo",
    city: "São Paulo - SP",
    type: "Boulder / Trad",
    difficulty: "V0 - V8 / 5c - 7a",
    routes: 32,
    description: "Área urbana com excelentes blocos e algumas vias tradicionais. Perfeito para treino após o trabalho.",
    photos: ["🪨", "📸", "🌆"],
    croquis: ["📋"],
    rating: 4.2,
    access: "Médio - Trilha de 15min",
    gear: "Crash pads, friends",
    coordinates: "-23.5505, -46.6333"
  }
];

// EDITOR DE CROQUIS COM IMPLEMENTAÇÃO REAL
const CroquisEditorReal = ({ onClose, locationId = 1 }) => {
  const [selectedTool, setSelectedTool] = useState('route');
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [drawingPaths, setDrawingPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  const drawingTools = [
    { id: 'route', name: 'Via', icon: '📍', color: '#ef4444' },
    { id: 'hold', name: 'Agarras', icon: '🔴', color: '#3b82f6' },
    { id: 'anchor', name: 'Ancoragem', icon: '⚓', color: '#10b981' },
    { id: 'belay', name: 'Reunião', icon: '🔗', color: '#f59e0b' },
    { id: 'grade', name: 'Graduação', icon: '📝', color: '#8b5cf6' },
    { id: 'danger', name: 'Perigo', icon: '⚠️', color: '#dc2626' }
  ];

  const selectedToolData = drawingTools.find(tool => tool.id === selectedTool);

  // IMPLEMENTAÇÃO REAL - CÂMERA E GALERIA
  const requestGalleryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'Precisamos de permissão para acessar a galeria de fotos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'Precisamos de permissão para acessar a câmera.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        exif: false
      });

      if (!result.canceled && result.assets?.[0]) {
        setCurrentPhoto({
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
          type: 'camera',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível acessar a câmera.');
    }
  };

  const handleChooseFromGallery = async () => {
    const hasPermission = await requestGalleryPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        exif: false
      });

      if (!result.canceled && result.assets?.[0]) {
        setCurrentPhoto({
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
          type: 'gallery',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erro ao escolher foto:', error);
      Alert.alert('Erro', 'Não foi possível acessar a galeria.');
    }
  };

  // IMPLEMENTAÇÃO REAL - DESENHO SVG
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (evt) => {
      if (!currentPhoto) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      setIsDrawing(true);
      setCurrentPath(`M${locationX},${locationY}`);
    },
    
    onPanResponderMove: (evt) => {
      if (!isDrawing || !currentPhoto) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
    },
    
    onPanResponderRelease: () => {
      if (!isDrawing || !currentPath) return;
      
      const newPath = {
        id: Date.now(),
        d: currentPath,
        stroke: selectedToolData.color,
        strokeWidth: 3,
        tool: selectedTool,
        timestamp: new Date().toISOString()
      };
      
      setDrawingPaths(prev => [...prev, newPath]);
      setCurrentPath('');
      setIsDrawing(false);
    }
  });

  // IMPLEMENTAÇÃO REAL - ARMAZENAMENTO
  const saveCroquisToStorage = async (croquisData) => {
    try {
      const storageKey = `croquis_location_${locationId}`;
      const existingCroquis = await AsyncStorage.getItem(storageKey);
      const croquisList = existingCroquis ? JSON.parse(existingCroquis) : [];
      
      const newCroquis = {
        id: Date.now(),
        ...croquisData,
        locationId,
        createdAt: new Date().toISOString(),
        version: '1.0'
      };
      
      croquisList.push(newCroquis);
      await AsyncStorage.setItem(storageKey, JSON.stringify(croquisList));
      
      console.log('Croquis salvo:', newCroquis.id);
      return newCroquis.id;
    } catch (error) {
      console.error('Erro ao salvar croquis:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (drawingPaths.length === 0) {
      Alert.alert('Atenção', 'Desenhe pelo menos um elemento antes de salvar.');
      return;
    }

    try {
      const croquisData = {
        photo: currentPhoto,
        paths: drawingPaths,
        metadata: {
          toolsUsed: [...new Set(drawingPaths.map(p => p.tool))],
          totalElements: drawingPaths.length,
          selectedTools: drawingTools.filter(tool => 
            drawingPaths.some(path => path.tool === tool.id)
          )
        }
      };
      
      const croquisId = await saveCroquisToStorage(croquisData);
      
      Alert.alert(
        'Croquis Salvo! 🎉',
        `Croquis #${croquisId} salvo com sucesso!\n\n` +
        `📊 ${drawingPaths.length} elementos desenhados\n` +
        `🛠️ Ferramentas: ${croquisData.metadata.toolsUsed.join(', ')}`,
        [
          { text: 'Criar Outro', onPress: () => setCurrentPhoto(null) },
          { text: 'Fechar', onPress: onClose }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro ao Salvar',
        'Não foi possível salvar o croquis. Verifique o armazenamento do dispositivo.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleUndo = () => {
    if (drawingPaths.length > 0) {
      setDrawingPaths(prev => prev.slice(0, -1));
    }
  };

  // RENDERIZAÇÃO - SELEÇÃO DE FOTO
  if (!currentPhoto) {
    return (
      <View style={styles.editorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
        
        <View style={styles.editorHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.editorTitle}>Editor de Croquis</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.photoSelectionContainer}>
          <View style={styles.photoSelectionCard}>
            <Text style={styles.photoSelectionTitle}>
              📸 Escolha uma foto da parede
            </Text>
            
            <Text style={styles.photoSelectionSubtitle}>
              Tire uma foto clara da rocha ou parede que você quer mapear
            </Text>
            
            <TouchableOpacity
              style={[styles.photoButton, styles.cameraButton]}
              onPress={handleTakePhoto}
            >
              <Text style={styles.photoButtonIcon}>📷</Text>
              <Text style={styles.photoButtonText}>Tirar Foto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.photoButton, styles.galleryButton]}
              onPress={handleChooseFromGallery}
            >
              <Text style={styles.photoButtonIcon}>🖼️</Text>
              <Text style={styles.photoButtonText}>Escolher da Galeria</Text>
            </TouchableOpacity>
            
            <Text style={styles.photoSelectionHint}>
              💡 Dica: Tire a foto de um ângulo que mostre bem as agarras e a linha da via
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // RENDERIZAÇÃO - EDITOR COM CANVAS
  return (
    <View style={styles.editorContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
      
      <View style={styles.editorHeader}>
        <TouchableOpacity onPress={() => setCurrentPhoto(null)}>
          <Text style={styles.backButtonText}>← Nova Foto</Text>
        </TouchableOpacity>
        <Text style={styles.editorTitle}>Desenhar Rota</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButtonText}>Fechar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.canvasContainer}>
        <Image 
          source={{ uri: currentPhoto.uri }} 
          style={styles.canvasImage}
          resizeMode="cover"
        />
        
        {/* SVG CANVAS REAL */}
        <View 
          style={styles.svgContainer}
          {...panResponder.panHandlers}
        >
          <Svg style={styles.svgCanvas}>
            {/* Paths salvos */}
            {drawingPaths.map((path) => (
              <Path
                key={path.id}
                d={path.d}
                stroke={path.stroke}
                strokeWidth={path.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            
            {/* Path sendo desenhado */}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={selectedToolData.color}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.8}
              />
            )}
          </Svg>
        </View>

        {/* Info da ferramenta atual */}
        <View style={styles.toolInfo}>
          <Text style={styles.toolInfoIcon}>{selectedToolData.icon}</Text>
          <Text style={styles.toolInfoText}>{selectedToolData.name}</Text>
        </View>

        {/* Contador de elementos */}
        <View style={styles.elementCounter}>
          <Text style={styles.counterText}>
            {drawingPaths.length} elemento{drawingPaths.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Indicador de modo desenho */}
        {isDrawing && (
          <View style={styles.drawingIndicator}>
            <Text style={styles.drawingIndicatorText}>✏️ Desenhando...</Text>
          </View>
        )}
      </View>

      {/* FERRAMENTAS */}
      <View style={styles.toolsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.toolsScroll}
          contentContainerStyle={styles.toolsScrollContent}
        >
          {drawingTools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              onPress={() => setSelectedTool(tool.id)}
              style={[
                styles.toolButton,
                selectedTool === tool.id && styles.toolButtonActive
              ]}
            >
              <Text style={styles.toolIcon}>{tool.icon}</Text>
              <Text style={[
                styles.toolName,
                selectedTool === tool.id && styles.toolNameActive
              ]}>
                {tool.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* CONTROLES */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            onPress={handleUndo}
            disabled={drawingPaths.length === 0}
            style={[
              styles.controlButton,
              styles.undoButton,
              drawingPaths.length === 0 && styles.disabledButton
            ]}
          >
            <Text style={[
              styles.controlButtonText,
              drawingPaths.length === 0 && styles.disabledButtonText
            ]}>
              ↶ Desfazer ({drawingPaths.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSave}
            disabled={drawingPaths.length === 0}
            style={[
              styles.controlButton,
              styles.saveButton,
              drawingPaths.length === 0 && styles.disabledButton
            ]}
          >
            <Text style={[
              styles.saveButtonText,
              drawingPaths.length === 0 && styles.disabledButtonText
            ]}>
              💾 Salvar Croquis
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// APP PRINCIPAL (mantendo toda funcionalidade existente)
export default function App() {
  const [currentProfile, setCurrentProfile] = useState(0);
  const [matches, setMatches] = useState([]);
  const [currentView, setCurrentView] = useState('discover');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showCroquisEditor, setShowCroquisEditor] = useState(false);

  const currentClimber = climberProfiles[currentProfile];

  const handleSwipe = (direction) => {
    if (direction === 'right') {
      setMatches([...matches, currentClimber]);
    }
    setCurrentProfile((prev) => (prev + 1) % climberProfiles.length);
  };

  const DiscoverView = () => (
    <View style={styles.discoverContainer}>
      <Text style={styles.header}>🧗‍♀️ Climder</Text>
      
      <View style={styles.card}>
        <View style={styles.photoArea}>
          <Text style={styles.emoji}>👤</Text>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{currentClimber.name}, {currentClimber.age}</Text>
          <Text style={styles.location}>📍 {currentClimber.location}</Text>
          <Text style={styles.grade}>Grau: {currentClimber.grade}</Text>
          <Text style={styles.bio}>{currentClimber.bio}</Text>
          
          <View style={styles.specialties}>
            {currentClimber.specialties.map((specialty, idx) => (
              <View key={idx} style={styles.specialty}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleSwipe('left')}
        >
          <Text style={styles.buttonText}>👎🩹</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.likeButton]}
          onPress={() => handleSwipe('right')}
        >
          <Text style={styles.buttonText}>❤️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const MatchesView = () => (
    <View style={styles.screenContainer}>
      <Text style={styles.header}>❤️ Matches ({matches.length})</Text>
      {matches.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum match ainda! Continue explorando 🧗‍♀️</Text>
      ) : (
        matches.map((match, idx) => (
          <View key={idx} style={styles.matchCard}>
            <Text style={styles.matchName}>{match.name}</Text>
            <Text style={styles.matchLocation}>{match.location}</Text>
          </View>
        ))
      )}
    </View>
  );

  const GroupsView = () => (
    <View style={styles.screenContainer}>
      <Text style={styles.header}>👥 Grupos de Escalada</Text>
      <View style={styles.groupCard}>
        <Text style={styles.groupTitle}>Escalada Pedra Grande</Text>
        <Text style={styles.groupInfo}>📍 Atibaia - SP</Text>
        <Text style={styles.groupInfo}>📅 02/08/2025 às 07:00</Text>
        <Text style={styles.groupInfo}>⚡ 6a-7b</Text>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Participar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const LocationDetailView = () => (
    <ScrollView style={styles.screenContainer}>
      <View style={styles.detailHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setSelectedLocation(null)}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {selectedLocation.rating}</Text>
        </View>
      </View>

      <Text style={styles.locationDetailName}>{selectedLocation.name}</Text>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>📍 Informações Básicas</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Localização</Text>
            <Text style={styles.infoValue}>{selectedLocation.city}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tipo</Text>
            <Text style={styles.infoValue}>{selectedLocation.type}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Dificuldade</Text>
            <Text style={styles.infoValue}>{selectedLocation.difficulty}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vias</Text>
            <Text style={styles.infoValue}>{selectedLocation.routes} vias</Text>
          </View>
        </View>
        <Text style={styles.description}>{selectedLocation.description}</Text>
      </View>

      {/* BOTÃO PRINCIPAL PARA ABRIR O EDITOR REAL */}
      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>🎨 Editor de Croquis</Text>
        <Text style={styles.description}>
          Crie croquis detalhados das vias fotografando a parede e desenhando as rotas com ferramentas específicas.
        </Text>
        
        <TouchableOpacity 
          style={styles.croquisMainButton}
          onPress={() => setShowCroquisEditor(true)}
        >
          <Text style={styles.croquisMainButtonIcon}>🎨</Text>
          <View style={styles.croquisMainButtonContent}>
            <Text style={styles.croquisMainButtonText}>Criar Novo Croquis</Text>
            <Text style={styles.croquisMainButtonSubtext}>
              Fotografe e desenhe rotas com ferramentas profissionais
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.sectionTitle}>ℹ️ Informações Técnicas</Text>
        <View style={styles.techInfo}>
          <Text style={styles.techLabel}>Acesso:</Text>
          <Text style={styles.techValue}>{selectedLocation.access}</Text>
        </View>
        <View style={styles.techInfo}>
          <Text style={styles.techLabel}>Equipamentos:</Text>
          <Text style={styles.techValue}>{selectedLocation.gear}</Text>
        </View>
        <View style={styles.techInfo}>
          <Text style={styles.techLabel}>Coordenadas:</Text>
          <Text style={styles.techValue}>{selectedLocation.coordinates}</Text>
        </View>
      </View>
    </ScrollView>
  );

  const LocationsView = () => {
    if (selectedLocation) {
      return <LocationDetailView />;
    }

    return (
      <View style={styles.screenContainer}>
        <Text style={styles.header}>🗺️ Locais de Escalada</Text>
        
        {locations.map((location) => (
          <TouchableOpacity 
            key={location.id} 
            style={styles.locationCard}
            onPress={() => setSelectedLocation(location)}
          >
            <View style={styles.locationHeader}>
              <Text style={styles.locationName}>{location.name}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {location.rating}</Text>
              </View>
            </View>
            
            <View style={styles.locationInfoGrid}>
              <Text style={styles.locationInfo}>📍 {location.city}</Text>
              <Text style={styles.locationInfo}>🧗‍♀️ {location.type}</Text>
              <Text style={styles.locationInfo}>📊 {location.difficulty}</Text>
              <Text style={styles.locationInfo}>🔢 {location.routes} vias</Text>
            </View>
            
            <Text style={styles.locationDescription}>{location.description}</Text>
            
            <View style={styles.photoPreview}>
              {location.photos.slice(0, 3).map((photo, idx) => (
                <View key={idx} style={styles.photoPreviewItem}>
                  <Text style={styles.photoPreviewEmoji}>{photo}</Text>
                </View>
              ))}
              <View style={styles.croquisPreviewBadge}>
                <Text style={styles.croquisPreviewText}>🎨 Croquis</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCurrentView = () => {
    switch(currentView) {
      case 'discover': return <DiscoverView />;
      case 'groups': return <GroupsView />;
      case 'matches': return <MatchesView />;
      case 'locations': return <LocationsView />;
      default: return <DiscoverView />;
    }
  };

  // RENDERIZAÇÃO PRINCIPAL
  if (showCroquisEditor) {
    return (
      <CroquisEditorReal 
        onClose={() => setShowCroquisEditor(false)}
        locationId={selectedLocation?.id || 1}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f9ff" />
      <View style={styles.app}>
        {renderCurrentView()}
        
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, currentView === 'discover' && styles.activeTab]}
            onPress={() => {
              setCurrentView('discover');
              setSelectedLocation(null);
            }}
          >
            <Text style={styles.tabText}>⛰️</Text>
            <Text style={styles.tabLabel}>Descobrir</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, currentView === 'groups' && styles.activeTab]}
            onPress={() => {
              setCurrentView('groups');
              setSelectedLocation(null);
            }}
          >
            <Text style={styles.tabText}>👥</Text>
            <Text style={styles.tabLabel}>Grupos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, currentView === 'matches' && styles.activeTab]}
            onPress={() => {
              setCurrentView('matches');
              setSelectedLocation(null);
            }}
          >
            <Text style={styles.tabText}>❤️</Text>
            <Text style={styles.tabLabel}>Matches</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, currentView === 'locations' && styles.activeTab]}
            onPress={() => {
              setCurrentView('locations');
              setSelectedLocation(null);
            }}
          >
            <Text style={styles.tabText}>🗺️</Text>
            <Text style={styles.tabLabel}>Locais</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  app: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  screenContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  discoverContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1f2937',
  },
  card: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  photoArea: {
    height: 200,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
  },
  profileInfo: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  grade: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  bio: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 12,
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specialty: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    color: '#1e40af',
    fontSize: 11,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 10,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  likeButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    fontSize: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 16,
    marginTop: 50,
    paddingHorizontal: 20,
  },
  matchCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  matchName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
  },
  matchLocation: {
    color: '#6b7280',
    fontSize: 14,
  },
  groupCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  groupInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  joinButton: {
    backgroundColor: '#10b981',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  joinButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  locationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationHeader: {
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
  ratingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
  },
  locationInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  locationInfo: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  locationDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 12,
  },
  photoPreview: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  photoPreviewItem: {
    width: 32,
    height: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreviewEmoji: {
    fontSize: 16,
  },
  croquisPreviewBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  croquisPreviewText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10b981',
  },
  
  // Estilos para detalhes do local
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ratingContainer: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
  },
  locationDetailName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  
  // BOTÃO PRINCIPAL DO CROQUIS
  croquisMainButton: {
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  croquisMainButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  croquisMainButtonContent: {
    flex: 1,
  },
  croquisMainButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  croquisMainButtonSubtext: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  
  techInfo: {
    marginBottom: 8,
  },
  techLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  techValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  tabBar: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#dbeafe',
    borderRadius: 6,
  },
  tabText: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },

  // ESTILOS DO EDITOR DE CROQUIS REAL
  editorContainer: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  editorHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButtonText: {
    color: '#6b7280',
    fontWeight: 'bold',
  },
  
  // SELEÇÃO DE FOTO
  photoSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  photoSelectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  photoSelectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  photoSelectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  photoButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cameraButton: {
    backgroundColor: '#3b82f6',
  },
  galleryButton: {
    backgroundColor: '#10b981',
  },
  photoButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoSelectionHint: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  
  // CANVAS
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  canvasImage: {
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
  svgCanvas: {
    flex: 1,
  },
  toolInfo: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  toolInfoIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  toolInfoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  elementCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  counterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  drawingIndicator: {
    position: 'absolute',
    top: 70,
    left: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  drawingIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // FERRAMENTAS
  toolsContainer: {
    backgroundColor: 'white',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    maxHeight: 140,
  },
  toolsScroll: {
    marginBottom: 16,
  },
  toolsScrollContent: {
    paddingHorizontal: 4,
  },
  toolButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginRight: 12,
    minWidth: 70,
    backgroundColor: 'white',
  },
  toolButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#dbeafe',
  },
  toolIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  toolName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
    textAlign: 'center',
  },
  toolNameActive: {
    color: '#1e40af',
  },
  
  // CONTROLES
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  undoButton: {
    backgroundColor: '#f3f4f6',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  disabledButton: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
});
