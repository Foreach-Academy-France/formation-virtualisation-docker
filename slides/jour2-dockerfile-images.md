---
marp: true
theme: uncover
paginate: true
footer: M2 ESTD - Virtualisation et Conteneurisation avec Docker | IEF2I
style: |
  section {
    font-size: 20px;
    padding: 40px 50px;
  }
  h1 {
    font-size: 36px;
    color: #2563eb;
    margin: 0 0 15px 0;
  }
  h2 {
    font-size: 28px;
    color: #1e40af;
    margin: 0 0 12px 0;
  }
  h3 {
    font-size: 24px;
    color: #3b82f6;
    margin: 0 0 10px 0;
  }
  code {
    font-size: 18px;
    background: #f3f4f6;
    padding: 1px 4px;
    border-radius: 4px;
  }
  .highlight {
    background: linear-gradient(120deg, #3b82f6 0%, #2563eb 100%);
    padding: 2px 6px;
    border-radius: 4px;
    color: white;
    font-weight: bold;
  }
  table {
    font-size: 16px;
  }
  blockquote {
    border-left: 4px solid #3b82f6;
    padding-left: 15px;
    font-style: italic;
    color: #4b5563;
    margin: 10px 0;
    font-size: 18px;
  }
  ul {
    margin: 10px 0;
    padding-left: 25px;
  }
  li {
    margin-bottom: 5px;
    line-height: 1.3;
  }
  pre {
    font-size: 15px;
    padding: 20px;
    margin: 15px 0;
    background: #1e1e1e !important;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  pre code {
    background: transparent !important;
    color: #d4d4d4;
    font-size: 15px;
  }
---

<!-- Mermaid support -->
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true, theme: 'default' });
</script>

<!-- _class: lead -->

# 🐳 Jour 2
## Dockerfile et Images Personnalisées

**Formation Virtualisation & Conteneurisation**
M2 ESTD - Architecte Web
IEF2I / Digital School of Paris

---

## 👋 Bienvenue au Jour 2!

**Hier (Jour 1)** :
- ✅ Présentation Docker et concepts
- ✅ Architecture (namespaces, cgroups, layers)
- ✅ Écosystème Docker
- ✅ TP1 : Découverte et premières commandes

**Aujourd'hui (Jour 2)** :
1. Module 4 : Installation et Configuration avancée
2. Module 5 : Création d'images avec Dockerfile
3. Démo : Dockeriser une application Node.js
4. TP2 : Dockeriser votre propre application

---

## 📋 Planning de la journée

| Horaire | Contenu |
|---------|---------|
| 9h00-10h30 | Module 4 : Installation avancée |
| 10h45-12h15 | Module 5 : Dockerfile (Partie 1) |
| 13h15-15h00 | Module 5 : Dockerfile (Partie 2) |
| 15h15-17h00 | TP2 : Dockeriser une app |

---

<!-- _class: lead -->

# Module 4
## Installation et Configuration Avancée

---

## Installation Docker sur Linux

**Méthodes d'installation** :

1. 🚀 **Script officiel** (rapide)
2. 📦 **Package manager** (recommandé production)
3. 🔧 **Binaires** (cas spécifiques)

**Aujourd'hui** : Focus sur méthode package manager (Debian/Ubuntu)

---

## Installation via APT (Debian/Ubuntu)

```bash
# 1. Supprimer anciennes versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# 2. Installer dépendances
sudo apt-get update
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 3. Ajouter clé GPG officielle Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

---

## Installation APT (suite)

```bash
# 4. Ajouter repository Docker
echo \
  "deb [arch=$(dpkg --print-architecture) \
  signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Installer Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

# 6. Vérifier
sudo docker run hello-world
```

---

## Configuration du groupe docker

**Problème** : `docker` nécessite `sudo` par défaut

**Solution** : Ajouter l'utilisateur au groupe `docker`

```bash
# Créer le groupe docker (si inexistant)
sudo groupadd docker

# Ajouter l'utilisateur au groupe
sudo usermod -aG docker $USER

# Appliquer les changements
newgrp docker

# Tester sans sudo
docker run hello-world
```

⚠️ **Sécurité** : Le groupe `docker` = root équivalent

---

## Post-installation : Démarrage automatique

```bash
# Activer Docker au boot
sudo systemctl enable docker.service
sudo systemctl enable containerd.service

# Vérifier le statut
sudo systemctl status docker

# Démarrer/Stopper Docker
sudo systemctl start docker
sudo systemctl stop docker
sudo systemctl restart docker
```

---

## Configuration Docker Daemon

**Fichier** : `/etc/docker/daemon.json`

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-address-pools": [
    {"base": "172.80.0.0/16", "size": 24}
  ],
  "storage-driver": "overlay2"
}
```

```bash
# Appliquer les changements
sudo systemctl reload docker
```

---

## Storage Drivers

**Choix du driver** :

| Driver | Usage | Performance |
|--------|-------|-------------|
| **overlay2** | ✅ Recommandé | Excellent |
| aufs | Legacy | Bon |
| btrfs | Btrfs FS | Bon |
| zfs | ZFS FS | Bon |

```bash
# Vérifier le driver actuel
docker info | grep "Storage Driver"
```

---

## Configurer les limites de ressources

**Par défaut** : Pas de limites

**Limiter globalement** dans `daemon.json` :

```json
{
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  },
  "default-shm-size": "64M"
}
```

---

## Configuration réseau Docker

**Réseaux par défaut** :

- `bridge` : Réseau par défaut
- `host` : Partage réseau hôte
- `none` : Pas de réseau

```bash
# Lister les réseaux
docker network ls

# Créer un réseau personnalisé
docker network create --driver bridge mon-reseau

# Inspecter un réseau
docker network inspect bridge
```

---

## Proxy et registres privés

**Configurer un proxy** :

```bash
# /etc/systemd/system/docker.service.d/http-proxy.conf
[Service]
Environment="HTTP_PROXY=http://proxy:8080"
Environment="HTTPS_PROXY=https://proxy:8080"
Environment="NO_PROXY=localhost,127.0.0.1"
```

**Registry privé** dans `daemon.json` :

```json
{
  "insecure-registries": ["registry.mycompany.com:5000"],
  "registry-mirrors": ["https://mirror.mycompany.com"]
}
```

---

## Docker Rootless Mode

**Problème de sécurité** : Docker Daemon = root

**Solution** : Rootless mode (Docker sans root)

```bash
# Installer dockerd-rootless
curl -fsSL https://get.docker.com/rootless | sh

# Configurer PATH
export PATH=/home/$USER/bin:$PATH
export DOCKER_HOST=unix:///run/user/$(id -u)/docker.sock

# Démarrer
systemctl --user start docker
```

⚠️ Limites : Pas de ports < 1024, pas de cgroups v1

---

<!-- _class: lead -->

# Module 5
## Création d'Images avec Dockerfile

---

## Qu'est-ce qu'un Dockerfile ?

**Dockerfile** = Recette pour construire une image Docker

**Analogie** : Recette de cuisine
- 🥘 **Ingrédients** = Images de base
- 📝 **Instructions** = Commandes Dockerfile
- 🍰 **Résultat** = Image Docker

**Format** : Fichier texte nommé `Dockerfile`

---

## Workflow de build

```bash
# 1. Créer un Dockerfile
vim Dockerfile

# 2. Builder l'image
docker build -t mon-app:1.0 .

# 3. Lancer un conteneur
docker run mon-app:1.0
```

<div class="mermaid">
flowchart LR
    Dockerfile[Dockerfile] -->|docker build| Image[Image Docker]
    Image -->|docker run| Container[Container]
</div>

---

## Exemple simple : Dockerfile Node.js

```dockerfile
# Image de base
FROM node:18-alpine

# Répertoire de travail
WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer dépendances
RUN npm install

# Copier le code
COPY . .

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server.js"]
```

---

## Instruction FROM

**FROM** : Définit l'image de base

```dockerfile
# Image officielle Node.js
FROM node:18

# Version alpine (plus légère)
FROM node:18-alpine

# Version Debian
FROM node:18-bullseye

# Multi-stage build
FROM node:18 AS builder
FROM nginx:alpine AS production
```

⚠️ **Toujours** commencer par `FROM`

---

## Tags et versions

**Format** : `image:tag`

```dockerfile
# ❌ Éviter 'latest' en production
FROM node:latest

# ✅ Version fixe
FROM node:18.19.0

# ✅ Version mineure
FROM node:18

# ✅ Alpine pour taille réduite
FROM node:18-alpine
```

**Conseil** : Utiliser des tags fixes en production

---

## Instruction WORKDIR

**WORKDIR** : Définit le répertoire de travail

```dockerfile
# Créer et se positionner dans /app
WORKDIR /app

# Équivalent à
RUN mkdir -p /app
WORKDIR /app

# Tous les chemins relatifs partent de /app
COPY package.json .  # → /app/package.json
RUN npm install      # → dans /app
```

**Best practice** : Toujours utiliser `WORKDIR`

---

## Instruction COPY vs ADD

**COPY** : Copier fichiers locaux → image

```dockerfile
# Copier un fichier
COPY package.json /app/

# Copier un répertoire
COPY src/ /app/src/

# Copier tout
COPY . /app/
```

**ADD** : Comme COPY + extraction tar + URL

```dockerfile
# Extraction automatique
ADD archive.tar.gz /app/

# Télécharger depuis URL
ADD https://example.com/file.tar.gz /tmp/
```

⚠️ **Préférer COPY** (plus explicite)

---

## Instruction RUN

**RUN** : Exécuter une commande pendant le build

```dockerfile
# Installer des packages
RUN apt-get update && apt-get install -y curl

# Installer dépendances Node
RUN npm install

# Plusieurs commandes avec &&
RUN apt-get update && \
    apt-get install -y curl wget && \
    rm -rf /var/lib/apt/lists/*

# Créer un fichier
RUN echo "Hello" > /app/hello.txt
```

**Chaque RUN** = 1 layer

---

## Optimisation des layers

**❌ Mauvais** : 3 layers

```dockerfile
RUN apt-get update
RUN apt-get install -y curl
RUN rm -rf /var/lib/apt/lists/*
```

**✅ Bon** : 1 layer

```dockerfile
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

**Règle** : Regrouper les commandes liées avec `&&`

---

## Instruction ENV

**ENV** : Définir des variables d'environnement

```dockerfile
# Variable simple
ENV NODE_ENV production

# Plusieurs variables
ENV APP_PORT=3000 \
    APP_HOST=0.0.0.0 \
    LOG_LEVEL=info

# Utiliser les variables
RUN echo "Port: $APP_PORT"
```

**Disponible** : Build + Runtime

---

## Instruction ARG

**ARG** : Variable uniquement au build

```dockerfile
# Définir un argument
ARG NODE_VERSION=18

# Utiliser dans FROM
FROM node:${NODE_VERSION}

# Argument avec valeur par défaut
ARG APP_PORT=3000

# Passer la valeur au build
# docker build --build-arg NODE_VERSION=20 .
```

**Différence ARG vs ENV** :
- ARG : Build uniquement
- ENV : Build + Runtime

---

## Instruction EXPOSE

**EXPOSE** : Documenter les ports utilisés

```dockerfile
# Port HTTP
EXPOSE 3000

# Plusieurs ports
EXPOSE 3000 8080

# Port UDP
EXPOSE 53/udp
```

⚠️ **EXPOSE ≠ publish** : Documentation uniquement

```bash
# Publier le port au runtime
docker run -p 3000:3000 mon-app
```

---

## Instructions CMD et ENTRYPOINT

**CMD** : Commande par défaut (remplaçable)

```dockerfile
# Format exec (recommandé)
CMD ["node", "server.js"]

# Format shell
CMD node server.js
```

**ENTRYPOINT** : Point d'entrée (non remplaçable)

```dockerfile
ENTRYPOINT ["node"]
CMD ["server.js"]
```

**Combinaison** : `ENTRYPOINT` + `CMD`
```bash
docker run mon-app         # → node server.js
docker run mon-app app.js  # → node app.js
```

---

## Différence CMD vs ENTRYPOINT

```dockerfile
# Dockerfile avec CMD
FROM node:18-alpine
CMD ["node", "server.js"]
```

```bash
docker run mon-app              # → node server.js
docker run mon-app npm test     # → npm test (CMD remplacé)
```

```dockerfile
# Dockerfile avec ENTRYPOINT
FROM node:18-alpine
ENTRYPOINT ["node"]
CMD ["server.js"]
```

```bash
docker run mon-app              # → node server.js
docker run mon-app app.js       # → node app.js
```

---

## Instruction USER

**USER** : Définir l'utilisateur d'exécution

```dockerfile
# Créer un utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Changer d'utilisateur
USER appuser

# Tous les RUN suivants = appuser
RUN whoami  # → appuser
```

**Sécurité** : ✅ Exécuter en non-root

---

## Instruction VOLUME

**VOLUME** : Déclarer un point de montage

```dockerfile
# Volume pour les données
VOLUME /app/data

# Plusieurs volumes
VOLUME ["/app/data", "/app/logs"]
```

**Usage** :

```bash
# Volume anonyme
docker run mon-app

# Volume nommé
docker run -v mydata:/app/data mon-app

# Bind mount
docker run -v $(pwd)/data:/app/data mon-app
```

---

## Instruction LABEL

**LABEL** : Métadonnées de l'image

```dockerfile
LABEL maintainer="dev@example.com"
LABEL version="1.0.0"
LABEL description="Application Node.js"

# Plusieurs labels
LABEL org.opencontainers.image.title="Mon App" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.authors="dev@example.com"
```

```bash
# Voir les labels
docker inspect mon-app | grep Labels -A 10
```

---

## Instruction HEALTHCHECK

**HEALTHCHECK** : Vérifier la santé du conteneur

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

**Paramètres** :
- `--interval` : Fréquence des checks
- `--timeout` : Timeout par check
- `--retries` : Nombre d'échecs avant "unhealthy"

```bash
# Voir l'état de santé
docker ps  # → healthy/unhealthy
docker inspect mon-app | grep Health -A 10
```

---

## Multi-stage builds

**Problème** : Image finale trop grosse (build tools inclus)

**Solution** : Multi-stage builds

```dockerfile
# Stage 1 : Build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2 : Production
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --production
CMD ["node", "dist/server.js"]
```

---

## Avantages Multi-stage

**Sans multi-stage** :
- Image : 1.2 GB
- Contient : Node 18 + npm + devDependencies + build tools

**Avec multi-stage** :
- Image : 150 MB (-88%)
- Contient : Node 18 Alpine + production code uniquement

**Use cases** :
- Applications compilées (Go, Rust, Java)
- Frontend builds (React, Vue, Angular)
- Applications Node.js avec TypeScript

---

## .dockerignore

**Problème** : `COPY . .` copie tout (node_modules, .git, etc.)

**Solution** : `.dockerignore`

```
# .dockerignore
node_modules
npm-debug.log
.git
.env
.vscode
*.md
.DS_Store
coverage
dist
```

**Bénéfices** : Build plus rapide + image plus légère

---

## Best Practices Dockerfile

**1. Utiliser des images de base officielles**
```dockerfile
✅ FROM node:18-alpine
❌ FROM random-user/node:latest
```

**2. Installer les dépendances avant le code**
```dockerfile
✅ COPY package*.json ./
   RUN npm install
   COPY . .
❌ COPY . .
   RUN npm install
```

**Raison** : Cache Docker

---

## Best Practices (suite)

**3. Minimiser le nombre de layers**
```dockerfile
✅ RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
❌ RUN apt-get update
   RUN apt-get install -y curl
```

**4. Utiliser WORKDIR**
```dockerfile
✅ WORKDIR /app
❌ RUN cd /app
```

**5. Exécuter en non-root**
```dockerfile
✅ USER node
❌ (root par défaut)
```

---

## Exemple complet : Application Node.js

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
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./
RUN npm ci --production
USER appuser
EXPOSE 3000
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

---

<!-- _class: lead -->

# Démo Live
## Dockeriser une application Node.js

---

## Démo : Application Express

**Application** : API REST Express simple

```bash
# Structure
my-app/
├── src/
│   └── server.js
├── package.json
├── Dockerfile
└── .dockerignore
```

**Étapes** :
1. Créer l'application
2. Écrire le Dockerfile
3. Builder l'image
4. Tester le conteneur

---

## Démo : Code server.js

```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello Docker!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Démo : Dockerfile

```dockerfile
FROM node:18-alpine

# Créer utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copier dépendances
COPY package*.json ./
RUN npm ci --production

# Copier code source
COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 3000

HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
```

---

## Démo : Build et Run

```bash
# 1. Builder l'image
docker build -t my-api:1.0 .

# 2. Vérifier l'image
docker images | grep my-api

# 3. Lancer le conteneur
docker run -d -p 3000:3000 --name api my-api:1.0

# 4. Tester
curl http://localhost:3000
curl http://localhost:3000/health

# 5. Voir les logs
docker logs api

# 6. Vérifier le health check
docker ps  # → healthy après 30s
```

---

## Démo : Optimisation

**Résultat** :
- ✅ Image : 150 MB (Node Alpine)
- ✅ Démarrage : < 1 seconde
- ✅ Non-root : Sécurisé
- ✅ Health check : Monitoring actif
- ✅ Logs : Accessibles

**Améliorations possibles** :
- Multi-stage build (si TypeScript)
- Variables d'environnement
- Secrets management

---

<!-- _class: lead -->

# TP2
## Dockeriser votre application
**(1h45)**

---

## Objectifs TP2

**Mission** : Dockeriser une application complète

**Tâches** :
1. Analyser l'application fournie
2. Créer un Dockerfile optimisé
3. Builder l'image
4. Tester le conteneur
5. Appliquer les best practices
6. (Bonus) Multi-stage build

**📝 Énoncé complet** : `tp/tp2-dockeriser-app/`

---

## TP2 - Application à dockeriser

**Application** : Todo API (Node.js + Express)

**Fonctionnalités** :
- CRUD Todos (GET, POST, PUT, DELETE)
- Stockage en mémoire
- Health check endpoint
- Tests unitaires

**Stack** :
- Node.js 18
- Express 4
- Vitest (tests)
- TypeScript

---

## TP2 - Partie 1 : Dockerfile de base

**Objectif** : Créer un Dockerfile fonctionnel

**Checklist** :
- ✅ FROM node:18-alpine
- ✅ WORKDIR /app
- ✅ COPY package files
- ✅ RUN npm install
- ✅ COPY source code
- ✅ EXPOSE 3000
- ✅ CMD ["node", "server.js"]

**Test** : `docker run -p 3000:3000 todo-api`

---

## TP2 - Partie 2 : Optimisations

**Objectif** : Appliquer les best practices

**Checklist** :
- ✅ .dockerignore (node_modules, .git, etc.)
- ✅ npm ci --production (au lieu de npm install)
- ✅ Utilisateur non-root
- ✅ HEALTHCHECK
- ✅ Labels et métadonnées
- ✅ Réduction du nombre de layers

**Test** : Comparer les tailles d'images

---

## TP2 - Partie 3 : Multi-stage

**Objectif** : Build TypeScript → Production optimisée

```dockerfile
# Stage 1: Build
FROM node:18 AS builder
# ... build TypeScript

# Stage 2: Production
FROM node:18-alpine
# ... copy dist/ uniquement
```

**Résultat attendu** :
- Image initiale : ~400 MB
- Image finale : ~150 MB

---

## TP2 - Bonus

**Challenges supplémentaires** :

1. **Docker Compose** : Ajouter PostgreSQL
2. **Variables d'environnement** : Configuration dynamique
3. **Volumes** : Persistence des données
4. **Networking** : Isoler les services

**Solution complète** : `tp/tp2-dockeriser-app/solution/`

---

<!-- _class: lead -->

# Récapitulatif Jour 2

---

## Ce que nous avons vu

✅ **Module 4** : Installation et Configuration
- Installation APT
- Configuration daemon.json
- Storage drivers
- Rootless mode

✅ **Module 5** : Dockerfile
- Instructions (FROM, RUN, COPY, CMD, etc.)
- Multi-stage builds
- Best practices

✅ **Démo** : Application Node.js dockerisée

✅ **TP2** : Dockeriser votre propre application

---

## Points clés à retenir

📝 Dockerfile = Recette pour builder une image

🏗️ Multi-stage = Images optimisées (< 150 MB)

👤 Toujours exécuter en non-root

🔍 Health checks = Monitoring automatique

📦 .dockerignore = Build plus rapide

---

## Demain (Jour 3)

**Module 6** : Gestion des conteneurs (monitoring, logs)
**Module 7** : Volumes et persistance
**TP3** : Application avec base de données

**Prérequis** :
- Dockerfile maîtrisé
- Image créée et testée (TP2)
- Compte Docker Hub

---

<!-- _class: lead -->

# Questions ?

**À demain pour le Jour 3!** 🚀

---

<!-- _class: lead -->

# Merci !

**Formation Docker - Jour 2**
M2 ESTD - Architecte Web

📧 michaelmavrodis@formateur.ief2i.fr
