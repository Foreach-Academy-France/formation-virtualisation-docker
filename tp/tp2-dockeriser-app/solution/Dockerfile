# Dockerfile optimisé pour Todo API
# Formation Docker M2 ESTD

# Image de base Alpine (plus légère)
FROM node:18-alpine

# Métadonnées
LABEL maintainer="formation@ief2i.fr" \
      version="1.0.0" \
      description="Todo API avec Docker best practices" \
      org.opencontainers.image.source="https://github.com/Foreach-Academy-France/formation-virtualisation-docker"

# Créer un utilisateur et groupe non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers de dépendances (pour optimiser le cache Docker)
COPY package*.json ./

# Installer les dépendances en production
# - npm ci : installation reproductible (utilise package-lock.json)
# - --only=production : n'installe pas les devDependencies
# - npm cache clean --force : nettoyage du cache pour réduire la taille
RUN npm ci --only=production && \
    npm cache clean --force

# Copier le code source avec les bonnes permissions
# --chown permet de définir le propriétaire des fichiers copiés
COPY --chown=appuser:appgroup src ./src

# Changer d'utilisateur pour exécuter en non-root
# Améliore la sécurité (principe du moindre privilège)
USER appuser

# Exposer le port 3000
# Documentation uniquement - ne publie pas le port
EXPOSE 3000

# Health check
# Permet à Docker (et Kubernetes) de vérifier si le conteneur est sain
# --interval=30s : vérifie toutes les 30 secondes
# --timeout=3s : timeout de 3 secondes par tentative
# --start-period=5s : attend 5s après le démarrage avant de commencer
# --retries=3 : marque comme unhealthy après 3 échecs consécutifs
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Variables d'environnement par défaut
ENV NODE_ENV=production \
    PORT=3000

# Commande de démarrage
# Format exec (recommandé) au lieu du format shell
CMD ["node", "src/server.js"]
