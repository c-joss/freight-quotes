import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function QuotesList({ user }) {
  const [quotes, setQuotes] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('/quotes', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.resolve({ error: r.status })))
      .then((data) => {
        console.log('quotes response:', data);
        const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setQuotes(arr);
        if (!Array.isArray(data)) setStatus(data?.error ? 'failed to load quotes' : '');
      })
      .catch(() => {
        setQuotes([]);
        setStatus('network error');
      });
  }, []);

  if (status && quotes.length === 0) return <p style={{ color: 'red' }}>{status}</p>;

  return (
    <div>
      <h2>Quotes</h2>
      {!user && <p>(Log in to create, edit, or delete)</p>}
      {quotes.length === 0 ? (
        <p>No quotes yet.</p>
      ) : (
        <ul>
          {quotes.map((q) => (
            <li key={q.id}>
              <Link to={`/quotes/${q.id}`}>{q.title}</Link> — {q.status}
              {user && user.id === q.user_id && <span> (you)</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
