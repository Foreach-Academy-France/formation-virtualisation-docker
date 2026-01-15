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
  .danger {
    background: linear-gradient(120deg, #dc2626 0%, #b91c1c 100%);
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
  .mermaid {
    transform: scale(0.75);
    transform-origin: center;
  }
---

<!-- Mermaid support -->
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ startOnLoad: true, theme: 'default' });
</script>

<!-- _class: lead -->

# 🐳 Jour 5
## Production, Sécurité & Projet Final

**Formation Virtualisation & Conteneurisation**
M2 ESTD - Architecte Web
ForEach Academy

---

## 👋 Bienvenue au Jour 5 - Dernier jour !

**Hier (Jour 4)** :
- ✅ Docker Registry privé
- ✅ Docker Compose complet
- ✅ TP4 : Stack multi-services

**Aujourd'hui (Jour 5)** :
1. Module 10 : Sécurité Docker
2. Module 11 : Docker en Production
3. Projet fil rouge
4. QCM + Évaluation finale

---

## 📋 Planning de la journée

| Horaire | Contenu |
|---------|---------|
| 9h00-10h30 | Module 10 : Sécurité Docker |
| 10h45-12h15 | Module 11 : Production & Monitoring |
| 13h15-15h30 | Projet fil rouge |
| 15h45-17h00 | QCM + Évaluation finale |

---

<!-- _class: lead -->

# Module 10
## Sécurité Docker

---

## Pourquoi la sécurité Docker ?

**Conteneurs ≠ VMs** : Isolation plus faible

**Risques** :
- 🔓 Images avec vulnérabilités
- 👤 Conteneurs root = host root
- 🌐 Exposition réseau non contrôlée
- 🔑 Secrets dans les images
- 💾 Accès au socket Docker

> Docker mal configuré = porte d'entrée pour attaquants

---

## Les 4 piliers de la sécurité Docker

```
┌─────────────────────────────────────────┐
│           Sécurité Docker               │
├────────────┬────────────┬───────────────┤
│  1. Images │ 2. Runtime │ 3. Réseau     │
│            │            │               │
│ - Sources  │ - Non-root │ - Isolation   │
│ - Scanning │ - Readonly │ - Firewall    │
│ - Updates  │ - Limits   │ - TLS         │
├────────────┴────────────┴───────────────┤
│           4. Host & Orchestration       │
│     - Socket Docker - Secrets - RBAC    │
└─────────────────────────────────────────┘
```

---

## 1. Sécurité des images

### Sources de confiance

**✅ À utiliser** :
- Images officielles (Docker Hub `_/nginx`)
- Images vérifiées (Docker Hub ✓)
- Images internes (registry privé)

**❌ À éviter** :
- Images random sur Docker Hub
- Images sans mainteneur actif
- Tags `latest` en production

---

## Images minimales

**Moins de code = Moins de vulnérabilités**

```dockerfile
# ❌ Image complète (100+ MB, 100+ CVE potentiels)
FROM node:20

# ✅ Image alpine (50 MB, moins de surface d'attaque)
FROM node:20-alpine

# ✅✅ Image distroless (20 MB, minimal)
FROM gcr.io/distroless/nodejs20-debian12
```

**Recommandé** : Alpine ou Distroless

---

## Scanning de vulnérabilités avec Trivy

**Trivy** = Scanner open-source par Aqua Security

```bash
# Installation
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh

# Scanner une image
trivy image nginx:latest

# Scanner avec seuil de sévérité
trivy image --severity HIGH,CRITICAL nginx:latest

# Format JSON pour CI/CD
trivy image --format json -o results.json nginx:latest

# Scanner un Dockerfile
trivy config ./Dockerfile
```

---

## Exemple de rapport Trivy

```bash
$ trivy image python:3.9

python:3.9 (debian 11.6)
========================
Total: 1247 (UNKNOWN: 0, LOW: 823, MEDIUM: 318, HIGH: 94, CRITICAL: 12)

┌──────────────┬──────────────────┬──────────┬─────────────────────┐
│   Library    │  Vulnerability   │ Severity │   Fixed Version     │
├──────────────┼──────────────────┼──────────┼─────────────────────┤
│ openssl      │ CVE-2023-0286    │ CRITICAL │ 1.1.1n-0+deb11u4    │
│ libxml2      │ CVE-2022-40303   │ HIGH     │ 2.9.10+dfsg-6.7+d.. │
│ curl         │ CVE-2023-23914   │ HIGH     │ 7.74.0-1.3+deb11u5  │
└──────────────┴──────────────────┴──────────┴─────────────────────┘
```

**Action** : Mettre à jour ou changer d'image base

---

## Trivy dans la CI/CD

```yaml
# .gitlab-ci.yml
security-scan:
  stage: test
  image: aquasec/trivy
  script:
    - trivy image --exit-code 1 --severity CRITICAL $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  allow_failure: false
```

```yaml
# GitHub Actions
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'my-app:latest'
    exit-code: '1'
    severity: 'CRITICAL,HIGH'
```

---

## 2. Sécurité Runtime : Utilisateurs non-root

**Problème** : Par défaut, conteneur = root

```bash
$ docker run -it alpine whoami
root   # ← Danger !
```

**Risque** : Si évasion conteneur → accès root au host

---

## Créer un utilisateur non-root

```dockerfile
FROM node:20-alpine

# Créer un groupe et utilisateur
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers avec les bonnes permissions
COPY --chown=appuser:appgroup . .

# Changer d'utilisateur AVANT le CMD
USER appuser

# L'application tourne en tant que appuser
CMD ["node", "server.js"]
```

---

## Vérifier l'utilisateur

```bash
# Vérifier que le conteneur ne tourne pas en root
$ docker run my-app whoami
appuser   # ✅

# Vérifier l'UID
$ docker run my-app id
uid=1001(appuser) gid=1001(appgroup)   # ✅

# Impossible d'écrire dans /etc
$ docker run my-app touch /etc/test
touch: /etc/test: Permission denied   # ✅ Sécurisé
```

---

## USER dans docker-compose

```yaml
services:
  api:
    image: my-api
    user: "1001:1001"    # UID:GID

  # Ou avec un utilisateur nommé
  web:
    image: nginx
    user: "nginx"
```

**Note** : L'utilisateur doit exister dans l'image

---

## Filesystem en lecture seule

```dockerfile
# Le conteneur ne peut pas modifier son filesystem
docker run --read-only nginx

# Avec tmpfs pour les fichiers temporaires
docker run --read-only --tmpfs /tmp nginx
```

```yaml
# docker-compose.yml
services:
  api:
    image: my-api
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

---

## Linux Capabilities

**Capabilities** = Permissions granulaires (alternative à root)

```bash
# Voir les capabilities par défaut
docker run --rm -it alpine sh -c 'apk add libcap && capsh --print'

# Supprimer toutes les capabilities
docker run --cap-drop=ALL nginx

# Ajouter seulement celles nécessaires
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx
```

**Best practice** : `--cap-drop=ALL` + ajouter le minimum

---

## Capabilities courantes

| Capability | Usage |
|------------|-------|
| `NET_BIND_SERVICE` | Bind port < 1024 |
| `CHOWN` | Changer propriétaire fichiers |
| `SETUID` / `SETGID` | Changer UID/GID |
| `SYS_ADMIN` | Opérations admin (dangereux) |
| `NET_RAW` | Packets raw (ping) |

```yaml
# docker-compose.yml
services:
  web:
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

---

## Limiter les ressources

```bash
# Limiter mémoire
docker run --memory=512m --memory-swap=512m nginx

# Limiter CPU
docker run --cpus=0.5 nginx

# Limiter nombre de processus (contre fork bomb)
docker run --pids-limit=100 nginx
```

```yaml
# docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    pids_limit: 100
```

---

## 3. Sécurité Réseau

**Principe** : Exposer le minimum nécessaire

```yaml
# ❌ Mauvais : tout exposé
services:
  db:
    ports:
      - "5432:5432"    # DB accessible depuis l'extérieur !

# ✅ Bon : réseau interne
services:
  db:
    networks:
      - backend        # Pas de ports exposés

networks:
  backend:
    internal: true     # Pas d'accès externe
```

---

## Architecture réseau sécurisée

```
Internet
    │
    ▼
┌─────────┐
│  Nginx  │ ← Seul point d'entrée (port 80/443)
│ (proxy) │
└────┬────┘
     │ frontend network
     ▼
┌─────────┐
│   API   │ ← Pas d'accès direct
└────┬────┘
     │ backend network (internal)
     ▼
┌─────────┐
│   DB    │ ← Totalement isolée
└─────────┘
```

---

## 4. Gestion des secrets

### ❌ Ce qu'il ne faut JAMAIS faire

```dockerfile
# Secrets dans le Dockerfile
ENV DATABASE_PASSWORD=supersecret123

# Secrets dans l'image
COPY .env /app/.env
```

```yaml
# Secrets en clair dans docker-compose
environment:
  - DB_PASSWORD=supersecret123
```

**Les images sont lisibles** : `docker history`, layers...

---

## ✅ Bonnes pratiques pour les secrets

**1. Variables d'environnement au runtime** :
```bash
docker run -e DB_PASSWORD="$DB_PASSWORD" my-app
```

**2. Fichier .env (non commité)** :
```yaml
env_file:
  - .env    # ⚠️ .env dans .gitignore !
```

**3. Docker secrets (Swarm)** :
```yaml
secrets:
  db_password:
    external: true
```

---

## Docker secrets (Swarm mode)

```bash
# Créer un secret
echo "supersecret123" | docker secret create db_password -

# Utiliser dans le service
docker service create \
  --name api \
  --secret db_password \
  my-api
```

```yaml
# docker-compose.yml (Swarm)
services:
  api:
    secrets:
      - db_password

secrets:
  db_password:
    external: true
```

**Le secret est monté dans** : `/run/secrets/db_password`

---

## Protection du socket Docker

**Le socket Docker = accès root au host**

```bash
# ❌ JAMAIS exposer le socket Docker
docker run -v /var/run/docker.sock:/var/run/docker.sock my-app
```

**Si nécessaire** (CI/CD, monitoring) :
- Utiliser un proxy (Tecnativa/docker-socket-proxy)
- Limiter les endpoints accessibles

```bash
# Proxy socket avec permissions limitées
docker run -d \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e CONTAINERS=1 -e IMAGES=0 -e NETWORKS=0 \
  tecnativa/docker-socket-proxy
```

---

## Checklist sécurité Docker

**Images** :
- [ ] Images officielles ou vérifiées
- [ ] Images minimales (alpine, distroless)
- [ ] Scanning avec Trivy en CI/CD
- [ ] Pas de secrets dans les images

**Runtime** :
- [ ] Utilisateur non-root (`USER`)
- [ ] `--cap-drop=ALL` + minimum capabilities
- [ ] Limites ressources (memory, CPU, pids)
- [ ] Filesystem read-only si possible

---

## Checklist sécurité (suite)

**Réseau** :
- [ ] Réseaux internes pour les services backend
- [ ] Seul le proxy expose des ports
- [ ] TLS pour les communications externes

**Host** :
- [ ] Socket Docker protégé
- [ ] Docker à jour
- [ ] Logs centralisés
- [ ] Monitoring des conteneurs

---

<!-- _class: lead -->

# Module 11
## Docker en Production

---

## Production vs Développement

| Aspect | Dev | Prod |
|--------|-----|------|
| **Images** | `latest`, rebuild fréquent | Tags versionnés, immuables |
| **Volumes** | Bind mounts (hot reload) | Volumes nommés |
| **Logs** | Console | Centralisés (ELK, Loki) |
| **Restart** | `no` | `unless-stopped` |
| **Resources** | Illimité | Limités |
| **Secrets** | .env local | Secrets manager |

---

## Health checks : Pourquoi ?

**Sans health check** :
- Conteneur "UP" mais application plantée
- Load balancer envoie du trafic vers service mort
- Pas de restart automatique

**Avec health check** :
- Docker sait si l'app fonctionne vraiment
- Restart automatique si unhealthy
- Intégration avec orchestrateurs

---

## Health checks dans Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .
RUN npm ci --production

# Health check HTTP
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

**Paramètres** :
- `interval` : Fréquence des checks
- `timeout` : Temps max pour répondre
- `start-period` : Délai avant premier check
- `retries` : Échecs avant "unhealthy"

---

## Health checks : Types de tests

**HTTP** (API, web) :
```dockerfile
HEALTHCHECK CMD wget -q --spider http://localhost:3000/health || exit 1
HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1
```

**TCP** (database) :
```dockerfile
HEALTHCHECK CMD pg_isready -U postgres || exit 1
HEALTHCHECK CMD mysqladmin ping -h localhost || exit 1
```

**Custom script** :
```dockerfile
HEALTHCHECK CMD /app/healthcheck.sh || exit 1
```

---

## Endpoint /health

```javascript
// Express.js
app.get('/health', (req, res) => {
  // Vérifications
  const dbConnected = checkDatabase();
  const cacheConnected = checkRedis();

  if (dbConnected && cacheConnected) {
    res.status(200).json({
      status: 'healthy',
      checks: { db: 'ok', cache: 'ok' }
    });
  } else {
    res.status(503).json({
      status: 'unhealthy',
      checks: { db: dbConnected ? 'ok' : 'fail', cache: cacheConnected ? 'ok' : 'fail' }
    });
  }
});
```

---

## Health checks dans Compose

```yaml
services:
  api:
    image: my-api
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s

  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 3s
      retries: 5
```

---

## États de santé

```bash
# Voir l'état de santé
docker ps
CONTAINER ID   IMAGE     STATUS
abc123         my-api    Up 5 min (healthy)
def456         my-api    Up 2 min (unhealthy)
ghi789         my-api    Up 30s (health: starting)
```

```bash
# Détails du health check
docker inspect --format='{{json .State.Health}}' my-api | jq
{
  "Status": "healthy",
  "FailingStreak": 0,
  "Log": [...]
}
```

---

## Logging : Les bases

**Par défaut** : stdout/stderr → Docker logs

```bash
# Voir les logs
docker logs my-container
docker logs -f my-container        # Follow
docker logs --tail 100 my-container # 100 dernières lignes
docker logs --since 1h my-container # Depuis 1h
```

**Problème** : Logs sur chaque host, pas centralisés

---

## Logging drivers

```bash
# Voir le driver actuel
docker info | grep "Logging Driver"

# Drivers disponibles
- json-file (défaut)
- syslog
- journald
- fluentd
- awslogs
- gcplogs
- splunk
```

---

## Configuration logging

```yaml
# docker-compose.yml
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"    # Taille max par fichier
        max-file: "3"      # Nombre de fichiers
        compress: "true"   # Compression des anciens

  # Ou vers un service externe
  web:
    logging:
      driver: "fluentd"
      options:
        fluentd-address: "localhost:24224"
        tag: "docker.{{.Name}}"
```

---

## Logging : Bonnes pratiques

**1. Format structuré (JSON)** :
```javascript
// ❌ Mauvais
console.log("User 123 logged in");

// ✅ Bon
console.log(JSON.stringify({
  level: "info",
  event: "user_login",
  userId: 123,
  timestamp: new Date().toISOString()
}));
```

**2. Limiter la taille** :
```yaml
logging:
  options:
    max-size: "10m"
    max-file: "3"
```

---

## Stack de logging : Loki + Grafana

```yaml
services:
  loki:
    image: grafana/loki:2.9.0
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki

  grafana:
    image: grafana/grafana:10.0.0
    ports:
      - "3000:3000"
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true

  api:
    logging:
      driver: loki
      options:
        loki-url: "http://loki:3100/loki/api/v1/push"
```

---

## Monitoring : Métriques essentielles

**Conteneurs** :
- CPU usage
- Memory usage
- Network I/O
- Disk I/O
- Restart count

**Application** :
- Request rate
- Error rate
- Response time
- Active connections

---

## Docker stats

```bash
# Stats en temps réel
docker stats

CONTAINER   CPU %   MEM USAGE / LIMIT     MEM %   NET I/O          BLOCK I/O
api         0.50%   128MiB / 512MiB       25%     1.2MB / 500KB    10MB / 0B
db          2.10%   256MiB / 1GiB         25%     500KB / 1.5MB    50MB / 20MB
redis       0.10%   32MiB / 128MiB        25%     100KB / 100KB    0B / 0B
```

```bash
# Format custom
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

---

## cAdvisor : Monitoring conteneurs

```yaml
services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    privileged: true
```

**Dashboard** : http://localhost:8080

---

## Prometheus + Grafana

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  prometheus-data:
  grafana-data:
```

---

## Introduction à l'orchestration

**Problème** : Docker Compose = 1 seul host

**Besoin production** :
- Haute disponibilité
- Scaling horizontal
- Load balancing
- Self-healing
- Rolling updates

**Solutions** :
- Docker Swarm (simple)
- Kubernetes (standard industrie)

---

## Docker Swarm vs Kubernetes

| Aspect | Docker Swarm | Kubernetes |
|--------|--------------|------------|
| **Complexité** | Simple | Complexe |
| **Courbe d'apprentissage** | Faible | Élevée |
| **Adoption** | Faible | Standard industrie |
| **Fonctionnalités** | Basiques | Très riches |
| **Communauté** | Petite | Massive |
| **Use case** | Petite/moyenne prod | Grande prod |

---

## Docker Swarm : Les bases

```bash
# Initialiser un swarm
docker swarm init

# Ajouter des workers
docker swarm join --token <token> <manager-ip>:2377

# Déployer une stack
docker stack deploy -c docker-compose.yml myapp

# Scaler un service
docker service scale myapp_api=5

# Voir les services
docker service ls
```

---

## Kubernetes : Concepts clés

```
┌─────────────────────────────────────────┐
│              Cluster K8s                │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │          Namespace              │   │
│  │  ┌─────────┐  ┌─────────┐      │   │
│  │  │Deployment│  │ Service │      │   │
│  │  │  ┌───┐  │  │         │      │   │
│  │  │  │Pod│  │  │         │      │   │
│  │  │  └───┘  │  │         │      │   │
│  │  └─────────┘  └─────────┘      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## De Compose à Kubernetes

**docker-compose.yml** :
```yaml
services:
  api:
    image: my-api:1.0
    ports:
      - "3000:3000"
    replicas: 3
```

**Kubernetes (deployment.yaml)** :
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    spec:
      containers:
        - name: api
          image: my-api:1.0
          ports:
            - containerPort: 3000
```

---

## Kompose : Convertir Compose → K8s

```bash
# Installer kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.31.2/kompose-linux-amd64 -o kompose
chmod +x kompose

# Convertir docker-compose.yml
kompose convert

# Résultat : fichiers YAML Kubernetes
# - api-deployment.yaml
# - api-service.yaml
# - db-deployment.yaml
# - db-service.yaml
```

---

## Récapitulatif : Checklist Production

**Avant le déploiement** :
- [ ] Images versionnées (pas de `latest`)
- [ ] Scan de vulnérabilités passé
- [ ] Health checks configurés
- [ ] Utilisateur non-root
- [ ] Ressources limitées

**Infrastructure** :
- [ ] Logging centralisé
- [ ] Monitoring actif
- [ ] Alerting configuré
- [ ] Backup des volumes
- [ ] Plan de disaster recovery

---

<!-- _class: lead -->

# Projet Fil Rouge
## Application Complète
**(2h15)**

---

## Objectif du projet

**Mission** : Dockeriser et déployer une application e-commerce complète

**Stack technique** :
- Frontend : React (build static)
- Backend : Node.js/Express API
- Database : PostgreSQL
- Cache : Redis
- Reverse proxy : Nginx

**Livrables** :
- Dockerfiles optimisés
- docker-compose.yml production-ready
- Documentation

---

## Architecture cible

```
                Internet
                    │
                    ▼
            ┌──────────────┐
            │    Nginx     │ :80/:443
            │   (proxy)    │
            └──────┬───────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│   Frontend   │      │   Backend    │
│   (React)    │      │   (API)      │
└──────────────┘      └──────┬───────┘
                             │
                   ┌─────────┴─────────┐
                   │                   │
                   ▼                   ▼
            ┌──────────┐        ┌──────────┐
            │ Postgres │        │  Redis   │
            │   (DB)   │        │ (Cache)  │
            └──────────┘        └──────────┘
```

---

## Critères d'évaluation

| Critère | Points |
|---------|--------|
| Dockerfiles fonctionnels | 20 |
| Multi-stage builds | 10 |
| docker-compose.yml complet | 20 |
| Health checks | 10 |
| Sécurité (non-root, réseau) | 15 |
| Volumes et persistance | 10 |
| Documentation | 10 |
| Bonus (CI/CD, monitoring) | 5 |

**Total** : 100 points

---

## Partie 1 : Dockerfiles (45 min)

**Frontend React** :
```dockerfile
# TODO: Multi-stage build
# Stage 1: Build avec Node
# Stage 2: Serve avec Nginx

# Points clés :
# - npm ci (pas npm install)
# - Utilisateur non-root
# - Image finale minimale
```

**Backend Node.js** :
```dockerfile
# TODO: Dockerfile optimisé
# - Image alpine
# - Utilisateur non-root
# - Health check
```

---

## Partie 2 : Docker Compose (45 min)

```yaml
# TODO: docker-compose.yml
#
# Services :
# - nginx (reverse proxy)
# - frontend
# - api
# - db (PostgreSQL)
# - redis
#
# À configurer :
# - Volumes nommés
# - Réseaux séparés (frontend/backend)
# - Health checks
# - Restart policies
# - Variables d'environnement
```

---

## Partie 3 : Sécurité & Production (30 min)

**Checklist** :
- [ ] Tous les services avec utilisateur non-root
- [ ] Base de données non exposée
- [ ] Secrets dans fichier .env
- [ ] Health checks sur tous les services
- [ ] Limites de ressources
- [ ] Logging configuré

---

## Bonus : CI/CD avec GitHub Actions

```yaml
# .github/workflows/docker.yml
name: Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build and scan
        run: |
          docker build -t my-app:${{ github.sha }} .
          trivy image --exit-code 1 my-app:${{ github.sha }}

      - name: Push to registry
        run: |
          docker push my-app:${{ github.sha }}
```

---

## Ressources pour le projet

**Documentation** :
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

**Outils** :
- Trivy pour le scanning
- hadolint pour valider les Dockerfiles

```bash
# Valider un Dockerfile
docker run --rm -i hadolint/hadolint < Dockerfile
```

---

<!-- _class: lead -->

# QCM Final
## Évaluation des connaissances
**(45 min)**

---

## Modalités du QCM

**Format** :
- 30 questions
- 45 minutes
- QCM (une ou plusieurs réponses)

**Thèmes couverts** :
- Fondamentaux Docker (Jours 1-2)
- Gestion et volumes (Jour 3)
- Registry et Compose (Jour 4)
- Sécurité et production (Jour 5)

**Validation** : Note ≥ 10/20

---

## Exemples de questions

**Q1** : Quelle commande permet de voir les logs d'un conteneur ?
- A) `docker show logs`
- B) `docker logs`
- C) `docker container logs`
- D) `docker inspect logs`

**Réponse** : B et C

---

## Exemples de questions (suite)

**Q2** : Dans un Dockerfile, quelle instruction permet de définir l'utilisateur qui exécutera les commandes ?
- A) `RUN user`
- B) `SETUSER`
- C) `USER`
- D) `AS`

**Réponse** : C

---

## Exemples de questions (suite)

**Q3** : Quel outil permet de scanner les vulnérabilités d'une image Docker ?
- A) Docker Scout
- B) Trivy
- C) Clair
- D) Toutes les réponses ci-dessus

**Réponse** : D

---

<!-- _class: lead -->

# Récapitulatif de la Formation

---

## Ce que nous avons appris

**Jour 1** : Fondamentaux
- Conteneurisation vs virtualisation
- Architecture Docker
- Premiers conteneurs

**Jour 2** : Images
- Dockerfile
- Multi-stage builds
- Best practices

---

## Ce que nous avons appris (suite)

**Jour 3** : Gestion
- Cycle de vie des conteneurs
- Volumes et persistance
- Networking

**Jour 4** : Orchestration
- Docker Registry
- Docker Compose
- Applications multi-services

**Jour 5** : Production
- Sécurité
- Monitoring et logging
- Orchestration (intro)

---

## Compétences acquises

✅ Comprendre et expliquer la conteneurisation
✅ Créer des images Docker optimisées
✅ Gérer le cycle de vie des conteneurs
✅ Persister les données avec les volumes
✅ Configurer le networking Docker
✅ Utiliser un registry privé
✅ Orchestrer avec Docker Compose
✅ Appliquer les bonnes pratiques de sécurité
✅ Préparer une mise en production

---

## Pour aller plus loin

**Formations complémentaires** :
- Kubernetes (K8s)
- CI/CD avec Docker
- Docker Swarm
- Service Mesh (Istio)

**Certifications** :
- Docker Certified Associate (DCA)
- Certified Kubernetes Administrator (CKA)

**Ressources** :
- [Play with Docker](https://labs.play-with-docker.com/)
- [Katacoda Docker](https://www.katacoda.com/courses/docker)

---

<!-- _class: lead -->

# Merci !

**Formation Virtualisation & Conteneurisation avec Docker**
M2 ESTD - Architecte Web
ForEach Academy

---

## Contact & Feedback

**Formateur** : Fabrice Claeys
**Email** : fabrice.claeys@groupe-bao.fr

**Ressources du cours** :
- Slides disponibles
- Code source des TPs
- Documentation

**Bonne continuation dans vos projets Docker !** 🐳

---

<!-- _class: lead -->

# Questions ?

🐳
