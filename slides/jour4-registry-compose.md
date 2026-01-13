---
marp: true
theme: uncover
paginate: true
footer: M2 ESTD - Virtualisation et Conteneurisation avec Docker | ForEach Academy
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
  .mermaid {
    transform: scale(0.75);
    transform-origin: center;
  }
---

<!-- Mermaid support -->
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true, theme: 'default' });
</script>

<!-- _class: lead -->

# 🐳 Jour 4
## Registry Privé & Docker Compose

**Formation Virtualisation & Conteneurisation**
M2 ESTD - Architecte Web
ForEach Academy

---

## 👋 Bienvenue au Jour 4!

**Hier (Jour 3)** :
- ✅ Gestion des conteneurs (monitoring, logs, exec)
- ✅ Volumes et persistance des données
- ✅ Networking entre conteneurs
- ✅ TP3 : Application avec PostgreSQL

**Aujourd'hui (Jour 4)** :
1. Module 8 : Docker Registry privé
2. Module 9 : Docker Compose
3. Démo : Stack applicative complète
4. TP4 : Déployer une application multi-services

---

## 📋 Planning de la journée

| Horaire | Contenu |
|---------|---------|
| 9h00-10h30 | Module 8 : Registry privé |
| 10h45-12h15 | Module 9 : Docker Compose (Partie 1) |
| 13h15-15h00 | Module 9 : Docker Compose (Partie 2) |
| 15h15-17h00 | TP4 : Stack complète |

---

<!-- _class: lead -->

# Module 8
## Docker Registry Privé

---

## Pourquoi un registry privé ?

**Docker Hub** = Public par défaut

**Limitations** :
- 💰 Images privées limitées (compte gratuit)
- 🐌 Rate limits (200 pulls/6h)
- 🌍 Dépendance externe (internet requis)
- 🔒 Données sensibles sur serveurs tiers

**Solution** : <span class="highlight">Registry privé</span>

---

## Options de registry privé

**Self-hosted** :
- **Docker Registry** (officiel, simple)
- **Harbor** (enterprise, UI, RBAC, scan)
- **Nexus Repository** (multi-format)

**Cloud** :
- **GitHub Container Registry** (ghcr.io, gratuit)
- **AWS ECR** (Elastic Container Registry)
- **Google Artifact Registry**
- **Azure Container Registry**

---

## Docker Registry : Le basique

**Image officielle** : `registry:2`

**Fonctionnalités** :
- ✅ Stockage d'images
- ✅ Push/Pull
- ✅ API REST
- ❌ Pas d'UI
- ❌ Pas d'authentification par défaut
- ❌ Pas de scan de vulnérabilités

**Use case** : Registry local pour développement/CI

---

## Lancer un registry local

```bash
# Lancer le registry sur port 5000
docker run -d \
  -p 5000:5000 \
  --name registry \
  registry:2

# Vérifier
curl http://localhost:5000/v2/_catalog
# → {"repositories":[]}
```

**URL** : `localhost:5000`

---

## Tag et push vers registry local

```bash
# 1. Builder une image
docker build -t my-app:1.0 .

# 2. Tagger pour le registry local
docker tag my-app:1.0 localhost:5000/my-app:1.0

# 3. Push vers le registry
docker push localhost:5000/my-app:1.0

# 4. Vérifier
curl http://localhost:5000/v2/_catalog
# → {"repositories":["my-app"]}
```

---

## Pull depuis registry local

```bash
# Sur une autre machine (même réseau)
docker pull localhost:5000/my-app:1.0

# Sur machine distante
docker pull registry.mycompany.com:5000/my-app:1.0

# Lancer
docker run localhost:5000/my-app:1.0
```

**Avantage** : Pas de dépendance à Docker Hub

---

## Registry avec persistence

**Problème** : Données perdues si conteneur supprimé

**Solution** : Volume

```bash
docker run -d \
  -p 5000:5000 \
  --name registry \
  -v registry-data:/var/lib/registry \
  registry:2
```

**Stockage** : `/var/lib/registry` dans le volume

---

## Registry avec authentification

**Créer un fichier de mots de passe** :

```bash
# Installer htpasswd
sudo apt-get install apache2-utils

# Créer le fichier auth
mkdir auth
htpasswd -Bc auth/htpasswd admin
# → Entrer le mot de passe

# Lancer avec auth
docker run -d \
  -p 5000:5000 \
  --name registry \
  -v $(pwd)/auth:/auth \
  -e "REGISTRY_AUTH=htpasswd" \
  -e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  -e "REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd" \
  -v registry-data:/var/lib/registry \
  registry:2
```

---

## Login au registry privé

```bash
# Login
docker login localhost:5000
# Username: admin
# Password: ****

# Push (maintenant authentifié)
docker push localhost:5000/my-app:1.0

# Logout
docker logout localhost:5000
```

**Credentials** : Stockées dans `~/.docker/config.json`

---

## Registry avec TLS/HTTPS

**Production** : HTTPS obligatoire

```bash
# Générer certificat auto-signé (dev/test)
mkdir certs
openssl req -newkey rsa:4096 \
  -nodes -sha256 -keyout certs/domain.key \
  -x509 -days 365 -out certs/domain.crt

# Lancer avec TLS
docker run -d \
  -p 443:443 \
  --name registry \
  -v $(pwd)/certs:/certs \
  -e REGISTRY_HTTP_ADDR=0.0.0.0:443 \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/domain.crt \
  -e REGISTRY_HTTP_TLS_KEY=/certs/domain.key \
  registry:2
```

---

## Registry API

**Liste des images** :
```bash
curl http://localhost:5000/v2/_catalog
```

**Tags d'une image** :
```bash
curl http://localhost:5000/v2/my-app/tags/list
```

**Manifest d'une image** :
```bash
curl http://localhost:5000/v2/my-app/manifests/1.0
```

**Supprimer une image** :
```bash
# Activer suppression dans config
-e REGISTRY_STORAGE_DELETE_ENABLED=true
```

---

## Harbor : Registry enterprise

**Features** :
- 🖥️ UI web complète
- 👥 RBAC (Role-Based Access Control)
- 🔍 Vulnerability scanning (Trivy)
- 📊 Audit logs
- 🔄 Image replication
- 📦 Helm charts support

**Installation** :
```bash
# Via Docker Compose
curl -L https://github.com/goharbor/harbor/releases/download/v2.10.0/harbor-offline-installer-v2.10.0.tgz
tar xzvf harbor-offline-installer-v2.10.0.tgz
cd harbor/
./install.sh
```

---

## GitHub Container Registry (ghcr.io)

**Avantages** :
- ✅ Gratuit et illimité
- ✅ Intégré à GitHub
- ✅ Pas de rate limits
- ✅ Public ou privé

**Usage** :
```bash
# Login avec GitHub token
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag
docker tag my-app:1.0 ghcr.io/username/my-app:1.0

# Push
docker push ghcr.io/username/my-app:1.0
```

---

<!-- _class: lead -->

# Module 9
## Docker Compose

---

## Qu'est-ce que Docker Compose ?

**Docker Compose** = Orchestrer plusieurs conteneurs

**Problème sans Compose** :
```bash
docker network create app-net
docker run -d --name db --network app-net postgres
docker run -d --name redis --network app-net redis
docker run -d --name api --network app-net -p 3000:3000 my-api
docker run -d --name web --network app-net -p 80:80 nginx
```

→ 5 commandes, difficile à reproduire, erreur possible

---

## La solution : docker-compose.yml

**Un fichier YAML** = Toute la stack

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
  redis:
    image: redis:alpine
  api:
    build: ./api
    ports:
      - "3000:3000"
  web:
    image: nginx
    ports:
      - "80:80"
```

```bash
docker-compose up -d  # Une seule commande !
```

---

## Structure d'un docker-compose.yml

```yaml
version: '3.8'           # Version du format Compose

services:                # Liste des conteneurs
  service1:
    image: nginx         # Image à utiliser
  service2:
    build: ./app        # Build depuis Dockerfile

volumes:                 # Volumes nommés
  data:

networks:                # Réseaux personnalisés
  frontend:
  backend:
```

---

## Services : Les bases

```yaml
services:
  web:
    image: nginx:alpine           # Image à utiliser
    container_name: my-web        # Nom du conteneur
    ports:
      - "8080:80"                 # Port mapping
    environment:
      - NODE_ENV=production       # Variables d'env
    restart: unless-stopped       # Politique de restart
```

**Équivalent** :
```bash
docker run -d --name my-web -p 8080:80 \
  -e NODE_ENV=production --restart unless-stopped nginx:alpine
```

---

## Build avec Compose

```yaml
services:
  api:
    build:
      context: ./api              # Chemin du Dockerfile
      dockerfile: Dockerfile      # Nom du Dockerfile
      args:
        - NODE_VERSION=18         # Build args
    image: my-api:latest          # Tag de l'image buildée
```

**Commandes** :
```bash
docker-compose build              # Builder les images
docker-compose up --build         # Build + up
docker-compose build --no-cache   # Build sans cache
```

---

## Variables d'environnement

**3 méthodes** :

**1. Inline** :
```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
```

**2. Fichier .env** :
```yaml
env_file:
  - .env
```

**3. Substitution** :
```yaml
environment:
  - DB_HOST=${DB_HOST:-localhost}
```

---

## Exemple de fichier .env

```bash
# .env
NODE_ENV=production
PORT=3000
DB_HOST=db
DB_PORT=5432
DB_NAME=myapp
DB_USER=dbuser
DB_PASSWORD=secret123
```

```yaml
# docker-compose.yml
services:
  api:
    env_file: .env
```

⚠️ **Ajouter .env au .gitignore !**

---

## Volumes dans Compose

**Volume nommé** :
```yaml
services:
  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
    driver: local
```

**Bind mount** :
```yaml
services:
  web:
    volumes:
      - ./src:/app/src           # Hot reload en dev
      - ./logs:/var/log:ro       # Logs en lecture seule
```

---

## Networks dans Compose

**Par défaut** : Réseau automatique créé

**Personnalisé** :
```yaml
services:
  api:
    networks:
      - frontend
      - backend
  db:
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true    # Pas d'accès externe
```

**Isolation** : DB accessible uniquement par API

---

## Dépendances entre services

**depends_on** :
```yaml
services:
  api:
    depends_on:
      - db
      - redis
  db:
    image: postgres:15
  redis:
    image: redis:alpine
```

**Ordre de démarrage** : db, redis → puis api

⚠️ **Attention** : Démarre dans l'ordre mais n'attend pas que le service soit "prêt"

---

## depends_on avec health check

**Attendre que le service soit prêt** :

```yaml
services:
  api:
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 3s
      retries: 5
```

**Compose v2** uniquement (format moderne)

---

## Restart policies

```yaml
services:
  web:
    restart: always              # Toujours redémarrer

  api:
    restart: unless-stopped      # Sauf si stoppé manuellement

  worker:
    restart: on-failure:3        # Max 3 tentatives

  dev:
    restart: "no"                # Jamais
```

**Production** : `unless-stopped` ou `always`

---

## Limites de ressources

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '0.5'            # Max 50% d'un CPU
          memory: 512M           # Max 512 MB RAM
        reservations:
          cpus: '0.25'           # Min 25% CPU
          memory: 256M           # Min 256 MB RAM
```

**Swarm mode** : Ces limites fonctionnent avec `docker stack deploy`

---

## Commandes Docker Compose

**Lifecycle** :
```bash
docker-compose up -d              # Démarrer (détaché)
docker-compose down               # Stopper et supprimer
docker-compose start              # Démarrer services existants
docker-compose stop               # Stopper sans supprimer
docker-compose restart            # Redémarrer
```

**Build** :
```bash
docker-compose build              # Builder les images
docker-compose up --build         # Build + démarrer
```

---

## Commandes de monitoring

```bash
# Voir les services
docker-compose ps

# Logs
docker-compose logs
docker-compose logs -f api        # Suivre logs de api
docker-compose logs --tail=100    # 100 dernières lignes

# Exécuter une commande
docker-compose exec api sh

# Voir les processus
docker-compose top
```

---

## Scaling avec Compose

```bash
# Lancer 3 instances du service api
docker-compose up -d --scale api=3

# Vérifier
docker-compose ps
```

**Conditions** :
- ❌ Pas de `container_name` (conflit)
- ✅ Ports dynamiques ou load balancer

```yaml
services:
  api:
    # container_name: api  # ← À supprimer
    ports:
      - "3000-3002:3000"   # Range de ports
```

---

## docker-compose.override.yml

**Environnements** :

**docker-compose.yml** (base) :
```yaml
services:
  api:
    build: .
    environment:
      - NODE_ENV=production
```

**docker-compose.override.yml** (dev) :
```yaml
services:
  api:
    environment:
      - NODE_ENV=development
    volumes:
      - ./src:/app/src    # Hot reload
```

**Merge automatique** : `docker-compose up`

---

## Fichiers Compose multiples

```bash
# Production
docker-compose -f docker-compose.yml \
               -f docker-compose.prod.yml up -d

# Staging
docker-compose -f docker-compose.yml \
               -f docker-compose.staging.yml up -d

# Dev
docker-compose -f docker-compose.yml \
               -f docker-compose.dev.yml up -d
```

**Merge** : Propriétés surchargées

---

## Exemple complet : Stack MEAN

```yaml
version: '3.8'

services:
  # MongoDB
  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secret

  # Backend Express
  api:
    build: ./backend
    depends_on:
      - mongo
    environment:
      - MONGO_URL=mongodb://admin:secret@mongo:27017
    ports:
      - "3000:3000"
```

---

## Exemple complet (suite)

```yaml
  # Frontend Angular
  web:
    build: ./frontend
    depends_on:
      - api
    ports:
      - "80:80"
    environment:
      - API_URL=http://api:3000

  # Nginx (reverse proxy)
  nginx:
    image: nginx:alpine
    depends_on:
      - web
      - api
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro

volumes:
  mongo-data:
```

---

## Networks avancés

```yaml
services:
  api:
    networks:
      frontend:
        ipv4_address: 172.20.0.5
      backend:

  db:
    networks:
      backend:
        aliases:
          - database
          - postgres-primary

networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
  backend:
    internal: true    # Pas d'accès externe
```

---

## Health checks dans Compose

```yaml
services:
  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 10s

  api:
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

---

## Secrets avec Compose

**Docker Swarm mode** :
```yaml
services:
  api:
    secrets:
      - db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

**Standalone** : Utiliser fichier `.env`

---

## Profiles (Compose v1.28+)

**Activer/désactiver des services** :

```yaml
services:
  api:
    # Toujours actif

  debug:
    profiles: ["debug"]
    image: nicolaka/netshoot

  monitoring:
    profiles: ["monitoring"]
    image: prom/prometheus
```

```bash
docker-compose up -d                      # Seulement api
docker-compose --profile debug up -d      # api + debug
docker-compose --profile monitoring up -d # api + monitoring
```

---

## Best Practices Compose

**1. Utiliser des versions fixées** :
```yaml
✅ image: postgres:15-alpine
❌ image: postgres:latest
```

**2. Health checks partout** :
```yaml
✅ healthcheck: [...]
```

**3. Volumes nommés** :
```yaml
✅ volumes: pgdata:/var/lib/postgresql/data
❌ volumes: /var/lib/postgresql/data
```

**4. Restart policies** :
```yaml
✅ restart: unless-stopped
```

---

## Best Practices (suite)

**5. Utilisateurs non-root** :
```yaml
services:
  api:
    user: "node"
```

**6. Limites de ressources** :
```yaml
deploy:
  resources:
    limits:
      memory: 512M
```

**7. Logging** :
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

<!-- _class: lead -->

# Démo Live
## Stack WordPress avec Docker Compose

---

## Démo : WordPress + MySQL

**Stack** :
- WordPress (PHP)
- MySQL (base de données)
- Volumes pour persistance

**Fichier** : `docker-compose.yml`

---

## docker-compose.yml WordPress

```yaml
version: '3.8'

services:
  db:
    image: mysql:8
    volumes:
      - db_data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wpuser
      MYSQL_PASSWORD: wppass
    restart: unless-stopped

  wordpress:
    depends_on:
      - db
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wpuser
      WORDPRESS_DB_PASSWORD: wppass
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress_data:/var/www/html
    restart: unless-stopped

volumes:
  db_data:
  wordpress_data:
```

---

## Démo : Lancer WordPress

```bash
# 1. Créer le fichier docker-compose.yml
vim docker-compose.yml
# (copier le contenu précédent)

# 2. Démarrer la stack
docker-compose up -d

# 3. Vérifier les services
docker-compose ps

# 4. Voir les logs
docker-compose logs -f

# 5. Ouvrir dans le navigateur
# → http://localhost:8080

# 6. Installer WordPress
# (suivre l'assistant d'installation)
```

---

## Démo : Explorer la stack

```bash
# Services actifs
docker-compose ps

# Logs d'un service
docker-compose logs wordpress

# Exécuter une commande
docker-compose exec db mysql -u wpuser -p

# Stats
docker stats

# Volumes créés
docker volume ls | grep wordpress

# Réseau créé
docker network ls
```

---

## Démo : Tester la persistance

```bash
# 1. Créer du contenu dans WordPress
# (ajouter un article, télécharger un thème)

# 2. Stopper tout
docker-compose down

# 3. Vérifier que les volumes existent
docker volume ls

# 4. Redémarrer
docker-compose up -d

# 5. Recharger http://localhost:8080
# → Tout le contenu est toujours là ! ✅
```

---

## Démo : Scaling

```bash
# Impossible de scaler WordPress (port 8080 unique)
# Mais on peut scaler un worker

# Ajouter au compose :
# worker:
#   build: ./worker
#   # Pas de ports

# Scaler
docker-compose up -d --scale worker=3

# Vérifier
docker-compose ps
```

---

## Commandes avancées

```bash
# Pull toutes les images
docker-compose pull

# Voir les changements de config
docker-compose config

# Supprimer tout (conteneurs + volumes + réseau)
docker-compose down -v

# Recréer les conteneurs
docker-compose up -d --force-recreate

# Pause/Unpause
docker-compose pause
docker-compose unpause
```

---

<!-- _class: lead -->

# TP4
## Stack Applicative Complète
**(1h45)**

---

## Objectifs TP4

**Mission** : Déployer une stack complète avec Docker Compose

**Stack** :
- Frontend (Nginx servant du HTML statique)
- Backend API (Node.js/Express)
- Database (PostgreSQL)
- Cache (Redis)

**Tâches** :
1. Créer le fichier docker-compose.yml
2. Configurer les services
3. Gérer les volumes et réseaux
4. Tester la communication entre services
5. Vérifier la persistance

**📝 Énoncé complet** : `tp/tp4-compose-avance/`

---

## TP4 - Application fournie

**Frontend** :
- Nginx avec page HTML statique
- Appelle l'API backend

**Backend** :
- API Express avec endpoints CRUD
- Connexion PostgreSQL
- Cache Redis

**Base de données** :
- PostgreSQL pour stockage permanent
- Redis pour cache

---

## TP4 - Partie 1 : docker-compose.yml basique

**Objectif** : Créer la stack minimale fonctionnelle

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    # TODO: Ajouter variables d'env
    # TODO: Ajouter volume

  api:
    build: ./backend
    # TODO: Ajouter ports
    # TODO: Ajouter depends_on
    # TODO: Ajouter env vars

  web:
    build: ./frontend
    # TODO: Ajouter ports
```

**Validation** : `docker-compose up -d`

---

## TP4 - Partie 2 : Volumes et persistance

**Objectif** : Ajouter volumes nommés

```yaml
services:
  db:
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    volumes:
      - api-uploads:/app/uploads

volumes:
  pgdata:
  api-uploads:
```

**Test** : Créer des données → `down` → `up` → Données toujours là

---

## TP4 - Partie 3 : Networks et isolation

**Objectif** : Séparer frontend/backend

```yaml
services:
  web:
    networks:
      - frontend

  api:
    networks:
      - frontend
      - backend

  db:
    networks:
      - backend

networks:
  frontend:
  backend:
    internal: true    # DB isolée
```

**Résultat** : Web → API → DB (pas Web → DB direct)

---

## TP4 - Partie 4 : Health checks

**Objectif** : Démarrage ordonné

```yaml
services:
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready"]
      interval: 10s

  api:
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "localhost:3000/health"]
```

**Test** : `docker-compose up -d` → API démarre après DB ready

---

## TP4 - Bonus

**Challenges** :

1. **Nginx reverse proxy** :
   - Toutes les requêtes via Nginx
   - `/` → Frontend
   - `/api` → Backend

2. **Redis pour cache** :
   - Ajouter service Redis
   - Cacher les requêtes GET

3. **Monitoring** :
   - Ajouter Prometheus
   - Scraper les métriques

4. **Multi-environnement** :
   - `docker-compose.dev.yml`
   - `docker-compose.prod.yml`

---

<!-- _class: lead -->

# Récapitulatif Jour 4

---

## Ce que nous avons vu

✅ **Module 8** : Docker Registry Privé
- Registry local avec registry:2
- Tag et push d'images
- Authentification et TLS
- Harbor et GHCR

✅ **Module 9** : Docker Compose
- Structure docker-compose.yml
- Services, volumes, networks
- depends_on et health checks
- Commandes Compose
- Best practices

✅ **Démo** : WordPress avec MySQL

✅ **TP4** : Stack complète multi-services

---

## Points clés à retenir

🏪 Registry privé = Contrôle total sur les images

🐙 Docker Compose = Un fichier pour toute la stack

🔗 Services communiquent par nom DNS

💾 Volumes nommés = Persistance garantie

⚡ depends_on + healthcheck = Démarrage ordonné

---

## Demain (Jour 5)

**Module 10** : Sécurité et best practices
**Module 11** : Production et monitoring
**Projet final** : Déployer une application complète
**QCM** : Évaluation finale

**Prérequis** :
- Docker Compose maîtrisé
- Stack multi-services déployée (TP4)
- Comprendre volumes et networking

---

<!-- _class: lead -->

# Questions ?

**À demain pour le Jour 5 (dernier jour) !** 🚀

---

<!-- _class: lead -->

# Merci !

**Formation Docker - Jour 4**
M2 ESTD - Architecte Web

📧 fabrice.claeys@groupe-bao.fr
