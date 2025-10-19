import { apiFetch } from '../api';
import '../styles.css';
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import QuotesList from './QuotesList';
import NewQuote from './NewQuote';
import QuoteDetail from './QuoteDetail';
import AdminData from './AdminData';

function App() {
  const [user, setUser] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    apiFetch('/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setUser(data);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    try {
      await apiFetch('/auth/logout', { method: 'DELETE' });
    } catch {
    } finally {
      setUser(null);
      nav('/login');
    }
  }

  return (
    <div className="app">
      <nav className="nav">
        <Link to="/quotes">Quotes</Link>
        {user && <Link to="/quotes/new">New Quote</Link>}
        {user && <Link to="/admin">Admin</Link>}
        <span className="spacer" />
        {!user ? (
          <Link to="/login">Login</Link>
        ) : (
          <button className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/quotes" element={<QuotesList user={user} />} />
        <Route path="/quotes/new" element={<NewQuote user={user} />} />
        <Route path="/quotes/:id" element={<QuoteDetail user={user} />} />
        <Route path="/admin" element={<AdminData user={user} />} />
      </Routes>
    </div>
  );
}

export default App;
