import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function QuotesList({ user }) {
    const [quotes, setQuotes] = useState([]);

    useEffect(() => {
        fetch("/quotes", { credentials: "include" })
        .then((r) => r.json())
        .then(setQuotes);
    }, []);

    return (
        <div>
            <h2>Quotes</h2>
            {!user && <p>(Log in to create, edit, or delete)</p>}
            <ul>
                {quotes.map((q) => (
                <li key={q.id}>
                    <Link to={`/quotes/${q.id}`}>{q.title}</Link> — {q.status}
                    {user && user.id === q.user_id && <span> (you)</span>}
                </li>
                ))}
            </ul>
        </div>
    );
}