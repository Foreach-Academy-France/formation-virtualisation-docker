#!/usr/bin/env bash
#
# Script de validation de la démo
# Teste que tous les builds et conteneurs fonctionnent correctement
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
TESTS=0

# Fonction de test
test_step() {
    TESTS=$((TESTS + 1))
    echo -ne "${BLUE}[TEST $TESTS]${NC} $1... "
}

test_pass() {
    echo -e "${GREEN}✓${NC}"
}

test_fail() {
    echo -e "${RED}✗${NC}"
    echo -e "${RED}  Error: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

# Nettoyage
cleanup() {
    docker stop api-basic api-optimized 2>/dev/null || true
    docker rm api-basic api-optimized 2>/dev/null || true
    docker rmi my-api:basic my-api:optimized 2>/dev/null || true
}

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Validation de la démo Docker${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}\n"

# Nettoyage initial
cleanup

# Test 1 : Vérifier que Docker fonctionne
test_step "Docker est disponible"
if docker --version > /dev/null 2>&1; then
    test_pass
else
    test_fail "Docker n'est pas installé ou ne répond pas"
    exit 1
fi

# Test 2 : Vérifier les fichiers sources
test_step "Fichiers sources existent"
if [[ -f "app/package.json" ]] && [[ -f "app/src/server.js" ]]; then
    test_pass
else
    test_fail "Fichiers sources manquants"
fi

# Test 3 : Vérifier Dockerfile basique
test_step "Dockerfile basique existe"
if [[ -f "basic/Dockerfile" ]]; then
    test_pass
else
    test_fail "basic/Dockerfile manquant"
fi

# Test 4 : Build image basique
test_step "Build image basique"
if docker build -f basic/Dockerfile -t my-api:basic . > /dev/null 2>&1; then
    test_pass
else
    test_fail "Échec du build de l'image basique"
fi

# Test 5 : Taille image basique
test_step "Taille image basique < 200 MB"
SIZE=$(docker images my-api:basic --format "{{.Size}}" | sed 's/MB//')
if (( $(echo "$SIZE < 200" | bc -l) )); then
    test_pass
else
    test_fail "Image trop grosse: ${SIZE}MB"
fi

# Test 6 : Vérifier Dockerfile optimisé
test_step "Dockerfile optimisé existe"
if [[ -f "optimized/Dockerfile" ]]; then
    test_pass
else
    test_fail "optimized/Dockerfile manquant"
fi

# Test 7 : Vérifier .dockerignore
test_step ".dockerignore existe"
if [[ -f "optimized/.dockerignore" ]]; then
    test_pass
else
    test_fail "optimized/.dockerignore manquant"
fi

# Test 8 : Build image optimisée
test_step "Build image optimisée"
if docker build -f optimized/Dockerfile -t my-api:optimized . > /dev/null 2>&1; then
    test_pass
else
    test_fail "Échec du build de l'image optimisée"
fi

# Test 9 : Lancer conteneur basique
test_step "Lancer conteneur basique"
if docker run -d -p 3001:3000 --name api-basic my-api:basic > /dev/null 2>&1; then
    test_pass
    sleep 2
else
    test_fail "Échec du lancement du conteneur basique"
fi

# Test 10 : API basique répond
test_step "API basique répond"
if curl -s http://localhost:3001/health | grep -q "healthy"; then
    test_pass
else
    test_fail "API basique ne répond pas correctement"
fi

# Test 11 : Lancer conteneur optimisé
test_step "Lancer conteneur optimisé"
if docker run -d -p 3002:3000 --name api-optimized my-api:optimized > /dev/null 2>&1; then
    test_pass
    sleep 2
else
    test_fail "Échec du lancement du conteneur optimisé"
fi

# Test 12 : API optimisée répond
test_step "API optimisée répond"
if curl -s http://localhost:3002/health | grep -q "healthy"; then
    test_pass
else
    test_fail "API optimisée ne répond pas correctement"
fi

# Test 13 : Utilisateur non-root
test_step "Conteneur optimisé utilise non-root"
USER=$(docker exec api-optimized whoami)
if [[ "$USER" == "appuser" ]]; then
    test_pass
else
    test_fail "Utilisateur devrait être 'appuser', pas '$USER'"
fi

# Test 14 : Health check configuré
test_step "Health check configuré"
if docker inspect api-optimized | grep -q "Healthcheck"; then
    test_pass
else
    test_fail "Health check non configuré"
fi

# Test 15 : Labels présents
test_step "Labels présents"
if docker inspect my-api:optimized | grep -q "maintainer"; then
    test_pass
else
    test_fail "Labels manquants"
fi

# Nettoyage
echo -e "\n${BLUE}Nettoyage...${NC}"
cleanup

# Résultats
echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}✓ Tous les tests sont passés ($TESTS/$TESTS)${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    exit 0
else
    echo -e "${RED}✗ $ERRORS test(s) échoué(s) sur $TESTS${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    exit 1
fi
