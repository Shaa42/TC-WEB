// src/components/MaPage.jsx
import React from 'react';
import '../styles/MaPage.css';

import { useState } from 'react'; // N'oublie pas l'import de useState
import '../styles/MaPage.css';
// Import des icônes indépendantes
import iconeCoeur from '../assets/coeur.svg';
import flecheGauche from '../assets/fleche_gauche.svg';
// Imaginons que la droite s'appelle fleche_droite.jpg
import flecheDroite from '../assets/fleche_droite.svg'; 
import projet from '../assets/projet.jpg';
import info from '../assets/info.svg';

const MaPage = () => {
  // État pour savoir si le menu est ouvert
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="page-container">
      {/* Bouton Burger : on ajoute l'appel à toggleMenu */}
      <button className="menu-burger" onClick={toggleMenu}>
        <div className="barre"></div>
        <div className="barre"></div>
        <div className="barre"></div>
      </button>

      {/* LA SIDEBAR : Elle s'affiche si isMenuOpen est true */}
      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleMenu}>×</button>
        <nav className="menu-options">
          <a href="#profil">Mon Profil</a>
          <a href="#projets">Mes Matchs</a>
          <a href="#parametres">Paramètres</a>
          <a href="#aide">Aide</a>
          <hr />
          <a href="#logout" className="logout">Se déconnecter</a>
        </nav>
      </div>

      {/* Overlay : un fond sombre qui ferme le menu si on clique dessus */}
      {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}

      <h1 className="main-title">Project<span>Match</span></h1>

      {/* La section split n'a plus de fond blanc elle-même dans le CSS */}
      <div className="split-section">
        <div className="image-card">
          <img src={projet} alt="Illustration du projet" />
        </div>
        
        <div className="text-card">
          <h2>Nom du Projet</h2> {/* Optionnel : un titre interne */}
          <p>
            Ceci est votre paragraphe descriptif. Il flotte maintenant 
            dans sa propre carte à côté de l'image.
          </p>
        </div>
      </div>

      {/* --- BANDEAU DÉCORATIF --- */}
      <footer className="icon-bar">
        
        <button className="icon-btn" onClick={() => console.log('Retour')}>
          <img src={flecheGauche} alt="Vers la gauche" />
        </button>

        <button className="icon-btn" onClick={() => console.log('Suivant')}>
          <img src={flecheDroite} alt="Vers la droite" />
        </button>

        <button className="icon-btn" onClick={() => console.log('Like')}>
          <img src={iconeCoeur} alt="Icône cœur" />
        </button>

        <button className="icon-btn" onClick={() => console.log('Informations')}>
          <img src={info} alt="Informations supplémentaires" />
        </button>

      </footer>
    </div>
  );
};

export default MaPage;