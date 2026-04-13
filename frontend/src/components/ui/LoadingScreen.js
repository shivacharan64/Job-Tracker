import React from 'react';

export default function LoadingScreen() {
  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', gap: '1rem'
    }}>
      <div style={{
        width: 48, height: 48,
        background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
        borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: '1rem'
      }}>JT</div>
      <div className="spinner" style={{ width: 28, height: 28 }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading JobTracker Pro...</p>
    </div>
  );
}
