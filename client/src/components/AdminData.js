import React, { useEffect, useState, useCallback } from 'react';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { apiFetch } from '../api';

const PortSchema = Yup.object({
  name: Yup.string().trim().required('Enter port name'),
  code: Yup.string().trim().required('Enter UN/LOCODE'),
});

const ContainerTypeSchema = Yup.object({
  name: Yup.string().trim().required('Enter container type name (e.g., 20GP, 40REHC)'),
  description: Yup.string().trim().max(120),
});

const PortPairSchema = Yup.object({
  origin_port_id: Yup.number().required('Choose origin'),
  destination_port_id: Yup.number().required('Choose destination'),
});

const RateSchema = Yup.object({
  port_pair_id: Yup.number().required('Choose port pair'),
  container_type_id: Yup.number().required('Choose container type'),
  transit_time: Yup.number().integer().min(1, 'Min 1 day').required('Transit time required'),
  amount: Yup.number().min(1, 'Min 1').required('Enter rate amount'),
});

export default function AdminData({ user }) {
  const [ports, setPorts] = useState([]);
  const [portPairs, setPortPairs] = useState([]);
  const [types, setTypes] = useState([]);
  const [flash, setFlash] = useState('');

  const loadLookups = useCallback(async () => {
    try {
      const [pr, ppr, tr] = await Promise.all([
        apiFetch('/ports'),
        apiFetch('/port_pairs'),
        apiFetch('/container_types'),
      ]);
      const [portsData, pairsData, typesData] = await Promise.all([
        pr.ok ? pr.json() : [],
        ppr.ok ? ppr.json() : [],
        tr.ok ? tr.json() : [],
      ]);
      setPorts(Array.isArray(portsData) ? portsData : []);
      setPortPairs(Array.isArray(pairsData) ? pairsData : []);
      setTypes(Array.isArray(typesData) ? typesData : []);
    } catch {
      setFlash('Failed to load lookup data');
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadLookups();
  }, [user, loadLookups]);

  if (!user) {
    return (
      <div className="page page-center">
        <h2 className="page-title">Admin</h2>
        <p>Please log in to access admin tools.</p>
      </div>
    );
  }

  async function postJSON(url, body) {
    const r = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      let msg = '';
      try {
        msg = (await r.json())?.error || (await r.text());
      } catch {}
      throw new Error(msg || `HTTP ${r.status}`);
    }
    return r.json();
  }

  return (
    <div className="page">
      <h1 className="page-title">Admin Dashboard</h1>
      {flash && (
        <p className="error" style={{ textAlign: 'center' }}>
          {flash}
        </p>
      )}

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Add Port</h3>
        <Formik
          initialValues={{ name: '', code: '' }}
          validationSchema={PortSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            setFlash('');
            try {
              await postJSON('/ports', values);
              resetForm();
              await loadLookups();
            } catch (e) {
              setFlash(`Failed to add port: ${e.message}`);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="form-grid">
              <label>Port Name</label>
              <Field name="name" />
              <ErrorMessage name="name" component="div" className="error" />

              <label>Port Code</label>
              <Field name="code" />
              <ErrorMessage name="code" component="div" className="error" />

              <button type="submit" className="btn" disabled={isSubmitting}>
                Add Port
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Add Container Type</h3>
        <Formik
          initialValues={{ name: '', description: '' }}
          validationSchema={ContainerTypeSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            setFlash('');
            try {
              await postJSON('/container_types', {
                name: values.name,
                description: values.description,
              });
              resetForm();
              await loadLookups();
            } catch (e) {
              setFlash(`Failed to add container type: ${e.message}`);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="form-grid">
              <label>Type Name</label>
              <Field name="name" placeholder="e.g., 20GP, 40REHC" />
              <ErrorMessage name="name" component="div" className="error" />

              <label>Description (optional)</label>
              <Field name="description" placeholder="Short description" />
              <ErrorMessage name="description" component="div" className="error" />

              <button type="submit" className="btn" disabled={isSubmitting}>
                Add Type
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Add Port Pair</h3>
        <Formik
          initialValues={{ origin_port_id: '', destination_port_id: '' }}
          validationSchema={PortPairSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            setFlash('');
            try {
              await postJSON('/port_pairs', {
                origin_port_id: Number(values.origin_port_id),
                destination_port_id: Number(values.destination_port_id),
              });
              resetForm();
              await loadLookups();
            } catch (e) {
              setFlash(`Failed to add port pair: ${e.message}`);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="form-grid">
              <label>Origin Port</label>
              <Field as="select" name="origin_port_id">
                <option value="">Select…</option>
                {ports.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </Field>
              <ErrorMessage name="origin_port_id" component="div" className="error" />

              <label>Destination Port</label>
              <Field as="select" name="destination_port_id">
                <option value="">Select…</option>
                {ports.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </Field>
              <ErrorMessage name="destination_port_id" component="div" className="error" />

              <button type="submit" className="btn" disabled={isSubmitting}>
                Add Port Pair
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <div className="card">
        <h3>Add Rate</h3>
        <Formik
          initialValues={{ port_pair_id: '', container_type_id: '', transit_time: '', amount: '' }}
          validationSchema={RateSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            setFlash('');
            try {
              const body = {
                port_pair_id: Number(values.port_pair_id),
                container_type_id: Number(values.container_type_id),
                transit_time: Number(values.transit_time),
                amount: Number(values.amount),
              };
              await postJSON('/rates', body);
              resetForm();
              await loadLookups();
            } catch (e) {
              setFlash(`Failed to add rate: ${e.message}`);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="form-grid">
              <label>Port Pair</label>
              <Field as="select" name="port_pair_id">
                <option value="">Select…</option>
                {portPairs.map((pp) => (
                  <option key={pp.id} value={pp.id}>
                    {pp.origin_port?.name} → {pp.destination_port?.name}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="port_pair_id" component="div" className="error" />

              <label>Container Type</label>
              <Field as="select" name="container_type_id">
                <option value="">Select…</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="container_type_id" component="div" className="error" />

              <label>Transit Time (days)</label>
              <Field name="transit_time" type="number" min="1" />
              <ErrorMessage name="transit_time" component="div" className="error" />

              <label>Rate Amount</label>
              <Field name="amount" type="number" min="1" />
              <ErrorMessage name="amount" component="div" className="error" />

              <button type="submit" className="btn" disabled={isSubmitting}>
                Add Rate
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
