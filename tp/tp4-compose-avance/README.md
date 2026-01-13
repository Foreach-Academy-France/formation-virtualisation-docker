# TP4 : Stack Applicative avec Docker Compose

## 🎯 Objectifs pédagogiques

À la fin de ce TP, vous serez capable de :
- ✅ Créer un fichier docker-compose.yml complet
- ✅ Orchestrer plusieurs services (frontend, backend, database, cache)
- ✅ Configurer les dépendances entre services
- ✅ Gérer volumes et réseaux avec Compose
- ✅ Utiliser health checks pour démarrage ordonné
- ✅ Déployer une stack production-ready

**Compétence C30** : Créer et mettre en place des environnements Docker pour la production

## ⏱️ Durée

**1h45** (4 parties progressives)

## 📋 Prérequis

- Docker et Docker Compose installés
- Avoir terminé les TP 1-3
- Comprendre volumes et networking
- Avoir suivi le cours Jour 4 (Docker Compose)

## 📦 Application fournie

Une stack applicative complète de type **Blog** :

**Frontend** :
- Nginx servant une interface HTML/JS
- Appelle l'API backend via fetch

**Backend** :
- API REST Node.js/Express
- CRUD Articles
- Connexion PostgreSQL + Redis

**Database** :
- PostgreSQL pour stockage permanent
- Redis pour cache des requêtes

**Architecture** :
```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌───────┐
│ Frontend │ --> │ Backend  │ --> │PostgreSQL│     │ Redis │
│  Nginx   │     │  Express │     │   DB     │ <-- │ Cache │
│  :80     │     │  :3000   │     │  :5432   │     │ :6379 │
└──────────┘     └──────────┘     └──────────┘     └───────┘
```

## 📁 Structure du TP

```
tp4-compose-avance/
├── README.md
├── frontend/
│   ├── index.html
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   ├── src/
│   │   └── server.js
│   ├── package.json
│   └── Dockerfile
├── exercices/
│   ├── partie1-basic-compose.md
│   ├── partie2-volumes-networks.md
│   ├── partie3-healthchecks.md
│   └── partie4-production.md
└── solution/
    ├── docker-compose.yml
    ├── docker-compose.prod.yml
    └── EXPLANATIONS.md
```

## 🚀 Préparation

### 1. Explorer l'application

**Frontend** :
```bash
cd frontend/
cat index.html     # Interface utilisateur
cat nginx.conf     # Configuration Nginx
cat Dockerfile     # Dockerfile Nginx
```

**Backend** :
```bash
cd backend/
cat src/server.js  # API Express
cat package.json   # Dépendances
cat Dockerfile     # Dockerfile API
```

---

## 📝 Exercices

### Partie 1 : docker-compose.yml basique (30 min)

**Objectif** : Créer la stack minimale fonctionnelle

📖 **Énoncé** : `exercices/partie1-basic-compose.md`

**À créer** : `docker-compose.yml` à la racine

**Services à définir** :

1. **PostgreSQL** :
```yaml
db:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: blogdb
    POSTGRES_USER: bloguser
    POSTGRES_PASSWORD: blogpass
```

2. **Redis** :
```yaml
redis:
  image: redis:alpine
```

3. **Backend** :
```yaml
api:
  build: ./backend
  ports:
    - "3000:3000"
  environment:
    DATABASE_URL: postgres://bloguser:blogpass@db:5432/blogdb
    REDIS_URL: redis://redis:6379
  depends_on:
    - db
    - redis
```

4. **Frontend** :
```yaml
web:
  build: ./frontend
  ports:
    - "8080:80"
  depends_on:
    - api
```

**Validation** :
```bash
docker-compose up -d
docker-compose ps
# → 4 services UP

# Tester dans le navigateur
open http://localhost:8080
```

---

### Partie 2 : Volumes et networks (30 min)

**Objectif** : Ajouter persistance et isolation réseau

📖 **Énoncé** : `exercices/partie2-volumes-networks.md`

**Volumes à ajouter** :

```yaml
services:
  db:
    volumes:
      - pgdata:/var/lib/postgresql/data

  web:
    volumes:
      - ./frontend/nginx.conf:/etc/nginx/nginx.conf:ro

volumes:
  pgdata:
    driver: local
```

**Networks à créer** :

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

  redis:
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true    # Pas d'accès externe
```

**Test de persistance** :
1. Créer des articles
2. `docker-compose down`
3. `docker-compose up -d`
4. Vérifier que les articles existent toujours

---

### Partie 3 : Health checks (30 min)

**Objectif** : Démarrage ordonné et robuste

📖 **Énoncé** : `exercices/partie3-healthchecks.md`

**Health checks à ajouter** :

```yaml
services:
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bloguser"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 10s

  redis:
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  api:
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
```

**Validation** :
```bash
docker-compose up -d
docker-compose ps
# → Health status doit être "healthy" pour tous
```

---

### Partie 4 : Configuration production (15 min)

**Objectif** : Fichier Compose pour production

📖 **Énoncé** : `exercices/partie4-production.md`

**Créer** : `docker-compose.prod.yml`

**Ajouts production** :

```yaml
services:
  api:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  db:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
```

**Lancement** :
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## ✅ Validation finale

**Checklist complète** :

- [ ] 4 services définis (web, api, db, redis)
- [ ] Volumes pour PostgreSQL
- [ ] 2 réseaux (frontend, backend)
- [ ] Health checks configurés
- [ ] depends_on avec conditions
- [ ] Stack démarre avec `docker-compose up -d`
- [ ] Interface accessible sur http://localhost:8080
- [ ] Articles persistent après `down` → `up`
- [ ] Logs accessibles avec `docker-compose logs`

**Test de l'API** :
```bash
# Health check
curl http://localhost:3000/health

# Créer un article
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"Docker Compose","content":"Super outil!"}'

# Lister
curl http://localhost:3000/articles
```

---

## 🏆 Bonus

**Pour aller plus loin** :

1. **Ajouter PHPMyAdmin** :
```yaml
  phpmyadmin:
    image: phpmyadmin
    ports:
      - "8081:80"
    environment:
      PMA_HOST: db
```

2. **Nginx reverse proxy** :
   - Toutes les requêtes via Nginx
   - `/` → Frontend
   - `/api` → Backend API

3. **Traefik** :
   - Load balancer automatique
   - HTTPS avec Let's Encrypt

4. **Monitoring** :
   - Prometheus + Grafana
   - Metrics de tous les services

---

## 🐛 Troubleshooting

### Services ne démarrent pas dans l'ordre

**Cause** : depends_on sans health check

**Solution** :
```yaml
depends_on:
  db:
    condition: service_healthy  # ← Ajouter condition
```

### API ne se connecte pas à PostgreSQL

**Causes** :
1. PostgreSQL pas sur le réseau `backend`
2. Mauvaise DATABASE_URL
3. PostgreSQL pas encore prêt

**Vérification** :
```bash
docker-compose logs db
docker-compose logs api
docker-compose exec api ping db
```

### Volumes ne persistent pas

**Cause** : Section `volumes:` manquante

**Solution** :
```yaml
volumes:
  pgdata:    # ← Déclarer le volume
```

### Port déjà utilisé

**Erreur** : `port is already allocated`

**Solution** : Changer le port
```yaml
ports:
  - "8081:80"  # Au lieu de 8080
```

---

## 📚 Solution

Solution complète dans `solution/` :
- `docker-compose.yml` : Stack complète avec tous les services
- `docker-compose.prod.yml` : Override pour production
- `EXPLANATIONS.md` : Explications ligne par ligne

⚠️ **N'ouvrez qu'après avoir terminé**

---

## 🎓 Points clés à retenir

1. **docker-compose.yml** → Infrastructure as Code
2. **Services par nom** → DNS automatique
3. **depends_on + healthcheck** → Démarrage ordonné
4. **Volumes nommés** → Persistance
5. **Networks** → Isolation et sécurité

---

## 📖 Ressources

- [Docker Compose File Reference](https://docs.docker.com/compose/compose-file/)
- [Compose CLI Reference](https://docs.docker.com/compose/reference/)
- [Networking in Compose](https://docs.docker.com/compose/networking/)
- [Environment Variables](https://docs.docker.com/compose/environment-variables/)

---

**Bon courage avec le TP4 ! 🚀**
