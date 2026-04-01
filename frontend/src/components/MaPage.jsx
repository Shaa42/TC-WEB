import React, { useState, useEffect, useRef } from "react";
import "../styles/MaPage.css";
import "../styles/modal-styles.css";
import LikeAudio from "../assets/likeaudio.mp3";
import { api } from "../api/client";

// Import des assets
import iconeCoeur from "../assets/coeur.svg";
import flecheGauche from "../assets/fleche_gauche.svg";
import flecheDroite from "../assets/fleche_droite.svg";
import info from "../assets/info.svg";
import croix from "../assets/croix.svg";
import TinderCard from "react-tinder-card";

const MaPage = ({
    onNavigate,
    selectedLabels = [],
    onClearFilters = () => {},
    projects,
    setProjects,
    currentProjectIndex,
    setCurrentProjectIndex,
		hasMoreProjects,
		setHasMoreProjects,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const childRefs = useRef([]);
    const prevSelectedLabelsRef = useRef([]);

    const getProjectId = (project) => {
        if (!project || !project._id) return null;
        if (typeof project._id === "string") return project._id;
        if (project._id.$oid) return project._id.$oid;
        return project._id.toString();
    };

    const prevProject = () => {
        setCurrentProjectIndex((prev) => Math.max(0, prev - 1));
        setHasMoreProjects(true);
    };
    const hasActiveFilters =
        Array.isArray(selectedLabels) && selectedLabels.length > 0;
    const currentProject = projects[currentProjectIndex] || {};
    const visibleProjects = [0, 1, 2]
        .map((i) => projects[currentProjectIndex + i])
        .filter(Boolean)
        .reverse();
    const currentImage =
        currentProject.img &&
        currentProject.img !== "http://localhost:8080/uploads/"
            ? currentProject.img
            : null;

    const playLikeSound = () => {
        const audio = new Audio(LikeAudio);
        audio
            .play()
            .then(() => console.log("Audio success"))
            .catch((err) => console.error("Audio failed : ", err));
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleModal = () => setIsModalOpen(!isModalOpen);
    const handleClearFilters = () => {
        if (typeof onClearFilters === "function") {
            onClearFilters();
        }
    };

    useEffect(() => {
        let isMounted = true;
				const oldProjectCount = projects.length;
				const oldHasMore = hasMoreProjects;

        setIsLoading(true);
        setError(null);

        const url = new URL("http://localhost:8080/api/projects");
        selectedLabels.forEach((label) => {
            const trimmed = (label || "").trim();
            if (trimmed !== "") {
                url.searchParams.append("labels", trimmed);
            }
        });

        fetch(url.toString())
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Erreur serveur: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (!isMounted) {
                    return;
                }
                const loadedProjects = Array.isArray(data) ? data : [];
                setProjects(loadedProjects);

                // Compare les labels pour déterminer si on doit réinitialiser l'index
                const previousLabels = prevSelectedLabelsRef.current || [];
                const currentLabels = Array.isArray(selectedLabels) ? selectedLabels : [];
                const labelsChanged =
                    previousLabels.length !== currentLabels.length ||
                    previousLabels.some((label, idx) => label !== currentLabels[idx]);

                if (labelsChanged) {
                    setCurrentProjectIndex(0);
                } else {
                    setCurrentProjectIndex((prev) =>
                        Math.min(prev, Math.max(0, loadedProjects.length - 1)),
                    );
                }

                prevSelectedLabelsRef.current = currentLabels;
								setProjects(loadedProjects);

                const isAllSwiped = !oldHasMore && oldProjectCount > 0;
                if (labelsChanged) {
                    setHasMoreProjects(loadedProjects.length > 0);
                } else if (isAllSwiped && loadedProjects.length <= oldProjectCount) {
                    // Maintenir l'état 'terminé' si on était au bout et les projets n'ont pas augmenté
                    setHasMoreProjects(false);
                } else {
                    setHasMoreProjects(loadedProjects.length > 0);
                }


                childRefs.current = [];
                setIsLoading(false);
            })
            .catch((err) => {
                if (!isMounted) {
                    return;
                }
                setError(err.message || "Impossible de charger les projets");
                setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [selectedLabels]);

    const nextProject = () => {
        setCurrentProjectIndex((prev) => {
            if (prev >= projects.length - 1) {
                setHasMoreProjects(false);
                return prev;
            }
            return prev + 1;
        });
    };

    const previousProject = () => {
        setCurrentProjectIndex((prev) => {
            if (prev <= 0) {
                return prev;
            }
            return prev - 1;
        });
    };

    const likeProject = (projectId) => {
        fetch(`http://localhost:8080/api/projects/${projectId}/like`, {
            method: "POST",
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Erreur serveur: ${res.status}`);
                }
                return res.json();
            })
            .then(() => {
                console.log("Projet liké avec succès");
            })
            .catch((err) => {
                console.error("Erreur lors du like du projet:", err);
            });
    };

    const dislikeProject = (projectId) => {
        fetch(`http://localhost:8080/api/projects/${projectId}/dislike`, {
            method: "POST",
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Erreur serveur: ${res.status}`);
                }
                return res.json();
            })
            .then(() => {
                console.log("Projet disliké avec succès");
            })
            .catch((err) => {
                console.error("Erreur lors du dislike du projet:", err);
            });
    };

    const swipe = async (dir) => {
        const topIndex = visibleProjects.length - 1;
        if (topIndex < 0) {
            return;
        }
        if (childRefs.current[topIndex]) {
            await childRefs.current[topIndex].swipe(dir);
        }
    };

    const handleSwipeApi = async (dir, project) => {
        const projectId = getProjectId(project);
        if (!projectId) {
            return;
        }

        try {
            if (dir === "right") {
                await api.likeProject(projectId);
            } else if (dir === "left") {
                await api.dislikeProject(projectId);
            }
        } catch (err) {
            console.error("Failed like/dislike:", err);
        }
    };

    const handleCardSwipe = async (dir, project) => {
        if (dir === "right") {
            playLikeSound();
        }
        await handleSwipeApi(dir, project);
    };

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
                        <a
                            href="#Filtrage"
                            onClick={(e) => {
                                e.preventDefault();
                                onNavigate("filter");
                            }}
                        >
                            Filtrage
                        </a>
                        <a href="#Projetfav">Mes Projets Favoris</a>
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
                        {hasActiveFilters
                            ? "Aucun projet ne correspond à ces filtres."
                            : "Aucun projet disponible pour le moment."}
                    </p>
                    {hasActiveFilters ? (
                        <button
                            className="retry-btn"
                            onClick={handleClearFilters}
                        >
                            Effacer les filtres
                        </button>
                    ) : (
                        <button
                            className="submit-project-btn"
                            onClick={() => onNavigate("submit")}
                        >
                            Déposer un projet
                        </button>
                    )}
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
                        <a
                            href="#Filtrage"
                            onClick={(e) => {
                                e.preventDefault();
                                onNavigate("filter");
                            }}
                        >
                            Filtrage
                        </a>
                        <a href="#Projetfav">Mes Projets Favoris</a>
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
                        {hasActiveFilters
                            ? "Aucun projet ne correspond à ces filtres."
                            : "Aucun projet disponible."}
                    </p>
                    {hasActiveFilters ? (
                        <button
                            className="retry-btn"
                            onClick={handleClearFilters}
                        >
                            Effacer les filtres
                        </button>
                    ) : (
                        <button
                            className="submit-project-btn"
                            onClick={() => onNavigate("submit")}
                        >
                            Déposer un projet
                        </button>
                    )}
                </div>
            </div>
        );
    }

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
                    <a
                        href="#Filtrage"
                        onClick={(e) => {
                            e.preventDefault();
                            onNavigate("filter");
                        }}
                    >
                        Filtrage
                    </a>
                    <hr />

                    <a href="#Projetfav">Mes Projets Favoris</a>
                    <hr />
                </nav>
            </div>

            {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}

            <h1 className="main-title">
                Project<span>Match</span>
            </h1>

            {hasActiveFilters && (
                <div className="active-filters">
                    <div className="filter-pill-group">
                        {selectedLabels.map((label) => (
                            <span key={label} className="filter-pill">
                                {label}
                            </span>
                        ))}
                    </div>
                    <div className="filter-actions">
                        <button
                            className="filter-link"
                            onClick={() => onNavigate("filter")}
                        >
                            Modifier
                        </button>
                        <button
                            className="filter-link"
                            onClick={handleClearFilters}
                        >
                            Effacer
                        </button>
                    </div>
                </div>
            )}

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
                            onSwipe={(dir) => handleCardSwipe(dir, project)}
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
        <h3>À propos du projet</h3>
        {/* Utilisation de la clé long_description de ton API Go */}
        <p className="long-description-text">
            {currentProject.long_description || "Aucun détail supplémentaire pour ce projet."}
        </p>
    </div>
                            <button
                                className="modal-action-btn"
                                onClick={() => {
                                    toggleModal();
                                    nextProject();
                                    likeProject(currentProject._id);
                                }}
                            >
                                Like
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="icon-bar">
                <button className="icon-btn btn-undo" onClick={previousProject}>
                    <img src={flecheGauche} alt="Projet précédent" />
                </button>

                <button className="icon-btn btn-undo" onClick={nextProject}>
                    <img src={flecheDroite} alt="Projet suivant" />
                </button>

                <button
                    className="icon-btn btn-like"
                    onClick={() => {
                        swipe("right");
                        likeProject(currentProject._id);
                    }}
                >
                    <img src={iconeCoeur} alt="Cœur" />
                </button>

                <button
                    className="icon-btn btn-dislike"
                    onClick={() => {
                        swipe("left");
                        dislikeProject(currentProject._id);
                    }}
                >
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
