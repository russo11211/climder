import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, StatusBar } from 'react-native';

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

export default function App() {
  const [currentProfile, setCurrentProfile] = useState(0);
  const [matches, setMatches] = useState([]);
  const [currentView, setCurrentView] = useState('discover');

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

  const LocationsView = () => (
    <View style={styles.screenContainer}>
      <Text style={styles.header}>🗺️ Locais de Escalada</Text>
      <View style={styles.locationCard}>
        <Text style={styles.locationName}>Pedra Grande</Text>
        <Text style={styles.locationInfo}>📍 Atibaia - SP</Text>
        <Text style={styles.locationInfo}>⭐ 4.8 • 45 vias • 5a-8b</Text>
        <Text style={styles.locationDescription}>
          Um dos locais mais clássicos de SP, com vias para todos os níveis.
        </Text>
      </View>
    </View>
  );

  const renderCurrentView = () => {
    switch(currentView) {
      case 'discover': return <DiscoverView />;
      case 'groups': return <GroupsView />;
      case 'matches': return <MatchesView />;
      case 'locations': return <LocationsView />;
      default: return <DiscoverView />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f9ff" />
      <View style={styles.app}>
        {renderCurrentView()}
        
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, currentView === 'discover' && styles.activeTab]}
            onPress={() => setCurrentView('discover')}
          >
            <Text style={styles.tabText}>⛰️</Text>
            <Text style={styles.tabLabel}>Descobrir</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, currentView === 'groups' && styles.activeTab]}
            onPress={() => setCurrentView('groups')}
          >
            <Text style={styles.tabText}>👥</Text>
            <Text style={styles.tabLabel}>Grupos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, currentView === 'matches' && styles.activeTab]}
            onPress={() => setCurrentView('matches')}
          >
            <Text style={styles.tabText}>❤️</Text>
            <Text style={styles.tabLabel}>Matches</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, currentView === 'locations' && styles.activeTab]}
            onPress={() => setCurrentView('locations')}
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
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1f2937',
  },
  locationInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  locationDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
    marginTop: 8,
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
});
