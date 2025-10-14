import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';

import { useParams } from 'react-router-dom';

export default function QuoteDetail({ user }) {
  const { id } = useParams();
  return (
    <section>
      <h2>Quote #{id}</h2>
      {!user ? <p>Please log in to view this quote.</p> : <p>(TODO) show quote detail.</p>}
    </section>
  );
}
