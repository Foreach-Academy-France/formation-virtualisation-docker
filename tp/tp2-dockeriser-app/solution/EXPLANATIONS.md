# Solution TP2 - Explications Détaillées

## 🎯 Vue d'ensemble

Cette solution implémente **toutes les best practices** Docker pour une application Node.js en production.

**Résultats** :
- ✅ Image : ~150 MB (Alpine)
- ✅ Démarrage : < 1 seconde
- ✅ Sécurité : Utilisateur non-root
- ✅ Monitoring : Health check actif
- ✅ Build : Optimisé avec cache Docker

---

## 📝 Dockerfile ligne par ligne

### 1. Image de base

```dockerfile
FROM node:18-alpine
```

**Pourquoi Alpine ?**
- **Taille** : 40 MB vs 350 MB (Debian)
- **Sécurité** : Surface d'attaque réduite
- **Performance** : Démarrage plus rapide

**Alternative** : `node:18-bullseye` si besoin de packages système spécifiques

---

### 2. Métadonnées (LABEL)

```dockerfile
LABEL maintainer="formation@ief2i.fr" \
      version="1.0.0" \
      description="Todo API avec Docker best practices"
```

**Avantages** :
- 📄 Documentation de l'image
- 🔍 Filtrage avec `docker images --filter`
- 🤖 Automatisation CI/CD

**Standards** : [OCI Image Spec](https://github.com/opencontainers/image-spec/blob/main/annotations.md)

---

### 3. Utilisateur non-root

```dockerfile
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
```

**Sécurité** :
- ❌ **root** : Accès complet au système hôte (si exploit conteneur)
- ✅ **non-root** : Accès limité

**Flags Alpine** :
- `-S` : System user (pas de home, pas de shell)
- `-G` : Groupe primaire

---

### 4. Répertoire de travail

```dockerfile
WORKDIR /app
```

**Pourquoi** :
- 📂 Organise les fichiers
- 🔒 Évite de polluer `/` (root directory)
- 📍 Tous les chemins relatifs partent de `/app`

**Best practice** : Toujours utiliser `WORKDIR` au lieu de `RUN cd`

---

### 5. Optimisation du cache Docker

```dockerfile
# ÉTAPE 1 : Copier seulement package*.json
COPY package*.json ./

# ÉTAPE 2 : Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# ÉTAPE 3 : Copier le code source
COPY --chown=appuser:appgroup src ./src
```

**Magie du cache** :

Si vous modifiez `src/server.js` :
- ✅ Étapes 1-2 utilisent le **cache** (pas de réinstallation)
- ❌ Étape 3 est **reconstruite** (nouveau code)

**Sans optimisation** :
```dockerfile
COPY . .                    # Copie TOUT
RUN npm install             # Réinstalle à chaque changement de code
```
→ **5-10× plus lent** !

---

### 6. npm ci vs npm install

```dockerfile
RUN npm ci --only=production && npm cache clean --force
```

**npm ci** (Clean Install) :
- ✅ Reproductible (utilise `package-lock.json`)
- ✅ Plus rapide (pas de résolution de dépendances)
- ✅ Supprime `node_modules` existants

**npm install** :
- ❌ Non reproductible
- ❌ Plus lent
- ❌ Peut modifier `package-lock.json`

**--only=production** :
- Exclut `devDependencies` (nodemon, etc.)
- Réduit la taille de l'image

**npm cache clean --force** :
- Supprime le cache npm (~50 MB)
- Réduit la taille de l'image

---

### 7. Permissions

```dockerfile
COPY --chown=appuser:appgroup src ./src
USER appuser
```

**Problème sans --chown** :
```dockerfile
COPY src ./src              # Propriétaire = root
USER appuser               # Bascule sur appuser
# → appuser ne peut pas écrire dans /app/src !
```

**Solution** :
```dockerfile
COPY --chown=appuser:appgroup src ./src
```
→ Fichiers appartiennent à `appuser` dès la copie

---

### 8. EXPOSE

```dockerfile
EXPOSE 3000
```

**Ce que EXPOSE fait** :
- 📄 Documentation uniquement
- 🤖 Utilisé par `docker-compose` et `docker network inspect`

**Ce que EXPOSE ne fait PAS** :
- ❌ Ne publie PAS le port
- ❌ N'ouvre PAS de firewall

**Pour publier** :
```bash
docker run -p 3000:3000 todo-api
```

---

### 9. Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
```

**États possibles** :
- `starting` : Pendant la période de démarrage
- `healthy` : Health check réussit
- `unhealthy` : 3 échecs consécutifs

**Pourquoi c'est important** :
- 🔍 Docker sait si l'app fonctionne
- 🔄 Kubernetes peut redémarrer les conteneurs "unhealthy"
- 📊 Monitoring automatique

**Alternatives** :
```bash
# curl (si installé)
CMD curl -f http://localhost:3000/health || exit 1

# node (toujours disponible)
CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
```

---

### 10. Variables d'environnement

```dockerfile
ENV NODE_ENV=production \
    PORT=3000
```

**Usage** :
- Définir des valeurs par défaut
- Configuration au runtime

**Override au lancement** :
```bash
docker run -e PORT=4000 -e NODE_ENV=staging todo-api
```

---

### 11. CMD

```dockerfile
CMD ["node", "src/server.js"]
```

**Format exec** (recommandé) :
```dockerfile
CMD ["node", "src/server.js"]
```
→ `node` = PID 1, reçoit les signaux (SIGTERM)

**Format shell** (éviter) :
```dockerfile
CMD node src/server.js
```
→ `/bin/sh -c "node src/server.js"` = PID 1
→ `node` ne reçoit pas SIGTERM (graceful shutdown impossible)

---

## 🔥 .dockerignore

```
node_modules
.git
.env
README.md
test
```

**Impact** :

Sans `.dockerignore` :
- `COPY . .` copie **tout** (node_modules, .git, etc.)
- Build lent (~5-10s pour copier node_modules)
- Image grosse (+100 MB pour node_modules)

Avec `.dockerignore` :
- `COPY . .` copie uniquement le code source
- Build rapide (~1s)
- Image légère

---

## 📊 Comparaison des versions

| Version | Taille | Build | Sécurité | Monitoring |
|---------|--------|-------|----------|------------|
| **Basic** | 400 MB | 15s | ❌ Root | ❌ Pas de HC |
| **Optimized** | 150 MB | 5s | ✅ Non-root | ✅ Health check |

**Amélioration** : -62% taille, -66% temps de build

---

## 🚀 Commandes utiles

### Builder et tester

```bash
# Build
docker build -t todo-api:1.0 .

# Vérifier la taille
docker images | grep todo-api

# Lancer
docker run -d -p 3000:3000 --name todo todo-api:1.0

# Tester
curl http://localhost:3000/health
curl http://localhost:3000/todos

# Logs
docker logs -f todo

# Health check status
docker ps  # Voir colonne STATUS

# Inspecter le health
docker inspect todo | grep -A 10 Health

# Cleanup
docker stop todo && docker rm todo
```

### Analyser l'image

```bash
# Voir les layers
docker history todo-api:1.0

# Inspecter les métadonnées
docker inspect todo-api:1.0

# Vérifier l'utilisateur
docker run --rm todo-api:1.0 whoami
# → devrait afficher "appuser"
```

---

## 🎯 Points clés

1. **Alpine** → Image légère
2. **npm ci** → Installation reproductible
3. **Cache Docker** → Build rapide
4. **Non-root** → Sécurité
5. **Health check** → Monitoring
6. **.dockerignore** → Optimisation

---

## 📚 Pour aller plus loin

### Multi-stage build

Si l'application utilisait TypeScript :

```dockerfile
# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
CMD ["node", "dist/server.js"]
```

**Avantages** :
- Image finale ne contient pas TypeScript ni devDependencies
- ~100 MB au lieu de ~400 MB

### Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

---

**Félicitations ! Vous maîtrisez maintenant les best practices Docker ! 🎉**
