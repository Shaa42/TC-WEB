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
  // Cette ligne scanne le dossier assets/projet et récupère toutes les images
  // "eager: true" permet de charger les images immédiatement
  const imagesGlob = import.meta.glob('../assets/projet/*.{png,jpg,jpeg,svg}', { eager: true });

  // On transforme l'objet en un tableau d'URLs utilisables
  const projectImages = Object.values(imagesGlob).map((mod) => mod.default);
  const [projects, setProjects] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // États pour la navigation et les fenêtres
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fonctions de bascule (Toggle)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  useEffect(() => {
		fetch("http://localhost:8080/api/projects")
			.then(res => res.json())
			.then(data => {
				console.log("projects:", data);
				setProjects(data);
			})
			.catch(err => console.error(err));
	}, []);

  // Fonctions de navigation d'images
  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === projects.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? projects.length - 1 : prevIndex - 1
    );
  };

	if (projects.length === 0) {
  	return <p>Loading...</p>;
	}

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
      onNavigate();       // Appelle la fonction de App.jsx pour changer de page
    }}
  >
    Déposer
  </a>
          <hr />
        </nav>
      </div>

      {/* Overlay pour fermer le menu au clic extérieur */}
      {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}

      <h1 className="main-title">Project<span>Match</span></h1>

      {/* --- SECTION CARTES --- */}
      <div className="split-section">
        <div className="image-card">
          <img src={projects[currentIndex]?.image} alt="Projet" />
          {/* Indicateur de position (petits points en bas de l'image) */}
          {/* <div className="image-counter">
            {projectImages.map((_, index) => (
              <div key={index} className={`dot ${index === currentImgIndex ? 'active' : ''}`}></div>
            ))}
          </div> */}
        </div>
        
        <div className="text-card">
          <h2>{projects[currentIndex]?.title}</h2>
          <p>{projects[currentIndex]?.description}</p>
        </div>
      </div>

      {/* --- MODALE DÉTAILS (INFO) --- */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={toggleModal}>✕</button>
            
            <div className="modal-header">
              <img src={projects[currentIndex]?.image} />

              
              {/* Boutons de navigation image */}
              <button className="modal-nav-btn modal-nav-prev" onClick={prevImage}>‹</button>
              <button className="modal-nav-btn modal-nav-next" onClick={nextImage}>›</button>
              
              {/* Petits points de navigation */}
              {/* <div className="modal-image-counter">
                {projectImages.map((_, index) => (
                  <div 
                    key={index} 
                    className={`modal-dot ${index === currentImgIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImgIndex(index)}
                  ></div>
                ))}
              </div> */}
            </div>
            
            <div className="modal-body">
              <h2 className="modal-title">Nom du Projet</h2>

              <div className="modal-section">
                <h3>Description du projet</h3>
                <p>
                  Ceci est la description complète et détaillée du projet. Elle présente l'idée globale, 
                  les objectifs spécifiques et la vision à long terme. On y détaille également les besoins 
                  techniques et les ressources requises.
                </p>
              </div>
              <button className="modal-action-btn" onClick={toggleModal}>
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

        <button className="icon-btn btn-dislike" 
				onClick={() => {
					console.log("DISLIKE", projects[currentIndex])
					nextImage()
				}}>
          <img src={flecheDroite} alt="Image suivante" />
        </button>

        <button className="icon-btn btn-like" 
				onClick={() => {
					console.log("LIKE", projects[currentIndex])
					nextImage()
				}}>
          <img src={iconeCoeur} alt="Cœur" />
        </button>

        <button className="icon-btn btn-like" onClick={() => console.log('Croix')}>
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