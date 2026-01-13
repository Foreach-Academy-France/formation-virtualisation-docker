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
---

<!-- Mermaid support -->
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true, theme: 'default' });
</script>

<!-- _class: lead -->

# 🐳 Jour 1
## Fondamentaux de Docker

**Formation Virtualisation & Conteneurisation**
M2 ESTD - Architecte Web
ForEach Academy

---

## 👋 Bienvenue!

**Objectifs de la formation (5 jours)** :
- ✅ Maîtriser Docker de A à Z
- ✅ Dockeriser des applications
- ✅ Gérer des environnements multi-conteneurs
- ✅ Appliquer les best practices

**Aujourd'hui (Jour 1)** :
1. Module 1 : Présentation Docker
2. Module 2 : Principes et Architectures
3. Module 3 : Écosystème Docker
4. TP1 : Découverte Docker

---

## 📋 Planning de la journée

| Horaire | Contenu |
|---------|---------|
| 9h00-11h00 | Module 1 : Présentation Docker |
| 11h15-12h15 | Module 2 : Architectures |
| 13h15-15h00 | Module 3 : Écosystème |
| 15h15-17h00 | TP1 : Découverte Docker |

---

<!-- _class: lead -->

# Module 1
## Présentation Docker

---

## Le problème avant Docker

**"It works on my machine!"** 😱

**Le parcours du combattant** :

- ✅ **Développeur A** (Node 16) → Fonctionne
- ❌ **Développeur B** (Node 18) → Crash
- ⚠️ **Serveur staging** → Comportement différent
- 💥 **Production** → NE FONCTIONNE PAS

**Causes** :
- Versions de dépendances différentes
- Configuration système différente
- Variables d'environnement manquantes

---

## La solution : Docker

**Docker** = Empaqueter application + dépendances dans un **conteneur**

**Un conteneur inclut** :
- 📦 Application
- ⚙️ Node.js 18
- 📚 npm packages
- 🔧 Configuration
- 🌍 Variables d'environnement

**Promesse** : "Si ça fonctionne dans un conteneur, <span class="highlight">ça fonctionnera partout</span>"

---

## Qu'est-ce qu'un conteneur ?

**Conteneur** = Unité d'exécution isolée qui :
- Partage le **kernel** du système hôte
- Contient l'application + dépendances
- S'exécute de manière **isolée**

**Analogie** : Conteneur maritime 🚢
- Standardisé (fonctionne sur tous les bateaux)
- Isolé (contenu protégé)
- Portable (transportable partout)

---

## Conteneurs vs Machines Virtuelles

![width:900px](https://docs.docker.com/get-started/images/Container%402x.png)

**VM** : OS complet (1-2 GB, boot 30s-2min)
**Conteneur** : Partage kernel (10-200 MB, boot < 1s)

---

## Comparaison détaillée

| Critère | VMs | Conteneurs |
|---------|-----|------------|
| **Démarrage** | 30s - 2 min | < 1 seconde |
| **Taille** | 1-2 GB | 10-200 MB |
| **Performance** | ~95% | ~99% |
| **Densité** | 10-20/serveur | 100-1000+ |
| **Isolation** | Forte | Moyenne |

---

## Cas d'usage Docker

**1. Environnements de développement** 💻
- Tous les devs ont le même environnement
- `docker-compose up` → environnement prêt

**2. Microservices** 🏗️
- Chaque service = conteneur indépendant
- Scaling horizontal facile

**3. CI/CD** 🚀
- Build reproductible
- Tests dans conteneurs

---

## Cas d'usage (suite)

**4. Multi-environnements** 🌍

Dev → Staging → Production
**(même image Docker partout)**

**5. Isolation d'applications** 🔒
```bash
docker run -d node:16 app1  # App avec Node 16
docker run -d node:20 app2  # App avec Node 20
```

Sans Docker : impossible sans configuration complexe!

---

## Statistiques Docker (2024-2025)

- **318 milliards** de pulls Docker Hub
- **96%** des organisations utilisent des conteneurs
- **7,3 millions** de comptes Docker Hub

**Entreprises utilisant Docker** :
- Netflix, Spotify, Uber (4000+ microservices)
- PayPal, Airbnb, ING Bank

<span class="highlight">Docker = standard de l'industrie</span>

---

<!-- _class: lead -->

# Module 2
## Principes et Architectures

---

## Technologies sous-jacentes

Docker s'appuie sur des technologies **Linux** :

1. **LXC** (Linux Containers) - Ancêtre de Docker
2. **Namespaces** - Isolation des ressources
3. **Cgroups** - Limitation des ressources
4. **OverlayFS** - Système de fichiers en layers

> ⚠️ Objectif : comprendre "comment ça marche", pas devenir expert système

---

## LXC : Linux Containers

**LXC** (2008) = Conteneurs Linux avant Docker

**Différence LXC vs Docker** :

| LXC | Docker |
|-----|--------|
| Machine virtuelle légère | Application isolée |
| init (systemd) | Processus direct |
| Système complet | App unique |

Docker utilisait LXC au début (2013), puis l'a remplacé par **libcontainer/runc** (2014)

---

## Control Groups (cgroups)

**cgroups** = Limiter et mesurer les ressources

**4 fonctions** :
1. **Limitation** : CPU, RAM, I/O
2. **Priorisation** : Plus de ressources à un groupe
3. **Accounting** : Mesurer la consommation
4. **Contrôle** : Freeze, kill, restart

```bash
# Limiter à 512 MB de RAM
docker run -m 512m nginx

# Limiter à 50% d'un CPU
docker run --cpus="0.5" nginx
```

---

## Namespaces Linux

**Namespaces** = Isolation des ressources

| Namespace | Isolation |
|-----------|-----------|
| **PID** | IDs de processus |
| **NET** | Stack réseau (IP, ports) |
| **MNT** | Système de fichiers |
| **UTS** | Hostname |
| **IPC** | Communication inter-processus |
| **USER** | UIDs/GIDs |

**Résultat** : Chaque conteneur vit dans sa "bulle"

---

## Exemple : PID Namespace

**Hôte** :
```bash
ps aux
# PID 1 = systemd
# PID 1234 = nginx (conteneur)
# PID 5678 = postgres (autre conteneur)
```

**Dans le conteneur** :
```bash
ps aux
# PID 1 = nginx (seul processus visible)
```

---

## OverlayFS : Système de layers

**Images Docker** = Empilement de **layers** (couches)

**Structure** :
- 🔴 **Container Layer** (Read-Write) → Modifications runtime
- 🔵 **Layer 4** : COPY index.html
- 🔵 **Layer 3** : RUN apt install nginx
- 🔵 **Layer 2** : RUN apt-get update
- 🔵 **Layer 1** : FROM ubuntu:22.04 (Base)

**Avantages** : Réutilisation, économie d'espace

---

## Copy-on-Write (CoW)

**Principe** : Fichiers copiés uniquement si modifiés

**Comportement** :
1. 📖 **Lecture** → Depuis le layer le plus haut
2. ✏️ **Modification** → Copie dans container layer
3. 🗑️ **Suppression** → Fichier "whiteout"

**Bénéfices** :
- 💾 Économie d'espace (layers partagés)
- ⚡ Performance (pas de copie si lecture seule)

---

## Architecture Docker

<div class="mermaid">
flowchart TD
    CLI[Docker CLI<br/>Interface utilisateur]
    CLI -->|REST API| Daemon[Docker Daemon]
    Daemon --> containerd[containerd<br/>Runtime haut niveau]
    containerd --> runc[runc OCI<br/>Runtime bas niveau]
    runc --> Container[Container]
</div>

**Stack** : CLI → Daemon → containerd → runc → Container

---

## Flow : `docker run nginx`

**Séquence d'exécution** :

1. 💻 `docker run nginx`
2. 🔄 Docker CLI → REST API → Daemon
3. 🔍 Daemon vérifie si image existe
4. 📥 Si non, pull depuis Docker Hub
5. ⚙️ Daemon → containerd → runc
6. 🔧 runc configure namespaces, cgroups
7. ✅ Conteneur démarre (nginx = PID 1)

---

<!-- _class: lead -->

# Module 3
## Docker et son Écosystème

---

## Les composants Docker

**Docker Engine** :
- Docker Daemon (dockerd)
- Docker CLI
- containerd + runc

**Docker Desktop** :
- GUI pour macOS/Windows
- VM Linux intégrée
- Dashboard visuel

---

## Docker Hub

**Le "GitHub" des images Docker**

- 🌐 https://hub.docker.com
- 📦 18 millions d'images publiques
- ✅ Images officielles (nginx, postgres, node, etc.)

**Commands** :
```bash
docker pull nginx:alpine    # Télécharger
docker push myapp:1.0       # Publier
docker search postgres      # Rechercher
```

---

## Rate limits Docker Hub (2020)

| Compte | Pulls par 6h |
|--------|-------------|
| Anonymous | 100 |
| Free (auth) | 200 |
| Pro | Illimité |

**Solution** : S'authentifier ou utiliser un registry privé

---

## Docker Compose

**Orchestrer plusieurs conteneurs**

```yaml
version: '3'
services:
  web:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:15
    volumes:
      - db-data:/var/lib/postgresql/data
volumes:
  db-data:
```

```bash
docker-compose up  # Démarre toute la stack
```

---

## Docker Compose : Cas d'usage

**Application web typique** :
- Frontend (React/Next.js)
- Backend API (Node.js/Python)
- Database (PostgreSQL/MongoDB)
- Cache (Redis)

**Un seul fichier** `docker-compose.yml` = toute l'infra!

```bash
git clone repo
docker-compose up
# → Application prête en 30 secondes
```

---

## Docker Registry

**Registry** = Stockage d'images Docker

**Options** :
1. **Docker Hub** (public/privé, limites)
2. **GitHub Container Registry** (ghcr.io, gratuit)
3. **AWS ECR** (privé, intégré AWS)
4. **Google Artifact Registry** (privé, GCP)
5. **Harbor** (self-hosted, open source)

---

## Docker Machine

**Créer des hôtes Docker** (moins utilisé maintenant)

```bash
# Créer une VM avec Docker
docker-machine create --driver virtualbox dev

# Se connecter
eval $(docker-machine env dev)

# Lister les machines
docker-machine ls
```

**Aujourd'hui** : Remplacé par cloud providers (AWS, Azure, GCP)

---

## L'écosystème plus large

**Orchestration** :
- Kubernetes (leader)
- Docker Swarm
- Nomad

**Registres** :
- Harbor, Quay, Nexus

**Sécurité** :
- Trivy, Snyk, Aqua

**Monitoring** :
- Prometheus, Grafana

---

<!-- _class: lead -->

# Démo Live
## Premier conteneur Docker

---

## Démo : Hello World

```bash
# 1. Vérifier Docker
docker --version

# 2. Premier conteneur
docker run hello-world

# 3. Conteneur interactif
docker run -it ubuntu bash
  # Dans le conteneur :
  apt-get update
  apt-get install curl
  curl https://example.com
  exit

# 4. Serveur web
docker run -d -p 8080:80 nginx
# Ouvrir http://localhost:8080
```

---

## Démo : Commandes de base

```bash
# Lister les conteneurs actifs
docker ps

# Lister tous les conteneurs
docker ps -a

# Voir les logs
docker logs <container-id>

# Stopper un conteneur
docker stop <container-id>

# Supprimer un conteneur
docker rm <container-id>
```

---

## Démo : Images

```bash
# Lister les images locales
docker images

# Télécharger une image
docker pull python:3.11-alpine

# Supprimer une image
docker rmi python:3.11-alpine

# Inspecter une image
docker inspect nginx:alpine
```

---

<!-- _class: lead -->

# TP1
## Découverte Docker
**(1h45)**

---

## Objectifs TP1

**Installation** :
1. Installer Docker sur votre machine
2. Configurer le groupe docker
3. Vérifier l'installation

**Pratique** :
4. Lancer des conteneurs
5. Commandes de gestion
6. Explorer les images

**📝 Énoncé complet** : `tp/tp1-decouverte-docker/`

---

## TP1 - Partie 1 : Installation

**Linux (Debian/Ubuntu)** :
```bash
# Script officiel
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter au groupe docker
sudo usermod -aG docker $USER
newgrp docker

# Vérifier
docker run hello-world
```

---

## TP1 - Partie 2 : Exploration

**Exercice** : Lancer plusieurs conteneurs

```bash
# 1. Nginx
docker run -d --name web -p 8080:80 nginx

# 2. Redis
docker run -d --name cache redis:alpine

# 3. PostgreSQL
docker run -d --name db \
  -e POSTGRES_PASSWORD=secret \
  postgres:15

# Lister et inspecter
docker ps
docker logs web
docker inspect db
```

---

## TP1 - Partie 3 : Nettoyage

```bash
# Stopper tous les conteneurs
docker stop $(docker ps -aq)

# Supprimer tous les conteneurs
docker rm $(docker ps -aq)

# Supprimer les images inutilisées
docker image prune

# Voir l'espace utilisé
docker system df
```

---

<!-- _class: lead -->

# Récapitulatif Jour 1

---

## Ce que nous avons vu

✅ **Module 1** : Présentation Docker
- Conteneurs vs VMs
- Cas d'usage
- Statistiques

✅ **Module 2** : Principes et Architectures
- LXC, cgroups, namespaces
- OverlayFS et layers

✅ **Module 3** : Écosystème Docker
- Docker Hub, Compose, Registry

✅ **TP1** : Découverte pratique

---

## Points clés à retenir

🐳 Docker = Empaqueter app + dépendances dans un conteneur

⚡ Conteneurs : légers, rapides, portables

🏗️ Architecture : namespaces + cgroups + OverlayFS

📦 Écosystème riche : Hub, Compose, Registry

---

## Demain (Jour 2)

**Module 4** : Installation et Configuration
**Module 5** : Création d'images (Dockerfile)
**TP2** : Dockeriser une application

**Prérequis** :
- Docker installé et fonctionnel
- Compte Docker Hub créé
- Éditeur de code (VSCode recommandé)

---

<!-- _class: lead -->

# Questions ?

**À demain pour le Jour 2!** 🚀

---

<!-- _class: lead -->

# Merci !

**Formation Docker - Jour 1**
M2 ESTD - Architecte Web

📧 fabrice.claeys@groupe-bao.fr
