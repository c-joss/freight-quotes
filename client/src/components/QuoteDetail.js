import { apiFetch } from '../api';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const EditSchema = Yup.object({
  title: Yup.string().trim().required('Title required'),
  status: Yup.mixed().oneOf(['Confirmed', 'Accepted'], 'Invalid status'),
});

export default function QuoteDetail({ user }) {
  const { id } = useParams();
  const nav = useNavigate();
  const [quote, setQuote] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    apiFetch(`/quotes/${id}`)
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
  const formattedRates = rates
    .map((rate) => `$${rate.base_rate} — ${rate.transit_days} days`)
    .join(' • ');

  async function handleDelete() {
    if (!isOwner) return;
    await apiFetch(`/quotes/${id}`, { method: 'DELETE' });
    nav('/quotes');
  }

  console.log('Quote status:', quote.status);

  return (
    <div className="page page-center">
      <div className="form-container">
        <h2 className="page-title">Quote #{id}</h2>
        {!isOwner && <p>(Read-only)</p>}
        <p>
          <strong>Company Name:</strong> {quote.title}
        </p>
        <p>
          <strong>Status:</strong>{' '}
          <span
            className={`pill ${quote.status === 'Confirmed' ? 'pill-confirmed' : 'pill-accepted'}`}
          >
            {quote.status}
          </span>
        </p>

        <p>
          <strong>Rate:</strong> {rates.length === 0 ? 'None' : formattedRates}
        </p>
        {isOwner && (
          <>
            <div className="form-container">
              <h3>Edit</h3>
              <Formik
                initialValues={{ title: quote.title, status: quote.status }}
                enableReinitialize
                validationSchema={EditSchema}
                onSubmit={async (values) => {
                  const res = await apiFetch(`/quotes/${id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(values),
                  });
                  const data = await res.json();
                  setQuote(data);
                }}
              >
                <Form>
                  <label>Title</label>
                  <Field name="title" />
                  <ErrorMessage name="title" component="div" className="error" />

                  <label>Status</label>
                  <Field as="select" name="status">
                    <option value="Confirmed">Confirmed</option>
                    <option value="Accepted">Accepted</option>
                  </Field>
                  <ErrorMessage name="status" component="div" className="error" />

                  <button className="btn btn-primary" type="submit">
                    Save
                  </button>
                </Form>
              </Formik>

              <button
                className="btn btn-danger btn-center btn-lg"
                style={{ marginTop: 12 }}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
