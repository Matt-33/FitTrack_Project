# 🧠 FitTrack — Backend (Node.js + Express)

Ce dossier contient le backend de l'application **FitTrack**, une plateforme de suivi sportif permettant aux utilisateurs de gérer leurs entraînements, leur progression et d’accéder à des programmes personnalisés créés par des coachs.

---

## 🧱 Stack backend

-   🟩 **Node.js** + **Express.js**
-   🔐 **JWT** pour l'authentification sécurisée
-   🛢 **MySQL** (via Sequelize)
-   🧩 Middleware : `cors`, `dotenv`, `bcrypt`, etc.
-   📊 Admin dashboard avec **Handlebars**

---

## 📁 Structure prévue du backend

back/
├── controllers/ # Logique métier des routes
├── routes/ # Définition des endpoints REST
├── models/ # Modèles Sequelize (ou SQL bruts)
├── middleware/ # Auth, logger, validation...
├── config/ # Connexion BDD, variables d'env
├── views/ # Dashboard admin avec Handlebars (si utilisé)
├── public/ # Statics (si frontend admin local)
├── app.js # Point d’entrée Express
└── .env # Variables d’environnement (non versionné)

---

## 🔐 Fonctionnalités backend à implémenter

### 1. Authentification

-   Inscription (`POST /api/auth/register`)
-   Connexion (`POST /api/auth/login`)
-   JWT pour sécuriser les routes privées

### 2. Utilisateurs

-   Get profil (`GET /api/users/me`)

### 3. Exercices

-   Lister GET /api/exercices
-   Créer (coach) POST /api/exercices

### 4. Programmes

-   Liste publique (filtres q, level, goal) GET /api/programmes
-   Détail GET /api/programmes/:id
-   Créer (coach) POST /api/programmes
-   Mettre à jour (coach propriétaire) PUT /api/programmes/:id
-   Supprimer (coach propriétaire) DELETE /api/programmes/:id

### 5. Inscriptions

-   S’inscrire à un programme POST /api/enrollments
-   Mes inscriptions GET /api/enrollments/mine (prise de masse / sèche)

### 6. Historique (journal d’entraînement)

-   Mon historique GET /api/history
-   Logger une séance / un exercice POST /api/history

### 7. Statistiques

-   Mes stats (totales + hebdo) GET /api/stats/me

### 📦 Dépendances

⚙️ Fichier .env à créer

-   env

PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=motdepasse
DB_NAME=fittrack_db
JWT_SECRET=MaSuperCleUltraSecrete
COACH_INVITE_CODE=DEV-COACH
CORS_ORIGINS=http://localhost:5173

-   Installer & lancer
    cd back
    npm install
    npm run dev

## 🧪 Tests rapides (Postman / Insomnia)

Auth : POST /api/auth/register, POST /api/auth/login

Utilisateur : GET /api/users/me (token)

Programmes : GET /api/programmes

Inscriptions : POST /api/enrollments (token)

Historique : POST /api/history (token)

Stats : GET /api/stats/me (token)

## 🧠 À propos

Développé dans le cadre de la formation développeur web.
Projet full-stack réalisé par Matthias Giraudeau.

## 📦 Déploiement

Frontend : Netlify

Backend : Railway (ou équivalent)
