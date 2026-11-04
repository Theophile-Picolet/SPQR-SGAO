# SPQR-SGAO : Système de Gestion Centralisé des Références pour Appels d'Offres

Un Micro-SaaS haute performance, sécurisé et éco-conçu pour les cabinets de conseil.

## Le Problème

Les consultants en politique/finances publiques perdent **3-4 heures par appel d'offres** à chercher dans des fichiers éparpillés (Excel, emails, dossiers) les références pertinentes. Résultat : risque d'oublis, frustration, et perte de productivité.

**SGAO résout ça en une seule fonctionnalité forte** : une barre de recherche centralisée avec filtres intelligents (division, collectivité, année, montant, résultat).

---

## Règles métier

Trois rôles : **consultant**, **manager**, **admin**.

| Action | Consultant | Manager | Admin |
|---|:---:|:---:|:---:|
| Créer une référence (auto-affectée au créateur) | ✅ | ✅ | ✅ |
| Consulter la liste de toutes les références | ✅ | ✅ | ✅ |
| Consulter le détail + commentaires | ⚠️ Si affecté | ⚠️ Si affecté | ✅ |
| Commenter une référence | ⚠️ Si affecté | ⚠️ Si affecté | ✅ |
| Modifier une référence directement | ❌ | ⚠️ Si affecté | ✅ |
| Demander une modification ou une suppression | ⚠️ Si affecté | ⚠️ Si affecté (suppression) | ➖ |
| Valider / rejeter une demande de modification | ❌ | ⚠️ Si affecté | ✅ |
| Décider une demande de suppression / retirer une référence (suppression logique) | ❌ | ❌ | ✅ |
| Affecter une référence, désactiver une affectation | ❌ | ❌ | ✅ |
| Suivre ses références et ses consultants | ❌ | ✅ | ➖ |
| Gérer les utilisateurs et les rôles (désactivation logique) | ❌ | ❌ | ✅ |
| Gérer les listes de choix (division, type de consultation, etc.) | ❌ | ❌ | ✅ |

**Circuit de modification** : un consultant affecté ne modifie pas une référence, il soumet une demande stockée dans la table transitoire `request`. Les valeurs proposées ne sont reportées dans la table `tender` qu'après approbation d'un manager affecté à la référence ou d'un admin, dans une transaction unique. Une demande de suppression ne peut être décidée que par un admin. Un rejet laisse la référence inchangée.

**Affectation** : la création affecte automatiquement la référence à son auteur ; un admin complète ensuite l'équipe. L'affectation conditionne l'accès au détail, aux commentaires et au droit de demander une modification. La liste des références, elle, reste visible de tous — c'est la valeur du produit.

**Notifications in-app** : affectation, demande soumise (vers les managers affectés et les admins), décision de validation (vers le demandeur), nouveau commentaire (vers les autres affectés).

**Listes de choix** : division, sujet, collectivité et type de consultation sont des tables de référence (pas des ENUM figés dans le schéma), pilotées par un CRUD admin. Une valeur déjà utilisée par une référence ne peut pas être supprimée, seulement désactivée. Le résultat (Remportée/Perdue/En cours/En suspens), lui, reste une liste fixe : il structure directement le calcul du taux de remport.

**Comptes utilisateurs** : pas d'auto-inscription. Seul l'admin crée un compte, avec un mot de passe initial qu'il transmet à l'utilisateur hors application, via un canal sécurisé interne au cabinet — jamais par email en clair ni par lien d'invitation.

---

##  Stack Technique — Optimisée pour Performance, Sécurité, Éco-conception

### Architecture générale

```
Client (Navigateur) 
    ↓ HTTPS
┌─────────────────────────────────────┐
│      Nginx Reverse-Proxy            │ ← 1 point de contrôle
│ • Fichiers statiques (cache 1 an)   │ • Headers de sécurité
│ • Relais /api (aucun cache API)     │ • Rate-limiting
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
- **Styling** : SCSS + Bootstrap ; icônes Lucide (import par icône)
- **Bundle** : <200KB gzipped (lazy-loaded par route)
- **Deployment** : HTML statique pré-généré (zéro calcul runtime)

### Backend
- **Runtime** : Node.js 18+
- **Framework** : Express.js 4.x (minimaliste, performant)
- **Validation** : Joi (déclarative, sécurisée)
- **Authentication** : JWT stateless dans un cookie HttpOnly (1h, SameSite=Strict) + Argon2 password hashing
- **Logging** : Logging centralisé via Nginx (access logs + error tracking via API)

### Infrastructure
- **Reverse-proxy** : Nginx (fichiers statiques et leur cache, sécurité, rate-limiting, compression gzip, logging ; aucun cache des réponses API)
- **Database** : PostgreSQL 14+ (relationnel, indices optimisés)
- **ORM** : Aucun (requêtes paramétrées directes)
- **Containerization** : Docker + Docker Compose : 4 conteneurs en développement (`client`, `server`, `db`, `db-test`), 3 en production (`nginx`, `server`, `db`) ; la base de test n'existe jamais en production
- **CI/CD** : GitHub Actions (tests, build, déploiement)
- **Testing Database** : PostgreSQL en container (données de test isolées)

---

##  Choix Techniques — Justifiés par 3 piliers

###  Performance 

| Choix | Impact | Métrique |
|-------|--------|----------|
| **SSG (Next.js)** | Pages pré-générées → <100ms TTFB | 5x plus rapide qu'une SPA |
| **Asset hashing** | Tous les fichiers statiques (JS, CSS, polices, images) hachés : cache 1 an sans invalidation manuelle | 99%+ cache hit |
| **ETag par version de données** | Calculé par Express sans requête SQL : lecture inchangée = `304` sans payload ni accès à la base | Lectures répétées sans requête en base |
| **Lazy-loading** | Code-split par route, chargement parallèle | LCP < 2.5s |

**Résultat** : Page charge en <2.5s, puis données en parallèle. Utilisateur ne ressent aucune attente.

###  Sécurité 

| Choix | Protection |
|-------|-----------|
| **Nginx centralisé** | 1 point d'entrée pour tous les headers (CSP, X-Frame, etc.) |
| **Rate-limiting** | Limite par IP sur l'API et, plus strictement, sur la connexion (valeurs provisoires, à confirmer en fin de projet) |
| **JWT dans un cookie HttpOnly** | Pas de session server-side ; jeton illisible par le JavaScript (`SameSite=Strict`, 1h) |
| **Joi validation** | Toutes les entrées validées (SQL injection, XSS) |
| **CORS strict** | Whitelist d'origines, credentials contrôlés |
| **RBAC 3 rôles** | consultant / manager / admin — écriture directe sur les références réservée à l'admin et aux managers affectés |
| **Cloisonnement par affectation** | Détail et commentaires réservés aux utilisateurs affectés, contrôle rejoué côté backend |
| **Table transitoire `request`** | Un consultant ne peut jamais écrire directement dans la table des références : ses valeurs attendent l'approbation d'un manager affecté ou d'un admin |

**Résultat** : Attaques bloquées avant le backend. Infrastructure légère.

###  Éco-conception 

| Dimension | Réduction | Justification |
|-----------|-----------|---------------|
| **Bande passante** | à mesurer | `304` sans payload, fichiers statiques 1 an en cache |
| **Calcul serveur** | à mesurer | Nginx sert le front statique, aucun Node.js pour le rendu, `304` sans requête SQL |
| **Bundle initial** | 60% | <200KB vs 500KB SPA classique |
| **CO₂ équivalent** | ~95% | Moins d'électricité réseau, serveur, client |

**Exemple** : Un utilisateur qui visite 1x/semaine (52 fois/an) télécharge les fichiers statiques une seule fois ; ensuite seules les données modifiées sont transférées (estimation initiale : **10MB/an → 250KB/an**, à confirmer par les mesures de l'epic L).

---

##  Documents Clés (Phase 1)

| Document | Contenu |
|----------|---------|
| **[PRD.md](docs/PRD.md)** | Problème, persona, proposition de valeur, fonctionnalités V1 |
| **[SPECS.md](docs/SPECS.md)** | User stories au format JTBD + scénarios Gherkin |
| **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | **Stack détaillée, justifications, caching stratégique, déploiement** |
| **[DESIGN.md](docs/DESIGN.md)** | Charte graphique, design tokens, RGAA 4.1 |
| **[diagrams/](docs/diagrams/)** | Diagrammes UML (use-cases, déploiement, séquence, MERISE) |
| **[phase2/](phase2/)** | Phase 2 : backlog complet au format Epic > US > issue (`us.md`, source unique), résumé des epics (`epic.md`), écarts d'alignement (`ecarts.md`) |
| **[wireframes/wireframe.pen](docs/wireframes/wireframe.pen)** | Maquettes Hi-Fi, design system et planche Merise (fichier Pencil) |

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
    ├── recherche-jtbd.md            Sources JTBD documentées
    ├── benchmark.md                 Benchmarks visuels
    ├── moodboard.md                 Moodboard
    ├── wireframes/wireframe.pen     Maquettes Hi-Fi et design system
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
1. JS fetch('/api/references?division_id=3')
2. Nginx relaie /api à Express (aucun cache dans Nginx)
3. Express valide le JWT (cookie) et les droits, puis exécute la requête SQL
4. Retour JSON + ETag, Cache-Control: private, no-cache (le navigateur garde la réponse)

À chaque lecture suivante (même après une déconnexion) :
5. Le navigateur envoie If-None-Match avec l'ETag gardé
6. Express contrôle la session et les droits, puis calcule l'ETag courant depuis des compteurs de version en mémoire
7. Données inchangées → 304 Not Modified, sans requête SQL ni payload
8. Une écriture a eu lieu → 200 avec la nouvelle donnée
```

### Protections en place

```
Nginx Rate-limiting (API et connexion)
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
| **LCP** | <2.5s | Code-split lazy, fichiers statiques en cache |
| **Cache hit (Assets)** | 99%+ | Hashing + 1 an cache |
| **Revalidation API** | majorité de `304` | ETag par version de données, mesuré dans les journaux Nginx |
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
- **Infra** : Nginx reverse-proxy (fichiers statiques, compression, logging, rate-limiting)
- **Containerization** : Docker + Docker Compose (obligatoire)
- **Lint / format** : Biome (front et back)
- **Tests** : Jest + Supertest + ts-jest (back), Jest + Testing Library (front), Playwright (E2E)
- **Hooks Git** : Husky + lint-staged ; commitlint (Conventional Commits) ; tests unitaires au pre-push. Tests d'intégration en CI sur chaque PR, E2E en CI à chaque merge sur `main`
- **CI/CD** : GitHub Actions (commitlint, lint, tests, build, déploiement)
- **Hébergement** : VPS OVH (Docker Compose, Nginx)

### Choix clés à respecter
- SSG (Next.js) pour frontend (pas SSR client-side rendering)
- Asset hashing automatique (Next.js le fait)
- ETag par version de données pour les réponses API (calculé sans requête SQL), `Cache-Control: private, no-cache`
- Aucun cache API dans Nginx (réponses propres à l'utilisateur)
- Rate-limiting Nginx (valeurs provisoires, à confirmer en fin de projet)
- Validation Joi sur toutes les routes
- JWT + Argon2 pour authentification sécurisée
- Argon2 password hashing (salt automatique, config OWASP)
- Logging centralisé via Nginx (access logs)
- Docker Compose pour dev/test/prod (identique partout)

### Performance non-négociables
- Bundle <200KB gzipped
- TTFB <100ms
- LCP <2.5s
- Lectures API répétées en `304` sans requête SQL

---

##  Gestion de Projet

- **Repo** : GitHub public
- **Project Board** : GitHub Projects v2 (Epics, User Stories, Milestones)
- **Versioning** : Conventional Commits (vérifiés par commitlint)
- **CI/CD** : GitHub Actions

---

**Dernière mise à jour** : 2026-10-07  
**Phase** : 2 (Développement : initialisation du projet)  
