# TP2 : Dockeriser une Application

## 🎯 Objectifs pédagogiques

À la fin de ce TP, vous serez capable de :
- ✅ Écrire un Dockerfile pour une application Node.js
- ✅ Appliquer les best practices Docker
- ✅ Optimiser la taille d'une image
- ✅ Implémenter un health check
- ✅ Utiliser .dockerignore
- ✅ Builder et tester des images Docker

**Compétence C30** : Créer et mettre en place des environnements Docker

## ⏱️ Durée

**1h45** (3 parties progressives)

## 📋 Prérequis

- Docker installé et fonctionnel
- Éditeur de code (VS Code recommandé)
- Connaissances de base en Node.js/Express
- Avoir suivi le cours Jour 2 (Dockerfile)

## 📦 Application fournie

L'application est une **Todo API** REST simple en Node.js/Express.

**Fonctionnalités** :
- `GET /todos` - Liste des todos
- `POST /todos` - Créer un todo
- `GET /todos/:id` - Récupérer un todo
- `PUT /todos/:id` - Modifier un todo
- `DELETE /todos/:id` - Supprimer un todo
- `GET /health` - Health check

**Stack technique** :
- Node.js 18
- Express 4
- Stockage en mémoire (pas de base de données)

## 📁 Structure du TP

```
tp2-dockeriser-app/
├── README.md                  # Ce fichier
├── app/                       # Application à dockeriser
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   └── models/
│   ├── package.json
│   └── package-lock.json
├── exercices/                 # Énoncés des exercices
│   ├── partie1-basic.md
│   ├── partie2-optimize.md
│   └── partie3-bonus.md
├── solution/                  # Solution complète
│   ├── Dockerfile
│   ├── .dockerignore
│   └── EXPLANATIONS.md
└── validation/                # Tests de validation
    └── validate.sh
```

## 🚀 Instructions de démarrage

### 1. Tester l'application localement

Avant de dockeriser, vérifiez que l'app fonctionne :

```bash
cd app/
npm install
npm start
```

Testez dans un autre terminal :

```bash
# Health check
curl http://localhost:3000/health

# Lister les todos
curl http://localhost:3000/todos

# Créer un todo
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Apprendre Docker","completed":false}'

# Lister à nouveau
curl http://localhost:3000/todos
```

Si tout fonctionne, stoppez le serveur (Ctrl+C) et passez aux exercices.

## 📝 Exercices

### Partie 1 : Dockerfile de base (30 min)

**Objectif** : Créer un Dockerfile fonctionnel

📖 **Énoncé** : `exercices/partie1-basic.md`

**Checklist** :
- [ ] Créer un fichier `Dockerfile` à la racine de `app/`
- [ ] Utiliser `node:18-alpine` comme base
- [ ] Définir `/app` comme WORKDIR
- [ ] Copier `package*.json`
- [ ] Installer les dépendances
- [ ] Copier le code source
- [ ] Exposer le port 3000
- [ ] Définir la commande de démarrage

**Validation** :

```bash
# Builder l'image
docker build -t todo-api:basic ./app

# Vérifier la taille
docker images | grep todo-api

# Lancer le conteneur
docker run -d -p 3000:3000 --name todo-basic todo-api:basic

# Tester
curl http://localhost:3000/health
curl http://localhost:3000/todos

# Cleanup
docker stop todo-basic && docker rm todo-basic
```

**Critères de réussite** :
- ✅ Image build sans erreur
- ✅ Conteneur démarre correctement
- ✅ API répond sur port 3000
- ✅ Health check retourne `{"status":"healthy"}`

---

### Partie 2 : Optimisations (45 min)

**Objectif** : Appliquer les best practices

📖 **Énoncé** : `exercices/partie2-optimize.md`

**Améliorations à implémenter** :

1. **`.dockerignore`** :
   - [ ] Créer un fichier `.dockerignore`
   - [ ] Exclure `node_modules`, `.git`, `*.md`, etc.

2. **npm ci** :
   - [ ] Remplacer `npm install` par `npm ci --only=production`
   - [ ] Ajouter `npm cache clean --force`

3. **Utilisateur non-root** :
   - [ ] Créer un utilisateur `appuser` et groupe `appgroup`
   - [ ] Changer les permissions avec `--chown`
   - [ ] Basculer sur `USER appuser`

4. **Health check** :
   - [ ] Ajouter `HEALTHCHECK` avec intervalle 30s
   - [ ] Commande : vérifier `/health` endpoint

5. **Labels** :
   - [ ] Ajouter métadonnées (maintainer, version, description)

6. **Optimisation layers** :
   - [ ] Regrouper les commandes RUN avec `&&`
   - [ ] Minimiser le nombre de layers

**Validation** :

```bash
# Builder la version optimisée
docker build -t todo-api:optimized ./app

# Comparer les tailles
docker images | grep todo-api

# Lancer avec health check
docker run -d -p 3000:3000 --name todo-optimized todo-api:optimized

# Attendre 30s et vérifier le health status
sleep 30
docker ps
# → devrait afficher "healthy"

# Inspecter l'utilisateur
docker exec todo-optimized whoami
# → devrait afficher "appuser" (pas root)

# Cleanup
docker stop todo-optimized && docker rm todo-optimized
```

**Critères de réussite** :
- ✅ Image < 180 MB (Alpine)
- ✅ Conteneur démarre en < 2 secondes
- ✅ Health check affiche "healthy" après 30s
- ✅ Utilisateur non-root
- ✅ Labels présents

---

### Partie 3 : Challenges Bonus (30 min)

**Objectif** : Aller plus loin

📖 **Énoncé** : `exercices/partie3-bonus.md`

**Challenges** :

1. **Multi-stage build** (si app TypeScript) :
   - Stage 1 : Build avec devDependencies
   - Stage 2 : Production avec code compilé uniquement

2. **Variables d'environnement** :
   - Supporter `PORT`, `NODE_ENV` via `ENV`
   - Tester avec `-e PORT=4000`

3. **Docker Compose** :
   - Créer `docker-compose.yml`
   - Ajouter PostgreSQL (bonus++)

4. **Volumes** :
   - Monter les logs en volume
   - Tester la persistence

**Validation** :

```bash
# Test variables d'environnement
docker run -d -p 4000:4000 -e PORT=4000 --name todo-env todo-api:optimized
curl http://localhost:4000/health

# Test Docker Compose
docker-compose up -d
docker-compose ps
docker-compose logs
docker-compose down
```

---

## ✅ Validation finale

Utilisez le script de validation fourni :

```bash
cd validation/
chmod +x validate.sh
./validate.sh
```

Le script vérifie :
- ✅ Dockerfile existe
- ✅ .dockerignore existe
- ✅ Image build correctement
- ✅ Conteneur démarre
- ✅ Health check fonctionne
- ✅ API répond correctement
- ✅ Utilisateur non-root

**Score attendu** : 100/100

---

## 📚 Solution

Une solution complète est disponible dans `solution/` avec :
- `Dockerfile` optimisé commenté
- `.dockerignore` complet
- `EXPLANATIONS.md` détaillant chaque choix

⚠️ **N'ouvrez la solution qu'après avoir terminé les exercices**

---

## 🎓 Points clés à retenir

1. **FROM node:18-alpine** → Image de base légère
2. **WORKDIR /app** → Définir le répertoire de travail
3. **COPY package*.json puis RUN npm ci** → Optimiser le cache
4. **USER non-root** → Sécurité
5. **HEALTHCHECK** → Monitoring
6. **.dockerignore** → Build rapide

---

## 🐛 Troubleshooting

### Erreur : "Cannot find module 'express'"

**Cause** : Dépendances pas installées

**Solution** :
```dockerfile
RUN npm ci --only=production
```

### Erreur : "Permission denied"

**Cause** : Utilisateur non-root sans permissions

**Solution** :
```dockerfile
COPY --chown=appuser:appgroup . .
```

### Conteneur "unhealthy"

**Cause** : Health check endpoint ne répond pas

**Vérification** :
```bash
docker logs <container-id>
docker exec <container-id> wget -O- http://localhost:3000/health
```

### Image trop grosse (> 300 MB)

**Causes possibles** :
- node_modules copié dans l'image (vérifier .dockerignore)
- Image de base node:18 au lieu de node:18-alpine
- devDependencies installées

---

## 📖 Ressources

- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Node.js Docker Guide](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [Health Check](https://docs.docker.com/engine/reference/builder/#healthcheck)

---

## 🏆 Challenge Final

**Pour les plus rapides** :

Dockerisez une de vos applications personnelles en appliquant TOUTES les best practices apprises aujourd'hui.

**Objectif** :
- Image optimisée (< 200 MB)
- Multi-stage si applicable
- Health check fonctionnel
- Documentation complète

Présentez votre travail au formateur pour obtenir un feedback !

---

**Bon courage ! 🚀**
