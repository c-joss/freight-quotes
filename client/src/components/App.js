import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "../pages/Login";
import QuotesList from "../pages/QuotesList";
import NewQuote from "../pages/NewQuote";
import QuoteDetail from "../pages/QuoteDetail";

function App() {
  const [user, setUser] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    fetch("/auth/me", { credentials: "include" })
    .then((r) => r.json())
    .then((data) => {
      if (!data.error) setUser(data);
    });
  }, []);

  function handleLogout() {
    fetch("/auth/logout", { method: "DELETE", credentials: "include" })
    .then(() => {
      setUser(null);
      nav("/login");
    });
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/quotes">Quotes</Link>
        <Link to="/quotes/new">New Quote</Link>
        {!user ? <Link to="/login">Login</Link> :
          <button onClick={handleLogout}>Logout</button>}
      </nav>

      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/quotes" element={<QuotesList user={user} />} />
        <Route path="/quotes/new" element={<NewQuote user={user} />} />
        <Route path="/quotes/:id" element={<QuoteDetail user={user} />} />
      </Routes>
    </div>
  );
}

export default App;
