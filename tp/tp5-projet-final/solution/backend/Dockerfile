# ===========================================
# Backend API Dockerfile - Production Ready
# ===========================================
FROM node:20-alpine

# Créer un groupe et utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production uniquement
RUN npm ci --production && \
    npm cache clean --force

# Copier le code source avec les bonnes permissions
COPY --chown=nodejs:nodejs . .

# Passer à l'utilisateur non-root
USER nodejs

# Variables d'environnement par défaut
ENV NODE_ENV=production \
    PORT=3000

# Exposer le port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:3000/health || exit 1

# Commande de démarrage
CMD ["node", "server.js"]
