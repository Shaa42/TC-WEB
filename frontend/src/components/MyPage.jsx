import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

function MyPage({ onBack }) {
  const [myProjects, setMyProjects] = useState([]);
  const [myLikes, setMyLikes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [projectsRes, likesRes] = await Promise.all([
          api.myProjects(),
          api.myLikes(),
        ]);

        if (!isMounted) {
          return;
        }

        setMyProjects(projectsRes.items || []);
        setMyLikes(likesRes.items || []);
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: '120px', overflowY: 'auto' }}>
      <button className="menu-burger" onClick={onBack} style={{ color: '#fff' }}>
        Retour
      </button>

      <h1 className="main-title" style={{ fontSize: '4rem', marginBottom: '20px' }}>
        Mon<span>Profil</span>
      </h1>

      {loading && <p style={textStyle}>Chargement...</p>}
      {error && <p style={textStyle}>Erreur: {error}</p>}

      {!loading && !error && (
        <div style={gridStyle}>
          <section style={cardStyle}>
            <h2>Mes Projets</h2>
            {myProjects.length === 0 ? (
              <p>Aucun projet publie.</p>
            ) : (
              myProjects.map((project) => (
                <article key={project.id} style={itemStyle}>
                  <h3>{project.title}</h3>
                  <p>{project.short_desc}</p>
                  <small>{project.department || 'Sans departement'}</small>
                </article>
              ))
            )}
          </section>

          <section style={cardStyle}>
            <h2>Projets Likes</h2>
            {myLikes.length === 0 ? (
              <p>Aucun like pour le moment.</p>
            ) : (
              myLikes.map((project) => (
                <article key={project.id} style={itemStyle}>
                  <h3>{project.title}</h3>
                  <p>{project.short_desc}</p>
                  <small>{project.like_count || 0} likes</small>
                </article>
              ))
            )}
          </section>
        </div>
      )}
    </div>
  );
}

const textStyle = {
  color: '#fff',
  background: 'rgba(0,0,0,0.2)',
  padding: '10px 14px',
  borderRadius: '10px',
};

const gridStyle = {
  width: '90%',
  maxWidth: '1100px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '20px',
  marginBottom: '40px',
};

const cardStyle = {
  background: '#fff',
  borderRadius: '20px',
  padding: '18px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
  textAlign: 'left',
};

const itemStyle = {
  border: '1px solid #eee',
  borderRadius: '12px',
  padding: '10px 12px',
  marginBottom: '10px',
};

export default MyPage;
