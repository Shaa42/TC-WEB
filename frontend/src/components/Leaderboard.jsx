import React, { useState, useEffect } from "react";
import "../styles/Leaderboard.css";
import "../styles/SubmitProject.css";

const Leaderboard = ({ onBack, onNavigate }) => {
    const [topProjects, setTopProjects] = useState([]);
    const [flopProjects, setFlopProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    useEffect(() => {
        setIsLoading(true);
        // Récupération des vrais projets depuis ton serveur Go
        fetch("http://localhost:8080/api/projects")
            .then((res) => res.json())
            .then((data) => {
                const projects = Array.isArray(data) ? data : [];

                // 1. TOP 5 : On trie par le champ "like" (au singulier comme ton JSON)
                const sortedTop = [...projects]
                    .sort((a, b) => (b.like || 0) - (a.like || 0))
                    .slice(0, 5);

                // 2. FLOP 5 : On trie par le champ "dislike"
                const sortedFlop = [...projects]
                    .sort((a, b) => (b.dislike || 0) - (a.dislike || 0))
                    .slice(0, 5);

                setTopProjects(sortedTop);
                setFlopProjects(sortedFlop);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Erreur chargement leaderboard:", err);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <div className="page-container"><p className="state-message">Calcul des rangs...</p></div>;
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
                    <a href="#projets" onClick={(e) => { e.preventDefault(); onBack(); }}>Projets</a>
                    <a href="#Deposer" onClick={(e) => { e.preventDefault(); onNavigate("submit"); }}>Déposer</a>
                    <hr />
                </nav>
            </div>

            {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}

            <h1 className="main-title">Project<span>Rank</span></h1>

            <div className="split-ranking">
                {/* COLONNE TOP (LIKES) */}
                <div className="ranking-column">
                    <h2 className="column-header-title top-title">Top <span>5</span> Projets</h2>
                    <div className="cards-stack">
                        {topProjects.map((project, index) => (
                            <div key={project._id} className={`rank-card pos-${index + 1}`}>
                                <div className="rank-badge">#{index + 1}</div>
                                <div className="card-content">
                                    <span className="category-badge">{project.label || "Projet"}</span>
                                    <h3>{project.title}</h3>
                                    <div className="stat-bar">
                                        {/* On calcule le % par rapport au premier pour la jauge */}
                                        <div
                                            className="stat-fill likes"
                                            style={{ width: `${topProjects[0].like > 0 ? (project.like / topProjects[0].like) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <p className="stat-text">{(project.like || 0).toLocaleString()} Likes</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLONNE FLOP (DISLIKES) */}
                <div className="ranking-column">
                    <h2 className="column-header-title flop-title">Top <span>5</span> Flops</h2>
                    <div className="cards-stack">
                        {flopProjects.map((project, index) => (
                            <div key={project._id} className={`rank-card pos-${index + 1}`}>
                                <div className="rank-badge">#{index + 1}</div>
                                <div className="card-content">
                                    <span className="category-badge">{project.label || "Projet"}</span>
                                    <h3>{project.title}</h3>
                                    <div className="stat-bar">
                                        <div
                                            className="stat-fill dislikes"
                                            style={{ width: `${flopProjects[0].dislike > 0 ? (project.dislike / flopProjects[0].dislike) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <p className="stat-text">{(project.dislike || 0).toLocaleString()} Dislikes</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;