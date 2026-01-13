# Solution TP4 - Explications Détaillées

## 🎯 Vue d'ensemble

Cette solution démontre une stack complète production-ready avec Docker Compose :
- ✅ 4 services orchestrés
- ✅ 2 réseaux isolés (frontend/backend)
- ✅ Volumes pour persistance
- ✅ Health checks pour démarrage ordonné
- ✅ Restart policies
- ✅ Isolation de sécurité

**Architecture** :

```
Internet
   ↓
┌──────────────┐
│   Frontend   │ (frontend network)
│   Nginx:80   │
└──────┬───────┘
       ↓
┌──────────────┐ (frontend + backend networks)
│   Backend    │
│   Express    │
│   :3000      │
└──────┬───────┘
       ↓
┌──────────────┐ ┌──────────────┐ (backend network - internal)
│  PostgreSQL  │ │    Redis     │
│   :5432      │ │    :6379     │
└──────────────┘ └──────────────┘
```

---

## 📝 docker-compose.yml ligne par ligne

### Version

```yaml
version: '3.8'
```

**Version Compose** :
- `3.8` : Dernière version Compose v3
- Supporte health checks avec conditions
- Compatible Docker 19.03+

---

### Service : PostgreSQL

```yaml
db:
  image: postgres:15-alpine
  container_name: tp4-db
```

**Image** : Alpine pour réduire la taille
**container_name** : Nom fixe pour faciliter le debug

```yaml
  environment:
    POSTGRES_DB: blogdb
    POSTGRES_USER: bloguser
    POSTGRES_PASSWORD: blogpass
```

**Variables PostgreSQL** :
- Crée automatiquement la base `blogdb`
- Utilisateur `bloguser` avec password `blogpass`

```yaml
  volumes:
    - pgdata:/var/lib/postgresql/data
```

**Volume nommé** : Les données survivent à `docker-compose down`

```yaml
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U bloguser -d blogdb"]
    interval: 10s
    timeout: 3s
    retries: 5
    start_period: 10s
```

**Health check** :
- `pg_isready` : Commande PostgreSQL pour vérifier la disponibilité
- `start_period: 10s` : Attend 10s avant de commencer les checks
- `retries: 5` : 5 échecs avant "unhealthy"

```yaml
  networks:
    - backend
```

**Réseau backend** : Isolé (pas d'accès direct depuis l'extérieur)

```yaml
  restart: unless-stopped
```

**Restart policy** : Redémarre sauf si stoppé manuellement

---

### Service : Redis

```yaml
redis:
  image: redis:alpine
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
```

**Simple et efficace** :
- Image Alpine (5 MB)
- Health check avec `redis-cli ping` (répond "PONG")
- Réseau backend uniquement

---

### Service : Backend API

```yaml
api:
  build: ../backend
```

**Build** : Utilise le Dockerfile dans `backend/`

```yaml
  ports:
    - "3000:3000"
```

**Exposition** : API accessible sur http://localhost:3000

```yaml
  environment:
    DATABASE_URL: postgres://bloguser:blogpass@db:5432/blogdb
    REDIS_URL: redis://redis:6379
```

**Configuration** :
- `db:5432` : Nom du service (DNS automatique)
- `redis:6379` : Idem pour Redis

```yaml
  networks:
    - frontend  # Accessible par le frontend
    - backend   # Accès à DB et Redis
```

**Dual network** : Pont entre frontend et backend

```yaml
  depends_on:
    db:
      condition: service_healthy
    redis:
      condition: service_healthy
```

**Démarrage ordonné** :
- Attend que PostgreSQL soit "healthy"
- Attend que Redis soit "healthy"
- Seulement après, démarre l'API

**Sans condition** : L'API démarrerait avant que PostgreSQL soit prêt → erreurs de connexion

---

### Service : Frontend

```yaml
web:
  build: ../frontend
  ports:
    - "8080:80"
  networks:
    - frontend
  depends_on:
    - api
```

**Simple** :
- Build Nginx avec index.html
- Accessible sur http://localhost:8080
- Réseau frontend uniquement (pas d'accès direct à DB)

---

### Volumes

```yaml
volumes:
  pgdata:
    driver: local
```

**Volume nommé** :
- Géré par Docker
- Survit à `docker-compose down`
- Supprimé uniquement avec `docker-compose down -v`

---

### Networks

```yaml
networks:
  frontend:
    driver: bridge

  backend:
    driver: bridge
    internal: true  # Pas d'accès externe
```

**Isolation** :
- **Frontend** : Web + API (accès externe possible)
- **Backend** : API + DB + Redis (isolé)
- **Résultat** : Impossible d'accéder à PostgreSQL depuis l'extérieur

---

## 🚀 Utilisation

### Démarrer la stack

```bash
# Build + démarrer
docker-compose up -d

# Voir les services
docker-compose ps

# Suivre les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f api
```

### Tester l'application

```bash
# Health check
curl http://localhost:3000/health

# Articles
curl http://localhost:3000/articles

# Interface web
open http://localhost:8080
```

### Commandes utiles

```bash
# Redémarrer un service
docker-compose restart api

# Rebuild un service
docker-compose build api
docker-compose up -d --no-deps api

# Exécuter une commande
docker-compose exec db psql -U bloguser -d blogdb

# Voir les stats
docker stats

# Cleanup
docker-compose down
docker-compose down -v  # Avec volumes
```

---

## 🎯 Points clés

1. **Un fichier** → Toute l'infrastructure
2. **depends_on + healthcheck** → Pas d'erreurs de connexion
3. **Networks** → Isolation DB/Redis
4. **Volumes** → Données persistent
5. **container_name** → Debug plus facile

---

## 🐛 Troubleshooting

### API : "ECONNREFUSED db:5432"

**Causes** :
1. PostgreSQL pas sur le réseau `backend`
2. Health check pas configuré (API démarre trop tôt)

**Solution** :
```yaml
depends_on:
  db:
    condition: service_healthy  # ← Important!
```

### "port is already allocated"

**Cause** : Port 3000 ou 8080 déjà utilisé

**Solutions** :
```bash
# Voir qui utilise le port
lsof -i :3000
lsof -i :8080

# Changer le port dans docker-compose.yml
ports:
  - "3001:3000"  # Au lieu de 3000:3000
```

### Volumes ne persistent pas

**Cause** : Section `volumes:` manquante en bas du fichier

**Solution** :
```yaml
volumes:
  pgdata:  # ← Déclarer le volume
```

### Services démarrent dans le mauvais ordre

**Cause** : `depends_on` sans `condition`

**Solution** :
```yaml
depends_on:
  db:
    condition: service_healthy  # Attend health check
```

---

## 🔥 Alternatives et Variantes

### Utiliser .env pour les secrets

**.env** :
```
POSTGRES_PASSWORD=blogpass
REDIS_PASSWORD=secret123
```

**docker-compose.yml** :
```yaml
services:
  db:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

### Ajouter Nginx reverse proxy

```yaml
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/nginx.conf
    depends_on:
      - api
      - web
```

**nginx-proxy.conf** :
```nginx
location / {
    proxy_pass http://web:80;
}

location /api {
    proxy_pass http://api:3000;
}
```

---

**Félicitations ! Vous maîtrisez maintenant Docker Compose ! 🎉**
