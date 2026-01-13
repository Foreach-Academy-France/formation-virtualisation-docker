# Démo : Stack WordPress avec Docker Compose

## 🎯 Objectif

Démonstration en direct de Docker Compose avec une stack WordPress complète :
- WordPress (CMS)
- MySQL (base de données)
- Volumes pour persistance
- Configuration via variables d'environnement

## 📦 Stack

**Services** :
- `wordpress` : CMS WordPress (PHP)
- `db` : MySQL 8
- `phpmyadmin` (optionnel) : Interface MySQL

**Volumes** :
- `db_data` : Données MySQL
- `wordpress_data` : Fichiers WordPress

## 🚀 Déroulement de la démo (15 min)

### Étape 1 : Présenter le fichier docker-compose.yml (3 min)

```bash
cat docker-compose.yml
```

**Points à souligner** :
- ✅ 2 services : wordpress + db
- ✅ Variables d'environnement pour la connexion
- ✅ Volumes nommés pour la persistance
- ✅ depends_on : WordPress attend MySQL
- ✅ Port 8080 pour éviter conflit avec d'autres apps

### Étape 2 : Lancer la stack (2 min)

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les services démarrés
docker-compose ps

# Suivre les logs
docker-compose logs -f
# Attendre "database system is ready to accept connections" (MySQL)
# Attendre "apache2 -D FOREGROUND" (WordPress)
# Ctrl+C pour quitter
```

**Temps de démarrage** : ~30 secondes

### Étape 3 : Installer WordPress (5 min)

**Navigateur** : http://localhost:8080

1. **Choisir la langue** : Français
2. **Configuration** :
   - Titre du site : "Demo Docker"
   - Identifiant : admin
   - Mot de passe : (généré automatiquement)
   - Email : demo@example.com
3. **Installer WordPress**
4. **Se connecter**
5. **Créer un article** : "Mon premier article Docker"
6. **Publier** et voir le site

### Étape 4 : Explorer la stack (3 min)

```bash
# Services actifs
docker-compose ps

# Logs MySQL
docker-compose logs db

# Logs WordPress
docker-compose logs wordpress

# Exécuter une commande dans MySQL
docker-compose exec db mysql -u wpuser -p
# Password: wppass
# SHOW DATABASES;
# USE wordpress;
# SHOW TABLES;
# exit

# Voir les volumes
docker volume ls | grep wordpress

# Stats des conteneurs
docker stats --no-stream
```

### Étape 5 : Tester la persistance (2 min)

```bash
# 1. Vérifier que l'article existe
# → Recharger http://localhost:8080

# 2. Stopper toute la stack
docker-compose down

# 3. Vérifier que les volumes existent toujours
docker volume ls | grep wordpress

# 4. Redémarrer
docker-compose up -d

# 5. Attendre 30s puis recharger http://localhost:8080
# → L'article "Mon premier article Docker" est toujours là ! ✅
```

---

## 📝 Script de présentation

### Introduction (1 min)

"Docker Compose permet de définir toute une stack applicative dans un seul fichier YAML. Nous allons déployer WordPress avec MySQL en une seule commande."

### Présentation du fichier (3 min)

"Regardons le fichier docker-compose.yml..."

**Points clés à expliquer** :
1. **services** : Les 2 conteneurs (wordpress, db)
2. **environment** : Configuration de la connexion MySQL
3. **volumes** : Persistance des données WordPress et MySQL
4. **depends_on** : WordPress démarre après MySQL
5. **ports** : Exposition sur 8080

"Avec Docker, on aurait besoin de 10+ commandes. Avec Compose : une seule !"

### Lancement (2 min)

```bash
docker-compose up -d
```

"Cette commande va :
1. Créer le réseau
2. Créer les volumes
3. Pull les images (si nécessaire)
4. Démarrer MySQL
5. Démarrer WordPress
6. Connecter les services"

### Installation WordPress (5 min)

[Ouvrir navigateur et installer]

"Vous voyez ? WordPress se connecte automatiquement à MySQL via le nom de service 'db'. Docker Compose gère le DNS automatiquement."

### Persistance (2 min)

"Maintenant le test important : est-ce que les données persistent ?"

[down → vérifier volumes → up → vérifier site]

"Parfait ! Les données sont dans les volumes, pas dans les conteneurs."

---

## ✅ Checklist de démo

- [ ] Fichier docker-compose.yml prêt
- [ ] Aucun conteneur WordPress/MySQL existant
- [ ] Ports 8080 et 3306 disponibles
- [ ] Navigateur ouvert
- [ ] Terminal visible

## 🎓 Points clés à souligner

1. **Un fichier YAML** → Toute la stack
2. **docker-compose up** → Infrastructure en 30 secondes
3. **Services par nom** → `db:3306` au lieu d'IP
4. **Volumes automatiques** → Créés par Compose
5. **Réseau automatique** → Créé et connecté
6. **depends_on** → Ordre de démarrage

## ⚠️ Erreurs courantes

1. **Port déjà utilisé** → Changer 8080:80 en 8081:80
2. **MySQL pas prêt** → Attendre les logs "ready to accept connections"
3. **Volumes pas créés** → Vérifier section `volumes:` dans compose
4. **WordPress ne se connecte pas** → Vérifier variables d'env (WORDPRESS_DB_*)

## 🧹 Cleanup après la démo

```bash
# Stopper et supprimer tout
docker-compose down

# Avec les volumes (⚠️ perte de données)
docker-compose down -v

# Vérifier
docker ps -a
docker volume ls
```

## 🔗 Références

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Compose File Reference](https://docs.docker.com/compose/compose-file/)
- [WordPress Official Image](https://hub.docker.com/_/wordpress)
- [MySQL Official Image](https://hub.docker.com/_/mysql)
