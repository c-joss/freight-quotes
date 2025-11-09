import React, { useEffect, useState, useCallback } from 'react';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { apiFetch } from '../api';

const PortSchema = Yup.object({
  name: Yup.string().trim().required('Enter port name'),
  code: Yup.string().trim().required('Enter UN/LOCODE'),
});

const ContainerTypeSchema = Yup.object({
  code: Yup.string().trim().required('Enter container code (e.g., 20GP, 40REHC)'),
  description: Yup.string().trim().max(120),
});

const PortPairSchema = Yup.object({
  origin_port_id: Yup.number().required('Choose origin'),
  destination_port_id: Yup.number().required('Choose destination'),
});

const RateSchema = Yup.object({
  port_pair_id: Yup.number().required('Choose port pair'),
  container_type_id: Yup.number().required('Choose container type'),
  transit_days: Yup.number().integer().min(1, 'Min 1 day').required('Transit days required'),
  base_rate: Yup.number().min(1, 'Min 1').required('Enter base rate'),
});

const UserSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Password required'),
  confirm: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
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
          initialValues={{ code: '', description: '' }}
          validationSchema={ContainerTypeSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            setFlash('');
            try {
              const res = await apiFetch('/container_types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
              });

              if (!res.ok) {
                let msg = `HTTP ${res.status}`;
                try {
                  const err = await res.json();
                  if (err?.error) msg = err.error;
                } catch {}
                setFlash(`Failed to add container type: ${msg}`);
                return;
              }

              const created = await res.json();
              setTypes((prev) => [...prev, created]);
              resetForm();
            } catch (e) {
              setFlash(`Failed to add container type: ${e.message}`);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="form-grid">
              <label htmlFor="code">Type Code</label>
              <Field id="code" name="code" placeholder="e.g., 20OT" />
              <ErrorMessage name="code" component="div" className="error" />

              <label htmlFor="description">Description (optional)</label>
              <Field
                id="description"
                name="description"
                as="textarea"
                placeholder="20 foot open top container"
              />
              <ErrorMessage name="description" component="div" className="error" />

              <button type="submit" className="btn" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Add Type'}
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
          initialValues={{
            port_pair_id: '',
            container_type_id: '',
            transit_days: '',
            base_rate: '',
          }}
          validationSchema={RateSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            setFlash('');
            try {
              const body = {
                port_pair_id: Number(values.port_pair_id),
                container_type_id: Number(values.container_type_id),
                transit_days: Number(values.transit_days),
                base_rate: Number(values.base_rate),
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
                    {t.code}
                    {t.description ? ` — ${t.description}` : ''}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="container_type_id" component="div" className="error" />

              <label>Transit Days</label>
              <Field name="transit_days" type="number" min="1" />
              <ErrorMessage name="transit_days" component="div" className="error" />

              <label>Base Rate</label>
              <Field name="base_rate" type="number" min="1" />
              <ErrorMessage name="base_rate" component="div" className="error" />

              <button type="submit" className="btn" disabled={isSubmitting}>
                Add Rate
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Add User</h3>
        <Formik
          initialValues={{ email: '', password: '', confirm: '' }}
          validationSchema={UserSchema}
          onSubmit={async (values, { resetForm, setSubmitting }) => {
            setFlash('');
            try {
              await postJSON('/admin/users', {
                email: values.email,
                password: values.password,
              });
              resetForm();
              setFlash('User created successfully');
            } catch (e) {
              setFlash(`Failed to add user: ${e.message}`);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="form-grid">
              <label>Email</label>
              <Field name="email" type="email" />
              <ErrorMessage name="email" component="div" className="error" />

              <label>Password</label>
              <Field name="password" type="password" />
              <ErrorMessage name="password" component="div" className="error" />

              <label>Confirm Password</label>
              <Field name="confirm" type="password" />
              <ErrorMessage name="confirm" component="div" className="error" />

              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                Add User
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
