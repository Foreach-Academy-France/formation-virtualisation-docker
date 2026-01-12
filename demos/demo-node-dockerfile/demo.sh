#!/usr/bin/env bash
#
# Script de démonstration automatique
# Exécute toutes les étapes de la démo Docker
#

set -e  # Exit on error

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher un titre
title() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"
}

# Fonction pour afficher une étape
step() {
    echo -e "${GREEN}➜${NC} $1"
}

# Fonction pour afficher une commande
cmd() {
    echo -e "${YELLOW}\$ $1${NC}"
}

# Fonction pour attendre l'utilisateur
wait_user() {
    echo -e "\n${YELLOW}Appuyez sur Entrée pour continuer...${NC}"
    read -r
}

# Nettoyage initial
cleanup() {
    echo -e "\n${RED}Nettoyage des conteneurs et images...${NC}"
    docker stop api-basic api-optimized 2>/dev/null || true
    docker rm api-basic api-optimized 2>/dev/null || true
    docker rmi my-api:basic my-api:optimized 2>/dev/null || true
}

# Trap pour nettoyer à la fin
trap cleanup EXIT

# Début de la démo
clear
title "🐳 DÉMO DOCKER - Dockeriser une Application Node.js"

echo "Cette démo montre comment dockeriser une application Express"
echo "en 2 versions : basique puis optimisée."
wait_user

# ═══════════════════════════════════════════════════
# Partie 1 : Application de base
# ═══════════════════════════════════════════════════

title "📦 Partie 1 : Application de base"

step "Affichons le code de l'application..."
cmd "cat app/src/server.js"
echo
cat app/src/server.js | head -30
echo "..."
wait_user

step "Vérifions les dépendances..."
cmd "cat app/package.json"
echo
cat app/package.json
wait_user

# ═══════════════════════════════════════════════════
# Partie 2 : Dockerfile basique
# ═══════════════════════════════════════════════════

title "🔨 Partie 2 : Dockerfile basique"

step "Regardons le Dockerfile basique..."
cmd "cat basic/Dockerfile"
echo
cat basic/Dockerfile
wait_user

step "Buildons l'image..."
cmd "docker build -f basic/Dockerfile -t my-api:basic ."
docker build -f basic/Dockerfile -t my-api:basic .
wait_user

step "Vérifions la taille de l'image..."
cmd "docker images | grep my-api"
docker images | grep my-api
wait_user

step "Lançons le conteneur..."
cmd "docker run -d -p 3000:3000 --name api-basic my-api:basic"
docker run -d -p 3000:3000 --name api-basic my-api:basic
sleep 2
wait_user

step "Testons l'API..."
cmd "curl http://localhost:3000"
curl http://localhost:3000 | jq .
echo
sleep 1

cmd "curl http://localhost:3000/health"
curl http://localhost:3000/health | jq .
wait_user

step "Vérifions les logs..."
cmd "docker logs api-basic"
docker logs api-basic
wait_user

step "Stoppons le conteneur..."
cmd "docker stop api-basic && docker rm api-basic"
docker stop api-basic && docker rm api-basic
wait_user

# ═══════════════════════════════════════════════════
# Partie 3 : Dockerfile optimisé
# ═══════════════════════════════════════════════════

title "⚡ Partie 3 : Dockerfile optimisé"

step "Regardons le Dockerfile optimisé..."
cmd "cat optimized/Dockerfile"
echo
cat optimized/Dockerfile
wait_user

step "Les améliorations :"
echo "  ✅ npm ci au lieu de npm install"
echo "  ✅ Utilisateur non-root"
echo "  ✅ Health check"
echo "  ✅ Labels et métadonnées"
echo "  ✅ .dockerignore"
wait_user

step "Regardons le .dockerignore..."
cmd "cat optimized/.dockerignore | head -20"
cat optimized/.dockerignore | head -20
wait_user

step "Buildons la version optimisée..."
cmd "docker build -f optimized/Dockerfile -t my-api:optimized ."
docker build -f optimized/Dockerfile -t my-api:optimized .
wait_user

step "Comparons les tailles..."
cmd "docker images | grep my-api"
docker images | grep my-api
wait_user

step "Lançons le conteneur optimisé..."
cmd "docker run -d -p 3000:3000 --name api-optimized my-api:optimized"
docker run -d -p 3000:3000 --name api-optimized my-api:optimized
sleep 2
wait_user

step "Testons l'API..."
cmd "curl http://localhost:3000/health"
curl http://localhost:3000/health | jq .
wait_user

step "Vérifions l'utilisateur (devrait être appuser, pas root)..."
cmd "docker exec api-optimized whoami"
docker exec api-optimized whoami
wait_user

step "Attendons 30 secondes pour le health check..."
echo "Le health check s'exécute toutes les 30 secondes..."
for i in {30..1}; do
    echo -ne "\rAttente : $i secondes "
    sleep 1
done
echo
wait_user

step "Vérifions le statut du health check..."
cmd "docker ps"
docker ps
wait_user

step "Inspectons le health check en détail..."
cmd "docker inspect api-optimized | grep -A 10 Health"
docker inspect api-optimized | jq '.[0].State.Health'
wait_user

# ═══════════════════════════════════════════════════
# Partie 4 : Comparaison et conclusion
# ═══════════════════════════════════════════════════

title "📊 Partie 4 : Comparaison finale"

echo -e "${GREEN}Images créées :${NC}"
docker images | grep -E "REPOSITORY|my-api"
echo

echo -e "${GREEN}Conteneur en cours :${NC}"
docker ps
echo

echo -e "${GREEN}Résumé des améliorations :${NC}"
echo "  ✅ Image optimisée (~150 MB avec Alpine)"
echo "  ✅ Sécurité : utilisateur non-root"
echo "  ✅ Monitoring : health check automatique"
echo "  ✅ Build optimisé avec cache Docker"
echo "  ✅ Production-ready"
echo

wait_user

# Nettoyage final
title "🧹 Nettoyage"
step "Arrêt et suppression des conteneurs..."
cmd "docker stop api-optimized && docker rm api-optimized"
docker stop api-optimized && docker rm api-optimized

step "Suppression des images (optionnel)..."
echo "Les images restent disponibles pour la suite."
echo "Pour les supprimer : docker rmi my-api:basic my-api:optimized"

title "✅ Démo terminée !"
echo "Points clés à retenir :"
echo "  1. Dockerfile = recette pour builder une image"
echo "  2. Alpine = images légères"
echo "  3. npm ci = installation reproductible"
echo "  4. Non-root = sécurité"
echo "  5. Health check = monitoring"
echo
echo "Bravo ! 🎉"
