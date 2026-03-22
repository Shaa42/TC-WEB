import React, { useState } from 'react';
import { api, setToken } from '../api/client';

const initialForm = {
  name: '',
  email: '',
  password: '',
  department: '',
};

function AuthPanel({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        email: form.email,
        password: form.password,
      };

      let data;
      if (mode === 'register') {
        data = await api.register({
          ...payload,
          name: form.name,
          department: form.department,
        });
      } else {
        data = await api.login(payload);
      }

      setToken(data.token);
      onAuthSuccess();
      setMessage('Connexion reussie.');
      setForm(initialForm);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={panelStyle}>
      <div style={modeRowStyle}>
        <button
          type="button"
          style={mode === 'login' ? activeTabStyle : tabStyle}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          style={mode === 'register' ? activeTabStyle : tabStyle}
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>

      <form onSubmit={submit} style={formStyle}>
        {mode === 'register' && (
          <>
            <input
              style={inputStyle}
              placeholder="Nom"
              value={form.name}
              onChange={updateField('name')}
              required
            />
            <input
              style={inputStyle}
              placeholder="Departement"
              value={form.department}
              onChange={updateField('department')}
            />
          </>
        )}

        <input
          style={inputStyle}
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={updateField('email')}
          required
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={updateField('password')}
          required
        />

        <button style={submitStyle} type="submit" disabled={loading}>
          {loading ? 'Loading...' : mode === 'login' ? 'Se connecter' : 'Creer le compte'}
        </button>
      </form>

      {message && <p style={messageStyle}>{message}</p>}
    </div>
  );
}

const panelStyle = {
  position: 'fixed',
  top: '16px',
  left: '16px',
  width: '290px',
  background: 'rgba(255,255,255,0.95)',
  borderRadius: '14px',
  padding: '12px',
  zIndex: 1100,
  boxShadow: '0 10px 24px rgba(0,0,0,0.15)',
};

const modeRowStyle = {
  display: 'flex',
  gap: '8px',
  marginBottom: '10px',
};

const tabStyle = {
  flex: 1,
  border: '1px solid #ddd',
  background: '#fff',
  borderRadius: '8px',
  padding: '6px',
  cursor: 'pointer',
};

const activeTabStyle = {
  ...tabStyle,
  border: '1px solid #fd297b',
  color: '#fd297b',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const inputStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '8px 10px',
};

const submitStyle = {
  border: 'none',
  borderRadius: '8px',
  padding: '9px',
  cursor: 'pointer',
  color: '#fff',
  background: 'linear-gradient(135deg, #fd297b 0%, #ff5864 100%)',
};

const messageStyle = {
  margin: '8px 0 0',
  fontSize: '0.9rem',
};

export default AuthPanel;
