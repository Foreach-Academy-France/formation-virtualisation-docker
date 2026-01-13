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

# 🐳 Jour 3
## Gestion des Conteneurs & Volumes

**Formation Virtualisation & Conteneurisation**
M2 ESTD - Architecte Web
ForEach Academy

---

## 👋 Bienvenue au Jour 3!

**Hier (Jour 2)** :
- ✅ Installation et configuration avancée
- ✅ Dockerfile et création d'images
- ✅ Multi-stage builds et optimisations
- ✅ TP2 : Dockeriser une application

**Aujourd'hui (Jour 3)** :
1. Module 6 : Gestion des conteneurs
2. Module 7 : Volumes et persistance des données
3. Démo : Monitoring et logs
4. TP3 : Application avec base de données

---

## 📋 Planning de la journée

| Horaire | Contenu |
|---------|---------|
| 9h00-10h30 | Module 6 : Gestion conteneurs |
| 10h45-12h15 | Module 7 : Volumes (Partie 1) |
| 13h15-15h00 | Module 7 : Volumes (Partie 2) |
| 15h15-17h00 | TP3 : App avec PostgreSQL |

---

<!-- _class: lead -->

# Module 6
## Gestion des Conteneurs

---

## Cycle de vie d'un conteneur

<div class="mermaid">
stateDiagram-v2
    [*] --> Created: docker create
    Created --> Running: docker start
    Running --> Paused: docker pause
    Paused --> Running: docker unpause
    Running --> Stopped: docker stop
    Stopped --> Running: docker start
    Stopped --> [*]: docker rm
    Running --> [*]: docker rm -f
</div>

---

## Commandes de base (rappel)

**Créer et démarrer** :
```bash
# Créer + Démarrer en une commande
docker run nginx

# Créer sans démarrer
docker create --name web nginx

# Démarrer un conteneur existant
docker start web
```

**Stopper** :
```bash
# Arrêt gracieux (SIGTERM puis SIGKILL après 10s)
docker stop web

# Arrêt immédiat (SIGKILL)
docker kill web
```

---

## docker run : Options essentielles

```bash
# Détaché (background)
docker run -d nginx

# Interactif avec TTY
docker run -it ubuntu bash

# Nom personnalisé
docker run --name mon-web nginx

# Port mapping
docker run -p 8080:80 nginx

# Variables d'environnement
docker run -e NODE_ENV=production node-app

# Tout ensemble
docker run -d --name api -p 3000:3000 -e NODE_ENV=prod my-api
```

---

## docker run : Options avancées

**Limites de ressources** :
```bash
# Limiter la RAM
docker run -m 512m nginx

# Limiter le CPU
docker run --cpus="1.5" nginx

# Limiter le CPU (pourcentage)
docker run --cpu-shares=512 nginx
```

**Restart policies** :
```bash
# Redémarrage automatique
docker run --restart=always nginx

# Redémarrer sauf si stoppé manuellement
docker run --restart=unless-stopped nginx

# Redémarrer avec limite
docker run --restart=on-failure:5 nginx
```

---

## Commandes de monitoring

**docker ps** :
```bash
# Conteneurs en cours
docker ps

# Tous les conteneurs
docker ps -a

# Format personnalisé
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Filtrer
docker ps --filter "status=running"
docker ps --filter "name=web"
```

---

## docker stats : Monitoring temps réel

```bash
# Stats de tous les conteneurs actifs
docker stats

# Stats d'un conteneur spécifique
docker stats mon-web

# Sans streaming (une fois)
docker stats --no-stream

# Format personnalisé
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

**Affichage** :
- CPU %
- RAM usage / limit
- NET I/O
- BLOCK I/O

---

## docker top : Processus dans le conteneur

```bash
# Lister les processus
docker top mon-web

# Avec format ps personnalisé
docker top mon-web aux
```

**Équivalent** :
```bash
docker exec mon-web ps aux
```

---

## docker logs : Consulter les logs

```bash
# Tous les logs
docker logs mon-web

# Suivre en temps réel
docker logs -f mon-web

# Dernières 100 lignes
docker logs --tail 100 mon-web

# Depuis un timestamp
docker logs --since 2024-01-12T10:00:00 mon-web

# Dernières 10 minutes
docker logs --since 10m mon-web

# Avec timestamps
docker logs -t mon-web
```

---

## docker inspect : Informations détaillées

```bash
# Toutes les infos (JSON)
docker inspect mon-web

# Extraire une valeur spécifique
docker inspect --format='{{.State.Status}}' mon-web

# IP du conteneur
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mon-web

# Variables d'environnement
docker inspect --format='{{.Config.Env}}' mon-web

# Volumes
docker inspect --format='{{.Mounts}}' mon-web
```

---

## docker exec : Exécuter des commandes

```bash
# Commande simple
docker exec mon-web ls /app

# Shell interactif
docker exec -it mon-web bash

# En tant qu'un utilisateur spécifique
docker exec -u root mon-web apt-get update

# Avec variables d'environnement
docker exec -e DEBUG=true mon-web node script.js

# Dans un répertoire spécifique
docker exec -w /app mon-web npm test
```

⚠️ **Note** : Le conteneur doit être **running**

---

## docker cp : Copier des fichiers

```bash
# Du conteneur vers l'hôte
docker cp mon-web:/app/logs/app.log ./logs/

# De l'hôte vers le conteneur
docker cp ./config.json mon-web:/app/config/

# Copier un répertoire
docker cp mon-web:/app/data ./backup/
```

**Use cases** :
- Récupérer des logs
- Debug en copiant des fichiers
- Backup de données

---

## docker pause/unpause

```bash
# Mettre en pause (freeze tous les processus)
docker pause mon-web

# Reprendre
docker unpause mon-web
```

**Différence avec stop** :
- `pause` : Freeze le processus (cgroups freezer)
- `stop` : Envoie SIGTERM puis SIGKILL

**Use case** : Libérer temporairement des ressources CPU

---

## Commandes de nettoyage

**Supprimer des conteneurs** :
```bash
# Supprimer un conteneur stoppé
docker rm mon-web

# Forcer la suppression (même si running)
docker rm -f mon-web

# Supprimer tous les conteneurs stoppés
docker container prune

# Supprimer plusieurs conteneurs
docker rm web1 web2 web3
```

---

## Nettoyage d'images

```bash
# Supprimer une image
docker rmi nginx:alpine

# Forcer la suppression
docker rmi -f nginx:alpine

# Supprimer les images non utilisées
docker image prune

# Supprimer toutes les images non utilisées
docker image prune -a

# Supprimer images sans tag
docker images -f "dangling=true" -q | xargs docker rmi
```

---

## docker system : Nettoyage global

```bash
# Voir l'espace utilisé
docker system df

# Nettoyage complet
docker system prune

# Nettoyage agressif (images, volumes, tout)
docker system prune -a --volumes

# Avec confirmation automatique
docker system prune -f
```

⚠️ **Attention** : `prune -a --volumes` supprime TOUT ce qui n'est pas utilisé

---

## Exemple : Voir l'espace disque

```bash
$ docker system df

TYPE            TOTAL   ACTIVE  SIZE      RECLAIMABLE
Images          15      3       4.2GB     3.8GB (90%)
Containers      8       2       150MB     100MB (66%)
Local Volumes   5       2       2.1GB     1.5GB (71%)
Build Cache     42      0       1.2GB     1.2GB (100%)
```

**Interprétation** :
- 15 images, seulement 3 utilisées → 3.8 GB récupérables
- 5 volumes, seulement 2 utilisés → 1.5 GB récupérables

---

## docker scan : Sécurité

```bash
# Scanner une image pour des vulnérabilités
docker scan nginx:alpine

# Scanner une image locale
docker scan my-api:1.0

# Sévérité spécifique
docker scan --severity high my-api:1.0
```

**Nécessite** : Compte Docker Hub et login

**Alternatives** :
- Trivy : `trivy image nginx:alpine`
- Snyk : `snyk container test nginx:alpine`

---

## docker events : Monitoring en temps réel

```bash
# Tous les événements
docker events

# Filtrer par type
docker events --filter type=container

# Filtrer par action
docker events --filter event=start

# Depuis un timestamp
docker events --since '2024-01-12T10:00:00'

# Plusieurs filtres
docker events --filter type=container --filter event=die
```

**Use case** : Debugging, monitoring, audit

---

## Networking : Les bases

**Lister les réseaux** :
```bash
docker network ls
```

**Réseaux par défaut** :
- `bridge` : Réseau par défaut
- `host` : Partage le réseau de l'hôte
- `none` : Pas de réseau

**Créer un réseau** :
```bash
# Réseau bridge personnalisé
docker network create mon-reseau

# Avec subnet spécifique
docker network create --subnet=172.18.0.0/16 mon-reseau
```

---

## Connecter des conteneurs

```bash
# Créer un réseau
docker network create app-network

# Lancer des conteneurs sur ce réseau
docker run -d --name db --network app-network postgres
docker run -d --name api --network app-network my-api

# Dans le conteneur API, accès à DB via 'db:5432'
docker exec api ping db
```

**DNS interne** : Les conteneurs se voient par leur nom

---

## Inspecter le réseau

```bash
# Voir les détails d'un réseau
docker network inspect bridge

# Voir les conteneurs connectés
docker network inspect app-network --format='{{range .Containers}}{{.Name}} {{end}}'

# Connecter/Déconnecter
docker network connect app-network mon-conteneur
docker network disconnect app-network mon-conteneur
```

---

## Ports et expositions

**Port mapping** :
```bash
# Port hôte:conteneur
docker run -p 8080:80 nginx

# Tous les ports EXPOSE
docker run -P nginx

# IP spécifique
docker run -p 127.0.0.1:8080:80 nginx

# Protocole UDP
docker run -p 53:53/udp dns-server
```

**Voir les ports** :
```bash
docker port mon-web
```

---

<!-- _class: lead -->

# Module 7
## Volumes et Persistance des Données

---

## Problème : Données perdues

**Par défaut** : Conteneurs = éphémères

```bash
# Créer un conteneur avec données
docker run -d --name db postgres
docker exec db psql -c "CREATE DATABASE myapp;"

# Supprimer le conteneur
docker rm -f db

# Redémarrer
docker run -d --name db postgres
# → Base de données myapp disparue ! 💥
```

**Solution** : Volumes Docker

---

## Types de montages

**3 options** :

1. **Volumes** (recommandé)
   - Gérés par Docker
   - Stockés dans `/var/lib/docker/volumes/`

2. **Bind mounts**
   - Lien direct vers un chemin hôte
   - `/home/user/data` → `/app/data`

3. **tmpfs mounts**
   - En mémoire uniquement
   - Données perdues à l'arrêt

---

## Volumes Docker : Créer et lister

```bash
# Créer un volume
docker volume create mon-volume

# Lister les volumes
docker volume ls

# Inspecter un volume
docker volume inspect mon-volume

# Voir le chemin sur l'hôte
docker volume inspect mon-volume --format='{{.Mountpoint}}'
# → /var/lib/docker/volumes/mon-volume/_data
```

---

## Utiliser un volume

```bash
# Volume nommé
docker run -d \
  --name db \
  -v pgdata:/var/lib/postgresql/data \
  postgres

# Volume anonyme (généré automatiquement)
docker run -d \
  -v /var/lib/postgresql/data \
  postgres

# Lister les volumes du conteneur
docker inspect db --format='{{.Mounts}}'
```

---

## Bind mounts

**Monter un répertoire local** :

```bash
# Chemin absolu obligatoire
docker run -d \
  -v /home/user/myapp:/app \
  node-app

# Lecture seule
docker run -d \
  -v /home/user/config:/app/config:ro \
  node-app

# Avec $(pwd)
docker run -d \
  -v $(pwd)/data:/app/data \
  node-app
```

**Use cases** :
- Développement (hot reload)
- Configuration
- Logs

---

## tmpfs mounts

**Stockage en mémoire** :

```bash
# Monter tmpfs
docker run -d \
  --tmpfs /app/temp \
  my-app

# Avec options
docker run -d \
  --tmpfs /app/temp:rw,size=100m \
  my-app
```

**Use cases** :
- Données sensibles (mot de passe temporaire)
- Cache temporaire
- Performance I/O maximale

---

## Comparaison des montages

| Type | Gestion | Performance | Partage | Use case |
|------|---------|-------------|---------|----------|
| **Volume** | Docker | ⭐⭐⭐ | Multi-conteneurs | Production |
| **Bind mount** | Utilisateur | ⭐⭐ | Hôte ↔ conteneur | Dev |
| **tmpfs** | Docker | ⭐⭐⭐⭐ | Non | Cache |

---

## Syntaxe moderne : --mount

**Alternative à -v** :

```bash
# Volume
docker run -d \
  --mount type=volume,source=pgdata,target=/var/lib/postgresql/data \
  postgres

# Bind mount
docker run -d \
  --mount type=bind,source=$(pwd)/app,target=/app \
  node-app

# tmpfs
docker run -d \
  --mount type=tmpfs,target=/app/temp \
  my-app
```

**Avantage** : Plus explicite et lisible

---

## Partager des volumes

**Entre conteneurs** :

```bash
# Conteneur 1 crée des données
docker run -d --name writer -v shared-data:/data alpine \
  sh -c "echo 'Hello' > /data/message.txt"

# Conteneur 2 lit les données
docker run --rm -v shared-data:/data alpine \
  cat /data/message.txt
# → Hello
```

**Use case** :
- Partage de logs
- Communication entre services
- Backup de données

---

## Volumes read-only

**Protection des données** :

```bash
# Volume en lecture seule
docker run -d \
  -v config-data:/app/config:ro \
  my-app

# Tentative d'écriture → erreur
docker exec my-app touch /app/config/file.txt
# → Read-only file system
```

**Use cases** :
- Configuration immuable
- Assets statiques
- Sécurité

---

## Backup et restore de volumes

**Backup** :
```bash
# Créer un backup du volume
docker run --rm \
  -v pgdata:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/pgdata-backup.tar.gz -C /data .
```

**Restore** :
```bash
# Créer un nouveau volume
docker volume create pgdata-restored

# Restaurer depuis le backup
docker run --rm \
  -v pgdata-restored:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/pgdata-backup.tar.gz -C /data
```

---

## Copier des données vers/depuis un volume

**Avec docker cp** :

```bash
# Créer un conteneur temporaire avec le volume
docker run -d --name temp -v mon-volume:/data alpine sleep 3600

# Copier vers le volume
docker cp ./local-file.txt temp:/data/

# Copier depuis le volume
docker cp temp:/data/file.txt ./

# Cleanup
docker rm -f temp
```

---

## Volume drivers

**Par défaut** : `local` (disque local)

**Autres drivers** :
- `nfs` : Network File System
- `azure-file` : Azure Files
- `vieux/sshfs` : SSH File System

```bash
# Volume NFS
docker volume create --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.1,rw \
  --opt device=:/path/to/dir \
  nfs-volume
```

---

## Gérer les volumes

```bash
# Lister les volumes
docker volume ls

# Supprimer un volume
docker volume rm mon-volume

# Supprimer volumes non utilisés
docker volume prune

# Forcer suppression
docker volume prune -f

# Voir l'espace utilisé
docker system df -v
```

⚠️ **Attention** : `volume rm` = perte de données définitive

---

## Volumes et Dockerfile

**VOLUME instruction** :

```dockerfile
FROM postgres:15
VOLUME /var/lib/postgresql/data
```

**Effet** :
- Déclare que `/var/lib/postgresql/data` devrait être un volume
- Docker crée un volume anonyme automatiquement
- Documentation pour les utilisateurs

**Override** :
```bash
docker run -v pgdata:/var/lib/postgresql/data postgres
```

---

## Exemple complet : PostgreSQL

```bash
# 1. Créer un volume nommé
docker volume create pgdata

# 2. Lancer PostgreSQL avec le volume
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:15

# 3. Créer des données
docker exec -it postgres psql -U postgres -c "CREATE DATABASE myapp;"

# 4. Redémarrer le conteneur
docker restart postgres

# 5. Vérifier que les données persistent
docker exec postgres psql -U postgres -l
# → myapp est toujours là ✅
```

---

## Volumes avec Docker Compose

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: secret

volumes:
  pgdata:
    driver: local
```

```bash
docker-compose up -d
# → Volume créé automatiquement
```

---

## Named volumes vs Anonymous volumes

**Named volume** :
```bash
docker run -v mydata:/app/data nginx
```
- ✅ Facile à référencer
- ✅ Réutilisable
- ✅ Backup simple

**Anonymous volume** :
```bash
docker run -v /app/data nginx
```
- ⚠️ Nom aléatoire (hash)
- ⚠️ Difficile à retrouver
- ⚠️ Risque d'accumulation

**Recommandation** : Toujours utiliser des named volumes

---

## Permissions et volumes

**Problème courant** :

```bash
docker run -d \
  -v $(pwd)/data:/app/data \
  --user 1000:1000 \
  my-app
# → Permission denied si /app/data appartient à root
```

**Solutions** :
1. Changer les permissions avant : `chown -R 1000:1000 ./data`
2. Utiliser USER dans Dockerfile
3. Exécuter en root (déconseillé)

---

<!-- _class: lead -->

# Démo Live
## Monitoring et Volumes

---

## Démo : Monitoring

```bash
# 1. Lancer plusieurs conteneurs
docker run -d --name web nginx
docker run -d --name api node-app
docker run -d --name db postgres

# 2. Monitoring
docker ps
docker stats --no-stream

# 3. Logs
docker logs web

# 4. Inspecter
docker inspect web | grep IPAddress

# 5. Top
docker top web
```

---

## Démo : Volumes avec PostgreSQL

```bash
# 1. Créer un volume
docker volume create demo-pgdata

# 2. Lancer PostgreSQL
docker run -d \
  --name demo-db \
  -e POSTGRES_PASSWORD=demo123 \
  -v demo-pgdata:/var/lib/postgresql/data \
  postgres:15

# 3. Créer des données
docker exec -it demo-db psql -U postgres -c "
  CREATE DATABASE demo;
  \c demo
  CREATE TABLE users (id SERIAL, name TEXT);
  INSERT INTO users (name) VALUES ('Alice'), ('Bob');
  SELECT * FROM users;
"
```

---

## Démo : Tester la persistance

```bash
# 4. Supprimer le conteneur (pas le volume)
docker rm -f demo-db

# 5. Recréer un nouveau conteneur avec le même volume
docker run -d \
  --name demo-db-2 \
  -e POSTGRES_PASSWORD=demo123 \
  -v demo-pgdata:/var/lib/postgresql/data \
  postgres:15

# 6. Vérifier que les données existent toujours
docker exec demo-db-2 psql -U postgres -d demo -c "SELECT * FROM users;"
# → Alice et Bob sont toujours là ! ✅
```

---

## Démo : Backup d'un volume

```bash
# 1. Backup
docker run --rm \
  -v demo-pgdata:/data:ro \
  -v $(pwd):/backup \
  alpine tar czf /backup/demo-backup.tar.gz -C /data .

# 2. Vérifier
ls -lh demo-backup.tar.gz

# 3. Créer nouveau volume
docker volume create demo-pgdata-restored

# 4. Restore
docker run --rm \
  -v demo-pgdata-restored:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/demo-backup.tar.gz -C /data

# 5. Tester
docker run --rm \
  -v demo-pgdata-restored:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=demo123 \
  postgres:15 \
  psql -U postgres -d demo -c "SELECT * FROM users;"
```

---

<!-- _class: lead -->

# TP3
## Application avec Base de Données
**(1h45)**

---

## Objectifs TP3

**Mission** : Créer une application Node.js avec PostgreSQL persistante

**Tâches** :
1. Créer un volume pour PostgreSQL
2. Dockeriser l'application backend
3. Connecter backend → database
4. Utiliser Docker network
5. Tester la persistance des données
6. (Bonus) Ajouter Redis pour le cache

**📝 Énoncé complet** : `tp/tp3-stack-app/`

---

## TP3 - Application fournie

**Stack** :
- **Backend** : API Express (CRUD Users)
- **Database** : PostgreSQL 15
- **Cache** (bonus) : Redis

**Fonctionnalités** :
- Créer/Lire/Modifier/Supprimer des utilisateurs
- Stockage PostgreSQL persistant
- Cache Redis (optionnel)

---

## TP3 - Partie 1 : PostgreSQL avec volume

**Objectif** : Lancer PostgreSQL avec données persistantes

```bash
# 1. Créer un volume
docker volume create tp3-pgdata

# 2. Lancer PostgreSQL
docker run -d \
  --name tp3-db \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=userdb \
  -v tp3-pgdata:/var/lib/postgresql/data \
  postgres:15

# 3. Vérifier
docker logs tp3-db
docker exec tp3-db psql -U postgres -l
```

---

## TP3 - Partie 2 : Backend avec networking

**Objectif** : Connecter l'API à PostgreSQL

```bash
# 1. Créer un réseau
docker network create tp3-network

# 2. Reconnecter la DB au réseau
docker network connect tp3-network tp3-db

# 3. Builder l'API
cd app/
docker build -t tp3-api .

# 4. Lancer l'API
docker run -d \
  --name tp3-api \
  --network tp3-network \
  -p 3000:3000 \
  -e DATABASE_URL=postgres://postgres:secret@tp3-db:5432/userdb \
  tp3-api
```

---

## TP3 - Partie 3 : Tester la persistance

**Scénario** :
1. Créer des utilisateurs via l'API
2. Supprimer TOUS les conteneurs
3. Recréer les conteneurs avec le même volume
4. Vérifier que les données existent toujours

**Validation** :
```bash
# Créer des users
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'

# Lister
curl http://localhost:3000/users

# Tout supprimer
docker rm -f tp3-db tp3-api

# Recréer (avec le même volume tp3-pgdata)
# ...

# Vérifier que Alice existe toujours ✅
```

---

## TP3 - Bonus : Ajouter Redis

**Challenge** : Ajouter un layer de cache

```bash
# Lancer Redis
docker run -d \
  --name tp3-redis \
  --network tp3-network \
  redis:alpine

# Modifier l'API pour utiliser Redis
# Cache les requêtes GET /users pendant 60s

# Tester le cache
time curl http://localhost:3000/users  # Lent (DB)
time curl http://localhost:3000/users  # Rapide (Cache)
```

---

<!-- _class: lead -->

# Récapitulatif Jour 3

---

## Ce que nous avons vu

✅ **Module 6** : Gestion des Conteneurs
- Commandes de monitoring (ps, stats, top, logs)
- docker exec et docker cp
- Nettoyage (prune, rm, rmi)
- Networking (create, connect, inspect)

✅ **Module 7** : Volumes
- Types de montages (volumes, bind mounts, tmpfs)
- Persistance des données
- Backup et restore
- Permissions

✅ **Démo** : Monitoring + PostgreSQL avec volumes

✅ **TP3** : Application complète avec base de données

---

## Points clés à retenir

📊 docker stats = Monitoring temps réel (CPU, RAM)

📝 docker logs -f = Suivre les logs en direct

💾 Volumes = Persistance des données

🔗 Network = Communication entre conteneurs

🗑️ docker system prune = Nettoyage global

---

## Demain (Jour 4)

**Module 8** : Docker Registry privé
**Module 9** : Docker Compose avancé
**TP4** : Stack complète multi-services

**Prérequis** :
- Volumes maîtrisés
- Networking compris
- Application avec DB fonctionnelle (TP3)

---

<!-- _class: lead -->

# Questions ?

**À demain pour le Jour 4!** 🚀

---

<!-- _class: lead -->

# Merci !

**Formation Docker - Jour 3**
M2 ESTD - Architecte Web

📧 fabrice.claeys@groupe-bao.fr
