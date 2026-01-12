# Solution TP3 - Explications Détaillées

## 🎯 Vue d'ensemble

Ce TP démontre :
- ✅ Volumes Docker pour persistance PostgreSQL
- ✅ Networking pour communication inter-conteneurs
- ✅ Application backend connectée à une base de données
- ✅ Résilience des données (survivent à la suppression des conteneurs)

**Architecture** :
```
┌─────────────┐      Docker Network      ┌──────────────┐
│   API       │ ←─────────────────────→  │  PostgreSQL  │
│  (port3000) │    tp3-db:5432           │  (volume)    │
└─────────────┘                          └──────────────┘
                                              │
                                         tp3-pgdata
                                         (persist!)
```

---

## 📝 Partie 1 : PostgreSQL avec volume

### Créer un volume

```bash
docker volume create tp3-pgdata
```

**Pourquoi un volume nommé ?**
- ✅ Facile à identifier
- ✅ Réutilisable
- ✅ Survit à la suppression du conteneur
- ✅ Facile à sauvegarder

**Alternative (déconseillée)** :
```bash
# Volume anonyme (hash aléatoire)
docker run -v /var/lib/postgresql/data postgres
```

### Lancer PostgreSQL

```bash
docker run -d \
  --name tp3-db \
  -e POSTGRES_USER=dbuser \
  -e POSTGRES_PASSWORD=dbpass \
  -e POSTGRES_DB=usersdb \
  -v tp3-pgdata:/var/lib/postgresql/data \
  postgres:15-alpine
```

**Variables d'environnement** :
- `POSTGRES_USER` : Utilisateur PostgreSQL (défaut: postgres)
- `POSTGRES_PASSWORD` : **Obligatoire** pour PostgreSQL
- `POSTGRES_DB` : Base de données à créer automatiquement

**Volume mount** :
- `tp3-pgdata` → `/var/lib/postgresql/data`
- C'est là que PostgreSQL stocke toutes ses données

### Vérifier

```bash
# Logs (doit afficher "database system is ready")
docker logs tp3-db

# Connexion psql
docker exec -it tp3-db psql -U dbuser -d usersdb

# Lister les bases
\l

# Quitter
\q
```

---

## 📝 Partie 2 : Backend avec networking

### Pourquoi un réseau Docker ?

**Sans réseau personnalisé** :
- ❌ Conteneurs sur le réseau `bridge` par défaut
- ❌ Communication par IP uniquement (fragile)
- ❌ Pas de résolution DNS automatique

**Avec réseau personnalisé** :
- ✅ Résolution DNS par nom de conteneur
- ✅ `tp3-db` → IP automatiquement
- ✅ Isolation réseau

### Créer le réseau

```bash
docker network create tp3-network
```

**Alternatives** :
```bash
# Avec subnet spécifique
docker network create --subnet=172.20.0.0/16 tp3-network

# Avec gateway
docker network create --gateway=172.20.0.1 tp3-network
```

### Connecter PostgreSQL

```bash
docker network connect tp3-network tp3-db
```

**Pourquoi pas au lancement ?**

Méthode alternative (recommandée) :
```bash
docker run -d \
  --name tp3-db \
  --network tp3-network \  # ← Directement au lancement
  ...
```

### Builder et lancer l'API

```bash
# Build
cd app/
docker build -t tp3-api .

# Run
docker run -d \
  --name tp3-api \
  --network tp3-network \
  -p 3000:3000 \
  -e DATABASE_URL=postgres://dbuser:dbpass@tp3-db:5432/usersdb \
  tp3-api
```

**DATABASE_URL** :
- `tp3-db` : Nom du conteneur PostgreSQL (résolu par DNS Docker)
- Pas besoin d'IP hardcodée !

### Tester l'API

```bash
# Health check
curl http://localhost:3000/health | jq .
# → doit afficher "database: connected" ✅

# Créer un user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","age":25}' | jq .

# Lister
curl http://localhost:3000/users | jq .
```

---

## 📝 Partie 3 : Tester la persistance

### Le test ultime

**Scénario** :
1. Créer des données
2. **Supprimer tous les conteneurs**
3. Recréer les conteneurs avec le **même volume**
4. Vérifier que les données existent toujours

### Créer des données

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@example.com","age":30}'

curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie","email":"charlie@example.com","age":35}'

# Compter les users
curl -s http://localhost:3000/users | jq '.count'
# → 4 users (Admin, Demo, Alice, Bob, Charlie)
```

### Supprimer les conteneurs

```bash
docker rm -f tp3-api tp3-db
```

**Important** :
- Conteneurs supprimés ✅
- Volume `tp3-pgdata` TOUJOURS là ✅

### Recréer

```bash
# PostgreSQL (même commande qu'avant)
docker run -d \
  --name tp3-db \
  --network tp3-network \
  -e POSTGRES_USER=dbuser \
  -e POSTGRES_PASSWORD=dbpass \
  -e POSTGRES_DB=usersdb \
  -v tp3-pgdata:/var/lib/postgresql/data \
  postgres:15-alpine

sleep 8

# API (même commande qu'avant)
docker run -d \
  --name tp3-api \
  --network tp3-network \
  -p 3000:3000 \
  -e DATABASE_URL=postgres://dbuser:dbpass@tp3-db:5432/usersdb \
  tp3-api

sleep 5
```

### Vérifier

```bash
curl http://localhost:3000/users | jq '.users[] | {id, name, email}'
```

**Résultat attendu** : Les 4 utilisateurs sont toujours là ! 🎉

---

## 🐙 Solution Docker Compose

**Avantage** : Toute la stack en un fichier

```bash
cd solution/

# Lancer la stack complète
docker-compose up -d

# Vérifier
docker-compose ps
docker-compose logs

# Tester
curl http://localhost:3000/health | jq .

# Stopper
docker-compose down

# Stopper ET supprimer les volumes (⚠️ perte de données)
docker-compose down -v
```

**docker-compose.yml** :
- Service `db` avec volume `pgdata`
- Service `api` avec dépendance sur `db`
- Health checks pour les deux services
- Réseau automatique

---

## 🎯 Points clés

1. **Volume nommé** → Données persistent
2. **Network** → Communication par nom
3. **depends_on + healthcheck** → Démarrage ordonné
4. **Variables d'env** → Configuration flexible
5. **Health checks** → Monitoring automatique

---

## 🐛 Troubleshooting

### API : "ECONNREFUSED tp3-db:5432"

**Causes** :
1. PostgreSQL pas sur le même réseau
2. PostgreSQL pas encore prêt

**Solutions** :
```bash
# Vérifier le réseau
docker network inspect tp3-network | grep -A 5 Containers

# Attendre plus longtemps
sleep 10

# Vérifier les logs PostgreSQL
docker logs tp3-db | grep "ready to accept connections"
```

### API : "relation users does not exist"

**Cause** : Table pas créée

**Solution** :
- Le code `db.js` crée automatiquement la table
- Vérifier les logs de l'API : `docker logs tp3-api`
- Se connecter à PostgreSQL et vérifier : `docker exec tp3-db psql -U dbuser -d usersdb -c "\dt"`

### Données disparaissent après restart

**Causes** :
1. Volume anonyme utilisé (pas `tp3-pgdata`)
2. Volume supprimé avec `docker rm -v`
3. Mauvais chemin de montage

**Vérification** :
```bash
# Le volume existe ?
docker volume ls | grep tp3-pgdata

# Le conteneur utilise le bon volume ?
docker inspect tp3-db --format='{{range .Mounts}}{{.Name}} → {{.Destination}}{{end}}'
# → Doit afficher "tp3-pgdata → /var/lib/postgresql/data"
```

---

## 🚀 Pour aller plus loin

### Backup automatique

```bash
# Script de backup quotidien
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
docker run --rm \
  -v tp3-pgdata:/data:ro \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/pgdata-$DATE.tar.gz -C /data .
```

### Monitoring avec Prometheus

```yaml
# Ajouter au docker-compose.yml
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
```

### Scaling

```bash
# Lancer plusieurs instances de l'API
docker-compose up -d --scale api=3

# Load balancer
# (nécessite Nginx ou Traefik)
```

---

**Félicitations ! Vous maîtrisez maintenant les volumes et le networking Docker ! 🎉**
