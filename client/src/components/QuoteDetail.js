import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';

export default function QuoteDetail({ user }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    fetch(`/quotes/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then(setQuote);
  }, [id]);

  if (!quote) return <p>Loading…</p>;

  const isOwner = user && user.id === quote.user_id;
  return (
    <div>
      <h2>Quote #{id}</h2>
      {!isOwner && <p>(Read-only)</p>}
      <p>
        <strong>Title:</strong> {quote.title}
      </p>
      <p>
        <strong>Status:</strong> {quote.status}
      </p>

      <h3>Selected Rates</h3>
      <ul>
        {quote.rates.map((r) => (
          <li key={r.id}>
            ${r.base_rate} — {r.transit_days} days
          </li>
        ))}
      </ul>
    </div>
  );
}
