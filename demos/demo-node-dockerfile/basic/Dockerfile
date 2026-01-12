# Dockerfile basique - Version simple fonctionnelle

FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY ../app/package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY ../app/src ./src

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["node", "src/server.js"]
