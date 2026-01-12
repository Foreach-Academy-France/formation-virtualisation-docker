# Démo : Monitoring et Volumes Docker

## 🎯 Objectif

Démonstration en direct des commandes de monitoring Docker et de la persistance avec volumes :
- Monitoring (ps, stats, logs, inspect)
- Volumes et persistance avec PostgreSQL
- Backup et restore de volumes

## 🚀 Déroulement de la démo

### Partie 1 : Monitoring (10 min)

**Étape 1 : Lancer plusieurs conteneurs**

```bash
# Web server
docker run -d --name web -p 8080:80 nginx

# API
docker run -d --name api -p 3000:3000 \
  -e PORT=3000 \
  node:18-alpine \
  sh -c "npm init -y && npm install express && node -e \"const express = require('express'); const app = express(); app.get('/', (req,res) => res.json({status:'ok'})); app.listen(3000, () => console.log('Ready'));\""

# Database
docker run -d --name db \
  -e POSTGRES_PASSWORD=demo \
  postgres:15-alpine
```

**Étape 2 : Commandes de monitoring**

```bash
# Liste des conteneurs
docker ps

# Stats temps réel
docker stats --no-stream

# Format personnalisé
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Logs
docker logs web
docker logs -f api  # Suivre en temps réel (Ctrl+C pour quitter)

# Processus
docker top db

# Inspecter
docker inspect web | grep IPAddress
docker inspect db --format='{{.Config.Env}}'
```

**Étape 3 : Exécution de commandes**

```bash
# Shell interactif
docker exec -it db bash

# Dans le conteneur :
psql -U postgres
\l
\q
exit

# Commande directe
docker exec db psql -U postgres -c "\l"
```

---

### Partie 2 : Volumes et Persistance (10 min)

**Étape 1 : Créer un volume**

```bash
# Créer un volume nommé
docker volume create demo-pgdata

# Lister
docker volume ls

# Inspecter
docker volume inspect demo-pgdata
```

**Étape 2 : PostgreSQL avec volume**

```bash
# Lancer avec volume
docker run -d \
  --name pg-persist \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=demo \
  -v demo-pgdata:/var/lib/postgresql/data \
  postgres:15

# Attendre le démarrage
sleep 5

# Créer des données
docker exec pg-persist psql -U postgres -d demo -c "
  CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2)
  );

  INSERT INTO products (name, price) VALUES
    ('Docker Course', 99.99),
    ('Kubernetes Course', 149.99),
    ('DevOps Bundle', 199.99);

  SELECT * FROM products;
"
```

**Étape 3 : Tester la persistance**

```bash
# Supprimer le conteneur (mais pas le volume!)
docker rm -f pg-persist

# Vérifier que le volume existe toujours
docker volume ls | grep demo-pgdata

# Recréer un nouveau conteneur avec le MÊME volume
docker run -d \
  --name pg-persist-2 \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=demo \
  -v demo-pgdata:/var/lib/postgresql/data \
  postgres:15

# Attendre
sleep 5

# Vérifier que les données sont toujours là
docker exec pg-persist-2 psql -U postgres -d demo -c "SELECT * FROM products;"

# → Les 3 produits sont toujours là ! ✅
```

---

### Partie 3 : Backup et Restore (5 min)

**Backup d'un volume** :

```bash
# Créer un backup du volume PostgreSQL
docker run --rm \
  -v demo-pgdata:/data:ro \
  -v $(pwd):/backup \
  alpine tar czf /backup/pgdata-backup-$(date +%Y%m%d).tar.gz -C /data .

# Vérifier
ls -lh pgdata-backup-*.tar.gz
```

**Restore** :

```bash
# Créer un nouveau volume
docker volume create demo-pgdata-restored

# Restaurer le backup
docker run --rm \
  -v demo-pgdata-restored:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/pgdata-backup-$(date +%Y%m%d).tar.gz -C /data

# Tester avec un conteneur
docker run --rm \
  -v demo-pgdata-restored:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret \
  postgres:15 \
  postgres --version

echo "✅ Backup et restore fonctionnent!"
```

---

## 📝 Script de présentation

### Introduction (2 min)

"Maintenant que nous savons créer des images, voyons comment gérer les conteneurs au quotidien et persister les données. Docker offre des commandes puissantes pour monitorer, debugger et gérer les volumes."

### Partie 1 : Monitoring (10 min)

"Lançons plusieurs conteneurs pour simuler une application réelle."

[Lancer web, api, db]

"Voici les commandes essentielles pour monitorer vos conteneurs en production :"

1. **docker ps** : Vue d'ensemble
2. **docker stats** : Ressources en temps réel (CPU, RAM, I/O)
3. **docker logs** : Debugging et troubleshooting
4. **docker inspect** : Infos détaillées (config, réseau, volumes)
5. **docker exec** : Accès shell pour investigation

"Ces commandes sont indispensables au quotidien pour debugger et monitorer vos applications."

### Partie 2 : Volumes (10 min)

"Le problème majeur avec les conteneurs : les données disparaissent quand on supprime le conteneur. Les volumes Docker résolvent ce problème."

[Créer volume + lancer PostgreSQL]

"Créons maintenant des données dans PostgreSQL..."

[Insérer des produits]

"Maintenant la démonstration la plus importante : supprimons le conteneur et vérifions que les données survivent."

[Supprimer conteneur → recréer → vérifier données]

"Magie ! Les données sont toujours là parce qu'elles sont stockées dans le volume, pas dans le conteneur."

### Partie 3 : Backup (5 min)

"En production, vous devez sauvegarder vos volumes. Voici comment faire un backup et un restore."

[Montrer backup → restore]

"Cette technique fonctionne pour tous les types de volumes : PostgreSQL, MongoDB, fichiers applicatifs, etc."

## ✅ Checklist de démo

- [ ] Docker démarré
- [ ] Aucun conteneur en cours
- [ ] Aucun volume demo-* existant
- [ ] Terminal propre
- [ ] Commandes prêtes

## 🎓 Points clés à souligner

1. **docker stats** → Monitoring essentiel en production
2. **docker logs -f** → Debugging en temps réel
3. **Volumes nommés** → Toujours préférer aux volumes anonymes
4. **Persistance** → Les données survivent à la suppression du conteneur
5. **Backup** → Utiliser tar avec conteneur temporaire Alpine

## ⚠️ Erreurs courantes

1. **Oublier le volume** → Données perdues à chaque restart
2. **Volume anonyme** → Difficile à retrouver et gérer
3. **Supprimer volume avec conteneur** → `docker rm -v` supprime le volume !
4. **Permissions** → Problèmes avec bind mounts et utilisateurs non-root

## 🧹 Cleanup après la démo

```bash
# Supprimer les conteneurs
docker rm -f web api db pg-persist pg-persist-2

# Supprimer les volumes de démo
docker volume rm demo-pgdata demo-pgdata-restored

# Supprimer les backups
rm pgdata-backup-*.tar.gz

# Vérifier le nettoyage
docker ps -a
docker volume ls
```

## 🔗 Références

- [docker stats](https://docs.docker.com/engine/reference/commandline/stats/)
- [docker logs](https://docs.docker.com/engine/reference/commandline/logs/)
- [Volumes](https://docs.docker.com/storage/volumes/)
- [Backup & Restore](https://docs.docker.com/storage/volumes/#back-up-restore-or-migrate-data-volumes)
