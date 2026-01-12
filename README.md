# 🐳 Formation Virtualisation et Conteneurisation avec Docker

> Formation de 5 jours (35h) sur Docker et la conteneurisation pour architectes web

**Public**: M2 ESTD - Expert en stratégie et transformation digitale - Architecte Web
**Durée**: 35 heures (5 jours × 7h)
**Institution**: IEF2I / Digital School of Paris
**Référent**: Michael MAVRODIS

---

## 📋 Programme des 5 Jours

**Durée totale**: 35 heures
**Format**: Théorie + Travaux Pratiques + Démos Live

### 📅 Jour 1 - Fondamentaux (7h)

| Horaire | Module | Contenu | Durée |
|---------|--------|---------|-------|
| 9h00-9h30 | 🎯 | Accueil et introduction | 30min |
| 9h30-11h00 | 📚 Module 1 | **Présentation Docker** | 1h30 |
| | | - Principe de la conteneurisation | |
| | | - Cas d'utilisation | |
| | | - Fonctionnalités principales | |
| 11h00-11h15 | ☕ | Pause | 15min |
| 11h15-12h15 | 🏗️ Module 2 | **Principes et Architectures** | 1h |
| | | - LXC, cgroups, namespaces | |
| | | - Systèmes de fichiers (OverlayFS) | |
| 12h15-13h15 | 🍽️ | Pause déjeuner | 1h |
| 13h15-15h00 | 🐳 Module 3 | **Docker et son Écosystème** | 1h45 |
| | | - Docker Engine, Hub, Registry | |
| | | - Docker Machine, Compose | |
| | | - Démo : Premier conteneur | |
| 15h00-15h15 | ☕ | Pause | 15min |
| 15h15-17h00 | 💻 TP1 | **Découverte Docker** | 1h45 |
| | | - Installation et configuration | |
| | | - Commandes de base | |

**📊 Slides**: [Jour 1](./slides/jour1-fondamentaux.md)
**📝 TP1**: [Découverte Docker](./tp/tp1-decouverte-docker/)

---

### 📅 Jour 2 - Installation et Images (7h)

| Horaire | Module | Contenu | Durée |
|---------|--------|---------|-------|
| 9h00-10h30 | ⚙️ Module 4 | **Installation et Configuration** | 1h30 |
| | | - Installation sur Debian | |
| | | - Configuration Docker groupe | |
| | | - TP guidé : Setup complet | |
| 10h30-10h45 | ☕ | Pause | 15min |
| 10h45-12h15 | 🖼️ Module 5 | **Création d'images personnalisées** | 1h30 |
| | | - Dockerfile : FROM, RUN, COPY, etc. | |
| | | - Instructions principales | |
| | | - Best practices | |
| 12h15-13h15 | 🍽️ | Pause déjeuner | 1h |
| 13h15-15h00 | 🏗️ | **Multi-stage builds** | 1h45 |
| | | - Pattern build + runtime | |
| | | - Optimisation des images | |
| | | - .dockerignore | |
| 15h00-15h15 | ☕ | Pause | 15min |
| 15h15-17h00 | 💻 TP2 | **Dockeriser une application** | 1h45 |
| | | - Créer un Dockerfile | |
| | | - Build et optimisation | |

**📊 Slides**: [Jour 2](./slides/jour2-images.md)
**📝 TP2**: [Dockeriser une application](./tp/tp2-dockeriser-app/)

---

### 📅 Jour 3 - Gestion et Persistance (7h)

| Horaire | Module | Contenu | Durée |
|---------|--------|---------|-------|
| 9h00-11h00 | 🎮 Module 6 | **Gestion des conteneurs** | 2h |
| | | - Commandes : ps, ls, stats, logs | |
| | | - Runtime : start, stop, exec | |
| | | - Networking Docker | |
| 11h00-11h15 | ☕ | Pause | 15min |
| 11h15-12h15 | 💾 Module 7 | **Volumes de données** | 1h |
| | | - Initialisation des volumes | |
| | | - Persistance des données | |
| | | - docker inspect | |
| 12h15-13h15 | 🍽️ | Pause déjeuner | 1h |
| 13h15-15h00 | 🌐 | **Docker Networking approfondi** | 1h45 |
| | | - Bridge, host, overlay | |
| | | - Communication inter-conteneurs | |
| 15h00-15h15 | ☕ | Pause | 15min |
| 15h15-17h00 | 💻 TP3 | **Stack applicative** | 1h45 |
| | | - App + Database + Cache | |
| | | - Volumes et networks | |

**📊 Slides**: [Jour 3](./slides/jour3-gestion-volumes.md)
**📝 TP3**: [Stack applicative complète](./tp/tp3-stack-app/)

---

### 📅 Jour 4 - Registry et Compose (7h)

| Horaire | Module | Contenu | Durée |
|---------|--------|---------|-------|
| 9h00-10h30 | 📦 Module 8 | **Registry privé** | 1h30 |
| | | - Docker Registry | |
| | | - Push/Pull images | |
| | | - Tags et versioning | |
| 10h30-10h45 | ☕ | Pause | 15min |
| 10h45-12h15 | 🐙 Module 9 | **Docker Compose - Partie 1** | 1h30 |
| | | - docker-compose.yml | |
| | | - Services, networks, volumes | |
| 12h15-13h15 | 🍽️ | Pause déjeuner | 1h |
| 13h15-15h00 | 🏗️ | **Docker Compose - Partie 2** | 1h45 |
| | | - Applications multi-conteneurs | |
| | | - Exemple: WordPress complet | |
| | | - Variables d'environnement | |
| 15h00-15h15 | ☕ | Pause | 15min |
| 15h15-17h00 | 💻 TP4 | **Application multi-conteneurs** | 1h45 |
| | | - Compose complet | |
| | | - Registry privé | |

**📊 Slides**: [Jour 4](./slides/jour4-registry-compose.md)
**📝 TP4**: [Docker Compose avancé](./tp/tp4-compose-avance/)

---

### 📅 Jour 5 - Production et Projet (7h)

| Horaire | Module | Contenu | Durée |
|---------|--------|---------|-------|
| 9h00-10h30 | 🔒 | **Sécurité Docker** | 1h30 |
| | | - Best practices sécurité | |
| | | - Scanning d'images (Trivy) | |
| | | - Utilisateurs non-root | |
| 10h30-10h45 | ☕ | Pause | 15min |
| 10h45-12h15 | 📊 | **Docker en Production** | 1h30 |
| | | - Healthchecks | |
| | | - Logging et monitoring | |
| | | - Orchestration (intro Kubernetes) | |
| 12h15-13h15 | 🍽️ | Pause déjeuner | 1h |
| 13h15-15h30 | 🚀 Projet | **Projet fil rouge** | 2h15 |
| | | - Dockeriser une app complète | |
| | | - Multi-stage, compose, registry | |
| 15h30-15h45 | ☕ | Pause | 15min |
| 15h45-17h00 | 📝 | **QCM + Évaluation TP** | 1h15 |

**📊 Slides**: [Jour 5](./slides/jour5-production-projet.md)
**📝 Projet**: [Projet fil rouge](./tp/tp5-projet-final/)
**📝 Évaluation**: [QCM + TP noté](./evaluation/)

---

## 🎯 Objectifs Pédagogiques

À l'issue de la formation, les participants seront capables de :

✅ Comprendre le principe de la conteneurisation et ses avantages
✅ Installer et configurer Docker sur Linux
✅ Créer des images Docker personnalisées avec Dockerfile
✅ Gérer le cycle de vie des conteneurs
✅ Utiliser les volumes pour la persistance des données
✅ Mettre en place un registry privé
✅ Orchestrer des applications multi-conteneurs avec Docker Compose
✅ Appliquer les bonnes pratiques de sécurité

---

## 📚 Ressources

### Documentation officielle
- [Docker Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Outils recommandés
- **Docker Desktop** (macOS/Windows)
- **Docker Engine** (Linux)
- **VSCode** + Extension Docker
- **Trivy** (scanning de vulnérabilités)

---

## 📊 Évaluation

### Contrôle continu (50%)
- TP1 : Découverte Docker (10%)
- TP2 : Dockeriser une application (10%)
- TP3 : Stack applicative (10%)
- TP4 : Docker Compose avancé (10%)
- Projet fil rouge (10%)

### QCM final (50%)
- 30 questions
- Durée : 45 minutes
- Connaissances théoriques et pratiques

**Validation de la compétence** : Note ≥ 10/20

---

## 🎬 Démos Disponibles

Toutes les démos sont disponibles avec CI/CD configuré :

- [Demo Docker Basics](./demos/demo-basics/)
- [Demo Multi-Stage Build](./demos/demo-multi-stage/)
- [Demo Docker Compose](./demos/demo-compose/)
- [Demo Registry Privé](./demos/demo-registry/)

---

## 👨‍💻 Setup Environnement

### Prérequis
- **OS** : Linux (Debian/Ubuntu recommandé) ou macOS/Windows avec Docker Desktop
- **RAM** : 8 GB minimum (16 GB recommandé)
- **Disk** : 20 GB d'espace libre
- **Droits** : sudo/admin

### Installation rapide (Linux)

```bash
# Installation Docker sur Debian/Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Vérifier l'installation
docker --version
docker run hello-world
```

---

## 📞 Contact

**Référent pédagogique** : Michael MAVRODIS
**Email** : michaelmavrodis@formateur.ief2i.fr

---

**© 2025 - Formation Docker - IEF2I / Digital School of Paris**
