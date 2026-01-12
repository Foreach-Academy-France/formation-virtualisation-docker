# Démo : Dockeriser une Application Node.js

## 🎯 Objectif

Démonstration en direct de la dockerisation d'une application Express simple, en montrant :
- La création d'un Dockerfile
- Les best practices
- L'optimisation multi-stage
- Les health checks

## 📁 Structure

```
demo-node-dockerfile/
├── README.md              # Ce fichier
├── app/                   # Application sans Docker
│   ├── src/
│   │   └── server.js
│   ├── package.json
│   └── package-lock.json
├── basic/                 # Dockerfile basique
│   ├── Dockerfile
│   └── .dockerignore
├── optimized/             # Dockerfile optimisé
│   ├── Dockerfile
│   └── .dockerignore
└── multi-stage/           # Multi-stage build
    ├── Dockerfile
    ├── .dockerignore
    └── tsconfig.json
```

## 🚀 Déroulement de la démo

### Étape 1 : Application de base

**Montrer le code** :

```bash
cd app/
cat src/server.js
cat package.json
```

**Tester l'app localement** :

```bash
npm install
node src/server.js
# Tester dans le navigateur : http://localhost:3000
curl http://localhost:3000/health
```

### Étape 2 : Dockerfile basique

**Créer le Dockerfile** :

```bash
cd ../basic/
cat Dockerfile
```

**Builder et lancer** :

```bash
# Build
docker build -t my-api:basic .

# Voir la taille
docker images | grep my-api

# Lancer
docker run -d -p 3000:3000 --name api-basic my-api:basic

# Tester
curl http://localhost:3000
curl http://localhost:3000/health

# Voir les logs
docker logs api-basic

# Cleanup
docker stop api-basic && docker rm api-basic
```

### Étape 3 : Dockerfile optimisé

**Montrer les optimisations** :

```bash
cd ../optimized/
cat Dockerfile
cat .dockerignore
```

**Amélioration** :
- ✅ npm ci au lieu de npm install
- ✅ Utilisateur non-root
- ✅ Health check
- ✅ Labels
- ✅ .dockerignore

**Builder et comparer** :

```bash
docker build -t my-api:optimized .

# Comparer les tailles
docker images | grep my-api

# Lancer avec health check
docker run -d -p 3000:3000 --name api-optimized my-api:optimized

# Voir le health check (attendre 30s)
docker ps

# Inspecter le health
docker inspect api-optimized | grep -A 10 Health

# Cleanup
docker stop api-optimized && docker rm api-optimized
```

### Étape 4 : Multi-stage build (Bonus)

**Pour application TypeScript** :

```bash
cd ../multi-stage/
cat Dockerfile
```

**Montrer la réduction de taille** :

```bash
# Build
docker build -t my-api:multi-stage .

# Comparer toutes les versions
docker images | grep my-api

# Résultat attendu :
# basic       : ~400 MB
# optimized   : ~180 MB
# multi-stage : ~150 MB
```

## 📝 Script de présentation

### Introduction (2 min)

"Aujourd'hui, nous allons dockeriser une application Node.js Express simple. L'application expose 2 endpoints : `/` et `/health`. Nous allons voir comment créer un Dockerfile, l'optimiser, et appliquer les best practices."

### Partie 1 : Application (3 min)

"Voici notre application. C'est un serveur Express basique avec 2 routes. Testons-la localement pour vérifier qu'elle fonctionne."

[Montrer le code + tester]

### Partie 2 : Dockerfile de base (5 min)

"Créons maintenant un Dockerfile basique. On part de node:18-alpine, on copie les fichiers, on installe les dépendances, et on lance le serveur."

[Montrer Dockerfile + builder + lancer]

"L'image fait environ 180 MB et démarre en moins d'une seconde. C'est fonctionnel mais on peut faire mieux."

### Partie 3 : Optimisations (7 min)

"Voyons comment optimiser notre Dockerfile :"

1. **npm ci** : Installation reproductible des dépendances
2. **Utilisateur non-root** : Sécurité (principe du moindre privilège)
3. **Health check** : Monitoring automatique de l'état du conteneur
4. **.dockerignore** : Exclure node_modules, .git, etc.
5. **Labels** : Métadonnées pour la documentation

[Montrer chaque amélioration + builder + tester]

"Notre image est maintenant plus sécurisée et mieux documentée. Le health check permet à Docker (et Kubernetes) de savoir si le conteneur est sain."

### Partie 4 : Multi-stage (Bonus - 3 min)

"Si on avait une application TypeScript, on pourrait utiliser un multi-stage build pour réduire encore la taille en ne gardant que le code compilé."

[Montrer le concept]

## ✅ Checklist de démo

- [ ] Terminal propre (clear)
- [ ] Docker démarré
- [ ] Pas de conteneur en cours
- [ ] Code de l'app visible
- [ ] Éditeur ouvert sur Dockerfile
- [ ] Navigateur prêt (localhost:3000)
- [ ] Notes à portée de main

## 🎓 Points clés à souligner

1. **FROM node:18-alpine** → Utiliser des images de base officielles
2. **WORKDIR /app** → Toujours définir un répertoire de travail
3. **COPY package*.json puis npm ci** → Optimiser le cache Docker
4. **USER non-root** → Sécurité first
5. **HEALTHCHECK** → Monitoring automatique
6. **.dockerignore** → Build plus rapide

## ⚠️ Erreurs courantes à mentionner

1. **Oublier .dockerignore** → node_modules copié (build lent)
2. **Copier tout puis installer** → Cache Docker inefficace
3. **Exécuter en root** → Risque de sécurité
4. **Pas de health check** → Impossible de détecter les problèmes
5. **Tag 'latest'** → Difficile de reproduire les builds

## 🔗 Références

- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Node.js Official Image](https://hub.docker.com/_/node)
- [Health Check](https://docs.docker.com/engine/reference/builder/#healthcheck)
