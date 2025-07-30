const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  app: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  
  // Header do usuário
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userGrade: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 20,
  },

  // Títulos e textos gerais
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },

  // Discover View
  profileCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    fontSize: 80,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  profileGrade: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  profileType: {
    fontSize: 16,
    color: '#3b82f6',
    marginBottom: 4,
  },
  profileAvailability: {
    fontSize: 14,
    color: '#8b5cf6',
    marginBottom: 12,
  },
  profileBio: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  passButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    minWidth: 100,
  },
  likeButton: {
    backgroundColor: '#dcfce7',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    minWidth: 100,
  },
  buttonEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },

  // Matches View
  matchesList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  matchImage: {
    fontSize: 40,
    marginRight: 16,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  matchDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  matchType: {
    fontSize: 12,
    color: '#3b82f6',
  },
  chatButton: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chatButtonText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Groups View
  groupsList: {
    flex: 1,
  },
  groupCard: {
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
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  groupLevel: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
  },
  groupLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  groupDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  groupParticipants: {
    fontSize: 14,
    color: '#10b981',
    marginBottom: 4,
  },
  groupOrganizer: {
    fontSize: 12,
    color: '#8b5cf6',
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 12,
  },
  joinButton: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Locations View (estilos da versão anterior)
  locationsList: {
    flex: 1,
  },
  locationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 20,
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
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  quickCroquisButton: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  quickCroquisText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickGalleryButton: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  quickGalleryText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tapHint: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
    alignItems: 'center',
  },
  tapHintText: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
  },

  // Detail views
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
  },
  croquisDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  croquisActions: {
    gap: 12,
  },
  createCroquisButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createCroquisText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewGalleryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewGalleryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#f0f9ff',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeTabIcon: {
    fontSize: 26,
  },
  tabText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 16,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView, 
  ScrollView,
  Alert 
} from 'react-native';
import CroquisEditor from './CroquisEditor';
import CroquisViewer from './CroquisViewer';
import { useAuth } from './AuthContext';

const { width } = Dimensions.get('window');

// Mock data (mesmo de antes)
const climberProfiles = [
  {
    id: 1,
    name: "Ana Silva",
    age: 28,
    grade: "7a",
    location: "São Paulo - SP",
    bio: "Apaixonada por escalada esportiva há 5 anos!",
    image: "👩‍🦰",
    climbingType: "Esportiva",
    availability: "Fins de semana"
  },
  {
    id: 2,
    name: "Carlos Santos",
    age: 32,
    grade: "6c",
    location: "Rio de Janeiro - RJ", 
    bio: "Boulder e escalada tradicional são minha paixão",
    image: "🧔",
    climbingType: "Boulder",
    availability: "Tardes"
  },
  {
    id: 3,
    name: "Marina Costa",
    age: 25,
    grade: "6a",
    location: "Belo Horizonte - MG",
    bio: "Iniciante procurando parceiros para evoluir juntos",
    image: "👩",
    climbingType: "Esportiva",
    availability: "Manhãs"
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
    description: "Um dos locais mais clássicos de SP, com vias para todos os níveis.",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Morro do Diabo",
    city: "São Paulo - SP",
    type: "Boulder / Trad", 
    difficulty: "V0 - V8 / 5c - 7a",
    routes: 32,
    description: "Área urbana com excelentes blocos e algumas vias tradicionais.",
    rating: 4.2,
  },
  {
    id: 3,
    name: "Serra do Cipó",
    city: "Santana do Riacho - MG", 
    type: "Escalada Esportiva",
    difficulty: "4c - 7c",
    routes: 78,
    description: "Região montanhosa com vistas incríveis e rotas variadas.",
    rating: 4.9,
  }
];

const groups = [
  {
    id: 1,
    title: "Escalada na Pedra Grande",
    location: "Atibaia - SP",
    date: "2025-08-02",
    time: "07:00",
    participants: 3,
    maxParticipants: 6,
    level: "Intermediário",
    organizer: "Ana Silva",
    description: "Saída para vias clássicas da região"
  },
  {
    id: 2,
    title: "Boulder no Morro do Diabo",
    location: "São Paulo - SP", 
    date: "2025-08-05",
    time: "15:00",
    participants: 2,
    maxParticipants: 4,
    level: "Iniciante/Intermediário",
    organizer: "Carlos Santos",
    description: "Sessão de boulder para todos os níveis"
  }
];

export default function ClimderApp() {
  const [currentView, setCurrentView] = useState('discover');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showCroquisEditor, setShowCroquisEditor] = useState(false);
  const [showCroquisViewer, setShowCroquisViewer] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [viewingLocationName, setViewingLocationName] = useState('');

  const { userProfile, logout } = useAuth();

  const handleLike = () => {
    const currentProfile = climberProfiles[currentMatchIndex];
    setLikedProfiles(prev => [...prev, currentProfile]);
    
    // Simular match (50% de chance)
    if (Math.random() > 0.5) {
      setMatches(prev => [...prev, currentProfile]);
      Alert.alert('🎉 Match!', `Você fez match com ${currentProfile.name}!`);
    }
    
    nextProfile();
  };

  const handlePass = () => {
    nextProfile();
  };

  const nextProfile = () => {
    if (currentMatchIndex < climberProfiles.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      setCurrentMatchIndex(0);
    }
  };

  const openCroquisEditor = (locationId) => {
    setEditingLocationId(locationId);
    setShowCroquisEditor(true);
  };

  const openCroquisViewer = (locationId, locationName) => {
    setEditingLocationId(locationId);
    setViewingLocationName(locationName);
    setShowCroquisViewer(true);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair do Climder?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout }
      ]
    );
  };

  // Componente do Header com perfil do usuário
  const UserHeader = () => (
    <View style={styles.userHeader}>
      <View style={styles.userInfo}>
        <Text style={styles.userIcon}>{userProfile?.profileImage || '🧗‍♀️'}</Text>
        <View>
          <Text style={styles.userName}>{userProfile?.displayName || 'Escalador'}</Text>
          <Text style={styles.userGrade}>Grade: {userProfile?.climbingGrade || '5c'}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>🚪</Text>
      </TouchableOpacity>
    </View>
  );

  // Tela de Descoberta (Matches)
  const DiscoverView = () => {
    const currentProfile = climberProfiles[currentMatchIndex];
    
    return (
      <View style={styles.container}>
        <UserHeader />
        <Text style={styles.title}>🔍 Descobrir Escaladores</Text>
        
        <View style={styles.profileCard}>
          <Text style={styles.profileImage}>{currentProfile.image}</Text>
          <Text style={styles.profileName}>{currentProfile.name}, {currentProfile.age}</Text>
          <Text style={styles.profileGrade}>Grade: {currentProfile.grade}</Text>
          <Text style={styles.profileLocation}>{currentProfile.location}</Text>
          <Text style={styles.profileType}>Tipo: {currentProfile.climbingType}</Text>
          <Text style={styles.profileAvailability}>Disponibilidade: {currentProfile.availability}</Text>
          <Text style={styles.profileBio}>{currentProfile.bio}</Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.passButton} onPress={handlePass}>
            <Text style={styles.buttonEmoji}>👎🩹</Text>
            <Text style={styles.buttonText}>Passar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
            <Text style={styles.buttonEmoji}>❤️</Text>
            <Text style={styles.buttonText}>Curtir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Tela de Matches
  const MatchesView = () => (
    <View style={styles.container}>
      <UserHeader />
      <Text style={styles.title}>❤️ Seus Matches</Text>
      
      <ScrollView style={styles.matchesList}>
        {matches.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>💔</Text>
            <Text style={styles.emptyStateText}>Nenhum match ainda</Text>
            <Text style={styles.emptyStateSubtext}>Continue descobrindo escaladores!</Text>
          </View>
        ) : (
          matches.map((match) => (
            <TouchableOpacity key={match.id} style={styles.matchCard}>
              <Text style={styles.matchImage}>{match.image}</Text>
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{match.name}</Text>
                <Text style={styles.matchDetails}>{match.grade} • {match.location}</Text>
                <Text style={styles.matchType}>{match.climbingType}</Text>
              </View>
              <TouchableOpacity style={styles.chatButton}>
                <Text style={styles.chatButtonText}>💬 Chat</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );

  // Tela de Grupos
  const GroupsView = () => (
    <View style={styles.container}>
      <UserHeader />
      <Text style={styles.title}>👥 Grupos de Escalada</Text>
      
      <ScrollView style={styles.groupsList}>
        {groups.map((group) => (
          <View key={group.id} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <Text style={styles.groupLevel}>{group.level}</Text>
            </View>
            
            <Text style={styles.groupLocation}>📍 {group.location}</Text>
            <Text style={styles.groupDate}>📅 {group.date} às {group.time}</Text>
            <Text style={styles.groupParticipants}>
              👥 {group.participants}/{group.maxParticipants} participantes
            </Text>
            <Text style={styles.groupOrganizer}>Organizado por {group.organizer}</Text>
            <Text style={styles.groupDescription}>{group.description}</Text>
            
            <TouchableOpacity style={styles.joinButton}>
              <Text style={styles.joinButtonText}>➕ Participar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // Tela de Locais (com croquis)
  const LocationsView = () => {
    if (selectedLocation) {
      return (
        <ScrollView style={styles.container}>
          <UserHeader />
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

          <View style={styles.detailCard}>
            <Text style={styles.sectionTitle}>🗺️ Croquis de {selectedLocation.name}</Text>
            <Text style={styles.croquisDescription}>
              Crie e visualize croquis específicos para este local de escalada
            </Text>
            
            <View style={styles.croquisActions}>
              <TouchableOpacity 
                style={styles.createCroquisButton}
                onPress={() => openCroquisEditor(selectedLocation.id)}
              >
                <Text style={styles.createCroquisText}>📋 + Criar Novo Croqui</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.viewGalleryButton}
                onPress={() => openCroquisViewer(selectedLocation.id, selectedLocation.name)}
              >
                <Text style={styles.viewGalleryText}>👁️ Ver Croquis Salvos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      );
    }

    return (
      <View style={styles.container}>
        <UserHeader />
        <Text style={styles.title}>🗺️ Locais de Escalada</Text>
        
        <ScrollView style={styles.locationsList}>
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
              
              <View style={styles.quickActions}>
                <TouchableOpacity 
                  style={styles.quickCroquisButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    openCroquisEditor(location.id);
                  }}
                >
                  <Text style={styles.quickCroquisText}>📋 Criar Croqui</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickGalleryButton}
                  onPress={(e) => {
                    e.stopPropagation();  
                    openCroquisViewer(location.id, location.name);
                  }}
                >
                  <Text style={styles.quickGalleryText}>👁️ Ver Croquis</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.tapHint}>
                <Text style={styles.tapHintText}>👆 Toque para ver detalhes completos</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Tab Bar
  const TabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity 
        style={[styles.tab, currentView === 'discover' && styles.activeTab]}
        onPress={() => setCurrentView('discover')}
      >
        <Text style={[styles.tabIcon, currentView === 'discover' && styles.activeTabIcon]}>🔍</Text>
        <Text style={[styles.tabText, currentView === 'discover' && styles.activeTabText]}>Descobrir</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, currentView === 'matches' && styles.activeTab]}
        onPress={() => setCurrentView('matches')}
      >
        <Text style={[styles.tabIcon, currentView === 'matches' && styles.activeTabIcon]}>❤️</Text>
        <Text style={[styles.tabText, currentView === 'matches' && styles.activeTabText]}>Matches</Text>
        {matches.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{matches.length}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, currentView === 'groups' && styles.activeTab]}
        onPress={() => setCurrentView('groups')}
      >
        <Text style={[styles.tabIcon, currentView === 'groups' && styles.activeTabIcon]}>👥</Text>
        <Text style={[styles.tabText, currentView === 'groups' && styles.activeTabText]}>Grupos</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, currentView === 'locations' && styles.activeTab]}
        onPress={() => setCurrentView('locations')}
      >
        <Text style={[styles.tabIcon, currentView === 'locations' && styles.activeTabIcon]}>🗺️</Text>
        <Text style={[styles.tabText, currentView === 'locations' && styles.activeTabText]}>Locais</Text>
      </TouchableOpacity>
    </View>
  );

  // Renderizar view atual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'discover': return <DiscoverView />;
      case 'matches': return <MatchesView />;
      case 'groups': return <GroupsView />;
      case 'locations': return <LocationsView />;
      default: return <DiscoverView />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.app}>
        {renderCurrentView()}
        
        <TabBar />

        <CroquisEditor
          visible={showCroquisEditor}
          onClose={() => setShowCroquisEditor(false)}
          locationId={editingLocationId}
        />

        <CroquisViewer
          visible={showCroquisViewer}
          onClose={() => setShowCroquisViewer(false)}
          locationId={editingLocationId}
          locationName={viewingLocationName}
          onEdit={openCroquisEditor}
        />
      </View>
    </SafeAreaView>
  );
}