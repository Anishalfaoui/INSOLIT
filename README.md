# INSOLIT - Bons Plans Insolites (-26 ans)

Application de bons plans exclusifs pour les moins de 26 ans. Stack : React (Vite + Tailwind CSS), Express.js, Supabase.

## Structure

```
├── client/          # Frontend React (Vite + Tailwind)
├── server/          # API Express.js
└── supabase/        # SQL schema & seed data
```

## Setup

### 1. Supabase

1. Crée un projet sur [supabase.com](https://supabase.com)
2. Exécute `supabase/schema.sql` dans le SQL Editor
3. Exécute `supabase/schema_partner.sql` dans le SQL Editor (migration manuelle auth marchands + status promos)
4. Exécute `supabase/seed.sql` pour les données de test

### 2. Variables d'environnement

**Server** (`server/.env`) :
```
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=change-me-in-production
```

### 3. Installation & lancement

```bash
# Installer toutes les dépendances
npm run install:all

# Lancer client + serveur
npm run dev
```

Le client tourne sur `http://localhost:5173`, le serveur sur `http://localhost:3001`.

## API Routes

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription locale (email + mot de passe hashé) |
| POST | `/api/auth/login` | Connexion locale (retourne JWT) |
| GET | `/api/auth/me` | Profil utilisateur courant (JWT requis) |
| GET | `/api/categories` | Liste des catégories |
| GET | `/api/promos` | Liste des promos (+ filtre `?category=Food`) |
| GET | `/api/promos/:id` | Détail d'une promo |
| POST | `/api/claim` | Enregistrer l'utilisation d'une offre (JWT requis) |

## Features

- Auth : système local via API Express (bcrypt + JWT), sans vérification d'email
- Dashboard avec grille de cartes et filtres par catégorie
- Vue détail avec carte Leaflet et révélation du code promo
- Design dark mode avec accents néon violet/cyan
- Responsive design
