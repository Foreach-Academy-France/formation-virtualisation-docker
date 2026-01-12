# Dockerfile basique - Version simple fonctionnelle
# Build depuis le répertoire demo-node-dockerfile/ avec:
# docker build -f basic/Dockerfile -t my-api:basic .

FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY app/package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY app/src ./src

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["node", "src/server.js"]
