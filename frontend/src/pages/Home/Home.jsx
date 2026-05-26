import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePageMeta } from '../../hooks/usePageMeta';
import { ArrowRight, CheckCircle } from 'lucide-react';

const Home = () => {
  const { user, loading } = useAuth();

  usePageMeta({
    title: 'TracknRack | Student Habit Tracker & Productivity App',
    description:
      'TracknRack is a student habit tracker for daily productivity, fitness tracking, and routine management.',
    path: '/',
  });

  useEffect(() => {
    document.getElementById('static-seo-fallback')?.remove();
  }, []);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="seo-home">
      <header className="seo-home-header">
        <Link to="/" className="seo-home-logo">TracknRack</Link>
        <nav className="seo-home-nav" aria-label="Main navigation">
          <Link to="/login" className="btn btn-ghost">Log in</Link>
          <Link to="/register" className="btn btn-primary">
            Get started <ArrowRight size={18} />
          </Link>
        </nav>
      </header>

      <main className="seo-home-main container">
        <article className="seo-home-hero glass-card">
          <h1>TracknRack - Best Habit Tracker for Students</h1>
          <p>
            TracknRack helps students track habits, workouts, productivity goals,
            daily routines, and fitness consistency through a simple online dashboard.
          </p>
          <div className="seo-home-cta">
            <Link to="/register" className="btn btn-primary">Create free account</Link>
            <Link to="/login" className="btn btn-ghost">Sign in</Link>
          </div>
        </article>

        <section className="seo-home-section glass-card" aria-labelledby="routine-heading">
          <h2 id="routine-heading">Daily Routine and Fitness Tracking</h2>
          <p>
            This habit tracking web application is designed for college students
            who want to improve productivity, fitness, and consistency.
          </p>
        </section>

        <section className="seo-home-section glass-card" aria-labelledby="features-heading">
          <h2 id="features-heading">Why students use TracknRack</h2>
          <ul className="seo-home-features">
            <li><CheckCircle size={20} aria-hidden="true" /> Track daily habits, streaks, and completion rates</li>
            <li><CheckCircle size={20} aria-hidden="true" /> Set fitness and productivity goals with progress charts</li>
            <li><CheckCircle size={20} aria-hidden="true" /> Manage routines with a clean online dashboard</li>
            <li><CheckCircle size={20} aria-hidden="true" /> View analytics to stay consistent week after week</li>
          </ul>
        </section>

        <section className="seo-home-section glass-card" aria-labelledby="productivity-heading">
          <h2 id="productivity-heading">Student productivity and fitness habits</h2>
          <p>
            Whether you are building a morning routine, tracking gym workouts, or staying on top of
            study goals, TracknRack keeps your habits visible and measurable. Use our habit tracking
            web application to log completions, review weekly performance, and stay accountable.
          </p>
        </section>
      </main>

      <footer className="seo-home-footer">
        <p>© {new Date().getFullYear()} TracknRack — Student habit tracker &amp; productivity app</p>
      </footer>
    </div>
  );
};

export default Home;
