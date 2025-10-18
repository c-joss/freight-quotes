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

  function mailtoHref(q) {
    const subject = `Booking request for Quote #${q.id}`;
    const body = `Hello,\n\nPlease create a booking for Quote #${q.id} (${q.title}).\n\nThank you.`;
    return `mailto:booking@freight-quotes.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="page page-center">
      <h2 className="page-title">Quotes</h2>
      {!user && <p className="error">(Log in to create, edit, or delete)</p>}
      {quotes.length === 0 ? (
        <p>No quotes yet.</p>
      ) : (
        <ul className="quote-list">
          {quotes.map((q) => {
            const isOwner = user && user.id === q.user_id;
            const isAccepted = (q.status || '').trim().toLowerCase() === 'accepted';

            return (
              <li key={q.id} className="quote-item card">
                <span className="quote-title">{q.title}</span>
                <span className="sep"> — </span>
                <strong>{q.status}</strong>

                {isAccepted && (
                  <>
                    <span className="sep"> </span>
                    <a href={mailtoHref(q)} className="btn btn-secondary btn-xs">
                      Request Booking
                    </a>
                  </>
                )}

                <span className="right-actions">
                  {isOwner && (
                    <>
                      <span className="sep"> </span>
                      <Link to={`/quotes/${q.id}`}>edit</Link>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
