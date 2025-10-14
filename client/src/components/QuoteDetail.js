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
      {isOwner && (
        <>
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
            <Form style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
              <label>Title</label>
              <Field name="title" />

              <label>Status</label>
              <Field as="select" name="status">
                <option value="draft">draft</option>
                <option value="published">published</option>
              </Field>

              <button type="submit">Save</button>
            </Form>
          </Formik>

          <button style={{ marginTop: 12 }} onClick={handleDelete}>
            Delete
          </button>
        </>
      )}
    </div>
  );
}
