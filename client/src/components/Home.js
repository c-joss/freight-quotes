import React from 'react';
import '../styles.css';

export default function Home() {
  return (
    <main className="home-wrap">
      <section className="home-card">
        <img src="/paper-boat.com.png" alt="Paper Boat" className="home-hero" />
        <h1>Freight Quotes</h1>
        <p>Compare routes & container rates, then lock in a quote.</p>
        <div className="home-cta">
          <a className="btn" href="/login">
            Login
          </a>
          <a className="btn secondary" href="/quotes">
            View Quotes
          </a>
        </div>
      </section>
    </main>
  );
}
