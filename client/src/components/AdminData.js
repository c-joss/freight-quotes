import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { apiFetch } from '../api';

const PortSchema = Yup.object({
  name: Yup.string().trim().required('Required'),
  code: Yup.string().trim().uppercase().length(5, '5-char UN/LOCODE expected').required('Required'),
});

const ContainerTypeSchema = Yup.object({
  name: Yup.string().trim().required('Required'),
});

export default function AdminData({ user }) {
  if (!user) return <p>Please log in to manage lookup data.</p>;

  return (
    <div className="page">
      <h2>Admin: Lookup Data</h2>

      <section className="card" style={{ maxWidth: 520 }}>
        <h3>Create Port</h3>
        <Formik
          initialValues={{ name: '', code: '' }}
          validationSchema={PortSchema}
          onSubmit={async (values, { setSubmitting, resetForm, setStatus }) => {
            setStatus('');
            try {
              const res = await apiFetch('/ports', {
                method: 'POST',
                body: JSON.stringify(values),
              });
              if (!res.ok) throw new Error(await res.text());
              resetForm();
              setStatus('Created!');
            } catch (e) {
              setStatus('Failed to create port');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, status }) => (
            <Form>
              <label>Name</label>
              <Field name="name" className="input" />
              <ErrorMessage name="name" component="div" className="error" />
              <label>Code (UN/LOCODE)</label>
              <Field name="code" className="input" />
              <ErrorMessage name="code" component="div" className="error" />
              <button className="btn" type="submit" disabled={isSubmitting}>
                Create Port
              </button>
              {status && <p className="ok">{status}</p>}
            </Form>
          )}
        </Formik>
      </section>

      <section className="card" style={{ maxWidth: 520, marginTop: 24 }}>
        <h3>Create Container Type</h3>
        <Formik
          initialValues={{ name: '' }}
          validationSchema={ContainerTypeSchema}
          onSubmit={async (values, { setSubmitting, resetForm, setStatus }) => {
            setStatus('');
            try {
              const res = await apiFetch('/container_types', {
                method: 'POST',
                body: JSON.stringify(values),
              });
              if (!res.ok) throw new Error(await res.text());
              resetForm();
              setStatus('Created!');
            } catch (e) {
              setStatus('Failed to create container type');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, status }) => (
            <Form>
              <label>Name</label>
              <Field name="name" className="input" />
              <ErrorMessage name="name" component="div" className="error" />
              <button className="btn" type="submit" disabled={isSubmitting}>
                Create Type
              </button>
              {status && <p className="ok">{status}</p>}
            </Form>
          )}
        </Formik>
      </section>
    </div>
  );
}
