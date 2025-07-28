# Climder - Product Requirements Document
**Versão:** 1.0  
**Data:** 28 de Julho de 2025  
**Autores:** Equipe Climder

---

## 📋 Sumário Executivo

### Visão do Produto
O **Climder** é um aplicativo móvel que conecta escaladores através de um sistema de matches estilo Tinder, facilitando a formação de parcerias para escalada, organização de grupos e compartilhamento de informações sobre locais de escalada.

### Problema
- Escaladores têm dificuldade em encontrar parceiros compatíveis
- Falta de centralização de informações sobre locais de escalada
- Ausência de ferramentas visuais para documentar rotas (croquis)
- Dificuldade na organização de grupos para saídas

### Solução
Plataforma integrada que combina:
- **Matching de escaladores** por compatibilidade
- **Organização de grupos** para saídas
- **Base de dados de locais** com informações detalhadas
- **Editor de croquis** para documentação visual de rotas

---

## 🎯 Objetivos do Produto

### Objetivos Primários
1. **Conectar escaladores** através de sistema de matches inteligente
2. **Facilitar organização** de grupos e saídas de escalada
3. **Centralizar informações** sobre locais de escalada
4. **Permitir documentação visual** de rotas através de croquis

### Objetivos Secundários
- Criar comunidade ativa de escaladores
- Promover segurança através de informações atualizadas
- Incentivar exploração de novos locais
- Facilitar entrada de novos escaladores no esporte

---

## 👥 Personas e Público-Alvo

### Persona Primária: "Ana - Escaladora Intermediária"
- **Idade:** 25-35 anos
- **Experiência:** 2-7 anos escalando
- **Motivações:** Encontrar parceiros, explorar novos locais, melhorar técnica
- **Frustrações:** Dificuldade em encontrar parceiros compatíveis, falta de informação sobre locais

### Persona Secundária: "Carlos - Escalador Experiente"  
- **Idade:** 30-45 anos
- **Experiência:** 8+ anos escalando
- **Motivações:** Compartilhar conhecimento, documentar rotas, organizar grupos
- **Frustrações:** Falta de ferramentas para documentar descobertas, grupos desorganizados

### Persona Terciária: "Marina - Iniciante"
- **Idade:** 20-30 anos  
- **Experiência:** 0-2 anos escalando
- **Motivações:** Aprender, conhecer pessoas, ganhar confiança
- **Frustrações:** Intimidação, falta de conhecimento sobre locais seguros

---

## ⚡ Funcionalidades Core

### 1. Sistema de Descoberta e Matches
**Prioridade:** P0 (Crítica)

#### Funcionalidades
- Cards de escaladores com informações relevantes
- Sistema de swipe (like/dislike) 
- Algoritmo de compatibilidade baseado em:
  - Nível de escalada
  - Tipos preferidos (esportiva, boulder, trad)
  - Localização geográfica
  - Disponibilidade de horários

#### Critérios de Aceitação
- [ ] Usuário consegue visualizar perfis de outros escaladores
- [ ] Sistema de swipe funcional (touch/mouse)
- [ ] Matches são registrados quando ambos dão "like"
- [ ] Notificação de novos matches

#### Status Atual: ✅ **Implementado** (simulação funcional)

### 2. Gestão de Grupos
**Prioridade:** P0 (Crítica)

#### Funcionalidades
- Criação de grupos para saídas específicas
- Sistema de participação/interesse
- Detalhes do grupo:
  - Local de escalada
  - Data e horário
  - Nível de dificuldade
  - Equipamentos necessários
  - Número de participantes

#### Critérios de Aceitação
- [ ] Usuário consegue criar novos grupos
- [ ] Usuário consegue participar de grupos existentes
- [ ] Sistema de limite de participantes
- [ ] Notificações sobre grupos

#### Status Atual: ✅ **Interface implementada** (funcionalidade básica)

### 3. Base de Dados de Locais
**Prioridade:** P0 (Crítica)

#### Funcionalidades
- Catálogo de locais de escalada organizados por:
  - País → Estado → Cidade
- Informações detalhadas por local:
  - Tipo de escalada
  - Faixa de dificuldade
  - Número de vias
  - Condições de acesso
  - Equipamentos necessários
  - Coordenadas GPS
  - Avaliações da comunidade

#### Critérios de Aceitação
- [ ] Interface de navegação por localização
- [ ] Visualização detalhada de cada local
- [ ] Sistema de avaliações e comentários
- [ ] Busca e filtros

#### Status Atual: ✅ **Implementado** (dados de exemplo)

### 4. Editor de Croquis
**Prioridade:** P1 (Importante)

#### Funcionalidades
- Captura de foto da parede/rocha
- Seleção de foto da galeria
- Ferramentas de desenho específicas:
  - **Via** (📍): Traçar rotas
  - **Agarras** (🔴): Marcar pegadas importantes  
  - **Ancoragem** (⚓): Pontos de proteção
  - **Reunião** (🔗): Pontos de belay
  - **Graduação** (📝): Anotações de grau
  - **Perigo** (⚠️): Áreas de risco

#### Critérios de Aceitação
- [ ] Integração com câmera do dispositivo
- [ ] Seleção de imagens da galeria
- [ ] Canvas de desenho funcional sobre foto
- [ ] Ferramentas de desenho específicas para escalada
- [ ] Sistema de desfazer/refazer
- [ ] Salvamento e compartilhamento de croquis

#### Status Atual: 🔄 **Parcialmente implementado** (interface + simulação)

---

## 🚀 Roadmap de Desenvolvimento

### Fase 1: MVP (Atual) ✅
- [x] Navegação básica (4 abas)
- [x] Sistema de matches simulado
- [x] Interface de grupos
- [x] Catálogo de locais
- [x] Editor de croquis (interface)

### Fase 2: Funcionalidades Core 🔄
- [ ] Sistema de matches real com backend
- [ ] Criação e participação em grupos
- [ ] Upload e edição de locais pelos usuários
- [ ] Canvas de desenho funcional para croquis
- [ ] Sistema de autenticação

### Fase 3: Melhorias e Expansão 📋
- [ ] Chat entre matches
- [ ] Sistema de avaliações e reviews
- [ ] Notificações push
- [ ] Filtros avançados de busca
- [ ] Gamificação (badges, conquistas)

### Fase 4: Recursos Avançados 📋
- [ ] Integração com apps de fitness
- [ ] Previsão do tempo por local
- [ ] Sistema de check-in em locais
- [ ] Marketplace de equipamentos
- [ ] Eventos e competições

---

## 💻 Especificações Técnicas

### Plataforma
- **Framework:** React Native (Expo)
- **Compatibilidade:** iOS 12+ / Android 8+
- **Backend:** Node.js + Express (futuro)
- **Base de dados:** MongoDB (futuro)
- **Autenticação:** Firebase Auth (futuro)

### Tecnologias Utilizadas
- **Frontend:** React Native, Expo SDK 53
- **Estado:** React Hooks (useState, useEffect)
- **Navegação:** Tab Navigator customizado
- **Styling:** StyleSheet (Flexbox)
- **Gestos:** PanGestureHandler (futuro)
- **Canvas:** React Native Canvas (futuro)

### Dependências Atuais
```json
{
  "expo": "~53.0.0",
  "react": "18.3.1", 
  "react-native": "0.76.3"
}
```

### Arquitetura
```
src/
├── components/          # Componentes reutilizáveis
├── screens/            # Telas principais
├── data/               # Dados estáticos e mocks
├── utils/              # Funções utilitárias
├── hooks/              # Hooks customizados
└── assets/             # Imagens e recursos
```

---

## 🎨 Design e UX

### Princípios de Design
1. **Simplicidade:** Interface limpa e intuitiva
2. **Consistência:** Padrões visuais unificados
3. **Acessibilidade:** Contrastes adequados, textos legíveis
4. **Performance:** Transições suaves, carregamento rápido
5. **Mobile-first:** Otimizado para dispositivos móveis

### Paleta de Cores
- **Primária:** `#3b82f6` (Azul)
- **Secundária:** `#10b981` (Verde)
- **Erro/Rejeitar:** `#ef4444` (Vermelho)  
- **Sucesso:** `#10b981` (Verde)
- **Neutros:** `#1f2937`, `#6b7280`, `#f3f4f6`

### Tipografia
- **Títulos:** Bold, 24px+
- **Subtítulos:** Semibold, 18px
- **Corpo:** Regular, 14px
- **Detalhes:** Regular, 12px

---

## 📊 Métricas e KPIs

### Métricas de Engajamento
- **DAU/MAU:** Usuários ativos diários/mensais
- **Matches por usuário:** Média de matches por período
- **Taxa de conversão:** Matches → Conversas → Encontros
- **Tempo na plataforma:** Sessão média por usuário

### Métricas de Conteúdo
- **Locais cadastrados:** Número total de locais
- **Croquis criados:** Número de croquis por período
- **Grupos formados:** Grupos criados e com atividade

### Métricas de Retenção
- **Taxa de retenção D1/D7/D30**
- **Churn rate:** Taxa de abandono
- **Frequência de uso:** Sessões por usuário/semana

---

## 🔒 Considerações de Segurança

### Dados Pessoais
- Conformidade com LGPD
- Criptografia de dados sensíveis
- Opt-in para compartilhamento de localização

### Segurança da Comunidade
- Sistema de denúncias
- Moderação de conteúdo
- Verificação de perfis (futuro)
- Diretrizes da comunidade

### Segurança Técnica
- Autenticação segura
- Validação de inputs
- Rate limiting
- Backup de dados

---

## 🗓️ Cronograma

### Sprint 1 (Atual) ✅
- [x] Setup do projeto
- [x] Navegação básica
- [x] Interface do sistema de matches
- [x] Interface de grupos e locais

### Sprint 2 (Próximos 15 dias) 🔄
- [ ] Canvas funcional para croquis
- [ ] Sistema de autenticação básico
- [ ] Backend para matches
- [ ] Testes em dispositivos reais

### Sprint 3 (30 dias) 📋
- [ ] Chat entre matches
- [ ] Upload de locais pelos usuários
- [ ] Sistema de notificações
- [ ] Testes de usuário e ajustes

---

## 🎯 Definição de Sucesso

### Critérios de Sucesso MVP
- [ ] 100+ usuários cadastrados
- [ ] 500+ matches realizados
- [ ] 50+ grupos criados
- [ ] 20+ locais documentados
- [ ] 4.0+ rating nas app stores

### Objetivos de Longo Prazo
- 10.000+ usuários ativos mensais
- Presença em 5+ países
- Parceria com federações de escalada
- Receita recorrente estabelecida

---

## 📝 Próximos Passos Imediatos

### Prioridade Alta
1. **Implementar canvas real** para desenho de croquis
2. **Configurar backend** para sistema de matches
3. **Adicionar autenticação** de usuários
4. **Testes em dispositivos** reais (câmera, gestos)

### Prioridade Média  
1. Melhorar algoritmo de compatibilidade
2. Adicionar mais dados de locais brasileiros
3. Implementar sistema de chat básico
4. Criar landing page para marketing

### Pesquisas Necessárias
- Validação com escaladores reais
- Análise de concorrência
- Estudo de monetização
- Requisitos legais para app de encontros

---

## 📞 Contatos e Recursos

### Equipe de Desenvolvimento
- **Product Owner:** A definir
- **Tech Lead:** A definir  
- **Designer:** A definir

### Recursos de Desenvolvimento
- **Repositório:** `https://github.com/russo11211/climder`
- **Expo Snack:** [Link do projeto]
- **Documentação:** Este PRD

### Comunidade e Feedback
- Grupo de teste beta (a formar)
- Contatos em federações de escalada
- Fóruns e comunidades online

---

*Documento vivo - última atualização: 28/07/2025*