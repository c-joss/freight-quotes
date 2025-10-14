import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const schema = Yup.object({
  title: Yup.string().required("required"),
  port_pair_id: Yup.number().required("required"),
  container_type_id: Yup.number().required("required"),
  rate_ids: Yup.array().of(Yup.number()).min(1, "choose at least one rate"),
});

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

    return (
        <div>
            <h2>New Quote</h2>
            {!user ? <p>Please log in.</p> : (
                <Formik 
                    initialValues={{ title: "", port_pair_id: "", container_type_id: "", rate_ids: [] }}
                    validationSchema={schema}
                    onSubmit={() => {}}
                >
                    <Form style={{ display: "grid", gap: 8, maxWidth: 480 }}>
                        <label>Title</label>
                        <Field name="title" />
                        <ErrorMessage name="title" component="div" style={{ color: "red" }} />

                        <label>Port Pair</label>
                        <Field
                            as="select"
                            name="port_pair_id"
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setFieldValue("port_pair_id", val);
                                loadRates(val, values.container_type_id);
                            }}
                        >
                            <option value="">Choose…</option>
                            {pairs.map((pp) => (
                                <option key={pp.id} value={pp.id}>
                                    {pp.origin_port.name} → {pp.destination_port.name}
                                </option>
                            ))}
                        </Field>
                        <ErrorMessage name="port_pair_id" component="div" style={{ color: "red" }} />

                        <label>Container Type</label>
                        <Field
                            as="select"
                            name="container_type_id"
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setFieldValue("container_type_id", val);
                                loadRates(values.port_pair_id, val);
                            }}
                        >
                            <option value="">Choose…</option>
                            {types.map((ct) => (
                                <option key={ct.id} value={ct.id}>{ct.code}</option>
                            ))}
                        </Field>
                        <ErrorMessage name="container_type_id" component="div" style={{ color: "red" }} />
                    </Form>                   
                </Formik>                
            )}
        </div>
    );
}