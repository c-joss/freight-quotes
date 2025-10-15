import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';

export default function QuoteDetail({ user }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [quote, setQuote] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(`/quotes/${id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.resolve({ error: r.status })))
      .then((data) => {
        if (data?.error) setStatus('failed to load quote');
        setQuote(data || null);
      })
      .catch(() => {
        setStatus('network error');
        setQuote(null);
      });
  }, [id]);

  if (!quote) return <p>{status || 'Loading…'}</p>;

  const isOwner = user && user.id === quote.user_id;
  const rates = Array.isArray(quote.rates) ? quote.rates : [];

  async function handleDelete() {
    if (!isOwner) return;
    await fetch(`/quotes/${id}`, { method: 'DELETE', credentials: 'include' });
    nav('/quotes');
  }

  return (
    <div>
      <h2>Quote #{id}</h2>
      {!isOwner && <p>(Read-only)</p>}
      <p>
        <strong>Title:</strong> {quote.title}
      </p>
      <p>
        <strong>Status:</strong>{' '}
        <span
          className={`pill ${quote.status === 'Confirmed' ? 'pill-confirmed' : 'pill-accepted'}`}
        >
          {quote.status}
        </span>
      </p>

      <h3>Rate</h3>
      {rates.length === 0 ? (
        <p>No rates linked.</p>
      ) : (
        <ul>
          {rates.map((r) => (
            <li key={r.id}>
              ${r.base_rate} — {r.transit_days} days
            </li>
          ))}
        </ul>
      )}
      {isOwner && (
        <>
          <div className="form-container">
            <h3>Edit</h3>
            <Formik
              initialValues={{ title: quote.title, status: quote.status }}
              enableReinitialize
              onSubmit={async (values) => {
                const res = await fetch(`/quotes/${id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify(values),
                });
                const data = await res.json();
                setQuote(data);
              }}
            >
              <Form>
                <label>Title</label>
                <Field name="title" />

                <label>Status</label>
                <Field as="select" name="status">
                  <option value="Confirmed">Confirmed</option>
                  <option value="Accepted">Accepted</option>
                </Field>

                <button className="btn btn-primary" type="submit">
                  Save
                </button>
              </Form>
            </Formik>

            <button className="btn btn-danger" style={{ marginTop: 12 }} onClick={handleDelete}>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
