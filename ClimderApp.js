<TouchableOpacity 
                  style={styles.inviteButton}
                  onPress={() => inviteToGroup(match)}
                >
                  <Text style={styles.inviteButtonText}>👥 Convidar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  ), [matches, openChat, inviteToGroup]);

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
            <Text style={styles.statNumber}>{allGroups.length}</Text>
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

        {allGroups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={[
              styles.groupCard,
              participatingGroups.has(group.id) && styles.groupCardParticipating,
              group.organizerId === user.uid && styles.groupCardOrganizing
            ]}
            onPress={() => showGroupDetails(group)}
            activeOpacity={0.7}
          >
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <Text style={styles.groupDate}>{group.date}</Text>
            </View>

            <Text style={styles.groupTime}>🕐 {group.time}</Text>
            <Text style={styles.groupLocation}>📍 {group.location}</Text>
            <Text style={styles.groupDifficulty}>⚡ {group.difficulty}</Text>
            <Text style={styles.groupType}>🧗‍♀️ {group.climbingType}</Text>

            <View style={styles.groupFooter}>
              <Text style={styles.groupParticipants}>
                👥 {group.participants}/{group.maxParticipants} participantes
              </Text>
              <Text style={styles.groupOrganizer}>👨‍💼 {group.organizer}</Text>
            </View>

            <View style={styles.statusBadge}>
              {group.organizerId === user.uid && (
                <Text style={styles.organizerBadge}>👑 Organizando</Text>
              )}
              {participatingGroups.has(group.id) && group.organizerId !== user.uid && (
                <Text style={styles.participatingBadge}>✅ Participando</Text>
              )}
              {group.participants >= group.maxParticipants && (
                <Text style={styles.fullBadge}>🚫 Lotado</Text>
              )}
            </View>

            <View style={styles.groupActions}>
              {participatingGroups.has(group.id) ? (
                <TouchableOpacity 
                  style={styles.leaveButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleLeaveGroup(group);
                  }}
                >
                  <Text style={styles.leaveButtonText}>❌ Sair</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[
                    styles.joinButton,
                    group.participants >= group.maxParticipants && styles.joinButtonDisabled
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleJoinGroup(group);
                  }}
                  disabled={group.participants >= group.maxParticipants}
                >
                  <Text style={styles.joinButtonText}>
                    {group.participants >= group.maxParticipants ? '🚫 Lotado' : '➕ Participar'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  ), [allGroups, participatingGroups, userCreatedGroups, user.uid, showGroupDetails, handleLeaveGroup, handleJoinGroup]);

  const LocationsView = useCallback(() => (
    <View style={styles.locationsContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Locais de Escalada</Text>
        <NotificationButton />
      </View>

      <ScrollView style={styles.locationsList}>
        <Text style={styles.totalLocations}>
          {climbingLocations.length} locais catalogados
        </Text>

        {climbingLocations.map((location) => (
          <View key={location.id} style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationEmoji}>{location.image}</Text>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationPlace}>{location.city}, {location.state}</Text>
                <Text style={styles.locationType}>{location.type}</Text>
              </View>
              <View style={styles.locationRating}>
                <Text style={styles.ratingText}>⭐ {location.rating}</Text>
              </View>
            </View>

            <Text style={styles.locationDescription}>{location.description}</Text>

            <View style={styles.locationDetails}>
              <Text style={styles.locationDetail}>⚡ {location.difficulty}</Text>
              <Text style={styles.locationDetail}>🧗‍♀️ {location.routes} vias</Text>
              <Text style={styles.locationDetail}>📍 {location.coordinates}</Text>
            </View>

            <Text style={styles.locationAccess}>🚶‍♂️ Acesso: {location.access}</Text>
            <Text style={styles.locationEquipment}>🎒 Equipamentos: {location.equipment}</Text>
            <Text style={styles.locationSeasons}>📅 Melhores épocas: {location.seasons}</Text>

            <View style={styles.locationActions}>
              <TouchableOpacity 
                style={styles.croquisButton}
                onPress={() => openCroquisEditor(location.id)}
              >
                <Text style={styles.croquisButtonText}>📋 Criar Croqui</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.viewCroquisButton}
                onPress={() => openCroquisViewer(location.id, location.name)}
              >
                <Text style={styles.viewCroquisButtonText}>👁️ Ver Croquis</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  ), [openCroquisEditor, openCroquisViewer]);

  // ===========================================
  // COMPONENTES E FUNÇÕES DE AÇÃO
  // ===========================================

  /**
   * Tab Bar Component
   */
  const TabBar = useCallback(() => (
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
        <Text style={[styles.tabIcon, currentView === 'matches' && styles.activeTabIcon]}>💕</Text>
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
        {participatingGroups.size > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{participatingGroups.size}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, currentView === 'locations' && styles.activeTab]}
        onPress={() => setCurrentView('locations')}
      >
        <Text style={[styles.tabIcon, currentView === 'locations' && styles.activeTabIcon]}>🗺️</Text>
        <Text style={[styles.tabText, currentView === 'locations' && styles.activeTabText]}>Locais</Text>
      </TouchableOpacity>
    </View>
  ), [currentView, matches.length, participatingGroups.size]);

  /**
   * Função para dar like em um perfil
   */
  const handleLike = useCallback(async () => {
    try {
      const currentProfile = climberProfiles[currentMatchIndex];
      
      if (Math.random() > 0.3) {
        setMatches(prevMatches => [...prevMatches, currentProfile]);
        
        // Enviar notificação se habilitada
        if (notificationSettings.matches) {
          await NotificationService.sendMatchNotification(currentProfile);
        }
        
        Alert.alert('🎉 Match!', `Você fez match com ${currentProfile.name}!`);
      }
      
      nextProfile();
    } catch (error) {
      console.error('❌ Erro ao processar like:', error);
    }
  }, [currentMatchIndex, notificationSettings.matches]);

  /**
   * Função para passar um perfil
   */
  const handlePass = useCallback(() => {
    nextProfile();
  }, []);

  /**
   * Avança para o próximo perfil
   */
  const nextProfile = useCallback(() => {
    setCurrentMatchIndex(prev => 
      prev < climberProfiles.length - 1 ? prev + 1 : 0
    );
  }, []);

  /**
   * Abre o editor de croquis
   */
  const openCroquisEditor = useCallback((locationId) => {
    setEditingLocationId(locationId);
    setShowCroquisEditor(true);
  }, []);

  /**
   * Abre o visualizador de croquis
   */
  const openCroquisViewer = useCallback((locationId, locationName) => {
    setEditingLocationId(locationId);
    setViewingLocationName(locationName);
    setShowCroquisViewer(true);
  }, []);

  /**
   * Abre o chat com um match
   */
  const openChat = useCallback((matchedUser) => {
    setSelectedChatUser(matchedUser);
    setShowChat(true);
  }, []);

  /**
   * Fecha o chat
   */
  const closeChat = useCallback(() => {
    setShowChat(false);
    setSelectedChatUser(null);
    // Atualizar badge ao fechar chat
    loadNotificationBadge();
  }, [loadNotificationBadge]);

  /**
   * Convida um match para um grupo
   */
  const inviteToGroup = useCallback(async (match) => {
    try {
      if (userCreatedGroups.length === 0) {
        Alert.alert(
          'Sem Grupos',
          'Você precisa criar um grupo primeiro para convidar pessoas!',
          [
            { text: 'OK', style: 'cancel' },
            { text: 'Criar Grupo', onPress: () => setShowCreateGroup(true) }
          ]
        );
        return;
      }

      const groupOptions = userCreatedGroups.map(group => ({
        text: group.title,
        onPress: async () => {
          // Enviar notificação de convite se habilitada
          if (notificationSettings.groups) {
            await NotificationService.sendGroupNotification(
              group.title,
              user.displayName,
              'invite'
            );
          }
          
          Alert.alert(
            '📨 Convite Enviado!',
            `${match.name} foi convidado(a) para o grupo "${group.title}". ${notificationSettings.groups ? 'Eles receberão uma notificação.' : ''}`
          );
        }
      }));

      Alert.alert(
        '👥 Convidar para Grupo',
        `Selecione um grupo para convidar ${match.name}:`,
        [
          { text: 'Cancelar', style: 'cancel' },
          ...groupOptions
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao convidar para grupo:', error);
    }
  }, [userCreatedGroups, user.displayName, notificationSettings.groups]);

  /**
   * Faz logout do app
   */
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair do Climder?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive', 
          onPress: () => {
            // Cleanup de notificações
            NotificationService.cleanup();
            
            // Limpar intervalos
            if (badgeUpdateInterval.current) {
              clearInterval(badgeUpdateInterval.current);
            }
            
            logout();
          }
        }
      ]
    );
  }, [logout]);

  /**
   * Renderiza a view atual baseada na tab selecionada
   */
  const renderCurrentView = useCallback(() => {
    switch (currentView) {
      case 'discover': return <DiscoverView />;
      case 'matches': return <MatchesView />;
      case 'groups': return <GroupsView />;
      case 'locations': return <LocationsView />;
      default: return <DiscoverView />;
    }
  }, [currentView, DiscoverView, MatchesView, GroupsView, LocationsView]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.app}>
        {renderCurrentView()}
        
        <TabBar />

        {/* MODALS */}
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

        <ChatScreen
          visible={showChat}
          onClose={closeChat}
          matchedUser={selectedChatUser}
          userProfile={user}
        />

        <CreateGroupModal
          visible={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
          onCreateGroup={handleCreateGroup}
          userProfile={user}
        />

        {/* CENTRAL DE NOTIFICAÇÕES */}
        <NotificationCenter
          visible={showNotifications}
          onClose={() => {
            setShowNotifications(false);
            loadNotificationBadge(); // Atualizar badge ao fechar
          }}
          onNavigate={handleNotificationNavigation}
        />
      </View>
    </SafeAreaView>
  );
}

// ===========================================
// STYLES
// ===========================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  app: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
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
  userEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Botão de Notificações
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },

  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },

  // Discover Styles
  discoverContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: width - 40,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardGrade: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 16,
  },
  cardBio: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  cardLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  cardExperience: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  cardPreference: {
    fontSize: 14,
    color: '#6b7280',
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
    shadowOpacity: 0.1,
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 28,
  },

  // Dedão Container
  dedaoContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  dedaoText: {
    fontSize: 32,
  },
  dedaoSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  // Matches Styles
  matchesContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  matchesList: {
    flex: 1,
    padding: 16,
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  matchEmoji: {
    fontSize: 48,
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
    color: '#3b82f6',
    marginBottom: 6,
  },
  matchBio: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  matchActions: {
    gap: 8,
  },
  chatButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chatButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  inviteButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inviteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
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
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Groups Styles
  groupsContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  createGroupButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createGroupText: {
    color: 'white',
    fontWeight: 'bold',
  },
  groupsList: {
    flex: 1,
    padding: 16,
  },

  // Estatísticas dos Grupos
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
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
    textAlign: 'center',
    marginTop: 4,
  },

  // Cards dos Grupos
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
    borderLeftWidth: 4,
    borderLeftColor: '#e5e7eb',
  },
  groupCardParticipating: {
    borderLeftColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  groupCardOrganizing: {
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    marginBottom: 6,
  },
  groupLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  groupDifficulty: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
    marginBottom: 6,
  },
  groupType: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
    marginBottom: 8,
  },
  groupFooter: {
    marginBottom: 12,
  },
  groupParticipants: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 4,
  },
  groupOrganizer: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Status Badges
  statusBadge: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  organizerBadge: {
    fontSize: 12,
    color: '#d97706',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  participatingBadge: {
    fontSize: 12,
    color: '#059669',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  fullBadge: {
    fontSize: 12,
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },

  // Ações dos Grupos
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'center',
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
    fontWeight: 'bold',
    fontSize: 14,
  },
  leaveButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Locations Styles
  locationsContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  locationsList: {
    flex: 1,
    padding: 16,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  locationPlace: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  locationType: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  locationRating: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  locationDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  locationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 12,
  },
  locationDetail: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  locationAccess: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  locationEquipment: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  locationSeasons: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  croquisButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  croquisButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  viewCroquisButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  viewCroquisButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Tab Bar Styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 20,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeTabIcon: {
    fontSize: 22,
  },
  tabText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },

  // Badge para tabs
  badge: {
    position: 'absolute',
    top: 2,
    right: 8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  bottomPadding: {
    height: 20,
  },
});import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const { width, height } = Dimensions.get('window');

/**
 * Componente principal do Climder após autenticação
 * 
 * Integra todas as funcionalidades principais:
 * - Sistema de descoberta e matches
 * - Chat entre matches
 * - Grupos de escalada
 * - Locais e croquis
 * - Notificações push completas
 */
export default function ClimderApp({ userProfile, onLogout }) {
  // Dados do usuário
  const user = userProfile || {
    displayName: 'Escalador Teste',
    uid: 'test-user'
  };
  const logout = onLogout || (() => Alert.alert('Logout', 'Função logout não definida'));

  // Estados principais
  const [currentView, setCurrentView] = useState('discover');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [participatingGroups, setParticipatingGroups] = useState(new Set());
  
  // Estados dos modais
  const [showCroquisEditor, setShowCroquisEditor] = useState(false);
  const [showCroquisViewer, setShowCroquisViewer] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [viewingLocationName, setViewingLocationName] = useState('');
  
  // Estados do chat
  const [showChat, setShowChat] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState(null);

  // Estados dos grupos
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [userCreatedGroups, setUserCreatedGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);

  // Estados das notificações
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationBadgeCount, setNotificationBadgeCount] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({
    matches: true,
    groups: true,
    chat: true,
    reminders: true,
  });

  // Refs para cleanup
  const appStateRef = useRef(AppState.currentState);
  const badgeUpdateInterval = useRef(null);

  // Inicialização do app
  useEffect(() => {
    initializeApp();
    
    // Cleanup ao desmontar componente
    return () => {
      if (badgeUpdateInterval.current) {
        clearInterval(badgeUpdateInterval.current);
      }
    };
  }, []);

  // Listener para mudanças de estado do app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  /**
   * Inicializa todos os sistemas do app
   */
  const initializeApp = useCallback(async () => {
    try {
      console.log('🚀 Inicializando Climder App...');
      
      // Inicializar notificações
      await initializeNotifications();
      
      // Carregar dados dos grupos
      await loadGroupsData();
      
      // Carregar configurações de notificação
      await loadNotificationSettings();
      
      // Carregar badge inicial
      await loadNotificationBadge();
      
      // Configurar atualização periódica do badge
      setupBadgeUpdateInterval();
      
      console.log('✅ Climder App inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro na inicialização do app:', error);
    }
  }, []);

  /**
   * Manipula mudanças de estado do app (foreground/background)
   */
  const handleAppStateChange = useCallback(async (nextAppState) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('📱 App voltou para foreground - atualizando badge');
      await loadNotificationBadge();
    }
    appStateRef.current = nextAppState;
  }, []);

  /**
   * Configura intervalo para atualização automática do badge
   */
  const setupBadgeUpdateInterval = useCallback(() => {
    // Atualizar badge a cada 30 segundos
    badgeUpdateInterval.current = setInterval(async () => {
      await loadNotificationBadge();
    }, 30000);
  }, []);

  // ===========================================
  // SISTEMA DE NOTIFICAÇÕES
  // ===========================================

  /**
   * Inicializa o serviço de notificações
   */
  const initializeNotifications = useCallback(async () => {
    try {
      console.log('🔔 Inicializando sistema de notificações...');
      const token = await NotificationService.initialize();
      
      if (token) {
        console.log('✅ Notificações inicializadas - Token:', token.substring(0, 20) + '...');
        // Aqui você pode enviar o token para seu backend se necessário
      } else {
        console.log('⚠️ Notificações não disponíveis');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar notificações:', error);
    }
  }, []);

  /**
   * Carrega o contador de badge de notificações
   */
  const loadNotificationBadge = useCallback(async () => {
    try {
      const history = await NotificationService.getNotificationHistory();
      const unreadCount = history.filter(n => !n.read).length;
      setNotificationBadgeCount(unreadCount);
    } catch (error) {
      console.error('❌ Erro ao carregar badge:', error);
    }
  }, []);

  /**
   * Carrega configurações de notificação
   */
  const loadNotificationSettings = useCallback(async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('climder_notification_settings');
      if (savedSettings) {
        setNotificationSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações de notificação:', error);
    }
  }, []);

  /**
   * Manipula navegação a partir de notificações
   */
  const handleNotificationNavigation = useCallback((data) => {
    console.log('🧭 Navegando de notificação:', data);
    
    switch (data.type) {
      case 'match':
        setCurrentView('matches');
        if (data.userId) {
          // Aqui você pode abrir o chat específico se necessário
          console.log('👥 Navegando para match com usuário:', data.userName);
        }
        break;
        
      case 'group':
        setCurrentView('groups');
        if (data.groupTitle) {
          console.log('👥 Navegando para grupo:', data.groupTitle);
        }
        break;
        
      case 'chat':
        setCurrentView('matches');
        if (data.chatId && data.senderName) {
          console.log('💬 Navegando para chat com:', data.senderName);
          // Aqui você pode abrir o chat específico
        }
        break;
        
      case 'reminder':
        setCurrentView('groups');
        console.log('⏰ Navegando para lembrete de grupo');
        break;
        
      default:
        console.log('❓ Tipo de notificação desconhecido:', data.type);
    }
  }, []);

  // ===========================================
  // SISTEMA DE GRUPOS
  // ===========================================

  /**
   * Dados iniciais dos grupos (mock data)
   */
  const initialGroups = [
    {
      id: 1,
      title: 'Escalada em Atibaia - Pedra Grande',
      date: '15 de Agosto',
      time: '07:00',
      location: 'Atibaia, SP',
      difficulty: '5a - 6b',
      participants: 3,
      maxParticipants: 8,
      organizer: 'Carlos Mendoza',
      organizerId: 'carlos-123',
      description: 'Saída para Pedra Grande, vias clássicas de esportiva.',
      equipment: 'Corda 60m, quickdraws, capacete',
      climbingType: 'Esportiva',
      requiredExperience: 'Intermediário',
      isPrivate: false,
      status: 'active',
      createdAt: '2025-07-25T10:00:00.000Z',
      participantsList: [
        { id: 'carlos-123', name: 'Carlos Mendoza', grade: '7a', isOrganizer: true },
        { id: 'ana-456', name: 'Ana Silva', grade: '6a', isOrganizer: false },
        { id: 'pedro-789', name: 'Pedro Santos', grade: '6c', isOrganizer: false }
      ]
    },
    {
      id: 2,
      title: 'Boulder na Urca',
      date: '18 de Agosto',
      time: '16:00',
      location: 'Rio de Janeiro, RJ',
      difficulty: 'V0 - V5',
      participants: 5,
      maxParticipants: 6,
      organizer: 'Ana Silva',
      organizerId: 'ana-456',
      description: 'Sessão de boulder na Urca, problemas para todos os níveis.',
      equipment: 'Crash pad, magnésio',
      climbingType: 'Boulder',
      requiredExperience: 'Qualquer nível',
      isPrivate: false,
      status: 'active',
      createdAt: '2025-07-26T14:00:00.000Z',
      participantsList: [
        { id: 'ana-456', name: 'Ana Silva', grade: '6a', isOrganizer: true },
        { id: 'marina-321', name: 'Marina Costa', grade: '5c', isOrganizer: false }
      ]
    },
    {
      id: 3,
      title: 'Trad em Itaipava',
      date: '22 de Agosto',
      time: '06:30',
      location: 'Petrópolis, RJ',
      difficulty: '4c - 5c',
      participants: 2,
      maxParticipants: 4,
      organizer: 'Pedro Santos',
      organizerId: 'pedro-789',
      description: 'Escalada tradicional para iniciantes, ensino de colocação.',
      equipment: 'Friends, nuts, corda dupla',
      climbingType: 'Tradicional',
      requiredExperience: 'Iniciante',
      isPrivate: false,
      status: 'active',
      createdAt: '2025-07-27T08:00:00.000Z',
      participantsList: [
        { id: 'pedro-789', name: 'Pedro Santos', grade: '6c', isOrganizer: true },
        { id: 'marina-321', name: 'Marina Costa', grade: '5c', isOrganizer: false }
      ]
    }
  ];

  /**
   * Carrega dados dos grupos do storage
   */
  const loadGroupsData = useCallback(async () => {
    try {
      const [savedParticipating, savedCreatedGroups, savedAllGroups] = await Promise.all([
        AsyncStorage.getItem('climder_participating_groups'),
        AsyncStorage.getItem('climder_created_groups'),
        AsyncStorage.getItem('climder_all_groups')
      ]);

      if (savedParticipating) {
        const participatingIds = JSON.parse(savedParticipating);
        setParticipatingGroups(new Set(participatingIds));
      }

      if (savedCreatedGroups) {
        setUserCreatedGroups(JSON.parse(savedCreatedGroups));
      }

      if (savedAllGroups) {
        const allGroupsData = JSON.parse(savedAllGroups);
        setAllGroups([...initialGroups, ...allGroupsData]);
      } else {
        setAllGroups(initialGroups);
      }

      console.log('📊 Dados dos grupos carregados');
    } catch (error) {
      console.error('❌ Erro ao carregar dados dos grupos:', error);
      setAllGroups(initialGroups);
    }
  }, []);

  /**
   * Salva dados dos grupos no storage
   */
  const saveGroupsData = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('climder_participating_groups', JSON.stringify([...participatingGroups])),
        AsyncStorage.setItem('climder_created_groups', JSON.stringify(userCreatedGroups)),
        AsyncStorage.setItem('climder_all_groups', JSON.stringify(userCreatedGroups))
      ]);
      console.log('💾 Dados dos grupos salvos');
    } catch (error) {
      console.error('❌ Erro ao salvar dados dos grupos:', error);
    }
  }, [participatingGroups, userCreatedGroups]);

  /**
   * Cria um novo grupo
   */
  const handleCreateGroup = useCallback(async (newGroup) => {
    try {
      const updatedCreatedGroups = [...userCreatedGroups, newGroup];
      const updatedAllGroups = [...allGroups, newGroup];
      
      setUserCreatedGroups(updatedCreatedGroups);
      setAllGroups(updatedAllGroups);
      
      const newParticipating = new Set([...participatingGroups, newGroup.id]);
      setParticipatingGroups(newParticipating);
      
      await saveGroupsData();
      
      // Enviar notificação se habilitada
      if (notificationSettings.groups) {
        await NotificationService.sendGroupNotification(
          newGroup.title,
          user.displayName,
          'created'
        );
      }
      
      console.log('✅ Grupo criado:', newGroup.title);
    } catch (error) {
      console.error('❌ Erro ao criar grupo:', error);
      Alert.alert('Erro', 'Falha ao criar grupo');
    }
  }, [userCreatedGroups, allGroups, participatingGroups, user.displayName, notificationSettings.groups]);

  /**
   * Participa de um grupo
   */
  const handleJoinGroup = useCallback(async (group) => {
    try {
      if (group.participants >= group.maxParticipants) {
        Alert.alert('😕', 'Grupo lotado!');
        return;
      }

      const updatedGroup = {
        ...group,
        participants: group.participants + 1,
        participantsList: [
          ...group.participantsList,
          {
            id: user.uid,
            name: user.displayName,
            grade: user.grade || '5c',
            isOrganizer: false,
            joinedAt: new Date().toISOString()
          }
        ]
      };

      const newParticipating = new Set([...participatingGroups, group.id]);
      setParticipatingGroups(newParticipating);

      const updatedAllGroups = allGroups.map(g => g.id === group.id ? updatedGroup : g);
      setAllGroups(updatedAllGroups);

      await saveGroupsData();

      Alert.alert('🎉', `Você se juntou ao grupo "${group.title}"!`);
      
      // Notificar organizador se habilitado
      if (notificationSettings.groups) {
        setTimeout(async () => {
          await NotificationService.sendGroupNotification(
            group.title,
            user.displayName,
            'joined'
          );
          
          Alert.alert(
            '📢 Notificação Enviada',
            `${group.organizer} foi notificado sobre sua participação!`
          );
        }, 1500);
      }

    } catch (error) {
      console.error('❌ Erro ao participar do grupo:', error);
      Alert.alert('Erro', 'Falha ao entrar no grupo');
    }
  }, [participatingGroups, allGroups, user, notificationSettings.groups]);

  /**
   * Sai de um grupo
   */
  const handleLeaveGroup = useCallback(async (group) => {
    try {
      if (group.organizerId === user.uid) {
        Alert.alert(
          '⚠️ Organizador',
          'Como organizador, você não pode sair do grupo. Deseja cancelar o grupo?',
          [
            { text: 'Não', style: 'cancel' },
            { text: 'Cancelar Grupo', style: 'destructive', onPress: () => handleCancelGroup(group) }
          ]
        );
        return;
      }

      const updatedGroup = {
        ...group,
        participants: group.participants - 1,
        participantsList: group.participantsList.filter(p => p.id !== user.uid)
      };

      const newParticipating = new Set(participatingGroups);
      newParticipating.delete(group.id);
      setParticipatingGroups(newParticipating);

      const updatedAllGroups = allGroups.map(g => g.id === group.id ? updatedGroup : g);
      setAllGroups(updatedAllGroups);

      await saveGroupsData();
      Alert.alert('✅', 'Você saiu do grupo');

    } catch (error) {
      console.error('❌ Erro ao sair do grupo:', error);
      Alert.alert('Erro', 'Falha ao sair do grupo');
    }
  }, [participatingGroups, allGroups, user.uid]);

  /**
   * Cancela um grupo (apenas organizador)
   */
  const handleCancelGroup = useCallback(async (group) => {
    try {
      const updatedAllGroups = allGroups.filter(g => g.id !== group.id);
      const updatedCreatedGroups = userCreatedGroups.filter(g => g.id !== group.id);
      
      setAllGroups(updatedAllGroups);
      setUserCreatedGroups(updatedCreatedGroups);

      const newParticipating = new Set(participatingGroups);
      newParticipating.delete(group.id);
      setParticipatingGroups(newParticipating);

      await saveGroupsData();
      Alert.alert('🗑️', 'Grupo cancelado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao cancelar grupo:', error);
      Alert.alert('Erro', 'Falha ao cancelar grupo');
    }
  }, [allGroups, userCreatedGroups, participatingGroups]);

  /**
   * Mostra detalhes de um grupo
   */
  const showGroupDetails = useCallback((group) => {
    const isParticipating = participatingGroups.has(group.id);
    const isOrganizer = group.organizerId === user.uid;
    const participantsList = group.participantsList || [];

    Alert.alert(
      `👥 ${group.title}`,
      `📍 ${group.location}\n🕐 ${group.date} às ${group.time}\n⚡ ${group.difficulty}\n🧗‍♀️ ${group.climbingType}\n\n📝 ${group.description}\n\n🎒 Equipamentos:\n${group.equipment}\n\n👥 Participantes (${group.participants}/${group.maxParticipants}):\n${participantsList.map(p => `• ${p.name} (${p.grade})${p.isOrganizer ? ' - Organizador' : ''}`).join('\n')}\n\n${isOrganizer ? '👑 Você é o organizador' : isParticipating ? '✅ Você está participando' : ''}`,
      [
        { text: 'Fechar', style: 'cancel' },
        ...(isOrganizer ? [
          { text: '🗑️ Cancelar Grupo', style: 'destructive', onPress: () => handleCancelGroup(group) }
        ] : []),
        ...(!isOrganizer && !isParticipating && group.participants < group.maxParticipants ? [
          { text: '➕ Participar', onPress: () => handleJoinGroup(group) }
        ] : []),
        ...(!isOrganizer && isParticipating ? [
          { text: '❌ Sair', style: 'destructive', onPress: () => handleLeaveGroup(group) }
        ] : [])
      ]
    );
  }, [participatingGroups, user.uid, handleCancelGroup, handleJoinGroup, handleLeaveGroup]);

  // ===========================================
  // DADOS MOCK
  // ===========================================

  const climberProfiles = [
    {
      id: 1,
      name: 'Ana Silva',
      age: 28,
      image: '🧗‍♀️',
      grade: '6a',
      climbingType: 'Esportiva',
      bio: 'Escaladora há 5 anos, adoro vias técnicas e locais novos!',
      location: 'São Paulo, SP',
      preference: 'Weekends',
      experience: '5 anos'
    },
    {
      id: 2,
      name: 'Carlos Mendoza',
      age: 35,
      image: '🧗‍♂️',
      grade: '7a',
      climbingType: 'Boulder',
      bio: 'Boulder enthusiast, sempre em busca de problemas desafiadores.',
      location: 'Rio de Janeiro, RJ',
      preference: 'Tardes',
      experience: '8 anos'
    },
    {
      id: 3,
      name: 'Marina Costa',
      age: 24,
      image: '🧗‍♀️',
      grade: '5c',
      climbingType: 'Trad',
      bio: 'Iniciante em trad, procuro parceiros experientes para aprender.',
      location: 'Belo Horizonte, MG',
      preference: 'Manhãs',
      experience: '2 anos'
    },
    {
      id: 4,
      name: 'Pedro Santos',
      age: 31,
      image: '🧗‍♂️',
      grade: '6c',
      climbingType: 'Esportiva',
      bio: 'Fotógrafo e escalador, documento expedições e vias clássicas.',
      location: 'Florianópolis, SC',
      preference: 'Flexível',
      experience: '7 anos'
    }
  ];

  const climbingLocations = [
    {
      id: 1,
      name: 'Pedra da Gávea',
      state: 'Rio de Janeiro',
      city: 'Rio de Janeiro',
      type: 'Escalada Esportiva e Trad',
      difficulty: '3º - 9º grau',
      routes: 150,
      image: '🏔️',
      description: 'Um dos cartões postais do Rio, com vias clássicas e vista incrível.',
      access: 'Trilha de 2h desde São Conrado',
      equipment: 'Corda 60m, friends, nuts para trad',
      seasons: 'Ano todo, evitar dias chuvosos',
      rating: 4.8,
      coordinates: '22.9999°S, 43.2872°W'
    },
    {
      id: 2,
      name: 'Pão de Açúcar',
      state: 'Rio de Janeiro',
      city: 'Rio de Janeiro',
      type: 'Escalada Esportiva',
      difficulty: '4º - 8º grau',
      routes: 270,
      image: '🍞',
      description: 'Ícone mundial da escalada, berço da escalada brasileira.',
      access: 'Bondinho + trilha ou escalada desde a Praia Vermelha',
      equipment: 'Corda 50-60m, quickdraws',
      seasons: 'Ano todo',
      rating: 4.9,
      coordinates: '22.9488°S, 43.1567°W'
    },
    {
      id: 3,
      name: 'Pedra do Baú',
      state: 'São Paulo',
      city: 'São Bento do Sapucaí',
      type: 'Escalada Esportiva e Trad',
      difficulty: '2º - 7º grau',
      routes: 85,
      image: '⛰️',
      description: 'Formação rochosa clássica paulista, ideal para iniciantes.',
      access: 'Trilha de 1h30 desde o estacionamento',
      equipment: 'Corda 60m, proteção variada',
      seasons: 'Maio a Setembro (seco)',
      rating: 4.6,
      coordinates: '22.6358°S, 45.5125°W'
    }
  ];

  // ===========================================
  // COMPONENTES DE VIEWS
  // ===========================================

  /**
   * Renderiza o botão de notificações com badge
   */
  const NotificationButton = useCallback(() => (
    <TouchableOpacity 
      style={styles.notificationButton}
      onPress={() => setShowNotifications(true)}
      activeOpacity={0.7}
    >
      <Text style={styles.notificationIcon}>🔔</Text>
      {notificationBadgeCount > 0 && (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>
            {notificationBadgeCount > 99 ? '99+' : notificationBadgeCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  ), [notificationBadgeCount]);

  /**
   * View de descoberta de escaladores
   */
  const DiscoverView = useCallback(() => {
    const currentProfile = climberProfiles[currentMatchIndex];

    return (
      <View style={styles.discoverContainer}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.userEmoji}>🧗‍♀️</Text>
            <View>
              <Text style={styles.userName}>{user?.displayName || 'Escalador Teste'}</Text>
              <Text style={styles.userDetails}>5c • Esportiva</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <NotificationButton />
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardEmoji}>{currentProfile.image}</Text>
            <Text style={styles.cardName}>{currentProfile.name}, {currentProfile.age}</Text>
            <Text style={styles.cardGrade}>{currentProfile.grade} • {currentProfile.climbingType}</Text>
            <Text style={styles.cardBio}>{currentProfile.bio}</Text>
            <Text style={styles.cardLocation}>📍 {currentProfile.location}</Text>
            <Text style={styles.cardExperience}>🧗‍♀️ {currentProfile.experience} de experiência</Text>
            <Text style={styles.cardPreference}>⏰ Prefere escalar: {currentProfile.preference}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.passButton} onPress={handlePass}>
            <Text style={styles.buttonText}>❌</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
            <Text style={styles.buttonText}>❤️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dedaoContainer}>
          <Text style={styles.dedaoText}>👎🩹</Text>
          <Text style={styles.dedaoSubtext}>Dedão sempre machucado</Text>
        </View>
      </View>
    );
  }, [currentMatchIndex, user, handleLogout, handlePass, handleLike]);

  const MatchesView = useCallback(() => (
    <View style={styles.matchesContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💕 Seus Matches</Text>
        <NotificationButton />
      </View>

      <ScrollView style={styles.matchesList}>
        {matches.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💔</Text>
            <Text style={styles.emptyTitle}>Nenhum match ainda</Text>
            <Text style={styles.emptyText}>
              Continue explorando na aba Descobrir para encontrar seu parceiro de escalada!
            </Text>
          </View>
        ) : (
          matches.map((match) => (
            <View key={match.id} style={styles.matchCard}>
              <Text style={styles.matchEmoji}>{match.image}</Text>
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{match.name}</Text>
                <Text style={styles.matchDetails}>{match.grade} • {match.climbingType}</Text>
                <Text style={styles.matchBio}>{match.bio}</Text>
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
                  onPress={()