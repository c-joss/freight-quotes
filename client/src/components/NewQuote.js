import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const schema = Yup.object({
  title: Yup.string().required('required'),
  port_pair_id: Yup.number().required('required'),
  container_type_id: Yup.number().required('required'),
  rate_ids: Yup.array().of(Yup.number()).min(1, 'choose at least one rate'),
});

export default function NewQuote({ user }) {
  const nav = useNavigate();
  const [pairs, setPairs] = useState([]);
  const [types, setTypes] = useState([]);
  const [rates, setRates] = useState([]);

  useEffect(() => {
    fetch('/port_pairs', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.resolve([])))
      .then((data) => {
        console.log('port_pairs:', data);
        setPairs(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        console.error('port_pairs error', e);
        setPairs([]);
      });

    fetch('/container_types', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.resolve([])))
      .then((data) => {
        console.log('container_types:', data);
        setTypes(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        console.error('container_types error', e);
        setTypes([]);
      });
  }, []);

  async function loadRates(ppId, ctId) {
    if (ppId && ctId) {
      try {
        const r = await fetch(`/rates?port_pair_id=${ppId}&container_type_id=${ctId}`, {
          credentials: 'include',
        });
        const data = await r.json();
        console.log('rates:', data);
        setRates(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('rates error', e);
        setRates([]);
      }
    } else {
      setRates([]);
    }
  }

  return (
    <div className="page page-center">
      <h2 className="page-title">New Quote</h2>
      {!user ? (
        <p>Please log in.</p>
      ) : (
        <div className="form-container">
          <Formik
            initialValues={{ title: '', port_pair_id: '', container_type_id: '', rate_ids: [] }}
            validationSchema={schema}
            onSubmit={async ({ title, rate_ids }, actions) => {
              try {
                const res = await fetch('/quotes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ title, rate_ids }),
                });

                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  actions.setStatus(err.error || `create failed (${res.status})`);
                  return;
                }

                const data = await res.json();

                if (!data || typeof data.id !== 'number') {
                  actions.setStatus('unexpected server response');
                  return;
                }

                nav('/quotes');
              } catch (e) {
                actions.setStatus('network error');
              }
            }}
          >
            {({ values, setFieldValue, isSubmitting, status }) => (
              <Form>
                <label>Company Name</label>
                <Field name="title" />
                <ErrorMessage name="title" component="div" className="error" />

                <label>Port Pair</label>
                <Field
                  as="select"
                  name="port_pair_id"
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFieldValue('port_pair_id', val);
                    loadRates(val, values.container_type_id);
                  }}
                >
                  <option value="">Choose…</option>
                  {Array.isArray(pairs) && pairs.length > 0 ? (
                    pairs.map((pp) => (
                      <option key={pp.id} value={pp.id}>
                        {pp.origin_port?.name ||
                          pp.origin_port?.code ||
                          `Origin ${pp.origin_port_id}`}{' '}
                        →
                        {pp.destination_port?.name ||
                          pp.destination_port?.code ||
                          `Dest ${pp.destination_port_id}`}
                      </option>
                    ))
                  ) : (
                    <option disabled value="">
                      No port pairs (seed the DB)
                    </option>
                  )}
                </Field>

                <label>Container</label>
                <Field
                  as="select"
                  name="container_type_id"
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFieldValue('container_type_id', val);
                    loadRates(values.port_pair_id, val);
                  }}
                >
                  <option value="">Choose…</option>
                  {Array.isArray(types) && types.length > 0 ? (
                    types.map((ct) => (
                      <option key={ct.id} value={ct.id}>
                        {ct.code || `Type ${ct.id}`}
                      </option>
                    ))
                  ) : (
                    <option disabled value="">
                      No container types (seed the DB)
                    </option>
                  )}
                </Field>
                <ErrorMessage name="container_type_id" component="div" className="error" />

                <fieldset>
                  <legend>Rate</legend>
                  {rates.length === 0 && <p>Select port pair and container type to see rates.</p>}
                  {rates.map((r) => (
                    <label key={r.id} style={{ display: 'block' }}>
                      <input
                        type="checkbox"
                        checked={values.rate_ids.includes(r.id)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...values.rate_ids, r.id]
                            : values.rate_ids.filter((id) => id !== r.id);
                          setFieldValue('rate_ids', next);
                        }}
                      />
                      ${''}
                      {r.base_rate} — {r.transit_days} days
                    </label>
                  ))}
                  <ErrorMessage name="rate_ids" component="div" className="error" />
                </fieldset>

                {status && <div className="error">{status}</div>}
                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                  Confirm Quote
                </button>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  );
}
