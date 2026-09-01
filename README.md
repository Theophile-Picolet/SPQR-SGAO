# SPQR-SGAO : Système de Gestion Centralisé des Références pour Appels d'Offres

Un Micro-SaaS haute performance, sécurisé et éco-conçu pour les cabinets de conseil.

## Le Problème

Les consultants en politique/finances publiques perdent **3-4 heures par appel d'offres** à chercher dans des fichiers éparpillés (Excel, emails, dossiers) les références pertinentes. Résultat : risque d'oublis, frustration, et perte de productivité.

**SGAO résout ça en une seule fonctionnalité forte** : une barre de recherche centralisée avec filtres intelligents (pôle, type de mission, année, collectivité, montant, statut).

---

##  Stack Technique — Optimisée pour Performance, Sécurité, Éco-conception

### Architecture générale

```
Client (Navigateur) 
    ↓ HTTPS
┌─────────────────────────────────────┐
│      Nginx Reverse-Proxy            │ ← 1 point de contrôle
│ • Cache assets (1 an)               │ • Headers de sécurité
│ • Cache API (5 min + ETag)          │ • Rate-limiting
│ • Compression gzip                  │ • Logs centralisés
└──┬──────────────────────┬───────────┘
   │                      │
   ↓                      ↓
Frontend Statique    Backend API
(Next.js SSG)        (Express.js)
   │                      │
   └──────────────────────┴──→ PostgreSQL
```

### Frontend
- **Framework** : [Next.js 14+](https://nextjs.org/) (Static Site Generation)
- **Language** : JSX (JavaScript avec syntaxe React)
- **Styling** : SCSS + Bootstrap (icones Bootstrap incluses)
- **Bundle** : <200KB gzipped (lazy-loaded par route)
- **Deployment** : HTML statique pré-généré (zéro calcul runtime)

### Backend
- **Runtime** : Node.js 18+
- **Framework** : Express.js 4.x (minimaliste, performant)
- **Validation** : Joi (déclarative, sécurisée)
- **Authentication** : JWT stateless (Bearer tokens, 1h TTL) + Argon2 password hashing
- **Logging** : Logging centralisé via Nginx (access logs + error tracking via API)

### Infrastructure
- **Reverse-proxy** : Nginx (cache, sécurité, rate-limiting, compression gzip, logging)
- **Database** : PostgreSQL 14+ (relationnel, indices optimisés)
- **ORM** : Aucun (requêtes paramétrées directes)
- **Containerization** : Docker + Docker Compose (frontend, backend, DB, Nginx)
- **CI/CD** : GitHub Actions (tests, build, déploiement)
- **Testing Database** : PostgreSQL en container (données de test isolées)

---

##  Choix Techniques — Justifiés par 3 piliers

###  Performance 

| Choix | Impact | Métrique |
|-------|--------|----------|
| **SSG (Next.js)** | Pages pré-générées → <100ms TTFB | 5x plus rapide qu'une SPA |
| **Asset hashing** | Cache 1 an sans invalidation manuelle | 99%+ cache hit |
| **ETag + 5min cache** | 96% des requêtes retournent 304 (0KB) | 96% bande passante économisée |
| **Lazy-loading** | Code-split par route, chargement parallèle | LCP < 2.5s |

**Résultat** : Page charge en <2.5s, puis données en parallèle. Utilisateur ne ressent aucune attente.

###  Sécurité 

| Choix | Protection |
|-------|-----------|
| **Nginx centralisé** | 1 point d'entrée pour tous les headers (CSP, X-Frame, etc.) |
| **Rate-limiting** | 1 req/5min par IP → bloque bots/scrapers/DDoS |
| **JWT stateless** | Pas de session server-side, scalable |
| **Joi validation** | Toutes les entrées validées (SQL injection, XSS) |
| **CORS strict** | Whitelist d'origines, credentials contrôlés |

**Résultat** : Attaques bloquées avant le backend. Infrastructure légère.

###  Éco-conception 

| Dimension | Réduction | Justification |
|-----------|-----------|---------------|
| **Bande passante** | 96% | ETag hits = 0KB transfert, assets 1 an cache |
| **Calcul serveur** | 99% | Nginx ultra-léger pour cache hits, zéro Node.js rendering |
| **Bundle initial** | 60% | <200KB vs 500KB SPA classique |
| **CO₂ équivalent** | ~95% | Moins d'électricité réseau, serveur, client |

**Exemple** : Un utilisateur qui visite 1x/semaine (52 fois/an) économise 98% de bande passante = **10MB/an → 250KB/an**.

---

##  Documents Clés (Phase 1)

| Document | Contenu |
|----------|---------|
| **[PRD.md](docs/PRD.md)** | Problème, persona, proposition de valeur, fonctionnalités V1 |
| **[SPECS.md](docs/SPECS.md)** | User stories au format JTBD + scénarios Gherkin |
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | **Stack détaillée, justifications, caching stratégique, déploiement** |
| **[DESIGN.md](docs/DESIGN.md)** | Charte graphique, design tokens, RGAA 4.1 |
| **[diagrams/](docs/diagrams/)** | Diagrammes UML (use-cases, déploiement, séquence, MERISE) |
| **[TECHNICAL_DECISIONS.md](docs/TECHNICAL_DECISIONS.md)** | Deep-dive : Performance, Sécurité, Éco-conception (optionnel) |

**→ Lire [ARCHITECTURE.md](docs/ARCHITECTURE.md) en priorité pour comprendre les choix techniques.**

---

##  Structure du Projet

```
SPQR-SGAO/
├── README.md                        ← Vous êtes ici
├── .gitignore
└── docs/
    ├── PRD.md                       Product Requirements Document
    ├── SPECS.md                     User Stories + Gherkin scenarios
    ├── ARCHITECTURE.md              tack, caching, sécurité, déploiement
    ├── DESIGN.md                    Charte graphique
    ├── TECHNICAL_DECISIONS.md       Deep-dive éco-conception (optionnel)
    ├── recherche-jtbd.md            Sources JTBD documentées
    ├── benchmark.md                 Benchmarks visuels
    ├── moodboard.md                 Moodboard
    └── diagrams/
        ├── 01-USE-CASES.md          Use cases UML
        ├── 02-DEPLOYMENT.md         Déploiement (Next.js + Nginx + Express)
        ├── 03-SEQUENCE.md           Diagramme de séquence
        └── 04-MERISE.md             MCD/MLD/MPD
```

---

##  Flux de Données

### Chargement initial (T=0)

```
1. Utilisateur accède https://sgao.com/
2. Nginx sert HTML pré-généré (<100ms)
3. Browser parse HTML + charge JS avec hash (cache 1 an)
4. JS s'exécute, fetch /api/references en parallèle
5. Données affichées (<2.5s total)
```

### Appels API (runtime)

```
1. JS fetch('/api/references?pôle=finances')
2. Nginx vérifie cache (5 min)
   - Hit → 200 OK (cached)
   - Miss → proxy à Express
3. Express valide JWT + params, requête DB
4. Retour JSON + ETag
5. Nginx cache 5 min

Après 5 min :
6. JS refetch avec If-None-Match: ETag
7. Données inchangées → 304 Not Modified (0KB)
8. Client réutilise cache local
```

### Protections en place

```
Nginx Rate-limiting (1 req/5min)
    ↓
Nginx Headers Security (CSP, X-Frame, etc.)
    ↓
Express JWT Validation
    ↓
Express Joi Input Validation
    ↓
PostgreSQL Parameterized Queries
    ↓
Backend Business Logic
```

---

##  Métriques de Succès

| Métrique | Cible | Moyens |
|----------|-------|--------|
| **Temps recherche** | ≤ 15 min/AO | Filtres intelligents, recherche centralisée |
| **TTFB** | <100ms | HTML statique pré-généré |
| **LCP** | <2.5s | Code-split lazy, API cache 5min |
| **Cache hit (Assets)** | 99%+ | Hashing + 1 an cache |
| **Cache hit (API)** | 96%+ | ETag + 5min, données stables |
| **Adoption** | 80% consultants | Formation + support |

---

##  Phases du Projet

### Phase 1 : Conception 
- Discovery & PRD
- Spécifications & Architecture
- Modèle de données & Maquettage
- Pitch & Dossier de conception

### Phase 2 : Développement 
- Setup Next.js SSG + Nginx
- Backend Express + PostgreSQL
- Docker Compose (frontend, backend, DB, reverse-proxy)
- Tests unitaires + intégration (DB de test en container)
- CI/CD GitHub Actions (lint, tests, build Docker, push images)
- Déploiement production
- Beta testing (5 consultants)

### Phase 3 : Post-lancement
- Monitoring (cache hit, performance)
- ISR (Incremental Static Regeneration) si besoin
- Dashboard analytics
- Roadmap V2+ (stats, graphiques, IA)

---

### Pour mieux comprendre le projet
1. Lire [ARCHITECTURE.md](docs/ARCHITECTURE.md) → comprendre les choix
2. Lire [SPECS.md](docs/SPECS.md) → comprendre les user stories
3. Consulter [diagrams/02-DEPLOYMENT.md](docs/diagrams/02-DEPLOYMENT.md) → architecture système

### Stack à utiliser
- **Frontend** : Next.js 14+, JSX, SCSS + Bootstrap
- **Backend** : Node.js 18+ + Express + Joi + Argon2
- **Database** : PostgreSQL 14+
- **Infra** : Nginx reverse-proxy (cache, compression, logging, rate-limiting)
- **Containerization** : Docker + Docker Compose (obligatoire)
- **CI/CD** : GitHub Actions (lint, tests, build, deploy)

### Choix clés à respecter
- SSG (Next.js) pour frontend (pas SSR client-side rendering)
- Asset hashing automatique (Next.js le fait)
- ETag generation pour API responses
- 5min cache Nginx pour API
- Rate-limiting 12 req/h par IP
- Validation Joi sur toutes les routes
- JWT + Argon2 pour authentification sécurisée
- Argon2 password hashing (salt automatique, config OWASP)
- Logging centralisé via Nginx (access logs)
- Docker Compose pour dev/test/prod (identique partout)

### Performance non-négociables
- Bundle <200KB gzipped
- TTFB <100ms
- LCP <2.5s
- 96%+ cache hit API

---

##  Gestion de Projet

- **Repo** : GitHub public
- **Project Board** : GitHub Projects v2 (Epics, User Stories, Milestones)
- **Versioning** : Conventional Commits
- **CI/CD** : GitHub Actions (Phase 2)

---

**Dernière mise à jour** : 2026-07-10  
**Phase** : 1 (En cours)  
