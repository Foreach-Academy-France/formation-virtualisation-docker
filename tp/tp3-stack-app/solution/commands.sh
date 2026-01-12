#!/usr/bin/env bash
#
# Solution TP3 - Commandes complètes
#

set -e

echo "═══════════════════════════════════════"
echo "  Solution TP3 - Étape par étape"
echo "═══════════════════════════════════════"

# ═══════════════════════════════════════
# Partie 1 : PostgreSQL avec volume
# ═══════════════════════════════════════

echo -e "\n📦 Partie 1 : PostgreSQL avec volume\n"

# 1. Créer un volume
echo "1. Créer le volume tp3-pgdata..."
docker volume create tp3-pgdata

# 2. Lancer PostgreSQL
echo "2. Lancer PostgreSQL avec le volume..."
docker run -d \
  --name tp3-db \
  -e POSTGRES_USER=dbuser \
  -e POSTGRES_PASSWORD=dbpass \
  -e POSTGRES_DB=usersdb \
  -v tp3-pgdata:/var/lib/postgresql/data \
  postgres:15-alpine

# 3. Attendre que PostgreSQL soit prêt
echo "3. Attendre que PostgreSQL soit prêt..."
sleep 10

# 4. Vérifier
echo "4. Vérifier la connexion..."
docker exec tp3-db psql -U dbuser -d usersdb -c "\dt"

echo "✅ Partie 1 terminée"

# ═══════════════════════════════════════
# Partie 2 : Backend avec networking
# ═══════════════════════════════════════

echo -e "\n🔗 Partie 2 : Backend avec networking\n"

# 1. Créer un réseau
echo "1. Créer le réseau tp3-network..."
docker network create tp3-network

# 2. Connecter PostgreSQL au réseau
echo "2. Connecter PostgreSQL au réseau..."
docker network connect tp3-network tp3-db

# 3. Builder l'API
echo "3. Builder l'image de l'API..."
cd ../app
docker build -t tp3-api .

# 4. Lancer l'API
echo "4. Lancer l'API sur le réseau..."
docker run -d \
  --name tp3-api \
  --network tp3-network \
  -p 3000:3000 \
  -e DATABASE_URL=postgres://dbuser:dbpass@tp3-db:5432/usersdb \
  tp3-api

# 5. Attendre que l'API soit prête
echo "5. Attendre que l'API soit prête..."
sleep 5

# 6. Tester l'API
echo "6. Tester l'API..."
echo -e "\n  Health check:"
curl -s http://localhost:3000/health | jq .

echo -e "\n  Liste des utilisateurs (devrait avoir 2 users de démo):"
curl -s http://localhost:3000/users | jq .

echo "✅ Partie 2 terminée"

# ═══════════════════════════════════════
# Partie 3 : Tester la persistance
# ═══════════════════════════════════════

echo -e "\n💾 Partie 3 : Tester la persistance\n"

# 1. Créer des utilisateurs
echo "1. Créer des nouveaux utilisateurs..."
curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","age":28}' | jq .

curl -s -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@example.com","age":32}' | jq .

# 2. Vérifier (devrait avoir 4 users maintenant)
echo -e "\n2. Vérifier les utilisateurs créés:"
curl -s http://localhost:3000/users | jq '.count'

# 3. Supprimer TOUS les conteneurs
echo -e "\n3. Supprimer tous les conteneurs..."
docker rm -f tp3-api tp3-db

# 4. Vérifier que le volume existe toujours
echo "4. Vérifier que le volume existe toujours..."
docker volume ls | grep tp3-pgdata

# 5. Recréer PostgreSQL avec le même volume
echo "5. Recréer PostgreSQL..."
docker run -d \
  --name tp3-db \
  --network tp3-network \
  -e POSTGRES_USER=dbuser \
  -e POSTGRES_PASSWORD=dbpass \
  -e POSTGRES_DB=usersdb \
  -v tp3-pgdata:/var/lib/postgresql/data \
  postgres:15-alpine

sleep 8

# 6. Recréer l'API
echo "6. Recréer l'API..."
docker run -d \
  --name tp3-api \
  --network tp3-network \
  -p 3000:3000 \
  -e DATABASE_URL=postgres://dbuser:dbpass@tp3-db:5432/usersdb \
  tp3-api

sleep 5

# 7. Vérifier que les données existent toujours
echo -e "\n7. Vérifier que les données ont survécu:"
curl -s http://localhost:3000/users | jq '.users[] | {id, name, email}'

echo -e "\n✅ Partie 3 terminée - Les données ont persisté ! 🎉"

# ═══════════════════════════════════════
# Résumé
# ═══════════════════════════════════════

echo -e "\n📊 Résumé de la stack\n"

echo "Conteneurs :"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\nVolumes :"
docker volume ls | grep tp3

echo -e "\nRéseaux :"
docker network ls | grep tp3

echo -e "\nUtilisateurs dans la DB :"
curl -s http://localhost:3000/users | jq '.count'

echo -e "\n✅ TP3 complété avec succès !"
echo -e "\nPour nettoyer :"
echo "  docker rm -f tp3-api tp3-db"
echo "  docker network rm tp3-network"
echo "  docker volume rm tp3-pgdata"
echo "  docker rmi tp3-api"
