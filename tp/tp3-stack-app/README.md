# TP3 : Application avec Base de Données et Volumes

## 🎯 Objectifs pédagogiques

À la fin de ce TP, vous serez capable de :
- ✅ Créer et gérer des volumes Docker
- ✅ Connecter une application à une base de données
- ✅ Utiliser Docker networking
- ✅ Persister des données avec PostgreSQL
- ✅ Tester la résilience des données
- ✅ Faire des backups de volumes

**Compétence C30** : Créer et mettre en place des environnements Docker pour la production

## ⏱️ Durée

**1h45** (3 parties progressives)

## 📋 Prérequis

- Docker installé et fonctionnel
- Avoir terminé le TP2 (Dockeriser une app)
- Connaissances de base en PostgreSQL
- Avoir suivi le cours Jour 3 (Volumes)

## 📦 Application fournie

L'application est une **Users API** REST avec PostgreSQL.

**Fonctionnalités** :
- `GET /users` - Liste des utilisateurs
- `POST /users` - Créer un utilisateur
- `GET /users/:id` - Récupérer un utilisateur
- `PUT /users/:id` - Modifier un utilisateur
- `DELETE /users/:id` - Supprimer un utilisateur
- `GET /health` - Health check (inclut status DB)

**Stack technique** :
- Node.js 18 + Express
- pg (PostgreSQL client)
- PostgreSQL 15

## 📁 Structure du TP

```
tp3-stack-app/
├── README.md                  # Ce fichier
├── app/                       # Application backend
│   ├── src/
│   │   ├── server.js
│   │   ├── db.js
│   │   └── init.sql
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── exercices/                 # Énoncés
│   ├── partie1-database.md
│   ├── partie2-networking.md
│   └── partie3-persistence.md
└── solution/                  # Solution complète
    ├── commands.sh
    ├── docker-compose.yml
    └── EXPLANATIONS.md
```

## 🚀 Préparation

### 1. Comprendre l'application

**Regardez le code** :

```bash
cd app/
cat src/server.js    # API Express
cat src/db.js        # Client PostgreSQL
cat src/init.sql     # Schéma de base
cat package.json     # Dépendances
```

**Configuration** :

L'app utilise une variable d'environnement `DATABASE_URL` :
```
DATABASE_URL=postgres://user:password@host:5432/database
```

---

## 📝 Exercices

### Partie 1 : PostgreSQL avec volume (30 min)

**Objectif** : Lancer PostgreSQL avec persistance

📖 **Énoncé** : `exercices/partie1-database.md`

**Étapes** :

1. **Créer un volume pour PostgreSQL** :
```bash
docker volume create tp3-pgdata
```

2. **Lancer PostgreSQL** :
```bash
docker run -d \
  --name tp3-db \
  -e POSTGRES_USER=dbuser \
  -e POSTGRES_PASSWORD=dbpass \
  -e POSTGRES_DB=usersdb \
  -v tp3-pgdata:/var/lib/postgresql/data \
  postgres:15-alpine
```

3. **Vérifier que PostgreSQL est prêt** :
```bash
docker logs tp3-db
# Attendre "database system is ready to accept connections"
```

4. **Tester la connexion** :
```bash
docker exec -it tp3-db psql -U dbuser -d usersdb
# Dans psql :
\dt
\q
```

**Validation** :
- ✅ Volume `tp3-pgdata` créé
- ✅ PostgreSQL démarre sans erreur
- ✅ Connexion psql fonctionne

---

### Partie 2 : Backend avec networking (45 min)

**Objectif** : Connecter l'API à PostgreSQL via réseau Docker

📖 **Énoncé** : `exercices/partie2-networking.md`

**Étapes** :

1. **Créer un réseau** :
```bash
docker network create tp3-network
```

2. **Connecter PostgreSQL au réseau** :
```bash
docker network connect tp3-network tp3-db
```

3. **Builder l'image de l'API** :
```bash
cd app/
docker build -t tp3-api .
```

4. **Lancer l'API sur le réseau** :
```bash
docker run -d \
  --name tp3-api \
  --network tp3-network \
  -p 3000:3000 \
  -e DATABASE_URL=postgres://dbuser:dbpass@tp3-db:5432/usersdb \
  tp3-api
```

5. **Tester l'API** :
```bash
# Health check (doit montrer database: connected)
curl http://localhost:3000/health | jq .

# Créer un utilisateur
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","age":25}'

# Lister les utilisateurs
curl http://localhost:3000/users | jq .

# Récupérer un utilisateur
curl http://localhost:3000/users/1 | jq .
```

**Validation** :
- ✅ Réseau `tp3-network` créé
- ✅ API build sans erreur
- ✅ API démarre et se connecte à PostgreSQL
- ✅ Endpoints CRUD fonctionnent
- ✅ Health check montre `database: connected`

---

### Partie 3 : Tester la persistance (30 min)

**Objectif** : Vérifier que les données survivent

📖 **Énoncé** : `exercices/partie3-persistence.md`

**Scénario de test** :

1. **Créer des utilisateurs** :
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@example.com","age":30}'

curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie","email":"charlie@example.com","age":35}'

# Vérifier (devrait avoir 3 users : Alice, Bob, Charlie)
curl http://localhost:3000/users | jq '.users | length'
```

2. **Supprimer TOUS les conteneurs** :
```bash
docker rm -f tp3-api tp3-db
```

3. **Vérifier que le volume existe toujours** :
```bash
docker volume ls | grep tp3-pgdata
# → Le volume est toujours là ✅
```

4. **Recréer les conteneurs** :
```bash
# PostgreSQL
docker run -d \
  --name tp3-db \
  --network tp3-network \
  -e POSTGRES_USER=dbuser \
  -e POSTGRES_PASSWORD=dbpass \
  -e POSTGRES_DB=usersdb \
  -v tp3-pgdata:/var/lib/postgresql/data \
  postgres:15-alpine

# Attendre
sleep 5

# API
docker run -d \
  --name tp3-api \
  --network tp3-network \
  -p 3000:3000 \
  -e DATABASE_URL=postgres://dbuser:dbpass@tp3-db:5432/usersdb \
  tp3-api

# Attendre
sleep 3
```

5. **Vérifier que les données existent** :
```bash
curl http://localhost:3000/users | jq .
# → Alice, Bob, Charlie sont toujours là ! 🎉
```

**Critères de réussite** :
- ✅ Conteneurs supprimés et recréés
- ✅ Volume conservé
- ✅ Données toujours accessibles via l'API
- ✅ 3 utilisateurs présents

---

## 🏆 Bonus : Backup et monitoring

### Bonus 1 : Backup du volume

```bash
# Créer un backup
docker run --rm \
  -v tp3-pgdata:/data:ro \
  -v $(pwd):/backup \
  alpine tar czf /backup/tp3-backup.tar.gz -C /data .

# Vérifier la taille
ls -lh tp3-backup.tar.gz
```

### Bonus 2 : Monitoring

```bash
# Stats en temps réel
docker stats tp3-api tp3-db

# Logs de l'API
docker logs -f tp3-api

# Inspecter la DB
docker inspect tp3-db --format='{{.Mounts}}'
```

### Bonus 3 : Ajouter Redis

```bash
# Lancer Redis
docker run -d \
  --name tp3-redis \
  --network tp3-network \
  redis:alpine

# Modifier l'API pour utiliser Redis comme cache
# (Code fourni dans solution/with-redis/)
```

---

## ✅ Validation finale

**Checklist complète** :

- [ ] Volume `tp3-pgdata` créé
- [ ] PostgreSQL démarre avec le volume
- [ ] Réseau `tp3-network` créé
- [ ] API connectée à PostgreSQL via le réseau
- [ ] Endpoints CRUD fonctionnent
- [ ] Données persistent après suppression des conteneurs
- [ ] Health check API montre `database: connected`
- [ ] Backup créé avec succès

**Commande de vérification rapide** :

```bash
# Tout devrait être UP
docker ps
curl http://localhost:3000/health
curl http://localhost:3000/users
```

---

## 🐛 Troubleshooting

### API ne se connecte pas à PostgreSQL

**Erreur** : `ECONNREFUSED` ou `getaddrinfo ENOTFOUND`

**Causes possibles** :
1. PostgreSQL pas sur le même réseau
2. Mauvais nom d'hôte dans DATABASE_URL
3. PostgreSQL pas encore prêt

**Solutions** :
```bash
# Vérifier le réseau
docker network inspect tp3-network

# Vérifier les logs PostgreSQL
docker logs tp3-db

# Tester la connexion réseau
docker exec tp3-api ping tp3-db
```

### Données ne persistent pas

**Cause** : Volume pas utilisé ou supprimé

**Vérification** :
```bash
# Le volume existe ?
docker volume ls | grep tp3-pgdata

# Le conteneur utilise le volume ?
docker inspect tp3-db --format='{{.Mounts}}'

# Vérifier que Destination = /var/lib/postgresql/data
```

### Permission denied sur volume

**Cause** : Problème de permissions avec bind mount

**Solution** : Utiliser volumes nommés (gérés par Docker) au lieu de bind mounts

---

## 📚 Solution

Solution complète dans `solution/` :
- `commands.sh` : Toutes les commandes à exécuter
- `docker-compose.yml` : Version simplifiée avec Compose
- `EXPLANATIONS.md` : Explications détaillées

⚠️ **N'ouvrez qu'après avoir terminé**

---

## 🎓 Points clés à retenir

1. **Volumes nommés** → Gérés par Docker, faciles à gérer
2. **Network** → Communication entre conteneurs par nom
3. **DATABASE_URL** → Configuration via variables d'env
4. **Health check** → Vérifier la connexion DB
5. **Persistance** → Les données survivent aux conteneurs

---

## 📖 Ressources

- [Docker Volumes](https://docs.docker.com/storage/volumes/)
- [Docker Networks](https://docs.docker.com/network/)
- [PostgreSQL Official Image](https://hub.docker.com/_/postgres)
- [pg (node-postgres)](https://node-postgres.com/)

---

**Bon courage avec le TP3 ! 🚀**
