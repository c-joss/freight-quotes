import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export default function Login() {
  const nav = useNavigate();

  return (
    <div>
      <h2>Login</h2>
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={() => {}}
      >
        <Form>form tba</Form>
      </Formik>
    </div>
  );
}