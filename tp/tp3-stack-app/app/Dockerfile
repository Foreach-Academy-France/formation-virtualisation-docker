# Dockerfile pour Users API
# Les étudiants peuvent s'inspirer de ce Dockerfile ou créer le leur

FROM node:18-alpine

LABEL maintainer="formation@ief2i.fr" \
      version="1.0.0" \
      description="Users API avec PostgreSQL"

WORKDIR /app

# Copier les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && \
    npm cache clean --force

# Copier le code source
COPY src ./src

# Utilisateur non-root
USER node

# Exposer le port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Variables d'environnement par défaut
ENV NODE_ENV=production \
    PORT=3000

# Démarrer l'application
CMD ["node", "src/server.js"]
