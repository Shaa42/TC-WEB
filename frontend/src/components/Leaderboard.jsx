import React, { useState, useEffect } from 'react';
import '../styles/Leaderboard.css';

const Leaderboard = ({ onBack }) => {
  const [topProjects, setTopProjects] = useState([]);
  const [flopProjects, setFlopProjects] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    // Simulation de données plus longue pour en avoir 5 de chaque côté
    const mockData = [
      { id: 1, title: "EcoRide", likes: 1250, dislikes: 10, category: "Innovation" },
      { id: 2, title: "CyberGarden", likes: 980, dislikes: 5, category: "Tech" },
      { id: 3, title: "BadIdea App", likes: 5, dislikes: 2000, category: "Social" },
      { id: 4, title: "Useless Robot", likes: 12, dislikes: 850, category: "IoT" },
      { id: 5, title: "SolarCar", likes: 750, dislikes: 15, category: "Énergie" },
      { id: 6, title: "FastFood VR", likes: 100, dislikes: 600, category: "Food" },
      { id: 7, title: "WaterPill", likes: 300, dislikes: 450, category: "Santé" },
      { id: 8, title: "GreenEnergy", likes: 800, dislikes: 20, category: "Énergie" },
      { id: 9, title: "SmartHome", likes: 600, dislikes: 100, category: "Tech" },
      { id: 10, title: "TrashDrone", likes: 50, dislikes: 1200, category: "Environnement" },
      { id: 11, title: "FitnessBand", likes: 400, dislikes: 300, category: "Santé" },
      { id: 12, title: "AirPurifier", likes: 700, dislikes: 50, category: "Environnement" },
      { id: 13, title: "SleepTracker", likes: 350, dislikes: 250, category: "Santé" },
      { id: 14, title: "FoodWaste App", likes: 200, dislikes: 400, category: "Food" },
      { id: 15, title: "VirtualGirlfriend", likes: 150, dislikes: 50000, category: "Pour Nanhyi" },
    ];

    // On prend les 5 meilleurs et les 5 pires
    setTopProjects([...mockData].sort((a, b) => b.likes - a.likes).slice(0, 5));
    setFlopProjects([...mockData].sort((a, b) => b.dislikes - a.dislikes).slice(0, 5));
  }, []);

  return (
    <div className="page-container leaderboard-page">
      
      <button className="menu-burger" onClick={toggleMenu}>
        <div className="barre"></div><div className="barre"></div><div className="barre"></div>
      </button>

      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleMenu}>×</button>
        <nav className="menu-options">
          <a href="#projets" onClick={(e) => { e.preventDefault(); onBack(); }}>🔥 Retour au Swipe</a>
          <hr />
          <a href="#logout" className="logout">Se déconnecter</a>
        </nav>
      </div>

      {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}

      <h1 className="main-title">Project<span>Rank</span></h1>

      <div className="split-ranking">
        
        {/* TOP COLUMN */}
        <div className="ranking-column">
          <h2 className="column-header-title top-title">🔥 Top Impact</h2>
          <div className="cards-stack">
            {topProjects.map((project, index) => (
              <div key={project.id} className={`rank-card pos-${index + 1}`}>
                <div className="rank-badge">#{index + 1}</div>
                <div className="card-content">
                  <span className="category-badge">{project.category}</span>
                  <h3>{project.title}</h3>
                  <div className="stat-bar"><div className="stat-fill likes" style={{width: `${(project.likes / 1500) * 100}%`}}></div></div>
                  <p className="stat-text">{project.likes.toLocaleString()} Likes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FLOP COLUMN */}
        <div className="ranking-column">
          <h2 className="column-header-title flop-title">💀 Gros Flops</h2>
          <div className="cards-stack">
            {flopProjects.map((project, index) => (
              <div key={project.id} className={`rank-card pos-${index + 1}`}>
                <div className="rank-badge">#{index + 1}</div>
                <div className="card-content">
                  <span className="category-badge">{project.category}</span>
                  <h3>{project.title}</h3>
                  <div className="stat-bar"><div className="stat-fill dislikes" style={{width: `${(project.dislikes / 2500) * 100}%`}}></div></div>
                  <p className="stat-text">{project.dislikes.toLocaleString()} Dislikes</p>
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