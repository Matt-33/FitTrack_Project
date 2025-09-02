## 🖥️ FitTrack — Frontend (React + Vite)

Interface web de FitTrack : inscription/connexion, consultation et inscription aux programmes, suivi d’entraînement (session en direct), tableau de bord avec statistiques.

## 🧱 Stack front

⚛️ React (Vite)

🧭 react-router-dom

🎨 SCSS (variables, mixins, global)

🔐 Auth via JWT (contexte)

🔌 Axios (instance api)

## 📁 Structure

front/
├─ src/
│ ├─ components/
│ ├─ context/
│ ├─ lib/
│ ├─ pages/
│ ├─ routes/
│ ├─ styles/
│ ├─ App.jsx
│ └─ main.jsx
├─ index.html
├─ vite.config.js
└─ eslintconfig.js

## ⚙️ Configuration

Créer front/.env :

VITE_API_URL=http://localhost:5000

Pense à relancer npm run dev si tu modifies le .env.

## ▶️ Démarrage

cd front
npm install
npm run dev # http://localhost:5173

## 🔐 Auth & API

Le token JWT est géré par AuthContext (stockage local + header Authorization).

Les appels passent par src/lib/api.js (axios) avec baseURL = VITE_API_URL.

Les routes protégées utilisent PrivateRoute (redirection vers /login si non connecté).

Rôle coach : la page Créer un programme est accessible uniquement aux comptes role=coach.

## ✨ Fonctionnalités côté UI

Home : hero + CTA.

Login : connexion & inscription rapide (avec indicateur de force de mot de passe).

Programs :

Liste publique avec filtres (recherche texte, niveau, objectif).

Bouton S’inscrire (si connecté) ➜ l’état Inscrit ✓ persiste (chargé depuis /api/enrollments/mine).

## Dashboard :

KPI : séances totales, durée totale,

Objectif hebdomadaire (progress ring) basé sur /api/stats/me.

WorkoutSession : panneau de séance → log de la session (durée) + notes + (option) lignes d’exercices. À la validation : rafraîchit les stats.

CreateProgram (coach) :

Formulaire programme (titre, niveau, objectif, description, publier).

Exercices : sélection d’exercices existants ou création rapide d’un nouvel exercice si la liste est vide.

## 🎨 SCSS

Variables dans styles/variables.scss, mixins dans styles/mixins.scss.

Chaque page/composant a son .scss dédié.

Exemple d’usage :

@use "../styles/variables" as v;
@use "../styles/mixins" as m;

.btn-primary { background: v.$primary-color; }

Si tu ajoutes un nouveau composant, crée un .scss à côté et importe-le en haut du .jsx.

## 🔧 Déploiement (ex. Netlify)

Build command : npm run build

Publish directory : dist

Env : définir VITE_API_URL vers ton backend (Railway, etc.)

SPA fallback : règle de réécriture /\* /index.html 200

## 🧪 Astuces / Debug

CORS : si tu as une erreur CORS, ajoute l’URL du front dans CORS_ORIGINS côté backend.

401 : token expiré ou absent → reconnecte-toi (le context peut déconnecter automatiquement).

.env non pris : relance npm run dev.

## 🧠 À propos

Projet full-stack réalisé par Matthias Giraudeau (formation 3WA).
Front : React + Vite + SCSS • Back : Node + Express + Sequelize.
