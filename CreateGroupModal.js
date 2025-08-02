import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  Switch,
  Platform,
} from 'react-native';

export default function CreateGroupModal({ visible, onClose, onCreateGroup, userProfile }) {
  const [groupData, setGroupData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    difficulty: '5a - 6b',
    maxParticipants: 8,
    equipment: '',
    isPrivate: false,
    requiredExperience: 'Iniciante',
    climbingType: 'Esportiva'
  });

  const [errors, setErrors] = useState({});

  const climbingTypes = ['Esportiva', 'Boulder', 'Tradicional', 'Via Ferrata', 'Trad'];

  const difficultyOptions = [
    '3a - 4c (Iniciante)',
    '5a - 6b (Intermediário)',
    '6c - 7b (Avançado)',
    '7c+ (Expert)',
    'V0 - V3 (Boulder Iniciante)',
    'V4 - V6 (Boulder Intermediário)',
    'V7+ (Boulder Avançado)'
  ];

  const experienceOptions = [
    'Iniciante (0-2 anos)',
    'Intermediário (2-5 anos)',
    'Avançado (5+ anos)',
    'Qualquer nível'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!groupData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (!groupData.location.trim()) {
      newErrors.location = 'Local é obrigatório';
    }
    if (!groupData.date.trim()) {
      newErrors.date = 'Data é obrigatória';
    }
    if (!groupData.time.trim()) {
      newErrors.time = 'Horário é obrigatório';
    }
    if (groupData.maxParticipants < 2 || groupData.maxParticipants > 20) {
      newErrors.maxParticipants = 'Entre 2 e 20 participantes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGroup = () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os campos destacados');
      return;
    }

    const newGroup = {
      id: Date.now(),
      ...groupData,
      organizer: userProfile?.displayName || 'Você',
      organizerId: userProfile?.uid || 'user',
      participants: 1, // Organizador já está incluído
      createdAt: new Date().toISOString(),
      status: 'active',
      participantsList: [
        {
          id: userProfile?.uid || 'user',
          name: userProfile?.displayName || 'Você',
          grade: userProfile?.grade || '5c',
          isOrganizer: true
        }
      ]
    };

    onCreateGroup(newGroup);
    resetForm();
    onClose();
    
    Alert.alert(
      '🎉 Grupo Criado!', 
      `O grupo "${groupData.title}" foi criado com sucesso! Outros escaladores poderão se juntar a você.`
    );
  };

  const resetForm = () => {
    setGroupData({
      title: '',
      description: '',
      location: '',
      date: '',
      time: '',
      difficulty: '5a - 6b',
      maxParticipants: 8,
      equipment: '',
      isPrivate: false,
      requiredExperience: 'Iniciante',
      climbingType: 'Esportiva'
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Criar Grupo</Text>
          <TouchableOpacity onPress={handleCreateGroup}>
            <Text style={styles.createButton}>Criar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Informações Básicas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Informações Básicas</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título do Grupo *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={groupData.title}
                onChangeText={(text) => setGroupData({...groupData, title: text})}
                placeholder="Ex: Escalada no Pão de Açúcar"
                maxLength={50}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.textArea]}
                value={groupData.description}
                onChangeText={(text) => setGroupData({...groupData, description: text})}
                placeholder="Descreva o objetivo da saída, nível esperado, etc..."
                multiline={true}
                numberOfLines={3}
                maxLength={200}
              />
            </View>
          </View>

          {/* Local e Data */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Local e Data</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Local *</Text>
              <TextInput
                style={[styles.input, errors.location && styles.inputError]}
                value={groupData.location}
                onChangeText={(text) => setGroupData({...groupData, location: text})}
                placeholder="Ex: Pedra da Gávea, Rio de Janeiro"
                maxLength={50}
              />
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Data *</Text>
                <TextInput
                  style={[styles.input, errors.date && styles.inputError]}
                  value={groupData.date}
                  onChangeText={(text) => setGroupData({...groupData, date: text})}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                />
                {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Horário *</Text>
                <TextInput
                  style={[styles.input, errors.time && styles.inputError]}
                  value={groupData.time}
                  onChangeText={(text) => setGroupData({...groupData, time: text})}
                  placeholder="HH:MM"
                  maxLength={5}
                />
                {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
              </View>
            </View>
          </View>

          {/* Detalhes da Escalada */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧗‍♀️ Detalhes da Escalada</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Escalada</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {climbingTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chip,
                        groupData.climbingType === type && styles.chipSelected
                      ]}
                      onPress={() => setGroupData({...groupData, climbingType: type})}
                    >
                      <Text style={[
                        styles.chipText,
                        groupData.climbingType === type && styles.chipTextSelected
                      ]}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dificuldade</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {difficultyOptions.map((diff) => (
                    <TouchableOpacity
                      key={diff}
                      style={[
                        styles.chip,
                        groupData.difficulty === diff && styles.chipSelected
                      ]}
                      onPress={() => setGroupData({...groupData, difficulty: diff})}
                    >
                      <Text style={[
                        styles.chipText,
                        groupData.difficulty === diff && styles.chipTextSelected
                      ]}>{diff}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Experiência Necessária</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {experienceOptions.map((exp) => (
                    <TouchableOpacity
                      key={exp}
                      style={[
                        styles.chip,
                        groupData.requiredExperience === exp && styles.chipSelected
                      ]}
                      onPress={() => setGroupData({...groupData, requiredExperience: exp})}
                    >
                      <Text style={[
                        styles.chipText,
                        groupData.requiredExperience === exp && styles.chipTextSelected
                      ]}>{exp}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Logística */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎒 Logística</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Equipamentos Necessários</Text>
              <TextInput
                style={styles.textArea}
                value={groupData.equipment}
                onChangeText={(text) => setGroupData({...groupData, equipment: text})}
                placeholder="Ex: Corda 60m, quickdraws, capacete, tênis de aproximação..."
                multiline={true}
                numberOfLines={2}
                maxLength={150}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Máx. Participantes</Text>
                <TextInput
                  style={[styles.input, errors.maxParticipants && styles.inputError]}
                  value={groupData.maxParticipants.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 2;
                    setGroupData({...groupData, maxParticipants: num});
                  }}
                  placeholder="8"
                  keyboardType="numeric"
                  maxLength={2}
                />
                {errors.maxParticipants && (
                  <Text style={styles.errorText}>{errors.maxParticipants}</Text>
                )}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Grupo Privado</Text>
                <View style={styles.switchContainer}>
                  <Switch
                    value={groupData.isPrivate}
                    onValueChange={(value) => setGroupData({...groupData, isPrivate: value})}
                    trackColor={{ false: "#767577", true: "#3b82f6" }}
                    thumbColor={groupData.isPrivate ? "#ffffff" : "#f4f3f4"}
                  />
                  <Text style={styles.switchLabel}>
                    {groupData.isPrivate ? 'Apenas por convite' : 'Aberto a todos'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👀 Preview do Grupo</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>
                  {groupData.title || 'Título do grupo'}
                </Text>
                <Text style={styles.previewDate}>
                  {groupData.date || 'Data'} - {groupData.time || 'Hora'}
                </Text>
              </View>
              <Text style={styles.previewLocation}>
                📍 {groupData.location || 'Local da escalada'}
              </Text>
              <Text style={styles.previewDifficulty}>
                ⚡ {groupData.difficulty}
              </Text>
              <Text style={styles.previewParticipants}>
                👥 1/{groupData.maxParticipants} participantes
              </Text>
              <Text style={styles.previewOrganizer}>
                👨‍💼 {userProfile?.displayName || 'Você'}
              </Text>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  createButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: 'bold',
  },

  // Content
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },

  // Form Elements
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },

  // Layout
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },

  // Picker & Chips
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  chipContainer: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  chipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  chipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: 'white',
  },

  // Switch
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },

  // Preview
  previewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  previewDate: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  previewLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  previewDifficulty: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
    marginBottom: 4,
  },
  previewParticipants: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 4,
  },
  previewOrganizer: {
    fontSize: 14,
    color: '#6b7280',
  },

  bottomPadding: {
    height: 20,
  },
});