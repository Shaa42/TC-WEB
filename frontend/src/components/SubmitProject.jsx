import React, { useState } from 'react';
import '../styles/SubmitProject.css';

const SubmitProject = ({ onBack }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fonctions de bascule (Toggle)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!title.trim()) {
      setError("Le titre est requis");
      return;
    }
    if (!description.trim()) {
      setError("La description est requise");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    fetch("http://localhost:8080/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        images,
      }),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur serveur: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Saved:", data);
        setSuccess(true);
        setTimeout(() => {
          onBack(); // retour a l'acceuil apres 1 seconde
        }, 1000);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || "Impossible de publier le projet. Veuillez reessayer.");
        setIsSubmitting(false);
      });
  };

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
        
        {/* Messages d'erreur et de succes */}
        {error && (
          <div className="form-message error-message">
            {error}
          </div>
        )}
        {success && (
          <div className="form-message success-message">
            Projet publie avec succes! Redirection...
          </div>
        )}

        <form className="project-form" onSubmit={handleSubmit}>
          {/* --- SECTION APERÇU (Ce que les autres voient en swipant) --- */}
          <div className="form-section">
            <h3>Apercu de la carte</h3>
            <input
              type="text"
              placeholder="Titre du projet"
              className={`input-field ${error && !title.trim() ? 'input-error' : ''}`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
            />
            <textarea
              className={`input-field short-desc ${error && !description.trim() ? 'input-error' : ''}`}
              placeholder="Description courte du projet"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError(null);
              }}
            />
            
            <div className="file-upload-group">
              <label>Photos du projet (max 5)</label>
              <input
							type="file"
							multiple
							accept="image/*"
							onChange={(e) => {
								const files = Array.from(e.target.files);
								const urls = files.map(file => URL.createObjectURL(file));
								setImages(urls);
							}}/>
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

          <button 
            type="submit" 
            className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
            disabled={isSubmitting || success}
          >
            {isSubmitting ? 'Publication...' : success ? 'Publie!' : 'Mettre en ligne'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitProject;
