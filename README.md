# INSOLIT - Bons Plans Insolites (-26 ans)

Application de bons plans exclusifs avec deux espaces distincts:
- Espace utilisateur -26 ans (consultation + claim + profil)
- Espace partenaire (gestion des offres)

Stack: React (Vite + Tailwind CSS), Express.js, Supabase.

## Structure

```
├── client/          # Frontend React (Vite)
├── server/          # API Express.js
└── supabase/        # SQL schema + seeds
```

## Installation

### 1. Base Supabase

1. Créer un projet sur https://supabase.com
2. Exécuter `supabase/schema.sql`
3. Exécuter `supabase/seed.sql`

### 2. Prérequis Partner (important)

Les flux partner utilisent des colonnes d'authentification sur `merchants` (`email` + mot de passe hashé). Si votre table `merchants` vient uniquement de `supabase/schema.sql`, ajoutez ces colonnes:

```sql
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS password TEXT;
```

Notes:
- Le code privilégie `password_hash`.
- La colonne `password` sert de compatibilité pour des schémas legacy.

### 3. Variables d'environnement

Fichier `server/.env`:

```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=change-me-in-production
```

### 4. Lancement

```bash
# Installer toutes les dépendances (root + client + server)
npm run install:all

# Démarrer client + serveur
npm run dev
```

Ports par défaut:
- Client: http://localhost:5173
- Server: http://localhost:3001

Le client proxy automatiquement `/api` vers le serveur via `client/vite.config.js`.

## Routes Frontend

### Utilisateur
- `/login`
- `/register`
- `/` (dashboard, protégé user)
- `/promo/:id` (protégé user)
- `/map` (protégé user)
- `/account` (protégé user)

### Partenaire
- `/partner/login`
- `/partner/register`
- `/partner/dashboard` (protégé partner)

### Alias legacy
- `/login-partner` -> redirection vers `/partner/login`
- `/register-partner` -> redirection vers `/partner/register`

## API Routes

### Auth utilisateur (`/api/auth`)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription utilisateur -26 ans |
| POST | `/api/auth/login` | Connexion utilisateur |
| GET | `/api/auth/me` | Profil utilisateur courant (JWT user) |
| PUT | `/api/auth/me` | Mise à jour profil utilisateur |

### Auth partner legacy (`/api/auth`)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register-partner` | Inscription partner (legacy) |
| POST | `/api/auth/login-partner` | Connexion partner (legacy) |

### Auth partner principale (`/api/partner`)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/partner/register` | Inscription partner (recommandée) |
| POST | `/api/partner/login` | Connexion partner (recommandée) |
| GET | `/api/partner/me` | Profil partner courant (JWT partner) |

### Offres partner (`/api/partner`)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/partner/promos` | Lister ses offres |
| POST | `/api/partner/promos` | Créer une offre |
| PUT | `/api/partner/promos/:id` | Modifier une offre |
| DELETE | `/api/partner/promos/:id` | Supprimer une offre |

### Catalogue public et claims
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/categories` | Liste catégories |
| GET | `/api/promos` | Liste promos (filtre `?category=...`) |
| GET | `/api/promos/:id` | Détail promo |
| POST | `/api/claim` | Enregistrer l'utilisation d'une offre (JWT user + age check) |

## Fonctionnalités

- Auth utilisateur locale avec JWT + bcrypt
- Restriction -26 ans à l'inscription et au claim
- Dashboard utilisateur avec filtres catégories
- Vue détail promo avec carte Leaflet et reveal du code promo
- Vue carte globale avec recherche, filtres et near-me
- Profil utilisateur éditable (incl. avatar)
- Auth partner séparée (token séparé)
- Dashboard partner: CRUD des offres
- UI responsive (desktop + mobile), thème dark néon

## Scripts utiles

Racine:
- `npm run dev` : démarre client + server
- `npm run install:all` : installe toutes les dépendances

Client (`client/`):
- `npm run dev`
- `npm run build`
- `npm run lint`

Server (`server/`):
- `npm run dev`
- `npm run start`
