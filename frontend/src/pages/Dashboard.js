import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI } from '../utils/api';
import { MdWork, MdTrendingUp, MdCheckCircle, MdCancel, MdAccessTime, MdStar, MdAdd } from 'react-icons/md';

const STATUS_COLORS = {
  Applied: '#4f8ef7', Interviewing: '#fbbf24', Offer: '#10b981',
  Accepted: '#14b8a6', Rejected: '#f43f5e', Bookmarked: '#7c3aed', Withdrawn: '#94a3b8'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([jobsAPI.getStats(), jobsAPI.getAll({ limit: 5, sortBy: 'newest' })])
      .then(([statsRes, jobsRes]) => {
        setStats(statsRes.data);
        setRecentJobs(jobsRes.data.jobs);
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusCount = (status) => stats?.stats?.find(s => s._id === status)?.count || 0;

  const statCards = [
    { label: 'Total Applications', value: stats?.total || 0, icon: <MdWork />, color: '#4f8ef7' },
    { label: 'Interviewing', value: getStatusCount('Interviewing'), icon: <MdTrendingUp />, color: '#fbbf24' },
    { label: 'Offers Received', value: getStatusCount('Offer') + getStatusCount('Accepted'), icon: <MdCheckCircle />, color: '#10b981' },
    { label: 'Rejected', value: getStatusCount('Rejected'), icon: <MdCancel />, color: '#f43f5e' },
  ];

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's your job search overview</p>
        </div>
        <Link to="/jobs" className="btn btn-primary"><MdAdd size={18} /> Add Job</Link>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {statCards.map((card, i) => (
          <div key={i} className="stat-card" style={{ borderTop: `3px solid ${card.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div className="stat-number" style={{ color: card.color }}>{card.value}</div>
              <div style={{ color: card.color, opacity: 0.7, fontSize: 24 }}>{card.icon}</div>
            </div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Status Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Status Breakdown</h3>
          {['Applied','Interviewing','Offer','Accepted','Rejected','Bookmarked','Withdrawn'].map(status => {
            const count = getStatusCount(status);
            const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div key={status} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                  <span style={{ color: STATUS_COLORS[status], fontWeight: 600 }}>{status}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: STATUS_COLORS[status], borderRadius: 3, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Applications</h3>
            <Link to="/jobs" style={{ fontSize: 13, color: 'var(--accent-primary)' }}>View all →</Link>
          </div>
          {recentJobs.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="icon">📋</div>
              <p>No applications yet</p>
              <Link to="/jobs" className="btn btn-primary btn-sm"><MdAdd size={14} /> Add your first job</Link>
            </div>
          ) : recentJobs.map(job => (
            <div key={job._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                {job.company[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.position}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{job.company}</div>
              </div>
              <span className={`badge status-${job.status}`}>{job.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick tips */}
      {stats?.total === 0 && (
        <div className="card" style={{ marginTop: 20, background: 'linear-gradient(135deg, rgba(79,142,247,0.1), rgba(124,58,237,0.1))', borderColor: 'rgba(79,142,247,0.3)' }}>
          <h3 style={{ marginBottom: 12, fontSize: 16 }}>🚀 Get Started</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>Start tracking your job applications to get insights on your job search progress.</p>
          <Link to="/jobs" className="btn btn-primary"><MdAdd size={16} /> Add your first application</Link>
        </div>
      )}
    </div>
  );
}
