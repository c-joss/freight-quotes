import { apiFetch } from '../api';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const loginSchema = Yup.object({
  email: Yup.string().email('use a valid email').required('required'),
  password: Yup.string().min(4, 'min 4 chars').required('required'),
});

const signupSchema = Yup.object({
  email: Yup.string().email('use a valid email').required('required'),
  password: Yup.string().min(6, 'min 6 chars').required('required'),
  confirm: Yup.string()
    .oneOf([Yup.ref('password')], 'passwords must match')
    .required('required'),
});

export default function Login({ onLogin }) {
  const nav = useNavigate();
  const [mode, setMode] = useState('login');

  async function handleAuth(path, values, actions) {
    const res = await apiFetch(path, {
      method: 'POST',
      body: JSON.stringify(values),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) {
      actions.setStatus(data?.error || `HTTP ${res.status}`);
      return;
    }
    onLogin && onLogin(data);
    nav('/quotes');
  }

  return (
    <div className="page page-center">
      <h2 className="page-title">{mode === 'login' ? 'Login' : 'Create Account'}</h2>

      <div className="form-container">
        {mode === 'login' ? (
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={(values, actions) => handleAuth('/auth/login', values, actions)}
          >
            {({ isSubmitting, status }) => (
              <Form>
                <label>Email</label>
                <Field name="email" type="email" />
                <ErrorMessage name="email" component="div" className="error" />

                <label>Password</label>
                <Field name="password" type="password" />
                <ErrorMessage name="password" component="div" className="error" />

                {status && <div className="error">{status}</div>}

                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                  Log in
                </button>

                <div className="mt-2">
                  <button type="button" className="btn btn-ghost" onClick={() => setMode('signup')}>
                    Create Account
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{ email: '', password: '', confirm: '' }}
            validationSchema={signupSchema}
            onSubmit={(values, actions) =>
              handleAuth(
                '/auth/signup',
                { email: values.email, password: values.password },
                actions,
              )
            }
          >
            {({ isSubmitting, status }) => (
              <Form>
                <label>Email</label>
                <Field name="email" type="email" />
                <ErrorMessage name="email" component="div" className="error" />

                <label>Password</label>
                <Field name="password" type="password" />
                <ErrorMessage name="password" component="div" className="error" />

                <label>Confirm Password</label>
                <Field name="confirm" type="password" />
                <ErrorMessage name="confirm" component="div" className="error" />

                {status && <div className="error">{status}</div>}

                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                  Create account
                </button>

                <div className="mt-2">
                  <button type="button" className="btn btn-ghost" onClick={() => setMode('login')}>
                    Create Account
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
}
