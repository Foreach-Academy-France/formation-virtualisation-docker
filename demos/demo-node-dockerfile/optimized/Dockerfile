# Dockerfile optimisé - Best practices appliquées

FROM node:18-alpine

# Métadonnées
LABEL maintainer="formation@ief2i.fr"
LABEL version="1.0.0"
LABEL description="Demo Express API avec Docker best practices"

# Créer un utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY ../app/package*.json ./

# Installer les dépendances en production avec npm ci
RUN npm ci --only=production && \
    npm cache clean --force

# Copier le code source avec les bonnes permissions
COPY --chown=appuser:appgroup ../app/src ./src

# Changer d'utilisateur (non-root)
USER appuser

# Exposer le port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Démarrer l'application
CMD ["node", "src/server.js"]
