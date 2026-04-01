// src/App.jsx
import React, { useState } from 'react';
import MaPage from './components/MaPage';
import SubmitProject from './components/SubmitProject';
import Leaderboard from './components/Leaderboard';
import FilterProjects from './components/FilterProjects';

function App() {
  const [currentPage, setCurrentPage] = useState('tinder');
  const [selectedLabels, setSelectedLabels] = useState([]);

  const [projects, setProjects] = useState([]);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  // Fonction centrale pour changer de page
  const navigate = (page) => setCurrentPage(page);

  const handleApplyFilters = (labels) => {
    setSelectedLabels(labels);
    setCurrentProjectIndex(0);
    setCurrentPage('tinder');
  };

  const clearFilters = () => {
    setSelectedLabels([]);
    setCurrentProjectIndex(0);
  };

  return (
    <div className="app-wrapper">
      {currentPage === 'tinder' && (
        <MaPage
          onNavigate={navigate}
          selectedLabels={selectedLabels}
          onClearFilters={clearFilters}
          projects={projects}
          setProjects={setProjects}
          currentProjectIndex={currentProjectIndex}
          setCurrentProjectIndex={setCurrentProjectIndex}
        />
      )}
      
      {currentPage === 'submit' && (
        <SubmitProject onBack={() => navigate('tinder')} onNavigate={navigate} />
      )}

      {currentPage === 'leaderboard' && (
        <Leaderboard
          onBack={() => navigate('tinder')}
          onNavigate={() => navigate('submit')}
        />
      )}

      {currentPage === 'filter' && (
        <FilterProjects
          onBack={() => navigate('tinder')}
          onApplyFilters={handleApplyFilters}
          selectedLabels={selectedLabels}
        />
      )}
    </div>
  );
}

export default App;