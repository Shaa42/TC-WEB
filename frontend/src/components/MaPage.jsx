import React, { useState, useEffect } from 'react';
import '../styles/MaPage.css';
import '../styles/modal-styles.css';

// Import des assets
import iconeCoeur from '../assets/coeur.svg';
import flecheGauche from '../assets/fleche_gauche.svg';
import flecheDroite from '../assets/fleche_droite.svg'; 
import info from '../assets/info.svg';
import croix from '../assets/croix.svg';

const MaPage = ({ onNavigate }) => {
  // On transforme l'objet en un tableau d'URLs utilisables
  const [projects, setProjects] = useState([]);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour la navigation et les fenêtres
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fonctions de bascule (Toggle)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch("http://localhost:8080/api/projects")
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur serveur: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("projects:", data);
        setProjects(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || "Impossible de charger les projets");
        setIsLoading(false);
      });
  }, []);

  // Fonctions de navigation d'images
  const nextImage = () => {
    const images = projects[currentProjectIndex]?.images || [];
  	setCurrentImageIndex((prev) =>
    	prev === images.length - 1 ? 0 : prev + 1
		);
  };

  const prevImage = () => {
    const images = projects[currentProjectIndex]?.images || [];
  	setCurrentImageIndex((prev) =>
			prev === 0 ? images.length - 1 : prev - 1
		);
  };

	 const nextProject = () => {
		setCurrentProjectIndex((prev) =>
			prev === projects.length - 1 ? 0 : prev + 1
		);
		setCurrentImageIndex(0);
	};

  // Affichage conditionnel pour les états de chargement et d'erreur
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <h1 className="main-title">Project<span>Match</span></h1>
          <p className="state-message">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h1 className="main-title">Project<span>Match</span></h1>
          <p className="state-message error">{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="page-container">
        <button className="menu-burger" onClick={toggleMenu}>
          <div className="barre"></div>
          <div className="barre"></div>
          <div className="barre"></div>
        </button>
        <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
          <button className="close-btn" onClick={toggleMenu}>x</button>
          <nav className="menu-options">
            <a href="#profil">Mon Profil</a>
            <a href="#Deposer" onClick={(e) => { e.preventDefault(); onNavigate(); }}>Deposer</a>
          </nav>
        </div>
        {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}
        <div className="empty-state">
          <h1 className="main-title">Project<span>Match</span></h1>
          <p className="state-message">Aucun projet disponible pour le moment.</p>
          <button 
            className="submit-project-btn"
            onClick={onNavigate}
          >
            Deposer un projet
          </button>
        </div>
      </div>
    );
  }

  // Get current project safely
  const currentProject = projects[currentProjectIndex] || {};
  const currentImages = currentProject.images || [];
  const currentImage = currentImages[currentImageIndex] || null;

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
    href="#Déposer" 
    onClick={(e) => { 
      e.preventDefault(); // Empêche le comportement par défaut du lien
      onNavigate('submit');       // Appelle la fonction de App.jsx pour changer de page
    }}
  >
    Déposer
  </a>

          <a 
            href="#Classement" 
            onClick={(e) => { 
              e.preventDefault(); 
              onNavigate('leaderboard'); 
            }}
          >
            Classement
          </a>
          <hr />

  <a href="#Projetfav">Mes Projets Favoris</a>
          <hr />
        </nav>
      </div>

      {/* Overlay pour fermer le menu au clic extérieur */}
      {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}

      <h1 className="main-title">Project<span>Match</span></h1>

      {/* --- SECTION CARTES --- */}
      <div className="split-section">
        <div className="image-card">
          {currentImage ? (
            <img src={currentImage} alt={currentProject.title || "Projet"} />
          ) : (
            <div className="no-image-placeholder">Pas d'image</div>
          )}
          {/* Indicateur de position (petits points en bas de l'image) */}
          {currentImages.length > 1 && (
            <div className="image-counter">
              {currentImages.map((_, index) => (
                <div key={index} className={`dot ${index === currentImageIndex ? 'active' : ''}`}></div>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-card">
          <h2>{currentProject.title || "Sans titre"}</h2>
          <p>{currentProject.description || "Pas de description disponible."}</p>
        </div>
      </div>

      {/* --- MODALE DÉTAILS (INFO) --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={toggleModal}>x</button>
            
            <div className="modal-header">
              {currentImage ? (
                <img src={currentImage} alt={currentProject.title || "Projet"} />
              ) : (
                <div className="no-image-placeholder">Pas d'image</div>
              )}
              
              {/* Boutons de navigation image */}
              {currentImages.length > 1 && (
                <>
                  <button className="modal-nav-btn modal-nav-prev" onClick={prevImage}>{'<'}</button>
                  <button className="modal-nav-btn modal-nav-next" onClick={nextImage}>{'>'}</button>
                </>
              )}
              
              {/* Petits points de navigation */}
              {currentImages.length > 1 && (
                <div className="modal-image-counter">
                  {currentImages.map((_, index) => (
                    <div 
                      key={index} 
                      className={`modal-dot ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    ></div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="modal-body">
              <h2 className="modal-title">{currentProject.title || "Sans titre"}</h2>

              <div className="modal-section">
                <h3>Description du projet</h3>
                <p>{currentProject.description || "Pas de description disponible."}</p>
              </div>
              <button className="modal-action-btn" onClick={() => {
                console.log("LIKE", currentProject);
                toggleModal();
                nextProject();
              }}>
                Like
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BANDEAU D'ICÔNES --- */}
      <footer className="icon-bar">
        <button className="icon-btn btn-undo" onClick={prevImage}>
          <img src={flecheGauche} alt="Image précédente" />
        </button>

        <button className="icon-btn btn-undo" 
				onClick = {nextImage}>
          <img src={flecheDroite} alt="Image suivante" />
        </button>

        <button className="icon-btn btn-like" 
				onClick={() => {
					console.log("LIKE", projects[currentProjectIndex])
					nextProject()
				}}>
          <img src={iconeCoeur} alt="Cœur" />
        </button>

        <button className="icon-btn btn-dislike"
				onClick={() => {
					console.log("DISLIKE", projects[currentProjectIndex])
					nextProject()
				}}>
          <img src={croix} alt="Croix" />
        </button>

        {/* C'est ce bouton qui ouvre la modale maintenant */}
        <button className="icon-btn btn-info" onClick={toggleModal}>
          <img src={info} alt="Plus d'infos" />
        </button>
      </footer>

    </div>
  );
};

export default MaPage;
