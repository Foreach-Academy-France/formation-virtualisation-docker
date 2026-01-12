# 🐳 TP1 - Découverte Docker

**Durée** : 1h45
**Difficulté** : ⭐ Débutant
**Points** : 10/100 (Contrôle continu)

---

## 🎯 Objectifs pédagogiques

À l'issue de ce TP, vous serez capable de :
- ✅ Installer et configurer Docker sur Linux
- ✅ Lancer et gérer des conteneurs
- ✅ Utiliser les commandes Docker de base
- ✅ Explorer et manipuler des images Docker
- ✅ Comprendre le cycle de vie d'un conteneur

---

## 📋 Prérequis

**Système** :
- Linux (Debian/Ubuntu recommandé) OU
- Docker Desktop (macOS/Windows)

**Ressources** :
- 4 GB RAM minimum
- 10 GB d'espace disque libre
- Connexion Internet

**Connaissances** :
- Ligne de commande Linux de base
- Aucune expérience Docker requise

---

## 📚 Structure du TP

Le TP est divisé en 4 parties :

1. **Partie 1 - Installation** (30 min) : Installer Docker et vérifier le setup
2. **Partie 2 - Premier conteneur** (20 min) : hello-world et commandes de base
3. **Partie 3 - Exploration** (30 min) : Images, conteneurs, logs
4. **Partie 4 - Manipulation avancée** (25 min) : Volumes, networking, cleanup

---

## 🚀 Partie 1 - Installation de Docker

### Installation sur Linux (Debian/Ubuntu)

**Méthode 1 : Script officiel Docker (recommandé)** :

```bash
# Télécharger le script d'installation
curl -fsSL https://get.docker.com -o get-docker.sh

# Examiner le script (bonne pratique sécurité)
less get-docker.sh

# Exécuter l'installation
sudo sh get-docker.sh

# Vérifier l'installation
docker --version
```

**Sortie attendue** :
```
Docker version 24.0.7, build afdd53b
```

---

### Configuration du groupe Docker

Par défaut, seul `root` peut utiliser Docker. Pour éviter `sudo` :

```bash
# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Appliquer le changement (sans déconnexion)
newgrp docker

# Vérifier que ça fonctionne
docker run hello-world
```

---

### Vérification du setup

```bash
# Version Docker
docker --version

# Informations système Docker
docker info

# Vérifier que le daemon tourne
systemctl status docker
```

**Points à vérifier dans `docker info`** :
- ✅ Server Version: 24.x+
- ✅ Storage Driver: overlay2
- ✅ Cgroup Driver: systemd
- ✅ Docker Root Dir: /var/lib/docker

---

### ✏️ Exercice 1.1 - Installation (10 points)

**Consignes** :
1. Installer Docker sur votre machine
2. Configurer le groupe docker
3. Exécuter `docker run hello-world`
4. Faire une capture d'écran du résultat

**Livrable** : Screenshot de `docker run hello-world` réussi

---

## 🎨 Partie 2 - Premier conteneur

### Hello World expliqué

```bash
docker run hello-world
```

**Que se passe-t-il ?** :
1. Docker cherche l'image `hello-world` localement
2. Ne la trouve pas → Pull depuis Docker Hub
3. Crée un conteneur à partir de l'image
4. Exécute le conteneur (affiche un message)
5. Le conteneur s'arrête (processus terminé)

**Output** :
```
Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from Docker Hub.
 3. The Docker daemon created a new container from that image...
 4. The Docker daemon streamed that output to the Docker client...
```

---

### Conteneur interactif

Lançons un conteneur Ubuntu **interactif** :

```bash
# -i = interactive (garder STDIN ouvert)
# -t = tty (allouer un pseudo-terminal)
docker run -it ubuntu bash
```

Vous êtes maintenant **dans le conteneur** :

```bash
# Explorer le conteneur
pwd           # /
whoami        # root
cat /etc/os-release  # Ubuntu

# Installer quelque chose
apt-get update
apt-get install -y curl

# Tester
curl https://google.com

# Quitter le conteneur
exit
```

**Important** : Une fois sorti, le conteneur est **arrêté** mais **existe toujours**.

---

### Conteneur en arrière-plan (daemon)

Lançons un serveur web Nginx :

```bash
# -d = detached (arrière-plan)
# -p = publish port (8080 hôte → 80 conteneur)
# --name = nom du conteneur
docker run -d -p 8080:80 --name web nginx
```

**Vérifier** :
```bash
# Tester dans le navigateur
# http://localhost:8080
# Vous devriez voir "Welcome to nginx!"

# Ou avec curl
curl http://localhost:8080
```

---

### ✏️ Exercice 2.1 - Conteneurs interactifs (10 points)

**Consignes** :
1. Lancer un conteneur Ubuntu interactif
2. Installer `curl` et `vim`
3. Créer un fichier `/tmp/test.txt` avec du contenu
4. Quitter le conteneur
5. Le relancer et vérifier que le fichier existe toujours

**Questions** :
- Le fichier existe-t-il toujours après `exit` ?
- Pourquoi ou pourquoi pas ?

**Indice** : Utilisez `docker start` et `docker exec`

---

### ✏️ Exercice 2.2 - Serveur web (10 points)

**Consignes** :
1. Lancer un conteneur Nginx sur le port 8080
2. Vérifier qu'il est accessible dans le navigateur
3. Lancer un second conteneur Nginx sur le port 8081
4. Vérifier que les deux fonctionnent simultanément

**Livrable** : Screenshot des deux serveurs actifs

---

## 🔍 Partie 3 - Exploration

### Lister les conteneurs

```bash
# Conteneurs en cours d'exécution
docker ps

# Tous les conteneurs (actifs + arrêtés)
docker ps -a

# Format personnalisé
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}"
```

**Output exemple** :
```
CONTAINER ID   NAMES    STATUS
a1b2c3d4e5f6   web      Up 2 minutes
9f8e7d6c5b4a   db       Exited (0) 5 minutes ago
```

---

### Lister les images

```bash
# Toutes les images locales
docker images

# Format détaillé
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

**Output** :
```
REPOSITORY    TAG       SIZE
nginx         latest    187MB
ubuntu        22.04     77.8MB
hello-world   latest    13.3kB
```

---

### Voir les logs d'un conteneur

```bash
# Logs du conteneur "web"
docker logs web

# Suivre les logs en temps réel (-f = follow)
docker logs -f web

# Dernières 50 lignes
docker logs --tail 50 web
```

---

### Inspecter un conteneur

```bash
# Informations détaillées (JSON)
docker inspect web

# Extraire une info spécifique (avec jq)
docker inspect web | grep IPAddress

# Ou avec format Go template
docker inspect --format='{{.NetworkSettings.IPAddress}}' web
```

---

### Exécuter une commande dans un conteneur

```bash
# Exécuter bash dans le conteneur "web"
docker exec -it web bash

# Exécuter une commande simple
docker exec web ls -la /etc/nginx

# Voir les processus
docker exec web ps aux
```

---

### ✏️ Exercice 3.1 - Exploration (15 points)

**Consignes** :

1. Lancer un conteneur PostgreSQL :
```bash
docker run -d --name db \
  -e POSTGRES_PASSWORD=secret \
  postgres:15
```

2. Répondre aux questions suivantes :
   - Quelle est l'adresse IP du conteneur ?
   - Combien de mémoire utilise-t-il ?
   - Quel est son PID sur l'hôte ?
   - Quels ports sont exposés ?

**Commandes utiles** :
```bash
docker inspect db
docker stats db --no-stream
docker top db
```

**Livrable** : Document avec les réponses + commandes utilisées

---

### ✏️ Exercice 3.2 - Logs et debugging (10 points)

**Consignes** :

1. Créer un conteneur qui affiche la date chaque seconde :
```bash
docker run -d --name timer alpine sh -c 'while true; do date; sleep 1; done'
```

2. Suivre les logs en temps réel pendant 10 secondes
3. Arrêter le conteneur
4. Redémarrer le conteneur
5. Afficher les 20 dernières lignes de logs

**Livrable** : Commandes utilisées + screenshot

---

## 🎮 Partie 4 - Manipulation avancée

### Copier des fichiers

```bash
# Hôte → Conteneur
docker cp fichier.txt web:/tmp/

# Conteneur → Hôte
docker cp web:/etc/nginx/nginx.conf ./
```

---

### Statistiques en temps réel

```bash
# Stats d'un conteneur
docker stats web --no-stream

# Stats de tous les conteneurs
docker stats
```

**Output** :
```
CONTAINER ID   NAME    CPU %   MEM USAGE / LIMIT   MEM %
a1b2c3d4e5f6   web     0.05%   5.2MiB / 7.7GiB    0.07%
```

---

### Stopper et redémarrer

```bash
# Stopper un conteneur (SIGTERM, puis SIGKILL après 10s)
docker stop web

# Stopper immédiatement (SIGKILL)
docker kill web

# Redémarrer
docker start web

# Redémarrer (stop + start)
docker restart web

# Pause/Unpause (freeze les processus)
docker pause web
docker unpause web
```

---

### Supprimer conteneurs et images

```bash
# Supprimer un conteneur (doit être arrêté)
docker rm web

# Forcer la suppression (même si actif)
docker rm -f web

# Supprimer tous les conteneurs arrêtés
docker container prune

# Supprimer une image
docker rmi ubuntu:22.04

# Supprimer toutes les images inutilisées
docker image prune -a
```

---

### Voir l'espace disque utilisé

```bash
# Vue d'ensemble
docker system df

# Détaillé
docker system df -v
```

**Output** :
```
TYPE            TOTAL   ACTIVE   SIZE      RECLAIMABLE
Images          10      5        2.5GB     1.2GB (48%)
Containers      15      3        500MB     400MB (80%)
Local Volumes   5       2        1GB       500MB (50%)
```

---

### ✏️ Exercice 4.1 - Manipulation (15 points)

**Scénario** : Vous devez lancer 3 conteneurs différents

**Consignes** :

1. **Redis** (cache) :
```bash
docker run -d --name cache redis:alpine
```

2. **PostgreSQL** (database) :
```bash
docker run -d --name db \
  -e POSTGRES_PASSWORD=secret \
  postgres:15
```

3. **Nginx** (web server) :
```bash
docker run -d --name web -p 8080:80 nginx
```

**Tâches** :
- Vérifier que les 3 conteneurs tournent (`docker ps`)
- Voir les logs de chaque conteneur
- Voir les stats de consommation
- Stopper tous les conteneurs
- Redémarrer uniquement `web`
- Supprimer `cache` et `db`

**Livrable** : Liste des commandes + screenshots

---

### ✏️ Exercice 4.2 - Nettoyage et optimisation (10 points)

**Situation** : Après une session de développement, vous avez :
- 10 conteneurs arrêtés
- 5 images inutilisées
- Des volumes orphelins

**Consignes** :

1. Vérifier l'espace disque utilisé :
```bash
docker system df
```

2. Nettoyer :
   - Supprimer tous les conteneurs arrêtés
   - Supprimer toutes les images inutilisées
   - Supprimer tous les volumes non utilisés

3. Vérifier l'espace récupéré

**Commandes à utiliser** :
```bash
docker container prune
docker image prune -a
docker volume prune
# Ou tout en une fois :
docker system prune -a --volumes
```

**Livrable** : Screenshot avant/après du `docker system df`

---

## 🎓 Exercice Bonus - Multi-conteneurs (5 points)

**Challenge** : Créer une application WordPress complète

```bash
# 1. Créer un network
docker network create wordpress-net

# 2. Lancer MySQL
docker run -d \
  --name wp-db \
  --network wordpress-net \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=wordpress \
  mysql:8

# 3. Lancer WordPress
docker run -d \
  --name wp-app \
  --network wordpress-net \
  -p 8080:80 \
  -e WORDPRESS_DB_HOST=wp-db \
  -e WORDPRESS_DB_PASSWORD=secret \
  wordpress:latest

# 4. Ouvrir http://localhost:8080
```

**Questions** :
- Comment les deux conteneurs communiquent-ils ?
- Que se passe-t-il si vous supprimez le conteneur MySQL ?
- Comment persister les données WordPress ?

---

## 📝 Grille d'évaluation

| Exercice | Points | Critères |
|----------|--------|----------|
| **1.1** Installation | 10 | Docker installé et fonctionnel |
| **2.1** Conteneurs interactifs | 10 | Manipulation correcte |
| **2.2** Serveur web | 10 | Deux serveurs actifs |
| **3.1** Exploration | 15 | Réponses correctes + commandes |
| **3.2** Logs et debugging | 10 | Commandes maîtrisées |
| **4.1** Manipulation | 15 | 3 conteneurs gérés correctement |
| **4.2** Nettoyage | 10 | Cleanup efficace |
| **Bonus** Multi-conteneurs | 5 | WordPress fonctionnel |
| **Total** | **85** | (+ 5 bonus = 90) |

**Note** : Minimum 60/85 pour valider le TP

**Rendu** :
- Format : Document PDF ou Markdown
- Contenu : Commandes + screenshots + réponses
- Deadline : Fin du Jour 1

---

## 🆘 Aide et ressources

### Commandes Docker essentielles

```bash
# Gestion des conteneurs
docker ps                    # Lister conteneurs actifs
docker ps -a                 # Tous les conteneurs
docker run                   # Créer et démarrer
docker start <container>     # Démarrer conteneur existant
docker stop <container>      # Arrêter
docker rm <container>        # Supprimer
docker logs <container>      # Voir les logs
docker exec -it <container> bash  # Ouvrir shell

# Gestion des images
docker images               # Lister images
docker pull <image>         # Télécharger
docker rmi <image>          # Supprimer
docker inspect <image>      # Inspecter

# Système
docker system df            # Espace disque
docker system prune         # Nettoyage global
```

---

### Troubleshooting

**Problème** : `permission denied while trying to connect to the Docker daemon socket`

**Solution** :
```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

**Problème** : `docker: Cannot connect to the Docker daemon`

**Solution** :
```bash
# Vérifier que le daemon tourne
sudo systemctl status docker

# Démarrer le daemon
sudo systemctl start docker
```

---

**Problème** : `docker: Error response from daemon: pull access denied`

**Solution** :
```bash
# L'image n'existe pas ou le nom est incorrect
# Vérifier sur Docker Hub : https://hub.docker.com
```

---

## 📚 Ressources complémentaires

### Documentation
- [Docker Documentation](https://docs.docker.com/)
- [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/cli/)
- [Docker Hub](https://hub.docker.com/)

### Tutoriels interactifs
- [Play with Docker](https://labs.play-with-docker.com/) - Lab Docker gratuit en ligne
- [Docker 101 Tutorial](https://www.docker.com/101-tutorial/)

### Cheat Sheets
- [Docker Cheat Sheet](https://docs.docker.com/get-started/docker_cheatsheet.pdf)

---

## ✅ Checklist avant de terminer

- [ ] Docker installé et fonctionnel
- [ ] `docker run hello-world` réussit
- [ ] J'ai lancé un conteneur interactif
- [ ] J'ai lancé un serveur web en arrière-plan
- [ ] Je sais lister les conteneurs et images
- [ ] Je sais voir les logs
- [ ] Je sais arrêter et supprimer des conteneurs
- [ ] J'ai nettoyé mon système

---

**🎉 Félicitations !** Vous avez terminé le TP1 - Découverte Docker !

**Prochaine étape** : Jour 2 - Création d'images avec Dockerfile
