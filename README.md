# climder
@russo11211 ➜ /workspaces/climder (main) $ 

Comando para rodar o Climder:
bash 
npx expo start --tunnel
📱 Depois de rodar o comando:
Para Mobile (recomendado):

Escaneie o QR code que aparece no terminal
Com o app Expo Go no seu celular
Aguarde carregar o Climder

Para Web:
bash# Pressione 'w' no terminal após o comando acima
w
Outras opções úteis:
bash# Limpar cache e reiniciar
npx expo start --tunnel --clear

# Apenas web
npx expo start --web

# Ver todas as opções
npx expo start --help


Arquivos ler:

climder-prd.md
1-conversation-history.md
2-conversation-history.md
3-conversation-history.md
4-conversation-history.md

git add .
This command will:

Stage the modifications to README.md, app.json, and package.json.

Add all the new files listed under "Untracked files" (like AuthContext.js, AuthScreens.js, ClimderApp.js, etc.) to be tracked by Git.

If you restored App.js in the previous step, it won't be staged for deletion.

3. Commit your changes:
Provide a clear message describing the update.

Bash

git commit -m "Add new project structure and components; update config files"
4. Push to origin:

Bash

git push origin main