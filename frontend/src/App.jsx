// src/App.jsx
import React, { useState } from 'react';
import MaPage from './components/MaPage';
import SubmitProject from './components/SubmitProject';

// src/App.jsx
function App() {
  const [currentPage, setCurrentPage] = useState('tinder');

  return (
    <div>
      {currentPage === 'tinder' ? (
        // Quand on navigue depuis MaPage, on veut aller sur 'submit'
        <MaPage onNavigate={() => setCurrentPage('submit')} />
      ) : (
        // Quand on clique sur Retour depuis SubmitProject, on veut revenir sur 'tinder'
        <SubmitProject onBack={() => setCurrentPage('tinder')} />
      )}
    </div>
  );
}

export default App; 