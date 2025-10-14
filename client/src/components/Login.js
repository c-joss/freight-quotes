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
        onSubmit={() => {}}
      >
        <Form>form tba</Form>
      </Formik>
    </div>
  );
}