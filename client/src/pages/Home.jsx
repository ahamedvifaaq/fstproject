import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    const handleCtaClick = () => {
        if (token) {
            navigate('/courses');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="landing-page">
            <nav className="landing-nav">
                <div className="logo">
                    <span className="gradient-text">FST Platform</span>
                </div>
                <div className="nav-actions">
                    {token ? (
                        <button className="nav-btn primary" onClick={() => navigate('/courses')}>Dashboard</button>
                    ) : (
                        <button className="nav-btn secondary" onClick={() => navigate('/login')}>Sign In</button>
                    )}
                </div>
            </nav>

            <main className="landing-main">
                <section className="hero-section">
                    <div className="hero-content">
                        <div className="badge">✨ Next-Generation E-Learning</div>
                        <h1>
                            Master Coding.<br />
                            <span className="gradient-text">Build the Future.</span>
                        </h1>
                        <p className="hero-subtitle">
                            Elevate your programming skills with interactive, visually rich, and dynamic video-code hybrid lessons designed for the next generation of developers.
                        </p>
                        <div className="hero-actions">
                            <button className="cta-btn primary-cta" onClick={handleCtaClick}>
                                {token ? 'Go to Dashboard' : 'Start Learning Free'}
                                <span className="arrow">→</span>
                            </button>
                            <button className="cta-btn secondary-cta" onClick={() => navigate('/courses')}>
                                Explore Courses
                            </button>
                        </div>
                        <div className="stats-row">
                            <div className="stat"><strong>50+</strong> Courses</div>
                            <div className="stat"><strong>Interactive</strong> Editors</div>
                            <div className="stat"><strong>24/7</strong> Access</div>
                        </div>
                    </div>
                    
                    <div className="hero-visual">
                        <div className="image-glow-wrapper">
                            <img src="/assets/landing-hero-banner.png" alt="Platform Dashboard" className="hero-image" />
                        </div>
                    </div>
                </section>

                <section className="features-section">
                    <h2 className="section-title">Why Learn With Us?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon code-icon">{'</>'}</div>
                            <h3>In-Browser Coding</h3>
                            <p>Write, execute, and debug code directly within your lesson timelines using our built-in Monaco editor integration.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon play-icon">▶</div>
                            <h3>Interactive Video Sync</h3>
                            <p>Your code updates natively in real-time alongside the instructor's audio and video progression.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon reward-icon">★</div>
                            <h3>Instructor Crafted</h3>
                            <p>Learn directly from high-end professionals with meticulously crafted modules structured for success.</p>
                        </div>
                    </div>
                </section>
            </main>
            
            <footer className="landing-footer">
                <p>© {new Date().getFullYear()} FST Platform. Designed for developers.</p>
            </footer>
        </div>
    );
}

