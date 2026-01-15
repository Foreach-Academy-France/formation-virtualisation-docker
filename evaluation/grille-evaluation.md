# Grille d'Évaluation - Formation Docker

## TP1 : Découverte Docker (10%)

| Critère | Points | Acquis | Partiel | Non acquis |
|---------|--------|--------|---------|------------|
| Installation Docker fonctionnelle | 3 | 3 | 1-2 | 0 |
| Commandes de base maîtrisées | 4 | 4 | 2-3 | 0-1 |
| Premier conteneur lancé et compris | 3 | 3 | 1-2 | 0 |
| **Total** | **10** | | | |

---

## TP2 : Dockeriser une Application (10%)

| Critère | Points | Acquis | Partiel | Non acquis |
|---------|--------|--------|---------|------------|
| Dockerfile syntaxiquement correct | 3 | 3 | 1-2 | 0 |
| Instructions appropriées (FROM, COPY, RUN, CMD) | 3 | 3 | 1-2 | 0 |
| Image buildée avec succès | 2 | 2 | 1 | 0 |
| Application fonctionnelle dans le conteneur | 2 | 2 | 1 | 0 |
| **Total** | **10** | | | |

---

## TP3 : Stack Applicative (10%)

| Critère | Points | Acquis | Partiel | Non acquis |
|---------|--------|--------|---------|------------|
| Volumes configurés correctement | 3 | 3 | 1-2 | 0 |
| Networking entre conteneurs | 3 | 3 | 1-2 | 0 |
| Persistance des données vérifiée | 2 | 2 | 1 | 0 |
| Communication inter-services | 2 | 2 | 1 | 0 |
| **Total** | **10** | | | |

---

## TP4 : Docker Compose Avancé (10%)

| Critère | Points | Acquis | Partiel | Non acquis |
|---------|--------|--------|---------|------------|
| docker-compose.yml valide | 3 | 3 | 1-2 | 0 |
| Services, volumes, networks définis | 3 | 3 | 1-2 | 0 |
| depends_on et health checks | 2 | 2 | 1 | 0 |
| Stack fonctionnelle | 2 | 2 | 1 | 0 |
| **Total** | **10** | | | |

---

## TP5 : Projet Final (10%)

### Dockerfiles (3 points)

| Critère | Points | Acquis | Partiel | Non acquis |
|---------|--------|--------|---------|------------|
| Multi-stage build frontend | 1 | 1 | 0.5 | 0 |
| Backend optimisé (alpine, non-root) | 1 | 1 | 0.5 | 0 |
| Health checks intégrés | 1 | 1 | 0.5 | 0 |

### Docker Compose (3 points)

| Critère | Points | Acquis | Partiel | Non acquis |
|---------|--------|--------|---------|------------|
| Tous les services fonctionnels | 1 | 1 | 0.5 | 0 |
| Réseaux correctement configurés | 1 | 1 | 0.5 | 0 |
| Volumes et persistance | 1 | 1 | 0.5 | 0 |

### Sécurité (2.5 points)

| Critère | Points | Acquis | Partiel | Non acquis |
|---------|--------|--------|---------|------------|
| Utilisateurs non-root | 1 | 1 | 0.5 | 0 |
| DB non exposée (réseau internal) | 0.5 | 0.5 | 0.25 | 0 |
| Secrets externalisés (.env) | 0.5 | 0.5 | 0.25 | 0 |
| Limites ressources | 0.5 | 0.5 | 0.25 | 0 |

### Documentation (1 point)

| Critère | Points | Acquis | Partiel | Non acquis |
|---------|--------|--------|---------|------------|
| README clair avec instructions | 0.5 | 0.5 | 0.25 | 0 |
| Architecture documentée | 0.5 | 0.5 | 0.25 | 0 |

### Bonus (0.5 point)

| Critère | Points |
|---------|--------|
| CI/CD configuré | +0.2 |
| Monitoring (Prometheus/Grafana) | +0.2 |
| TLS/HTTPS | +0.1 |

**Total TP5** : **10 points** (+0.5 bonus)

---

## Récapitulatif Global

| Évaluation | Points | Pondération | Note /20 |
|------------|--------|-------------|----------|
| TP1 | /10 | 10% | |
| TP2 | /10 | 10% | |
| TP3 | /10 | 10% | |
| TP4 | /10 | 10% | |
| TP5 | /10 | 10% | |
| **Sous-total CC** | **/50** | **50%** | |
| QCM Final | /31 | 50% | |
| **Total** | | **100%** | **/20** |

---

## Calcul de la note finale

```
Note CC = (TP1 + TP2 + TP3 + TP4 + TP5) / 5 × 10
Note QCM = Points QCM × 20 / 31

Note Finale = (Note CC + Note QCM) / 2
```

**Validation de la compétence** : Note Finale ≥ 10/20

---

## Compétences évaluées (C30)

| Compétence | TPs concernés |
|------------|---------------|
| Comprendre la conteneurisation | TP1, QCM |
| Créer des images Docker | TP2, TP5 |
| Gérer les conteneurs | TP1, TP3 |
| Utiliser les volumes | TP3, TP4, TP5 |
| Configurer le networking | TP3, TP4, TP5 |
| Utiliser Docker Compose | TP4, TP5 |
| Appliquer les bonnes pratiques sécurité | TP5, QCM |

---

## Critères de validation par niveau

| Niveau | Critères | Note |
|--------|----------|------|
| **Non validé** | Compétences de base non maîtrisées | < 8 |
| **À consolider** | Bases acquises, pratique insuffisante | 8-9.9 |
| **Validé** | Compétences maîtrisées | 10-14 |
| **Très bien** | Excellente maîtrise + bonnes pratiques | 15-17 |
| **Expert** | Maîtrise complète + optimisations | 18-20 |
