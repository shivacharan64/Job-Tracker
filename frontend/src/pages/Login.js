import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import './AuthSplit.css';

const bubbles = [
  { text: 'back again? more opportunities waiting 👀', align: 'left' },
  { text: "progress updated in real time ⚡", align: 'right' },
  { text: 'you’re closer than you think 🎯', align: 'left' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-split-page">
      <div className="auth-split-card">

        {/* LEFT dark panel */}
        <div className="auth-split-left">
          <div className="auth-split-brand">
            <div className="auth-split-logo">💼</div>
            <span className="auth-split-appname">JobTracker Pro</span>
          </div>
          <div className="auth-split-tagline">
            <h2>Connect with your<br />career in real time</h2>
            <p>Jobs, notes, and analytics<br />— all in one place</p>
          </div>
          <div className="auth-split-bubbles">
            {bubbles.map((b, i) => (
              <div key={i} className={"auth-bubble auth-bubble-" + b.align}>{b.text}</div>
            ))}
          </div>
          <div className="auth-split-orb auth-orb-1" />
          <div className="auth-split-orb auth-orb-2" />
        </div>

        {/* RIGHT white panel */}
        <div className="auth-split-right">
          <div className="auth-split-form-wrap">
            <h1 className="auth-split-title">Welcome back</h1>
            <p className="auth-split-subtitle">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit}>
              <div className="auth-split-group">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} required className="auth-split-input" />
              </div>
              <div className="auth-split-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} required className="auth-split-input" />
              </div>
              <div style={{ textAlign: 'right', marginBottom: 20 }}>
                <Link to="/forgot-password" className="auth-split-link">Forgot password?</Link>
              </div>
              <button type="submit" className="auth-split-btn" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Sign In'}
              </button>
            </form>

            <p className="auth-split-switch">
              Don't have an account? <Link to="/register" className="auth-split-link-bold">Register</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}