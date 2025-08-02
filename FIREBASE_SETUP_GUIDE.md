# 🔥 Guia de Configuração Firebase - Climder

## 📋 **ETAPAS PARA CONFIGURAR FIREBASE**

### **1. Criar Projeto Firebase**

1. Acesse: https://console.firebase.google.com/
2. Clique em "Criar um projeto"
3. Nome do projeto: **"Climder"** (ou nome de sua preferência)
4. Ative o Google Analytics (opcional)
5. Clique em "Criar projeto"

### **2. Configurar Aplicativo Web**

1. No console do Firebase, clique em "⚙️ Configurações do projeto"
2. Vá na aba "Geral"
3. Role até "Seus apps" e clique em "Adicionar app" → **"Web" (</> ícone)**
4. Nome do app: **"Climder Web"**
5. ✅ Marque "Configurar também o Firebase Hosting"
6. Clique em "Registrar app"

### **3. Copiar Configurações**

Você verá uma tela com as configurações:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "climder-xxxx.firebaseapp.com",
  projectId: "climder-xxxx",
  storageBucket: "climder-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

**📋 COPIE ESSAS CONFIGURAÇÕES!**

### **4. Configurar Autenticação**

1. No menu lateral, vá em **"Authentication"**
2. Clique em **"Começar"**
3. Vá na aba **"Sign-in method"**
4. Ative os provedores:
   - ✅ **Email/senha** (Obrigatório)
   - ✅ **Google** (Recomendado - opcional)
   - ✅ **Apple** (Para iOS - opcional)

### **5. Configurar Firestore Database**

1. No menu lateral, vá em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Começar no modo de teste"** (por enquanto)
4. Escolha localização: **"southamerica-east1 (São Paulo)"**
5. Clique em **"Concluído"**

### **6. Configurar Storage**

1. No menu lateral, vá em **"Storage"**
2. Clique em **"Começar"**
3. Escolha **"Começar no modo de teste"**
4. Escolha localização: **"southamerica-east1 (São Paulo)"**
5. Clique em **"Concluído"**

### **7. Configurar Regras de Segurança**

#### **Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Matches são públicos para usuários autenticados
    match /matches/{matchId} {
      allow read, write: if request.auth != null;
    }
    
    // Grupos são públicos para usuários autenticados
    match /groups/{groupId} {
      allow read, write: if request.auth != null;
    }
    
    // Mensagens só para participantes do chat
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Chats só para usuários autenticados
    match /chats/{chatId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### **Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Usuários podem fazer upload de suas próprias fotos
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Fotos de grupos são públicas para usuários autenticados
    match /groups/{groupId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Croquis são públicos para usuários autenticados
    match /croquis/{croquisId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## ⚙️ **CONFIGURAR NO CÓDIGO**

### **1. Substituir Configurações**

Abra o arquivo `firebase-config-real.js` e substitua as configurações:

```javascript
const firebaseConfig = {
  // ⚠️ COLE SUAS CONFIGURAÇÕES AQUI
  apiKey: "SUA_API_KEY_AQUI",           // ← Cole aqui
  authDomain: "climder-app.firebaseapp.com",   // ← Cole aqui  
  projectId: "climder-app",             // ← Cole aqui
  storageBucket: "climder-app.appspot.com",    // ← Cole aqui
  messagingSenderId: "123456789",       // ← Cole aqui
  appId: "1:123456789:web:abcdef123456789",    // ← Cole aqui
  measurementId: "G-ABCDEF1234"         // ← Cole aqui
};
```

### **2. Atualizar App Principal**

Renomeie os arquivos para usar Firebase:

```bash
# Backup do app atual
mv App.js App-mock.js

# Usar app com Firebase
mv App-firebase.js App.js
mv AuthScreen-firebase.js AuthScreen.js
```

### **3. Testar Configuração**

Execute o app e verifique os logs:

```bash
npx expo start --clear
```

**Logs esperados:**
```
✅ Firebase App inicializado
✅ Firebase Auth configurado  
✅ Firestore configurado
✅ Firebase Storage configurado
🔥 Firebase configurado para produção
```

---

## 🧪 **TESTES**

### **Teste de Cadastro:**
1. Abra o app
2. Clique em "Não tem conta? Cadastre-se"
3. Preencha os dados:
   - Email: `seu-email@gmail.com`
   - Senha: `123456`
   - Nome: `Seu Nome`
   - Localização: `Sua Cidade, Estado`
4. Clique em "📝 Criar Conta"

### **Teste de Login:**
1. Use o email e senha criados
2. Clique em "🚀 Entrar"
3. Deve entrar no app principal

### **Verificar no Firebase Console:**
1. Vá em **Authentication** → **Users**
2. Deve aparecer o usuário criado
3. Vá em **Firestore** → **Data**
4. Deve aparecer a coleção `users` com dados

---

## 🚨 **TROUBLESHOOTING**

### **Erro: "Firebase not configured"**
- Verifique se copiou todas as configurações corretamente
- Confirme que o projeto Firebase existe

### **Erro: "Permission denied"**
- Verifique se as regras do Firestore estão configuradas
- Confirme que o usuário está autenticado

### **Erro: "Network request failed"**
- Verifique conexão com internet
- Confirme que o Firebase está ativo

### **App não conecta:**
1. Limpe o cache: `npx expo start --clear`
2. Reinstale dependências: `npm install`
3. Verifique console do navegador/device

---

## ✅ **CHECKLIST FINAL**

- [ ] Projeto Firebase criado
- [ ] App web registrado no Firebase
- [ ] Authentication configurado (Email/senha ativado)
- [ ] Firestore Database criado
- [ ] Storage configurado
- [ ] Regras de segurança aplicadas
- [ ] Configurações copiadas para `firebase-config-real.js`
- [ ] App renomeado para usar Firebase
- [ ] Teste de cadastro funcionando
- [ ] Teste de login funcionando
- [ ] Dados aparecendo no Firestore

---

## 🎯 **PRÓXIMOS PASSOS**

Após configurar o Firebase:

1. **Teste todas as funcionalidades** (cadastro, login, logout)
2. **Migrar dados de matches** para Firestore
3. **Implementar chat em tempo real**
4. **Configurar upload de imagens**
5. **Implementar sincronização offline**

**Firebase configurado = Backend real funcionando! 🚀**