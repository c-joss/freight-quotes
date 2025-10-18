import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const schema = Yup.object({
  email: Yup.string().email('use a valid email').required('required'),
  password: Yup.string().min(4, 'min 4 chars').required('required'),
});

export default function Login({ onLogin }) {
  const nav = useNavigate();

  return (
    <div>
      <div className="page page-center">
        <h2 className="page-title">Login</h2>
        <div className="form-container">
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={schema}
            onSubmit={async (values, actions) => {
              const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(values),
              });
              const data = await res.json();
              if (data.error) {
                actions.setStatus(data.error);
              } else {
                onLogin && onLogin(data);
                nav('/quotes');
              }
            }}
          >
            {({ isSubmitting, status }) => (
              <Form>
                <label>Email</label>
                <Field name="email" type="email" />
                <ErrorMessage name="email" component="div" className="error" />

                <label>Password</label>
                <Field name="password" type="password" />
                {status && <div className="error">{status}</div>}

                <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                  Log in
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
