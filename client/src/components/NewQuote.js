import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export default function NewQuote({ user }) {
    const nav = useNavigate();
    const [pairs, setPairs] = useState([]);
    const [types, setTypes] = useState([]);
    const [rates, setRates] = useState([]);

    useEffect(() => {
        fetch("/port_pairs").then((r) => r.json()).then(setPairs);
        fetch("/container_types").then((r) => r.json()).then(setTypes);
    }, []);

    async function loadRates(ppId, ctId) {
        if (ppId && ctId) {
            const r = await fetch(`/rates?port_pair_id=${ppId}&container_type_id=${ctId}`);
            setRates(await r.json());
        } else {
            setRates([]);
        }
    }

    return <h2>New Quote</h2>;
}