# 🔑 TP1 - Solutions détaillées

> **Note** : Ces solutions sont fournies à titre pédagogique. Essayez d'abord de résoudre les exercices par vous-même.

---

## Exercice 1.1 - Installation (10 points)

### Solution

```bash
# 1. Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. Configurer le groupe
sudo usermod -aG docker $USER
newgrp docker

# 3. Tester
docker run hello-world
```

**Screenshot attendu** : Message "Hello from Docker!"

---

## Exercice 2.1 - Conteneurs interactifs (10 points)

### Solution

```bash
# 1. Lancer Ubuntu interactif
docker run -it --name mon-ubuntu ubuntu bash

# 2. Dans le conteneur, installer curl et vim
apt-get update
apt-get install -y curl vim

# 3. Créer un fichier
echo "Hello Docker!" > /tmp/test.txt
cat /tmp/test.txt

# 4. Quitter
exit

# 5. Vérifier que le conteneur existe (arrêté)
docker ps -a | grep mon-ubuntu

# 6. Redémarrer le conteneur
docker start mon-ubuntu

# 7. Exécuter une commande pour vérifier le fichier
docker exec mon-ubuntu cat /tmp/test.txt
# Output: Hello Docker!

# Alternative : Ouvrir un shell
docker exec -it mon-ubuntu bash
cat /tmp/test.txt
exit
```

**Réponse aux questions** :
- ✅ **Le fichier existe toujours** après `exit`
- **Pourquoi ?** : `exit` arrête le conteneur mais ne le supprime pas. Les modifications du filesystem restent dans le "container layer" (Read-Write layer)
- **Attention** : Si on fait `docker rm`, le conteneur ET ses modifications sont supprimés

---

## Exercice 2.2 - Serveur web (10 points)

### Solution

```bash
# 1. Premier serveur Nginx (port 8080)
docker run -d --name web1 -p 8080:80 nginx

# 2. Vérifier qu'il fonctionne
curl http://localhost:8080
# Ou ouvrir dans le navigateur

# 3. Second serveur Nginx (port 8081)
docker run -d --name web2 -p 8081:80 nginx

# 4. Vérifier qu'il fonctionne aussi
curl http://localhost:8081

# 5. Lister les deux conteneurs
docker ps
```

**Output attendu** :
```
CONTAINER ID   IMAGE   COMMAND                  PORTS                  NAMES
a1b2c3d4e5f6   nginx   "nginx -g 'daemon of…"   0.0.0.0:8080->80/tcp   web1
f6e5d4c3b2a1   nginx   "nginx -g 'daemon of…"   0.0.0.0:8081->80/tcp   web2
```

---

## Exercice 3.1 - Exploration (15 points)

### Solution

```bash
# Lancer PostgreSQL
docker run -d --name db \
  -e POSTGRES_PASSWORD=secret \
  postgres:15

# 1. Adresse IP du conteneur
docker inspect db --format='{{.NetworkSettings.IPAddress}}'
# Output: 172.17.0.2 (peut varier)

# 2. Mémoire utilisée
docker stats db --no-stream --format "table {{.Name}}\t{{.MemUsage}}"
# Output: db    45.2MiB / 7.7GiB

# 3. PID sur l'hôte
docker inspect db --format='{{.State.Pid}}'
# Output: 12345 (varie selon le système)

# 4. Ports exposés
docker inspect db --format='{{.Config.ExposedPorts}}'
# Output: map[5432/tcp:{}]

# Ou plus simple :
docker port db
# Output: vide (car pas de -p, port non publié)
```

**Réponses** :
- **IP** : 172.17.0.x (réseau bridge par défaut)
- **RAM** : ~45 MB au démarrage
- **PID** : Variable (processus postgres sur l'hôte)
- **Ports exposés** : 5432/tcp (non publié sur l'hôte)

---

## Exercice 3.2 - Logs et debugging (10 points)

### Solution

```bash
# 1. Créer le conteneur timer
docker run -d --name timer alpine sh -c 'while true; do date; sleep 1; done'

# 2. Suivre les logs en temps réel
docker logs -f timer
# Attendre 10 secondes, puis Ctrl+C

# 3. Arrêter le conteneur
docker stop timer

# 4. Redémarrer
docker start timer

# 5. Afficher les 20 dernières lignes
docker logs --tail 20 timer
```

**Output exemple** :
```
Sun Jan 12 10:00:01 UTC 2026
Sun Jan 12 10:00:02 UTC 2026
Sun Jan 12 10:00:03 UTC 2026
...
```

---

## Exercice 4.1 - Manipulation (15 points)

### Solution

```bash
# 1. Lancer les 3 conteneurs
docker run -d --name cache redis:alpine
docker run -d --name db -e POSTGRES_PASSWORD=secret postgres:15
docker run -d --name web -p 8080:80 nginx

# 2. Vérifier qu'ils tournent
docker ps
# Devrait montrer 3 conteneurs

# 3. Logs de chaque conteneur
docker logs cache
docker logs db
docker logs web

# 4. Stats de consommation
docker stats --no-stream
# Ou individuellement :
docker stats cache --no-stream
docker stats db --no-stream
docker stats web --no-stream

# 5. Stopper tous les conteneurs
docker stop cache db web

# Vérifier qu'ils sont arrêtés
docker ps
# Aucun conteneur actif

# 6. Redémarrer uniquement web
docker start web

# Vérifier
docker ps
# Seul "web" est actif

# 7. Supprimer cache et db
docker rm cache db

# Vérifier
docker ps -a
# Seul "web" existe
```

---

## Exercice 4.2 - Nettoyage (10 points)

### Solution

```bash
# 1. Vérifier l'espace AVANT nettoyage
docker system df

# Output exemple :
# TYPE            TOTAL   ACTIVE   SIZE      RECLAIMABLE
# Images          15      5        3.2GB     1.8GB (56%)
# Containers      10      2        200MB     180MB (90%)
# Local Volumes   3       1        500MB     300MB (60%)

# 2. Nettoyer les conteneurs arrêtés
docker container prune -f
# Deleted Containers: 8
# Total reclaimed space: 180MB

# 3. Nettoyer les images inutilisées
docker image prune -a -f
# Deleted Images: 10
# Total reclaimed space: 1.8GB

# 4. Nettoyer les volumes non utilisés
docker volume prune -f
# Total reclaimed space: 300MB

# 5. Vérifier l'espace APRÈS nettoyage
docker system df

# Output après :
# TYPE            TOTAL   ACTIVE   SIZE      RECLAIMABLE
# Images          5       5        1.4GB     0B (0%)
# Containers      2       2        20MB      0B (0%)
# Local Volumes   1       1        200MB     0B (0%)
```

**Espace récupéré** : ~2.3 GB dans cet exemple

### Alternative : Tout en une commande

```bash
# Nettoyage complet (⚠️ DANGER: supprime TOUT ce qui n'est pas utilisé)
docker system prune -a --volumes -f

# Pour un nettoyage plus sélectif, préférer :
docker container prune -f  # Conteneurs arrêtés seulement
docker image prune -f      # Images sans tag seulement
```

---

## Exercice Bonus - Multi-conteneurs (5 points)

### Solution complète

```bash
# 1. Créer un network dédié
docker network create wordpress-net

# Vérifier
docker network ls
# Devrait montrer "wordpress-net"

# 2. Lancer MySQL
docker run -d \
  --name wp-db \
  --network wordpress-net \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=wordpress \
  -e MYSQL_USER=wpuser \
  -e MYSQL_PASSWORD=wppass \
  mysql:8

# Attendre que MySQL soit prêt (10-15 secondes)
docker logs -f wp-db
# Attendre "ready for connections"

# 3. Lancer WordPress
docker run -d \
  --name wp-app \
  --network wordpress-net \
  -p 8080:80 \
  -e WORDPRESS_DB_HOST=wp-db \
  -e WORDPRESS_DB_USER=wpuser \
  -e WORDPRESS_DB_PASSWORD=wppass \
  -e WORDPRESS_DB_NAME=wordpress \
  wordpress:latest

# 4. Vérifier que les deux tournent
docker ps

# 5. Ouvrir http://localhost:8080
# Vous devriez voir l'installation de WordPress
```

### Réponses aux questions

**Q1 : Comment les conteneurs communiquent ?**
- Via le **network** `wordpress-net`
- WordPress peut atteindre MySQL avec le hostname `wp-db`
- Docker fait la résolution DNS automatiquement

**Q2 : Si on supprime MySQL ?**
```bash
docker stop wp-db
docker rm wp-db
```
- WordPress affichera une erreur "Error establishing database connection"
- L'application ne peut plus fonctionner

**Q3 : Comment persister les données ?**
```bash
# Créer des volumes nommés
docker volume create wp-data
docker volume create wp-db-data

# Relancer avec volumes
docker run -d \
  --name wp-db \
  --network wordpress-net \
  -v wp-db-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:8

docker run -d \
  --name wp-app \
  --network wordpress-net \
  -p 8080:80 \
  -v wp-data:/var/www/html \
  -e WORDPRESS_DB_HOST=wp-db \
  -e WORDPRESS_DB_PASSWORD=secret \
  wordpress:latest
```

Maintenant, même si vous supprimez les conteneurs, les données restent dans les volumes !

---

## 🎓 Conseils pour la suite

### Bonnes pratiques apprises

1. ✅ **Nommer les conteneurs** : `--name` facilite la gestion
2. ✅ **Nettoyer régulièrement** : Éviter d'accumuler des conteneurs/images
3. ✅ **Utiliser les logs** : `docker logs` pour débugger
4. ✅ **Inspecter** : `docker inspect` donne toutes les infos

### Erreurs courantes à éviter

1. ❌ **Oublier `-d`** : Le terminal reste bloqué
2. ❌ **Port déjà utilisé** : `-p 8080:80` échoue si 8080 est pris
3. ❌ **Oublier de stopper** : `docker rm` échoue si conteneur actif
4. ❌ **Confondre `docker run` et `docker start`** :
   - `run` : Créer + démarrer un NOUVEAU conteneur
   - `start` : Démarrer un conteneur EXISTANT

---

**Préparation Jour 2** :
- Créer un compte Docker Hub (gratuit)
- Installer un éditeur de code (VSCode recommandé)
- Lire la documentation sur les Dockerfile

🚀 **Bonne chance pour le Jour 2 !**
