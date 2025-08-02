import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CroquisEditor from './CroquisEditor';
import CroquisViewer from './CroquisViewer';
import ChatScreen from './ChatScreen';
import CreateGroupModal from './CreateGroupModal';
import NotificationCenter from './NotificationCenter';
import NotificationService from './NotificationService';
import FirestoreService from './services/FirestoreService';

const { width } = Dimensions.get('window');

export default function ClimderApp({ userProfile, onLogout }) {
  const user = userProfile;
  const logout = onLogout;

  // Estados principais
  const [activeTab, setActiveTab] = useState('discover');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [participatingGroups, setParticipatingGroups] = useState(new Set());
  const [createdGroups, setCreatedGroups] = useState([]);
  const [showCroquisEditor, setShowCroquisEditor] = useState(false);
  const [showCroquisViewer, setShowCroquisViewer] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);

  // Estados do Firestore
  const [climbers, setClimbers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Estados do chat
  const [showChat, setShowChat] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Estados de notificação
  const [showNotifications, setShowNotifications] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

  // Refs para cleanup
  const appStateRef = useRef(AppState.currentState);
  const badgeUpdateIntervalRef = useRef(null);



  // Dados de locais
  const locations = [
    {
      id: 1,
      name: 'Pão de Açúcar',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil',
      type: 'Escalada Esportiva',
      difficulty: '4º - 8º grau',
      routes: 270,
      image: '🍞',
      description: 'Ícone mundial da escalada, berço da escalada brasileira.',
      access: 'Bondinho + trilha ou escalada desde a Praia Vermelha',
      equipment: 'Corda 50-60m, capacete recomendado'
    },
    {
      id: 2,
      name: 'Cachoeira do Abismo',
      city: 'Três Rios',
      state: 'RJ',
      country: 'Brasil',
      type: 'Escalada Esportiva',
      difficulty: '5º - 7º grau',
      routes: 45,
      image: '💧',
      description: 'Parede de gnaisse com cachoeira ao fundo.',
      access: 'Trilha leve de 20 minutos',
      equipment: 'Corda 60m, 12 expressas'
    }
  ];

  // Inicialização do serviço de notificações
  useEffect(() => {
    initializeNotifications();
    loadUserData();
    setupAppStateListener();
    startBadgeUpdateInterval();
    initializeFirestoreData(); // Carregar dados do Firebase

    return () => {
      cleanup();
    };
  }, [initializeFirestoreData]);

  // Inicializar notificações
  const initializeNotifications = useCallback(async () => {
    try {
      const token = await NotificationService.initialize();
      if (token) {
        console.log('✅ Notificações inicializadas com token:', token);
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar notificações:', error);
    }
  }, []);

  // Carregar dados do usuário
  const loadUserData = useCallback(async () => {
    try {
      // Dados locais não relacionados ao Firestore (configurações, etc.)
      // Os matches, grupos agora vêm do Firestore via initializeFirestoreData()
      console.log('📱 Carregando dados locais do usuário...');
      
      // Manter apenas dados que não estão no Firestore
      // como preferências de UI, configurações locais, etc.
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados locais:', error);
    }
  }, []);

  // Configurar listener de estado do app
  const setupAppStateListener = useCallback(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        updateBadgeCount();
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription?.remove();
  }, []);

  // Inicializar dados do Firestore
  const initializeFirestoreData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      console.log('🔥 Carregando dados do Firestore...');

      // Carregar escaladores para descoberta
      const climbersData = await FirestoreService.getClimbersForDiscovery(user.uid, 20);
      
      // Se não há escaladores, popular com dados de teste
      if (climbersData.length === 0) {
        console.log('📦 Nenhum escalador encontrado, populando dados de teste...');
        await FirestoreService.populateTestData();
        
        // Tentar carregar novamente
        const newClimbersData = await FirestoreService.getClimbersForDiscovery(user.uid, 20);
        setClimbers(newClimbersData);
        console.log(`✅ ${newClimbersData.length} escaladores carregados (após popular teste)`);
      } else {
        setClimbers(climbersData);
        console.log(`✅ ${climbersData.length} escaladores carregados`);
      }

      // Carregar grupos
      const groupsData = await FirestoreService.getAllGroups();
      setAllGroups(groupsData);
      console.log(`✅ ${groupsData.length} grupos carregados`);

      // Carregar matches do usuário
      const matchesData = await FirestoreService.getUserMatches(user.uid);
      setMatches(matchesData);
      console.log(`✅ ${matchesData.length} matches carregados`);

    } catch (error) {
      console.error('❌ Erro ao carregar dados do Firestore:', error);
      // Fallback para dados mock se necessário
      await loadMockDataFallback();
    } finally {
      setIsLoadingData(false);
    }
  }, [user.uid]);

  // Fallback para dados mock se Firestore falhar
  const loadMockDataFallback = async () => {
    console.log('⚠️ Usando dados mock como fallback');
    const mockClimbers = [
      {
        id: 'mock-1',
        name: 'Ana Silva',
        age: 28,
        grade: '6a',
        type: 'Esportiva',
        experience: '3 anos',
        location: 'Rio de Janeiro, RJ',
        bio: 'Apaixonada por escalada esportiva! 🧗‍♀️',
        image: '🧗‍♀️',
        lastActive: '2 horas atrás'
      }
    ];
    setClimbers(mockClimbers);
  };

  // Iniciar intervalo de atualização de badge
  const startBadgeUpdateInterval = useCallback(() => {
    badgeUpdateIntervalRef.current = setInterval(() => {
      updateBadgeCount();
    }, 30000); // Atualizar a cada 30 segundos
  }, []);

  // Atualizar contador de badge
  const updateBadgeCount = useCallback(async () => {
    try {
      const history = await NotificationService.getNotificationHistory();
      const unreadCount = history.filter(n => !n.read).length;
      setBadgeCount(unreadCount);
    } catch (error) {
      console.error('❌ Erro ao atualizar badge:', error);
    }
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (badgeUpdateIntervalRef.current) {
      clearInterval(badgeUpdateIntervalRef.current);
    }
    NotificationService.cleanup();
  }, []);

  // Função para dar like
  const handleLike = useCallback(async () => {
    try {
      const currentClimber = climbers[currentIndex];
      if (!currentClimber) return;

      console.log('💖 Like em:', currentClimber.name);

      // Criar match no Firestore
      const matchData = {
        userId: user.uid,
        targetUserId: currentClimber.id,
        action: 'like',
        climberData: currentClimber
      };

      await FirestoreService.createMatch(matchData);

      // Atualizar estado local
      const newMatches = [...matches, currentClimber];
      setMatches(newMatches);
      
      // Enviar notificação de match
      await NotificationService.sendMatchNotification({
        id: currentClimber.id,
        name: currentClimber.name
      });
      
      // Próximo escalador
      if (currentIndex < climbers.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }

    } catch (error) {
      console.error('❌ Erro ao dar like:', error);
      Alert.alert('Erro', 'Não foi possível processar o like. Tente novamente.');
    }
  }, [currentIndex, climbers, matches, user.uid]);

  // Função para dar pass
  const handlePass = useCallback(async () => {
    try {
      const currentClimber = climbers[currentIndex];
      if (!currentClimber) return;

      console.log('👎 Pass em:', currentClimber.name);

      // Registrar pass no Firestore (opcional, para analytics)
      const passData = {
        userId: user.uid,
        targetUserId: currentClimber.id,
        action: 'pass'
      };

      await FirestoreService.createMatch(passData);

      // Próximo escalador
      if (currentIndex < climbers.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }

    } catch (error) {
      console.error('❌ Erro ao dar pass:', error);
      // Pass não é crítico, continuar mesmo com erro
      if (currentIndex < climbers.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }
  }, [currentIndex, climbers, user.uid]);

  // Função para abrir chat
  const openChat = useCallback((match) => {
    console.log('🔥 Abrindo chat com:', match.name);
    setSelectedMatch(match);
    setShowChat(true);
    console.log('💬 Chat state atualizado - showChat:', true);
  }, []);

  // Função para fechar chat
  const closeChat = useCallback(() => {
    setShowChat(false);
    setSelectedMatch(null);
  }, []);

  // Função para participar de grupo
  const joinGroup = useCallback(async (groupId) => {
    const newParticipatingGroups = new Set(participatingGroups);
    newParticipatingGroups.add(groupId);
    
    setParticipatingGroups(newParticipatingGroups);
    await AsyncStorage.setItem('climder_participating_groups', JSON.stringify([...newParticipatingGroups]));
    
    const group = allGroups.find(g => g.id === groupId);
    if (group) {
      await NotificationService.sendGroupNotification(group.title, group.organizer, 'joined');
    }
  }, [participatingGroups]);

  // Função para sair de grupo
  const leaveGroup = useCallback(async (groupId) => {
    const newParticipatingGroups = new Set(participatingGroups);
    newParticipatingGroups.delete(groupId);
    
    setParticipatingGroups(newParticipatingGroups);
    await AsyncStorage.setItem('climder_participating_groups', JSON.stringify([...newParticipatingGroups]));
  }, [participatingGroups]);

  // Função para convidar para grupo
  const inviteToGroup = useCallback(async (match) => {
    if (createdGroups.length === 0) {
      Alert.alert('Info', 'Você precisa criar um grupo primeiro para convidar pessoas.');
      return;
    }

    const groupOptions = createdGroups.map(group => ({
      text: group.title,
      onPress: () => {
        Alert.alert('Convite Enviado!', `${match.name} foi convidado(a) para o grupo "${group.title}"`);
        NotificationService.sendGroupNotification(group.title, user.displayName, 'invite');
      }
    }));

    Alert.alert('Convidar para Grupo', 'Escolha um grupo:', [
      ...groupOptions,
      { text: 'Cancelar', style: 'cancel' }
    ]);
  }, [createdGroups, user]);

  // Função para criar grupo
  const handleCreateGroup = useCallback(async (groupData) => {
    const newGroup = {
      ...groupData,
      id: Date.now(),
      organizer: user.displayName,
      participants: 1
    };

    const updatedCreatedGroups = [...createdGroups, newGroup];
    setCreatedGroups(updatedCreatedGroups);
    await AsyncStorage.setItem('climder_created_groups', JSON.stringify(updatedCreatedGroups));

    // Automaticamente participar do grupo que criou
    await joinGroup(newGroup.id);
    
    // Enviar notificação
    await NotificationService.sendGroupNotification(newGroup.title, user.displayName, 'created');
    
    setShowCreateGroup(false);
    Alert.alert('Sucesso!', 'Grupo criado com sucesso!');
  }, [createdGroups, user, joinGroup]);

  // Função para abrir detalhes do grupo
  const openGroupDetails = useCallback((group) => {
    setSelectedGroup(group);
    setShowGroupDetails(true);
  }, []);

  // Função para logout
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair do Climder?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout }
      ]
    );
  }, [logout]);

  // Botão de notificações
  const NotificationButton = useCallback(() => (
    <TouchableOpacity 
      style={styles.notificationButton}
      onPress={() => setShowNotifications(true)}
    >
      <Text style={styles.notificationIcon}>🔔</Text>
      {badgeCount > 0 && (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  ), [badgeCount]);

  // Função para navegação das notificações
  const handleNotificationNavigation = useCallback((data) => {
    if (data?.screen) {
      switch (data.screen) {
        case 'Matches':
          setActiveTab('matches');
          break;
        case 'Groups':
          setActiveTab('groups');
          break;
        case 'Chat':
          if (data.chatId && matches.length > 0) {
            const match = matches.find(m => m.id.toString() === data.chatId);
            if (match) {
              openChat(match);
            }
          }
          break;
        default:
          setActiveTab('discover');
      }
    }
  }, [matches, openChat]);

  // Combinação de grupos (criados + disponíveis)
  const userCreatedGroups = createdGroups;
  const combinedGroups = [...allGroups, ...userCreatedGroups];

  // Vista de descoberta
  const DiscoverView = useCallback(() => (
    <View style={styles.discoverContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 Descobrir Escaladores</Text>
        <NotificationButton />
      </View>
      
      {isLoadingData ? (
        <View style={styles.loadingCard}>
          <Text style={styles.loadingEmoji}>🔥</Text>
          <Text style={styles.loadingTitle}>Carregando escaladores...</Text>
          <Text style={styles.loadingSubtitle}>Conectando com Firebase</Text>
        </View>
      ) : climbers.length > 0 ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.climberEmoji}>{climbers[currentIndex].image}</Text>
            <View style={styles.climberInfo}>
              <Text style={styles.climberName}>{climbers[currentIndex].name}</Text>
              <Text style={styles.climberAge}>{climbers[currentIndex].age} anos</Text>
            </View>
            <Text style={styles.climberGrade}>{climbers[currentIndex].grade}</Text>
          </View>
          
          <View style={styles.cardBody}>
            <Text style={styles.climberType}>🧗‍♀️ {climbers[currentIndex].type}</Text>
            <Text style={styles.climberExperience}>⏱️ {climbers[currentIndex].experience}</Text>
            <Text style={styles.climberLocation}>📍 {climbers[currentIndex].location}</Text>
            <Text style={styles.climberBio}>{climbers[currentIndex].bio}</Text>
            <Text style={styles.climberLastActive}>🟢 {climbers[currentIndex].lastActive}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🤔</Text>
          <Text style={styles.emptyTitle}>Nenhum escalador encontrado</Text>
          <Text style={styles.emptySubtitle}>Tente novamente mais tarde</Text>
        </View>
      )}
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.passButton} onPress={handlePass}>
          <Text style={styles.actionButtonText}>👎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Text style={styles.actionButtonText}>👍</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [currentIndex, handleLike, handlePass, NotificationButton]);

  // Vista de matches
  const MatchesView = useCallback(() => (
    <View style={styles.matchesContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💕 Seus Matches</Text>
        <NotificationButton />
      </View>
      
      <ScrollView style={styles.matchesList}>
        <Text style={styles.matchesCount}>Você tem {matches.length} matches!</Text>
        
        {matches.map((match) => (
          <View key={match.id} style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <Text style={styles.matchEmoji}>{match.image}</Text>
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{match.name}</Text>
                <Text style={styles.matchDetails}>{match.age} anos • {match.grade} • {match.type}</Text>
                <Text style={styles.matchLocation}>📍 {match.location}</Text>
              </View>
            </View>
            
            <View style={styles.matchActions}>
              <TouchableOpacity 
                style={styles.chatButton}
                onPress={() => openChat(match)}
              >
                <Text style={styles.chatButtonText}>💬 Chat</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.inviteButton}
                onPress={() => inviteToGroup(match)}
              >
                <Text style={styles.inviteButtonText}>👥 Convidar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  ), [matches, openChat, inviteToGroup, NotificationButton]);

  // Vista de grupos
  const GroupsView = useCallback(() => (
    <View style={styles.groupsContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 Grupos de Escalada</Text>
        <View style={styles.headerActions}>
          <NotificationButton />
          <TouchableOpacity 
            style={styles.createGroupButton}
            onPress={() => setShowCreateGroup(true)}
          >
            <Text style={styles.createGroupText}>➕ Criar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.groupsList}>
        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{combinedGroups.length}</Text>
            <Text style={styles.statLabel}>Grupos Disponíveis</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{participatingGroups.size}</Text>
            <Text style={styles.statLabel}>Participando</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userCreatedGroups.length}</Text>
            <Text style={styles.statLabel}>Criados por Você</Text>
          </View>
        </View>

        {combinedGroups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={[
              styles.groupCard,
              participatingGroups.has(group.id) && styles.participatingGroup,
              group.organizer === user.displayName && styles.organizingGroup
            ]}
            onPress={() => openGroupDetails(group)}
          >
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <Text style={styles.groupDate}>{group.date}</Text>
            </View>
            
            <Text style={styles.groupTime}>🕐 {group.time}</Text>
            <Text style={styles.groupLocation}>📍 {group.location}</Text>
            <Text style={styles.groupDifficulty}>⚡ {group.difficulty}</Text>
            <Text style={styles.groupDescription}>{group.description}</Text>
            <Text style={styles.groupEquipment}>🎒 {group.equipment}</Text>
            <Text style={styles.groupParticipants}>
              👥 {group.participants}/{group.maxParticipants} participantes
            </Text>
            
            <View style={styles.groupActions}>
              {participatingGroups.has(group.id) ? (
                <>
                  {group.organizer === user.displayName ? (
                    <View style={styles.organizerBadge}>
                      <Text style={styles.organizerText}>🎯 Organizando</Text>
                    </View>
                  ) : (
                    <View style={styles.participatingBadge}>
                      <Text style={styles.participatingText}>✅ Participando</Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.leaveButton}
                    onPress={() => leaveGroup(group.id)}
                  >
                    <Text style={styles.leaveButtonText}>
                      {group.organizer === user.displayName ? '❌ Cancelar' : '🚪 Sair'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : group.participants >= group.maxParticipants ? (
                <View style={styles.fullBadge}>
                  <Text style={styles.fullText}>🔒 Lotado</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.joinButton}
                  onPress={() => joinGroup(group.id)}
                >
                  <Text style={styles.joinButtonText}>➕ Participar</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  ), [combinedGroups, participatingGroups, userCreatedGroups, user, openGroupDetails, joinGroup, leaveGroup, NotificationButton]);

  // Vista de locais
  const LocationsView = useCallback(() => (
    <View style={styles.locationsContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏔️ Locais de Escalada</Text>
        <NotificationButton />
      </View>
      
      <ScrollView style={styles.locationsList}>
        <Text style={styles.totalLocations}>
          {locations.length} locais de escalada cadastrados
        </Text>
        
        {locations.map((location) => (
          <View key={location.id} style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationEmoji}>{location.image}</Text>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationAddress}>
                  {location.city}, {location.state}
                </Text>
              </View>
              <Text style={styles.locationRoutes}>{location.routes} vias</Text>
            </View>
            
            <Text style={styles.locationType}>🧗‍♀️ {location.type}</Text>
            <Text style={styles.locationDifficulty}>⚡ {location.difficulty}</Text>
            <Text style={styles.locationDescription}>{location.description}</Text>
            <Text style={styles.locationAccess}>🚗 {location.access}</Text>
            <Text style={styles.locationEquipment}>🎒 {location.equipment}</Text>
            
            <View style={styles.locationActions}>
              <TouchableOpacity 
                style={styles.croquisButton}
                onPress={() => {
                  setSelectedLocation(location);
                  setShowCroquisEditor(true);
                }}
              >
                <Text style={styles.croquisButtonText}>✏️ Criar Croquis</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.viewCroquisButton}
                onPress={() => {
                  setSelectedLocation(location);
                  setShowCroquisViewer(true);
                }}
              >
                <Text style={styles.viewCroquisButtonText}>👁️ Ver Croquis</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  ), [locations, NotificationButton]);

  // Renderizar conteúdo baseado na aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <DiscoverView />;
      case 'matches':
        return <MatchesView />;
      case 'groups':
        return <GroupsView />;
      case 'locations':
        return <LocationsView />;
      default:
        return <DiscoverView />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.app}>
        {/* Header do usuário */}
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Olá, </Text>
            <Text style={styles.userName}>{user?.displayName || 'Escalador Teste'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo principal */}
        <View style={styles.content}>
          {renderContent()}
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
            onPress={() => setActiveTab('discover')}
          >
            <Text style={styles.tabText}>🔍</Text>
            <Text style={[styles.tabLabel, activeTab === 'discover' && styles.activeTabLabel]}>
              Descobrir
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
            onPress={() => setActiveTab('matches')}
          >
            <Text style={styles.tabText}>💕</Text>
            <Text style={[styles.tabLabel, activeTab === 'matches' && styles.activeTabLabel]}>
              Matches
            </Text>
            {matches.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{matches.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
            onPress={() => setActiveTab('groups')}
          >
            <Text style={styles.tabText}>👥</Text>
            <Text style={[styles.tabLabel, activeTab === 'groups' && styles.activeTabLabel]}>
              Grupos
            </Text>
            {participatingGroups.size > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{participatingGroups.size}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'locations' && styles.activeTab]}
            onPress={() => setActiveTab('locations')}
          >
            <Text style={styles.tabText}>🏔️</Text>
            <Text style={[styles.tabLabel, activeTab === 'locations' && styles.activeTabLabel]}>
              Locais
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modais */}
      {showCroquisEditor && (
        <CroquisEditor
          visible={showCroquisEditor}
          location={selectedLocation}
          onClose={() => {
            setShowCroquisEditor(false);
            setSelectedLocation(null);
          }}
        />
      )}

      {showCroquisViewer && (
        <CroquisViewer
          visible={showCroquisViewer}
          location={selectedLocation}
          onClose={() => {
            setShowCroquisViewer(false);
            setSelectedLocation(null);
          }}
        />
      )}

      {showChat && selectedMatch && (
        <ChatScreen
          visible={showChat}
          matchedUser={selectedMatch}
          userProfile={user}
          onClose={closeChat}
        />
      )}

      {showCreateGroup && (
        <CreateGroupModal
          visible={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}

      {showNotifications && (
        <NotificationCenter
          visible={showNotifications}
          onClose={() => setShowNotifications(false)}
          onNavigate={handleNotificationNavigation}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  app: {
    flex: 1,
  },
  
  // Header Styles
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },

  // Content Styles
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Notification Button
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Discover Styles
  discoverContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  climberEmoji: {
    fontSize: 50,
    marginRight: 16,
  },
  climberInfo: {
    flex: 1,
  },
  climberName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  climberAge: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  climberGrade: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cardBody: {
    padding: 20,
  },
  climberType: {
    fontSize: 16,
    color: '#059669',
    marginBottom: 8,
    fontWeight: '600',
  },
  climberExperience: {
    fontSize: 16,
    color: '#7c3aed',
    marginBottom: 8,
    fontWeight: '600',
  },
  climberLocation: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 12,
    fontWeight: '600',
  },
  climberBio: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  climberLastActive: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
    gap: 40,
  },
  passButton: {
    backgroundColor: '#ef4444',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  likeButton: {
    backgroundColor: '#10b981',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonText: {
    fontSize: 24,
  },

  // Matches Styles
  matchesContainer: {
    flex: 1,
  },
  matchesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  matchesCount: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 16,
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  matchDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  matchLocation: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 4,
    fontWeight: '500',
  },
  matchActions: {
    flexDirection: 'row',
    gap: 12,
  },
  chatButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  chatButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  inviteButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: 'white',
    fontWeight: '600',
  },

  // Groups Styles
  groupsContainer: {
    flex: 1,
  },
  createGroupButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createGroupText: {
    color: 'white',
    fontWeight: '600',
  },
  groupsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginVertical: 16,
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
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  participatingGroup: {
    backgroundColor: '#ecfdf5',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  organizingGroup: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  groupDate: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  groupTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  groupLocation: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 4,
    fontWeight: '500',
  },
  groupDifficulty: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  groupEquipment: {
    fontSize: 14,
    color: '#7c3aed',
    marginBottom: 8,
    fontWeight: '500',
  },
  groupParticipants: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 12,
  },
  groupActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  joinButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  leaveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  participatingBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flex: 1,
  },
  participatingText: {
    color: '#16a34a',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  organizerBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flex: 1,
  },
  organizerText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  fullBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flex: 1,
  },
  fullText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },

  // Locations Styles
  locationsContainer: {
    flex: 1,
  },
  locationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  totalLocations: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  locationAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  locationRoutes: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  locationType: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 4,
    fontWeight: '600',
  },
  locationDifficulty: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 8,
    fontWeight: '600',
  },
  locationDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  locationAccess: {
    fontSize: 14,
    color: '#7c3aed',
    marginBottom: 4,
    fontWeight: '500',
  },
  locationEquipment: {
    fontSize: 14,
    color: '#f59e0b',
    marginBottom: 12,
    fontWeight: '500',
  },
  locationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  croquisButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  croquisButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  viewCroquisButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  viewCroquisButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // Tab Bar Styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#eff6ff',
  },
  tabText: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  tabBadge: {
    position: 'absolute',
    top: 4,
    right: '25%',
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Loading States
  loadingCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },

  // Empty States
  emptyCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});