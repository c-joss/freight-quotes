import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function QuotesList({ user }) {
    return (
        <section>
            <h2>Quotes</h2>
            {!user && <p>Please log in to see your quotes.</p>}
            {user && <p>(TODO) list quotes for {user.email}</p>}
        </section>
    );
}