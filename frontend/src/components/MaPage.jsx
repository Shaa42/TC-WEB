import React, { useState, useEffect, useRef } from "react";
import "../styles/MaPage.css";
import "../styles/modal-styles.css";

// Import des assets
import iconeCoeur from "../assets/coeur.svg";
import flecheGauche from "../assets/fleche_gauche.svg";
import flecheDroite from "../assets/fleche_droite.svg";
import info from "../assets/info.svg";
import croix from "../assets/croix.svg";
import TinderCard from "react-tinder-card";

const MaPage = ({ onNavigate }) => {
    // On transforme l'objet en un tableau d'URLs utilisables
    const [projects, setProjects] = useState([]);
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // États pour la navigation et les fenêtres
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasMoreProjects, setHasMoreProjects] = useState(true);

    // Fonctions de bascule (Toggle)
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleModal = () => setIsModalOpen(!isModalOpen);

    // References des cartes
    const childRefs = useRef([]);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        fetch("http://localhost:8080/api/projects")
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Erreur serveur: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log("projects:", data);
                const loadedProjects = Array.isArray(data) ? data : [];
                setProjects(loadedProjects);
                setHasMoreProjects(loadedProjects.length > 0);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(err.message || "Impossible de charger les projets");
                setIsLoading(false);
            });
    }, []);

    const nextProject = () => {
        setCurrentProjectIndex((prev) => {
            if (prev >= projects.length - 1) {
                setHasMoreProjects(false);
                return prev;
            }
            return prev + 1;
        });
    };

    const swipe = async (dir) => {
        const topIndex = visibleProjects.length - 1;

        if (childRefs.current[topIndex]) {
            await childRefs.current[topIndex].swipe(dir);
        }
    };

    // Affichage conditionnel pour les états de chargement et d'erreur
    if (isLoading) {
        return (
            <div className="page-container">
                <div className="loading-state">
                    <h1 className="main-title">
                        Project<span>Match</span>
                    </h1>
                    <p className="state-message">Chargement des projets...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="error-state">
                    <h1 className="main-title">
                        Project<span>Match</span>
                    </h1>
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

                <div className={`sidebar ${isMenuOpen ? "open" : ""}`}>
                    <button className="close-btn" onClick={toggleMenu}>
                        ×
                    </button>
                    <nav className="menu-options">
                        <a href="#profil">Mon Profil</a>
                        {/* On ajoute les liens manquants ici aussi */}
                        <a
                            href="#Deposer"
                            onClick={(e) => {
                                e.preventDefault();
                                onNavigate("submit");
                            }}
                        >
                            Déposer
                        </a>
                        <a
                            href="#Classement"
                            onClick={(e) => {
                                e.preventDefault();
                                onNavigate("leaderboard");
                            }}
                        >
                            Classement
                        </a>
                        <hr />
                    </nav>
                </div>

                {isMenuOpen && (
                    <div className="overlay" onClick={toggleMenu}></div>
                )}

                <div className="empty-state">
                    <h1 className="main-title">
                        Project<span>Match</span>
                    </h1>
                    <p className="state-message">
                        Aucun projet disponible pour le moment.
                    </p>
                    <button
                        className="submit-project-btn"
                        onClick={() => onNavigate("submit")}
                    >
                        Déposer un projet
                    </button>
                </div>
            </div>
        );
    }

    const noMoreProjects =
        !hasMoreProjects || currentProjectIndex >= projects.length;

    if (noMoreProjects) {
        return (
            <div className="page-container">
                <button className="menu-burger" onClick={toggleMenu}>
                    <div className="barre"></div>
                    <div className="barre"></div>
                    <div className="barre"></div>
                </button>
                <div className={`sidebar ${isMenuOpen ? "open" : ""}`}>
                    <button className="close-btn" onClick={toggleMenu}>
                        ×
                    </button>
                    <nav className="menu-options">
                        <a href="#profil">Mon Profil</a>
                        <a
                            href="#Déposer"
                            onClick={(e) => {
                                e.preventDefault();
                                onNavigate("submit");
                            }}
                        >
                            Déposer
                        </a>
                        <a
                            href="#Classement"
                            onClick={(e) => {
                                e.preventDefault();
                                onNavigate("leaderboard");
                            }}
                        >
                            Classement
                        </a>
                    </nav>
                </div>
                {isMenuOpen && (
                    <div className="overlay" onClick={toggleMenu}></div>
                )}
                <div className="empty-state">
                    <h1 className="main-title">
                        Project<span>Match</span>
                    </h1>
                    <p className="state-message">Aucun projet disponible.</p>
                    <button
                        className="submit-project-btn"
                        onClick={() => onNavigate("submit")}
                    >
                        Déposer un projet
                    </button>
                </div>
            </div>
        );
    }

    // Get current project safely
    const currentProject = projects[currentProjectIndex] || {};
    const currentImage =
        currentProject.img &&
        currentProject.img !== "http://localhost:8080/uploads/"
            ? currentProject.img
            : null;
    const visibleProjects = [0, 1, 2]
        .map((i) => projects[currentProjectIndex + i])
        .filter(Boolean)
        .reverse();

    return (
        <div className="page-container">
            {/* --- MENU BURGER --- */}
            <button className="menu-burger" onClick={toggleMenu}>
                <div className="barre"></div>
                <div className="barre"></div>
                <div className="barre"></div>
            </button>

            {/* --- SIDEBAR --- */}
            <div className={`sidebar ${isMenuOpen ? "open" : ""}`}>
                <button className="close-btn" onClick={toggleMenu}>
                    ×
                </button>
                <nav className="menu-options">
                    <a href="#profil">Mon Profil</a>
                    <a
                        href="#Déposer"
                        onClick={(e) => {
                            e.preventDefault(); // Empêche le comportement par défaut du lien
                            onNavigate("submit"); // Appelle la fonction de App.jsx pour changer de page
                        }}
                    >
                        Déposer
                    </a>

                    <a
                        href="#Classement"
                        onClick={(e) => {
                            e.preventDefault();
                            onNavigate("leaderboard");
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

            <h1 className="main-title">
                Project<span>Match</span>
            </h1>

            {/* --- SECTION CARTES --- */}
            <div className="cardContainer">
                {visibleProjects.map((project, index) => {
                    const image =
                        project.img &&
                        project.img !== "http://localhost:8080/uploads/"
                            ? project.img
                            : null;

                    return (
                        <TinderCard
                            ref={(el) => (childRefs.current[index] = el)}
                            className="swipe"
                            key={currentProjectIndex + "-" + index}
                            swipeRequirementType="position"
                            swipeThreshold={80}
                            onSwipe={(dir) => {
                                console.log("swiped:", dir);
                            }}
                            onCardLeftScreen={() => {
                                if (index === visibleProjects.length - 1) {
                                    nextProject();
                                }
                            }}
                            preventSwipe={["up", "down"]}
                        >
                            <div className={`card card-${index}`}>
                                <div className="split-section">
                                    <div className="image-card">
                                        {image ? (
                                            <img
                                                key={image}
                                                src={image}
                                                alt={project.title}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.style.display =
                                                        "none";
                                                    e.target.nextSibling.style.display =
                                                        "flex";
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="no-image-placeholder"
                                            style={{
                                                display: image
                                                    ? "none"
                                                    : "flex",
                                            }}
                                        >
                                            Pas d'image
                                        </div>
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
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="close-modal" onClick={toggleModal}>
                            x
                        </button>

                        <div className="modal-header">
                            {currentImage ? (
                                <img
                                    key={`modal-${currentImage}`}
                                    src={currentImage}
                                    alt={currentProject.title || "Projet"}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display =
                                            "flex";
                                    }}
                                />
                            ) : null}
                            <div
                                className="no-image-placeholder"
                                style={{
                                    display: currentImage ? "none" : "flex",
                                }}
                            >
                                Pas d'image
                            </div>
                        </div>

                        <div className="modal-body">
                            <h2 className="modal-title">
                                {currentProject.title || "Sans titre"}
                            </h2>

                            <div className="modal-section">
                                <h3>Description du projet</h3>
                                <p>
                                    {currentProject.description ||
                                        "Pas de description disponible."}
                                </p>
                            </div>
                            <button
                                className="modal-action-btn"
                                onClick={() => {
                                    console.log("LIKE", currentProject);
                                    toggleModal();
                                    nextProject();
                                }}
                            >
                                Like
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- BANDEAU D'ICÔNES --- */}
            <footer className="icon-bar">
                <button className="icon-btn btn-undo" onClick={nextProject}>
                    <img src={flecheGauche} alt="Projet précédent" />
                </button>

                <button className="icon-btn btn-undo" onClick={nextProject}>
                    <img src={flecheDroite} alt="Projet suivant" />
                </button>

                <button
                    className="icon-btn btn-like"
                    onClick={() => swipe("right")}
                >
                    <img src={iconeCoeur} alt="Cœur" />
                </button>

                <button
                    className="icon-btn btn-dislike"
                    onClick={() => swipe("left")}
                >
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
