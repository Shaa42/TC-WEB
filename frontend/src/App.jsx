// src/App.jsx
import React, { useState } from 'react';
import MaPage from './components/MaPage';
import SubmitProject from './components/SubmitProject';
import Leaderboard from './components/Leaderboard'; // La nouvelle page

function App() {
  const [currentPage, setCurrentPage] = useState('tinder');

  // Fonction centrale pour changer de page
  const navigate = (page) => setCurrentPage(page);

  return (
    <div className="app-wrapper">
      {currentPage === 'tinder' && (
        <MaPage onNavigate={navigate} />
      )}
      
      {currentPage === 'submit' && (
        <SubmitProject onBack={() => navigate('tinder')} onNavigate={navigate} />
      )}

      {currentPage === 'leaderboard' && (
  <Leaderboard 
    onBack={() => navigate('tinder')} 
    onNavigate={() => navigate('submit')} // <-- On précise 'submit' ici
  />
)}
    </div>
  );
}

export default App;