import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export default function NewQuote({ user }) {
    if (!user) return <p>Please log in to create a quote</p>
    return (
        <section>
            <h2>New Quote</h2>
            <p>(TODO) form to create a new quote.</p>
        </section>
    );
}