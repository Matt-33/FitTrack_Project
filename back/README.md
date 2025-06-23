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
-   Modifier profil (nom, rôle, etc.)

### 3. Entraînements

-   Créer une séance (`POST /api/workouts`)
-   Modifier / Supprimer (`PUT`, `DELETE`)
-   Lister les séances (`GET /api/workouts`)
-   Associer exercices personnalisés à une séance

### 4. Programmes

-   Créer un programme (`POST /api/programs`) – réservé aux coachs
-   Liste publique des programmes (`GET /api/programs`)
-   Affecter un programme à un utilisateur (`POST /api/users/:id/program`)

### 5. Dashboard admin

-   Voir tous les utilisateurs
-   Ajouter des modèles de programmes (prise de masse / sèche)

---

### 📦 Dépendances

⚙️ Fichier .env à créer
env

PORT=3307
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=motdepasse
DB_NAME=fittrack_db
JWT_SECRET=yourSuperSecretKey

🧪 Tests des routes
Utilise Postman ou Insomnia pour tester les routes :

Auth : POST /api/auth/register, POST /api/auth/login

Séances : GET /api/workouts (token requis)

Programmes : GET /api/programs

🧠 À propos
Développé dans le cadre de la formation développeur web.
Projet full-stack réalisé par Matthias Giraudeau.

📦 Déploiement
Frontend prévu sur : Netlify

Backend prévu sur : Railway
