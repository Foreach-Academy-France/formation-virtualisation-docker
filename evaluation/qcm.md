# QCM Final - Virtualisation et Conteneurisation avec Docker

**Durée** : 45 minutes
**Total** : 30 questions
**Barème** : 1 point par question (sauf mention contraire)

---

## Section 1 : Fondamentaux (10 questions)

### Question 1
Quelle est la principale différence entre un conteneur et une machine virtuelle ?

- [ ] A) Un conteneur est plus lourd qu'une VM
- [ ] B) Un conteneur partage le noyau du système hôte
- [ ] C) Un conteneur nécessite un hyperviseur
- [ ] D) Un conteneur ne peut pas être isolé

---

### Question 2
Quelle technologie Linux permet l'isolation des ressources pour les conteneurs ?

- [ ] A) systemd
- [ ] B) SELinux uniquement
- [ ] C) cgroups et namespaces
- [ ] D) iptables

---

### Question 3
Quelle commande permet de lister tous les conteneurs (y compris ceux arrêtés) ?

- [ ] A) `docker ps`
- [ ] B) `docker ps -a`
- [ ] C) `docker list --all`
- [ ] D) `docker containers`

---

### Question 4
Quel est le rôle de Docker Hub ?

- [ ] A) Un IDE pour Docker
- [ ] B) Un registry public pour stocker et partager des images
- [ ] C) Un outil de monitoring
- [ ] D) Un orchestrateur de conteneurs

---

### Question 5
Quelle commande permet d'exécuter une commande dans un conteneur en cours d'exécution ?

- [ ] A) `docker run`
- [ ] B) `docker start`
- [ ] C) `docker exec`
- [ ] D) `docker attach`

---

### Question 6
Que fait la commande `docker pull nginx:latest` ?

- [ ] A) Crée un conteneur nginx
- [ ] B) Télécharge l'image nginx avec le tag latest
- [ ] C) Met à jour un conteneur existant
- [ ] D) Supprime l'image nginx

---

### Question 7
Quelle option de `docker run` permet de mapper un port du conteneur vers l'hôte ?

- [ ] A) `-v`
- [ ] B) `-e`
- [ ] C) `-p`
- [ ] D) `-n`

---

### Question 8
Que signifie l'option `-d` dans `docker run -d nginx` ?

- [ ] A) Debug mode
- [ ] B) Delete after stop
- [ ] C) Detached mode (arrière-plan)
- [ ] D) Development mode

---

### Question 9
Quelle commande permet de voir les logs d'un conteneur ?

- [ ] A) `docker inspect`
- [ ] B) `docker logs`
- [ ] C) `docker debug`
- [ ] D) `docker output`

---

### Question 10
Quel système de fichiers Docker utilise-t-il pour ses images en couches ?

- [ ] A) ext4
- [ ] B) NTFS
- [ ] C) OverlayFS (ou overlay2)
- [ ] D) ZFS uniquement

---

## Section 2 : Images et Dockerfile (8 questions)

### Question 11
Quelle instruction Dockerfile est utilisée pour définir l'image de base ?

- [ ] A) `BASE`
- [ ] B) `IMAGE`
- [ ] C) `FROM`
- [ ] D) `SOURCE`

---

### Question 12
Quelle est la différence entre `COPY` et `ADD` dans un Dockerfile ?

- [ ] A) Aucune différence
- [ ] B) ADD peut décompresser des archives et télécharger des URLs
- [ ] C) COPY est plus rapide
- [ ] D) ADD est déprécié

---

### Question 13
Quelle instruction définit la commande par défaut d'un conteneur ?

- [ ] A) `RUN`
- [ ] B) `EXEC`
- [ ] C) `CMD`
- [ ] D) `START`

---

### Question 14
Qu'est-ce qu'un multi-stage build ?

- [ ] A) Builder plusieurs images en parallèle
- [ ] B) Utiliser plusieurs FROM dans un Dockerfile pour optimiser l'image finale
- [ ] C) Exécuter plusieurs CMD
- [ ] D) Builder sur plusieurs machines

---

### Question 15
Quelle commande permet de builder une image à partir d'un Dockerfile ?

- [ ] A) `docker create`
- [ ] B) `docker build`
- [ ] C) `docker make`
- [ ] D) `docker compile`

---

### Question 16
Quel fichier permet d'exclure des fichiers du contexte de build ?

- [ ] A) `.gitignore`
- [ ] B) `.dockerexclude`
- [ ] C) `.dockerignore`
- [ ] D) `Dockerfile.ignore`

---

### Question 17
Quelle instruction permet de définir le répertoire de travail dans le conteneur ?

- [ ] A) `WORKDIR`
- [ ] B) `DIR`
- [ ] C) `CD`
- [ ] D) `PWD`

---

### Question 18
Pourquoi est-il recommandé d'utiliser des images Alpine ?

- [ ] A) Elles sont plus rapides à l'exécution
- [ ] B) Elles sont plus petites et ont moins de vulnérabilités potentielles
- [ ] C) Elles sont officiellement supportées par Docker
- [ ] D) Elles ont plus de fonctionnalités

---

## Section 3 : Volumes et Networking (6 questions)

### Question 19
Quelle est la différence entre un volume et un bind mount ?

- [ ] A) Aucune différence
- [ ] B) Les volumes sont gérés par Docker, les bind mounts pointent vers un chemin du host
- [ ] C) Les bind mounts sont plus rapides
- [ ] D) Les volumes ne persistent pas les données

---

### Question 20
Quelle commande crée un volume Docker nommé ?

- [ ] A) `docker volume add myvolume`
- [ ] B) `docker volume create myvolume`
- [ ] C) `docker create volume myvolume`
- [ ] D) `docker new volume myvolume`

---

### Question 21
Quel driver réseau permet l'isolation totale d'un conteneur (pas d'accès réseau) ?

- [ ] A) bridge
- [ ] B) host
- [ ] C) none
- [ ] D) overlay

---

### Question 22
Comment les conteneurs sur le même réseau Docker peuvent-ils communiquer ?

- [ ] A) Par adresse IP uniquement
- [ ] B) Par nom de conteneur (DNS interne)
- [ ] C) Ils ne peuvent pas communiquer
- [ ] D) Par socket Unix uniquement

---

### Question 23
Quelle option permet de monter un volume en lecture seule ?

- [ ] A) `-v myvolume:/data:readonly`
- [ ] B) `-v myvolume:/data:ro`
- [ ] C) `-v myvolume:/data --readonly`
- [ ] D) `--volume-readonly myvolume:/data`

---

### Question 24
Quel driver réseau est utilisé par défaut pour les conteneurs ?

- [ ] A) host
- [ ] B) overlay
- [ ] C) bridge
- [ ] D) macvlan

---

## Section 4 : Docker Compose (3 questions)

### Question 25
Quelle commande démarre tous les services définis dans docker-compose.yml en arrière-plan ?

- [ ] A) `docker-compose start -d`
- [ ] B) `docker-compose up -d`
- [ ] C) `docker-compose run -d`
- [ ] D) `docker-compose deploy`

---

### Question 26
Dans docker-compose.yml, quelle directive permet de s'assurer qu'un service démarre après un autre ?

- [ ] A) `requires`
- [ ] B) `after`
- [ ] C) `depends_on`
- [ ] D) `needs`

---

### Question 27
Quelle commande arrête et supprime les conteneurs, réseaux et volumes définis dans le compose ?

- [ ] A) `docker-compose stop -v`
- [ ] B) `docker-compose down -v`
- [ ] C) `docker-compose rm -v`
- [ ] D) `docker-compose delete -v`

---

## Section 5 : Sécurité et Production (3 questions)

### Question 28
Pourquoi est-il recommandé d'utiliser un utilisateur non-root dans les conteneurs ?

- [ ] A) Pour améliorer les performances
- [ ] B) Pour réduire l'impact en cas de compromission du conteneur
- [ ] C) C'est obligatoire depuis Docker 20
- [ ] D) Pour économiser de la mémoire

---

### Question 29
Quel outil permet de scanner les vulnérabilités d'une image Docker ?

- [ ] A) Docker Scan uniquement
- [ ] B) Trivy, Clair, ou Docker Scout
- [ ] C) docker inspect
- [ ] D) hadolint

---

### Question 30 (2 points)
Citez 3 bonnes pratiques de sécurité pour les conteneurs Docker en production :

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## Barème

| Section | Questions | Points |
|---------|-----------|--------|
| Fondamentaux | 1-10 | 10 |
| Images/Dockerfile | 11-18 | 8 |
| Volumes/Networking | 19-24 | 6 |
| Docker Compose | 25-27 | 3 |
| Sécurité/Production | 28-30 | 4 |
| **Total** | | **31** |

**Note finale** : Points obtenus × 20 / 31

**Validation** : ≥ 10/20
