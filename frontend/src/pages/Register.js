import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import './AuthSplit.css';

const bubbles = [
  { text: 'welcome to the team! 👋', align: 'left' },
  { text: 'excited to be here!', align: 'right' },
  { text: "offer on the way 🎯", align: 'left' },
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to JobTracker Pro 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
            <h2>Join the conversation<br />today</h2>
            <p>Create your account and start<br />tracking jobs instantly</p>
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
            <h1 className="auth-split-title">Create account</h1>
            <p className="auth-split-subtitle">Fill in the details below to get started</p>

            <form onSubmit={handleSubmit}>
              <div className="auth-split-group">
                <label>Full Name</label>
                <input placeholder="John Doe" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} required className="auth-split-input" />
              </div>
              <div className="auth-split-group">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} required className="auth-split-input" />
              </div>
              <div className="auth-split-group">
                <label>Password</label>
                <input type="password" placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} required className="auth-split-input" />
              </div>
              <div className="auth-split-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="Repeat password" value={form.confirmPassword}
                  onChange={e => setForm({...form, confirmPassword: e.target.value})} required className="auth-split-input" />
              </div>
              <button type="submit" className="auth-split-btn" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Create Account'}
              </button>
            </form>

            <p className="auth-split-switch">
              Already have an account? <Link to="/login" className="auth-split-link-bold">Sign in</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}