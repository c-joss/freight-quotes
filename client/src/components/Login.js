import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const schema = Yup.object({
    email: Yup.string().email("use a valid email").required("required"),
    password: Yup.string().min(4, "min 4 chars").required("required"),
});

export default function Login() {
  const nav = useNavigate();

  return (
    <div>
      <h2>Login</h2>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={schema}
        onSubmit={async (values, actions) => {
            const res = await fetch("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(values),
            });
            const data = await res.json();
            if (data.error) {
                actions.setStatus(data.error);
            } else {
                if (typeof window.onLogin === "function") window.onLogin(data);
                nav("/quotes");
            }
            }}
      >
        {({ isSubmitting, status }) => (
            <Form style={{ display: "grid", gap: 8, maxWidth: 320 }}>
                <label>Email</label>
                <Field name="email" type="email" />
                <ErrorMessage name="email" component="div" style={{ color: "red" }} />

                <label>Password</label>
                <Field name="password" type="password" />
                {status && <div style={{ color: "red" }}>{status}</div>}

                <button type="submit" disabled={isSubmitting}>Log in</button>
            </Form>
        )}
      </Formik>
    </div>
  );
}