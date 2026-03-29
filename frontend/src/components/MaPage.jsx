import React, { useState, useEffect, useRef } from "react";
import "../styles/MaPage.css";
import "../styles/modal-styles.css";
import { api } from "../api/client"; // Importation du service API

// Import des assets
import iconeCoeur from "../assets/coeur.svg";
import flecheGauche from "../assets/fleche_gauche.svg";
import flecheDroite from "../assets/fleche_droite.svg";
import info from "../assets/info.svg";
import croix from "../assets/croix.svg";
import TinderCard from "react-tinder-card";

const MaPage = ({ onNavigate }) => {
    const [projects, setProjects] = useState([]);
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0); 

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasMoreProjects, setHasMoreProjects] = useState(true);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const childRefs = useRef([]);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        fetch("http://localhost:8080/api/projects")
            .then((res) => {
                if (!res.ok) throw new Error(`Erreur serveur: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                const loadedProjects = Array.isArray(data) ? data : [];
                setProjects(loadedProjects);
                setHasMoreProjects(loadedProjects.length > 0);
                setIsLoading(false);
            })
            .catch((err) => {
                setError(err.message || "Impossible de charger les projets");
                setIsLoading(false);
            });
    }, []);

    const nextProject = () => {
        setCurrentProjectIndex((prev) => prev + 1);
        setCurrentImageIndex(0); 
    };

    const nextImage = () => {
        const project = projects[currentProjectIndex];
        const images = Array.isArray(project?.images) ? project.images : [project?.img];
        if (currentImageIndex < images.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        }
    };

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    const handleVote = async (projectId, type) => {
        try {
            const response = await fetch(`http://localhost:8080/api/projects/${projectId}/${type}`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`Erreur serveur: ${res.status}`);
            console.log(`Vote ${type} réussi pour ${projectId}`);
        } catch (err) {
            console.error("Erreur lors du vote:", err.message);
        }
    };

    const swipe = async (dir) => {
        const topIndex = visibleProjects.length - 1;
        if (childRefs.current[topIndex]) {
            await childRefs.current[topIndex].swipe(dir);
        }
    };

    if (isLoading) return <div className="page-container"><div className="loading-state">Chargement...</div></div>;

    if (error || !projects || projects.length === 0 || currentProjectIndex >= projects.length) {
        return (
            <div className="page-container">
                <button className="menu-burger" onClick={toggleMenu}><div className="barre"></div><div className="barre"></div><div className="barre"></div></button>
                <div className={`sidebar ${isMenuOpen ? "open" : ""}`}>
                    <button className="close-btn" onClick={toggleMenu}>×</button>
                    <nav className="menu-options">
                        <a href="#profil">Mon Profil</a>
                        <a href="#Deposer" onClick={(e) => { e.preventDefault(); onNavigate("submit"); }}>Déposer</a>
                        <a href="#Classement" onClick={(e) => { e.preventDefault(); onNavigate("leaderboard"); }}>Classement</a>
                    </nav>
                </div>
                {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}
                <div className="empty-state">
                    <h1 className="main-title">Project<span>Match</span></h1>
                    <p className="state-message">Plus de projets disponibles.</p>
                    <button className="submit-project-btn" onClick={() => onNavigate("submit")}>Déposer un projet</button>
                </div>
            </div>
        );
    }

    const currentProject = projects[currentProjectIndex];
    const visibleProjects = [0, 1, 2]
        .map((i) => projects[currentProjectIndex + i])
        .filter(Boolean)
        .reverse();

    // Gestion des images pour la modale
    const currentImages = Array.isArray(currentProject?.images) ? currentProject.images : [currentProject?.img];
    const currentModalImage = currentImages[currentImageIndex] || null;

    return (
        <div className="page-container">
            <button className="menu-burger" onClick={toggleMenu}><div className="barre"></div><div className="barre"></div><div className="barre"></div></button>

            <div className={`sidebar ${isMenuOpen ? "open" : ""}`}>
                <button className="close-btn" onClick={toggleMenu}>×</button>
                <nav className="menu-options">
                    <a href="#profil">Mon Profil</a>
                    <a href="#Déposer" onClick={(e) => { e.preventDefault(); onNavigate("submit"); }}>Déposer</a>
                    <a href="#Classement" onClick={(e) => { e.preventDefault(); onNavigate("leaderboard"); }}>Classement</a>
                    <hr /><a href="#Projetfav">Mes Projets Favoris</a>
                </nav>
            </div>

            {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}

            <h1 className="main-title">Project<span>Match</span></h1>

            <div className="cardContainer">
                {visibleProjects.map((project, index) => {
                    const isTopCard = index === visibleProjects.length - 1;
                    const images = Array.isArray(project.images) ? project.images : [project.img];
                    const displayedImage = isTopCard ? images[currentImageIndex] : images[0];

                    return (
                        <TinderCard
                            ref={(el) => (childRefs.current[index] = el)}
                            className="swipe"
                            key={project._id}
                            swipeRequirementType="position"
                            swipeThreshold={80}
                            onSwipe={(dir) => {
                                if (dir === 'left') handleVote(project._id, 'dislike');
                                else if (dir === 'right') handleVote(project._id, 'like');
                            }}
                            onCardLeftScreen={() => isTopCard && nextProject()}
                            preventSwipe={["up", "down"]}
                        >
                            <div className={`card card-${index}`}>
                                <div className="split-section">
                                    <div className="image-card">
                                        {displayedImage ? (
                                            <img src={displayedImage} alt={project.title} />
                                        ) : (
                                            <div className="no-image-placeholder">Pas d'image</div>
                                        )}
                                        {isTopCard && images.length > 1 && (
                                            <div className="image-dots">
                                                {images.map((_, i) => (
                                                    <div key={i} className={`dot ${i === currentImageIndex ? 'active' : ''}`} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-card">
                                        <h2>{project.title}</h2>
                                        <p>{project.description}</p>
                                    </div>
                                </div>
                            </div>
                        </TinderCard>
                    );
                })}
            </div>

            {/* --- MODALE DÉTAILS (INFO) --- */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={toggleModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={toggleModal}>x</button>
                        <div className="modal-header">
                            {currentModalImage ? (
                                <img src={currentModalImage} alt={currentProject.title} />
                            ) : (
                                <div className="no-image-placeholder">Pas d'image</div>
                            )}
                        </div>
                        <div className="modal-body">
                            <h2 className="modal-title">{currentProject.title}</h2>
                            <div className="modal-section">
                                <h3>Description détaillée</h3>
                                <p>
                                    {currentProject.long_description && currentProject.long_description.trim() !== "" 
                                        ? currentProject.long_description 
                                        : "Ce projet n'a pas encore de description détaillée."}
                                </p>
                            </div>
                            <button className="modal-action-btn" onClick={() => { swipe("right"); toggleModal(); }}>
                                Like ce projet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="icon-bar">
                <button className="icon-btn btn-undo" onClick={prevImage}>
                    <img src={flecheGauche} alt="Précédent" />
                </button>
                <button className="icon-btn btn-undo" onClick={nextImage}>
                    <img src={flecheDroite} alt="Suivant" />
                </button>
                <button className="icon-btn btn-like" onClick={() => swipe("right")}>
                    <img src={iconeCoeur} alt="Cœur" />
                </button>
                <button className="icon-btn btn-dislike" onClick={() => swipe("left")}>
                    <img src={croix} alt="Croix" />
                </button>
                <button className="icon-btn btn-info" onClick={toggleModal}>
                    <img src={info} alt="Plus d'infos" />
                </button>
            </footer>
        </div>
    );
};

export default MaPage;