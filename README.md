# PROJET-WEB : PROJECT MATCH
Project Match est une plateforme de classement  des projets crées par les élèves TC. Il permet grâce à son système de likes inspiré des applications de rencontre, de hiérarchiser les projets de manière intuitive. 
## Pré-requis

-React & React-DOM (19.2.4)\
-React-Tinder-Card (1.6.4) \
-React-Spring/Web (10.0.3)
 
-Vite (8.0.0) \
-ESLint (9.39.4)\
-@vitejs/plugin-react (6.0.0)

##Architecture

```
├── backend/                # Logique serveur et API (Go)
│   ├── cmd/
│   │   ├── .env            # Variables d'environnement
│   │   └── main.go         # Point d'entrée du serveur Go
│   ├── internal/request/
│   │   ├── api.go          # Gestion des routes et handlers
│   │   └── database.go     # Logique de connexion et requêtes base de données
│   ├── uploads/            # Stockage des fichiers envoyés par les utilisateurs
│   ├── go.mod              # Gestionnaire de modules Go
│   └── projects.json       # Stockage local ou structure de données initiale
│
├── frontend/               # Interface utilisateur (React + Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js   # Configuration du client (Axios/Fetch) pour le backend
│   │   ├── assets/         # Images, polices et ressources multimédias
│   │   ├── components/     # Composants React réutilisables (Leaderboard, Filter...)
│   │   ├── styles/         # Fichiers CSS associés aux composants
│   │   ├── App.jsx         # Composant racine de l'application
│   │   └── main.jsx        # Point d'entrée React
│   ├── eslint.config.js    # Règles de qualité de code
│   ├── package.json        # Dépendances et scripts du frontend
│   └── vite.config.js      # Configuration de l'outil de build Vite
│
├── database/               # Fichiers liés à la gestion des données
├── .gitignore              # Fichiers à exclure de la synchronisation Git
└── README.md               # Documentation du projet
```

### Lancement

Pour lancer le serveur : (dans le dossier backend\cmd\)

```
go run main.go
```
Pour compiler : (dans le dossier frontend\)

```
npm install
npm run dev
```

## Fonctionnalités

Boutons like et dislike, et des mouvements de swipe à droite pour liker et à gauche pour disliker.\
Menu pour voir le classement des projets ou déposer des projets.\
Retours sonores pour certaines actions.\
