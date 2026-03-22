import React, { useState } from 'react';
import '../styles/SubmitProject.css';

const SubmitProject = ({ onBack }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fonctions de bascule (Toggle)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="page-container">
      
      {/* --- MENU BURGER --- */}
      <button className="menu-burger" onClick={toggleMenu}>
        <div className="barre"></div>
        <div className="barre"></div>
        <div className="barre"></div>
      </button>

      {/* --- SIDEBAR --- */}
      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleMenu}>×</button>
        <nav className="menu-options">
          <a href="#profil">Mon Profil</a>
          <a 
            href="#projets" 
            onClick={(e) => {
              e.preventDefault();
              toggleMenu(); // Ferme le menu
              onBack(); // Retour à la page Tinder
            }}
          >
            Projets
          </a>
          <hr />
        </nav>
      </div>

      {/* Overlay pour fermer le menu au clic extérieur */}
      {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}
      
      <div className="submit-card">
        <h2 className="form-title">Publier un <span>Projet</span></h2>
        
        <form className="project-form">
          {/* --- SECTION APERÇU (Ce que les autres voient en swipant) --- */}
          <div className="form-section">
            <h3>Aperçu de la carte</h3>
            <input type="text" placeholder="Titre du projet (ex: EcoRide)" className="input-field" />
            <textarea placeholder="Description courte (2 lignes max)" className="input-field short-desc"></textarea>
            
            <div className="file-upload-group">
              <label>Photos du projet (max 5)</label>
              <input type="file" multiple accept="image/*" />
            </div>
          </div>

          {/* --- SECTION DÉTAILLÉE (Ce qui s'affiche au clic sur "Info") --- */}
          <div className="form-section">
            <h3>Détails supplémentaires</h3>
            <textarea placeholder="Explication complète du projet, objectifs, besoins..." className="input-field long-desc"></textarea>
            
            <div className="file-upload-group">
              <label>Vidéo de présentation (Optionnel)</label>
              <input type="file" accept="video/*" />
            </div>
          </div>

          <button type="submit" className="submit-btn">Mettre en ligne</button>
        </form>
      </div>
    </div>
  );
};

export default SubmitProject;