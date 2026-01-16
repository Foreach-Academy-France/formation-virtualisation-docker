# ===========================================
# Stage 1: Build
# ===========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (ci = clean install, plus rapide et reproductible)
RUN npm ci

# Copier le code source
COPY . .

# Builder l'application
RUN npm run build

# ===========================================
# Stage 2: Production
# ===========================================
FROM nginx:alpine

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copier les fichiers buildés depuis le stage précédent
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Créer les répertoires nécessaires avec les bonnes permissions
RUN mkdir -p /var/cache/nginx /var/run && \
    chown -R appuser:appgroup /var/cache/nginx /var/run /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /var/run

# Modifier nginx.conf pour écouter sur un port non-privilégié et utiliser un PID accessible
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf && \
    sed -i '/user  nginx;/d' /etc/nginx/nginx.conf && \
    sed -i 's|pid.*nginx.pid;|pid /tmp/nginx.pid;|g' /etc/nginx/nginx.conf

# Exposer le port
EXPOSE 8080

# Passer à l'utilisateur non-root
USER appuser

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
