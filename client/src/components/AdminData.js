import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { apiFetch } from '../api';

const PortSchema = Yup.object({
  name: Yup.string().trim().required('Required'),
  code: Yup.string().trim().length(5, '5-char UN/LOCODE expected').required('Required'),
});

const PortPairSchema = Yup.object().shape({
  origin_port_id: Yup.number().required('Select origin port'),
  destination_port_id: Yup.number().required('Select destination port'),
});

const RateSchema = Yup.object().shape({
  port_pair_id: Yup.number().required('Select a port pair'),
  container_type_id: Yup.number().required('Select container type'),
  transit_time: Yup.number().typeError('Must be a number').required('Enter transit time'),
  amount: Yup.number().typeError('Must be a number').required('Enter rate amount'),
});

const ContainerTypeSchema = Yup.object({
  code: Yup.string().trim().required('Required'),
  description: Yup.string().trim(),
});

export default function AdminData({ user }) {
  const [ports, setPorts] = useState([]);
  const [portPairs, setPortPairs] = useState([]);
  const [containers, setContainers] = useState([]);
  const [status, setStatus] = useState('');

  const loadLookups = useCallback(() => {
    return Promise.all([apiFetch('/ports'), apiFetch('/port_pairs'), apiFetch('/container_types')])
      .then(async ([pr, ppr, cr]) => [
        pr.ok ? await pr.json() : [],
        ppr.ok ? await ppr.json() : [],
        cr.ok ? await cr.json() : [],
      ])
      .then(([portsData, pairsData, typesData]) => {
        setPorts(Array.isArray(portsData) ? portsData : []);
        setPortPairs(Array.isArray(pairsData) ? pairsData : []);
        setContainers(Array.isArray(typesData) ? typesData : []);
      })
      .catch(() => setStatus('❌ Error loading admin data'));
  }, []);

  useEffect(() => {
    if (!user) return;
    loadLookups();
  }, [user, loadLookups]);

  if (!user) {
    return (
      <div className="notice">
        <p>Please log in to access admin tools.</p>
      </div>
    );
  }

  const PortSchema = Yup.object({
    name: Yup.string().required('Enter port name'),
    code: Yup.string().trim().required('Enter port code'),
  });

  if (!user) {
    return (
      <div className="notice">
        <p>Please log in to access admin tools.</p>
      </div>
    );
  }

  const createPort = (values, { resetForm }) => {
    apiFetch('/ports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((newPort) => {
        setPorts((prev) => [...prev, newPort]);
        setStatus('✅ Port added');
        resetForm();
      })
      .catch(() => setStatus('Failed to add port'));
  };

  const createPortPair = (values, { resetForm }) => {
    apiFetch('/port_pairs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((newPP) => {
        setPortPairs((prev) => [...prev, newPP]);
        setStatus('✅ Port pair added');
        resetForm();
      })
      .catch(() => setStatus('Failed to add port pair'));
  };

  const createRate = (values, { resetForm }) => {
    apiFetch('/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => {
        setStatus('✅ Rate added');
        resetForm();
      })
      .catch(() => setStatus('Failed to add rate'));
  };

  useEffect(() => {
    Promise.all([apiFetch('/ports'), apiFetch('/port_pairs'), apiFetch('/container_types')])
      .then(async ([pr, ppr, cr]) => [
        pr.ok ? await pr.json() : [],
        ppr.ok ? await ppr.json() : [],
        cr.ok ? await cr.json() : [],
      ])
      .then(([portsData, portPairsData, containersData]) => {
        setPorts(Array.isArray(portsData) ? portsData : []);
        setPortPairs(Array.isArray(portPairsData) ? portPairsData : []);
        setContainers(Array.isArray(containersData) ? containersData : []);
      })
      .catch(() => setStatus('Error loading admin data'));
  }, []);

  return (
    <div className="page page-center">
      <h2>Admin Dashboard</h2>
      {status && <p style={{ textAlign: 'center' }}>{status}</p>}

      <section className="card" style={{ marginBottom: '2rem' }}>
        <h3>Add Port</h3>
        <Formik
          initialValues={{ name: '', code: '' }}
          validationSchema={PortSchema}
          onSubmit={createPort}
        >
          {({ isSubmitting }) => (
            <Form>
              <label>Port Name</label>
              <Field name="name" className="input" />
              <ErrorMessage name="name" component="div" className="error" />

              <label>Port Code</label>
              <Field name="code" className="input" />
              <ErrorMessage name="code" component="div" className="error" />

              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                Add Port
              </button>
            </Form>
          )}
        </Formik>
      </section>

      <section className="card" style={{ marginBottom: '2rem' }}>
        <h3>Add Port Pair</h3>
        <Formik
          initialValues={{ origin_port_id: '', destination_port_id: '' }}
          validationSchema={PortPairSchema}
          onSubmit={createPortPair}
        >
          {({ isSubmitting }) => (
            <Form>
              <label>Origin Port</label>
              <Field as="select" name="origin_port_id" className="input">
                <option value="">Select...</option>
                {ports.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </Field>
              <ErrorMessage name="origin_port_id" component="div" className="error" />

              <label>Destination Port</label>
              <Field as="select" name="destination_port_id" className="input">
                <option value="">Select...</option>
                {ports.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </Field>
              <ErrorMessage name="destination_port_id" component="div" className="error" />

              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                Add Port Pair
              </button>
            </Form>
          )}
        </Formik>
      </section>

      <section className="card">
        <h3>Add Rate for Port Pair</h3>
        <Formik
          initialValues={{
            port_pair_id: '',
            container_type_id: '',
            transit_time: '',
            amount: '',
          }}
          validationSchema={RateSchema}
          onSubmit={createRate}
        >
          {({ isSubmitting }) => (
            <Form>
              <label>Port Pair</label>
              <Field as="select" name="port_pair_id" className="input">
                <option value="">Select...</option>
                {portPairs.map((pp) => (
                  <option key={pp.id} value={pp.id}>
                    {pp.origin_port?.name || ''} → {pp.destination_port?.name || ''}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="port_pair_id" component="div" className="error" />

              <label>Container Type</label>
              <Field as="select" name="container_type_id" className="input">
                <option value="">Select...</option>
                {containers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.description}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="container_type_id" component="div" className="error" />

              <label>Transit Time (days)</label>
              <Field type="number" name="transit_time" className="input" />
              <ErrorMessage name="transit_time" component="div" className="error" />

              <label>Rate Amount</label>
              <Field type="number" name="amount" className="input" />
              <ErrorMessage name="amount" component="div" className="error" />

              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                Add Rate
              </button>
            </Form>
          )}
        </Formik>
      </section>
    </div>
  );
}
