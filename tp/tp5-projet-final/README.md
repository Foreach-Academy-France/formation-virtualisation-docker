# TP5 - Projet Fil Rouge : Application E-Commerce

## Objectif

Dockeriser et déployer une application e-commerce complète en appliquant toutes les bonnes pratiques vues pendant la formation.

## Durée

2h15 (projet) + 45min (présentation/évaluation)

## Stack Technique

| Service | Technologie | Port interne |
|---------|-------------|--------------|
| Frontend | React (build static) | 80 |
| Backend | Node.js/Express | 3000 |
| Database | PostgreSQL 15 | 5432 |
| Cache | Redis Alpine | 6379 |
| Proxy | Nginx | 80/443 |

## Architecture Cible

```
                    Internet
                        │
                        ▼
                ┌──────────────┐
                │    Nginx     │ :80
                │   (proxy)    │
                └──────┬───────┘
                       │
            ┌──────────┴──────────┐
            │                     │
            ▼                     ▼
    ┌──────────────┐      ┌──────────────┐
    │   Frontend   │      │   Backend    │
    │   (static)   │      │    (API)     │
    └──────────────┘      └──────┬───────┘
                                 │
                       ┌─────────┴─────────┐
                       │                   │
                       ▼                   ▼
                ┌──────────┐        ┌──────────┐
                │ Postgres │        │  Redis   │
                └──────────┘        └──────────┘
```

## Partie 1 : Dockerfiles (45 min)

### 1.1 Frontend React

Créer `starter/frontend/Dockerfile` avec les exigences suivantes :

**Exigences** :
- Multi-stage build (build + serve)
- Stage 1 : Node.js pour le build (`npm ci && npm run build`)
- Stage 2 : Nginx pour servir les fichiers statiques
- Utilisateur non-root
- Image finale < 50 MB

**Hints** :
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
# ...

# Stage 2: Production
FROM nginx:alpine
# Copier les fichiers buildés
COPY --from=builder /app/build /usr/share/nginx/html
# ...
```

### 1.2 Backend API

Créer `starter/backend/Dockerfile` avec les exigences suivantes :

**Exigences** :
- Image `node:20-alpine`
- Utilisateur non-root
- `npm ci --production` (pas npm install)
- Health check intégré
- EXPOSE 3000

**Hints** :
```dockerfile
FROM node:20-alpine

# Créer utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copier et installer les dépendances
COPY package*.json ./
RUN npm ci --production

# Copier le code
COPY --chown=nodejs:nodejs . .

USER nodejs

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["node", "server.js"]
```

## Partie 2 : Docker Compose (45 min)

Créer `docker-compose.yml` à la racine du projet.

### 2.1 Services à configurer

**nginx** :
- Image : `nginx:alpine`
- Ports : `80:80`
- Volumes : config nginx
- Depends on : frontend, api
- Networks : frontend

**frontend** :
- Build : `./starter/frontend`
- Networks : frontend
- Restart : unless-stopped

**api** :
- Build : `./starter/backend`
- Environment : variables de connexion DB et Redis
- Depends on : db, redis (avec health check)
- Networks : frontend, backend
- Restart : unless-stopped

**db** :
- Image : `postgres:15-alpine`
- Environment : credentials
- Volumes : données persistantes
- Health check : `pg_isready`
- Networks : backend (internal)

**redis** :
- Image : `redis:alpine`
- Volumes : données persistantes
- Health check : `redis-cli ping`
- Networks : backend (internal)

### 2.2 Networks

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # Isolation de la DB
```

### 2.3 Volumes

```yaml
volumes:
  postgres_data:
  redis_data:
```

## Partie 3 : Sécurité & Production (30 min)

### 3.1 Checklist de sécurité

- [ ] Tous les conteneurs avec utilisateur non-root
- [ ] Database non exposée sur le réseau externe
- [ ] Secrets dans fichier `.env` (non commité)
- [ ] Health checks sur tous les services
- [ ] Limites de ressources (memory, CPU)
- [ ] Logging configuré avec rotation

### 3.2 Fichier .env

Créer `.env` avec :

```bash
# Database
POSTGRES_USER=ecommerce
POSTGRES_PASSWORD=<générer_mot_de_passe_fort>
POSTGRES_DB=ecommerce

# API
NODE_ENV=production
DATABASE_URL=postgresql://ecommerce:<password>@db:5432/ecommerce
REDIS_URL=redis://redis:6379

# Logging
LOG_LEVEL=info
```

### 3.3 Configuration Nginx

Créer `starter/nginx/nginx.conf` :

```nginx
upstream frontend {
    server frontend:80;
}

upstream api {
    server api:3000;
}

server {
    listen 80;
    server_name localhost;

    # Frontend (React)
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Backend
    location /api {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 'healthy';
        add_header Content-Type text/plain;
    }
}
```

## Partie 4 : Validation et Tests (15 min)

### 4.1 Commandes de validation

```bash
# 1. Valider les Dockerfiles
docker run --rm -i hadolint/hadolint < starter/frontend/Dockerfile
docker run --rm -i hadolint/hadolint < starter/backend/Dockerfile

# 2. Builder et démarrer
docker-compose build
docker-compose up -d

# 3. Vérifier les services
docker-compose ps
docker-compose logs

# 4. Tester les health checks
docker inspect --format='{{.State.Health.Status}}' tp5-projet-final-api-1

# 5. Tester les endpoints
curl http://localhost/health
curl http://localhost/api/health
curl http://localhost/api/products

# 6. Vérifier la sécurité
docker-compose exec api whoami  # Doit afficher nodejs, pas root
docker-compose exec db whoami   # Doit afficher postgres, pas root

# 7. Scanner les vulnérabilités
trivy image tp5-projet-final-api:latest
trivy image tp5-projet-final-frontend:latest
```

### 4.2 Tests de persistance

```bash
# 1. Créer des données
curl -X POST http://localhost/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product", "price": 99.99}'

# 2. Vérifier
curl http://localhost/api/products

# 3. Redémarrer
docker-compose down
docker-compose up -d

# 4. Vérifier que les données sont toujours là
curl http://localhost/api/products
```

## Critères d'évaluation

| Critère | Points | Description |
|---------|--------|-------------|
| **Dockerfiles** | 30 | |
| Multi-stage build frontend | 10 | Build + serve séparés |
| Backend optimisé | 10 | Alpine, non-root, health check |
| Images minimales | 5 | Taille raisonnable |
| Pas de secrets | 5 | Aucun secret dans les images |
| **Docker Compose** | 30 | |
| Services fonctionnels | 10 | Tous les services démarrent |
| Réseaux configurés | 10 | Isolation backend/frontend |
| Volumes persistants | 5 | Données conservées après restart |
| Health checks | 5 | Tous les services avec health check |
| **Sécurité** | 25 | |
| Utilisateurs non-root | 10 | Tous les conteneurs |
| DB non exposée | 5 | Réseau internal |
| Secrets externalisés | 5 | Fichier .env |
| Limites ressources | 5 | Memory/CPU définis |
| **Documentation** | 10 | |
| README clair | 5 | Instructions de déploiement |
| Architecture documentée | 5 | Schéma et explications |
| **Bonus** | +5 | |
| CI/CD | +2 | GitHub Actions ou GitLab CI |
| Monitoring | +2 | Prometheus/Grafana |
| TLS/HTTPS | +1 | Certificats configurés |

**Total** : 100 points (+5 bonus)
**Validation** : >= 50 points

## Livrables

1. `starter/frontend/Dockerfile`
2. `starter/backend/Dockerfile`
3. `docker-compose.yml`
4. `starter/nginx/nginx.conf`
5. `.env.example` (template sans secrets)
6. `README.md` mis à jour avec instructions

## Ressources

- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Nginx Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Trivy Scanner](https://github.com/aquasecurity/trivy)

## Aide

**Problèmes courants** :

1. **Permission denied** : Vérifier que l'utilisateur a accès aux fichiers
2. **Connection refused** : Vérifier les réseaux et health checks
3. **Image trop grosse** : Utiliser `.dockerignore` et multi-stage
4. **Secrets exposés** : Ne jamais COPY .env dans l'image

**Commandes utiles** :

```bash
# Debug un conteneur
docker-compose exec api sh

# Voir les logs en temps réel
docker-compose logs -f api

# Reconstruire un service
docker-compose up -d --build api

# Nettoyer tout
docker-compose down -v --rmi all
```

---

Bon courage ! 🐳
