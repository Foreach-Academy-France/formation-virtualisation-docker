# 🚀 Docker Cheat Sheet - Jour 1

## 📦 Gestion des conteneurs

### Créer et lancer

```bash
# Créer et démarrer un nouveau conteneur
docker run <image>

# Options courantes
docker run -d <image>              # Arrière-plan (detached)
docker run -it <image> bash        # Interactif avec terminal
docker run --name <nom> <image>    # Nommer le conteneur
docker run -p 8080:80 <image>      # Publier port (hôte:conteneur)
docker run -e VAR=value <image>    # Variable d'environnement
docker run --rm <image>            # Supprimer auto après arrêt

# Exemple complet
docker run -d --name web -p 8080:80 -e ENV=prod nginx
```

### Gérer le cycle de vie

```bash
docker start <container>      # Démarrer conteneur existant
docker stop <container>       # Arrêter (SIGTERM)
docker kill <container>       # Tuer immédiatement (SIGKILL)
docker restart <container>    # Redémarrer (stop + start)
docker pause <container>      # Mettre en pause
docker unpause <container>    # Reprendre
```

### Lister et inspecter

```bash
docker ps                     # Conteneurs actifs
docker ps -a                  # Tous les conteneurs
docker ps -q                  # IDs uniquement
docker logs <container>       # Voir les logs
docker logs -f <container>    # Suivre les logs (follow)
docker logs --tail 50 <container>  # Dernières 50 lignes
docker inspect <container>    # Infos détaillées (JSON)
docker stats <container>      # Stats temps réel
docker top <container>        # Processus dans le conteneur
docker port <container>       # Ports mappés
```

### Exécuter dans un conteneur

```bash
docker exec -it <container> bash       # Ouvrir shell
docker exec <container> <cmd>          # Exécuter commande
docker exec -it <container> sh         # Pour alpine (pas bash)

# Exemples
docker exec web ls -la /etc/nginx
docker exec db psql -U postgres
docker exec cache redis-cli ping
```

### Copier des fichiers

```bash
docker cp <fichier> <container>:/path/    # Hôte → Conteneur
docker cp <container>:/path/fichier ./    # Conteneur → Hôte

# Exemples
docker cp index.html web:/usr/share/nginx/html/
docker cp web:/etc/nginx/nginx.conf ./
```

### Supprimer

```bash
docker rm <container>         # Supprimer (doit être arrêté)
docker rm -f <container>      # Forcer suppression
docker container prune        # Supprimer tous les arrêtés
docker rm $(docker ps -aq)    # Supprimer TOUS les conteneurs
```

---

## 🖼️ Gestion des images

### Télécharger et lister

```bash
docker pull <image>           # Télécharger depuis Docker Hub
docker pull <image>:<tag>     # Version spécifique
docker images                 # Lister images locales
docker images -q              # IDs uniquement
docker search <terme>         # Rechercher sur Docker Hub

# Exemples
docker pull nginx:alpine
docker pull postgres:15
docker search nodejs
```

### Inspecter et historique

```bash
docker inspect <image>        # Infos détaillées
docker history <image>        # Historique des layers
docker image inspect <image>  # Alias de inspect

# Voir la taille des layers
docker history nginx:alpine --no-trunc
```

### Supprimer

```bash
docker rmi <image>            # Supprimer image
docker rmi -f <image>         # Forcer suppression
docker image prune            # Images sans tag
docker image prune -a         # Toutes images inutilisées
docker rmi $(docker images -q)  # TOUTES les images
```

---

## 🌐 Networking

### Commandes réseau

```bash
docker network ls                    # Lister networks
docker network create <nom>          # Créer network
docker network inspect <network>     # Inspecter
docker network rm <network>          # Supprimer
docker network prune                 # Nettoyer inutilisés

# Connecter/déconnecter conteneur
docker network connect <network> <container>
docker network disconnect <network> <container>
```

### Types de networks

| Type | Usage |
|------|-------|
| **bridge** | Par défaut, communication entre conteneurs |
| **host** | Partage la stack réseau de l'hôte |
| **none** | Pas de réseau |

---

## 💾 Volumes

### Commandes volumes

```bash
docker volume ls                     # Lister volumes
docker volume create <nom>           # Créer volume
docker volume inspect <volume>       # Inspecter
docker volume rm <volume>            # Supprimer
docker volume prune                  # Nettoyer inutilisés

# Monter un volume
docker run -v <volume>:/path <image>
docker run -v $(pwd):/app <image>    # Bind mount (dossier hôte)
```

---

## 🧹 Nettoyage système

### Commandes de nettoyage

```bash
# Nettoyage sélectif
docker container prune        # Conteneurs arrêtés
docker image prune            # Images sans tag
docker image prune -a         # Toutes images inutilisées
docker volume prune           # Volumes non utilisés
docker network prune          # Networks non utilisés

# Nettoyage global (⚠️ DANGER)
docker system prune           # Conteneurs + images + networks
docker system prune -a        # + toutes images inutilisées
docker system prune -a --volumes  # + volumes

# Voir l'espace utilisé
docker system df              # Vue d'ensemble
docker system df -v           # Détaillé
```

---

## 🔍 Debugging et inspection

### Commandes utiles

```bash
# Logs
docker logs <container>              # Tous les logs
docker logs -f <container>           # Suivre en temps réel
docker logs --tail 100 <container>   # 100 dernières lignes
docker logs --since 30m <container>  # Depuis 30 minutes

# Inspection
docker inspect <container/image>     # Toutes les infos (JSON)
docker inspect --format='{{.Config}}' <container>  # Section spécifique

# Stats et processus
docker stats                         # Stats tous conteneurs
docker stats --no-stream <container> # Stats snapshot
docker top <container>               # Processus dans conteneur

# Events
docker events                        # Stream d'événements Docker
docker events --since 1h             # Dernière heure
```

---

## 🎯 Patterns courants

### Lancer une base de données

```bash
# PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=mydb \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15

# MySQL
docker run -d --name mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=mydb \
  -v mysqldata:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8

# MongoDB
docker run -d --name mongo \
  -v mongodata:/data/db \
  -p 27017:27017 \
  mongo:7

# Redis
docker run -d --name redis \
  -v redisdata:/data \
  -p 6379:6379 \
  redis:alpine
```

### Lancer un serveur web

```bash
# Nginx
docker run -d --name web \
  -p 8080:80 \
  -v $(pwd)/html:/usr/share/nginx/html \
  nginx:alpine

# Apache
docker run -d --name apache \
  -p 8080:80 \
  -v $(pwd)/html:/usr/local/apache2/htdocs \
  httpd:alpine
```

### Environnement de développement

```bash
# Node.js
docker run -it --rm \
  -v $(pwd):/app \
  -w /app \
  -p 3000:3000 \
  node:20-alpine \
  sh

# Python
docker run -it --rm \
  -v $(pwd):/app \
  -w /app \
  python:3.11-slim \
  bash

# PHP
docker run -it --rm \
  -v $(pwd):/app \
  -w /app \
  -p 8000:8000 \
  php:8.2-cli \
  php -S 0.0.0.0:8000
```

---

## ⚠️ Erreurs courantes et solutions

### "Cannot connect to the Docker daemon"

```bash
# Vérifier que Docker tourne
sudo systemctl status docker
sudo systemctl start docker
```

### "permission denied"

```bash
# Ajouter au groupe docker
sudo usermod -aG docker $USER
newgrp docker
```

### "port is already allocated"

```bash
# Un autre processus utilise le port
# Changer le port hôte :
docker run -p 8081:80 nginx  # Au lieu de 8080
```

### "No space left on device"

```bash
# Nettoyer le système
docker system prune -a --volumes
docker system df  # Voir l'espace récupéré
```

---

## 📊 Format des commandes Docker

```
docker <commande> [OPTIONS] <objet> [COMMANDE] [ARGS]

Exemples :
docker container ls -a
docker image prune -f
docker network create my-net
docker volume inspect my-data
```

**Structure** :
- **Ancien style** : `docker ps`, `docker images`
- **Nouveau style** : `docker container ls`, `docker image ls`

Les deux fonctionnent, mais le nouveau style est plus cohérent.

---

**Document créé pour** : TP1 - Découverte Docker
**Formation** : M2 ESTD - Virtualisation et Conteneurisation
