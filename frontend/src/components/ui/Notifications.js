import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiBell, FiX, FiCheck } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const typeColors = {
    interview_reminder: '#6366f1',
    deadline_reminder: '#f59e0b',
    status_update: '#10b981',
    system: '#06b6d4',
    follow_up: '#a78bfa'
  };

  return (
    <div style={{
      position: 'fixed', top: 70, right: 20,
      width: 380, maxHeight: 500,
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      zIndex: 1000, overflow: 'hidden', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiBell style={{ color: 'var(--accent)' }} />
          <strong style={{ fontSize: '0.95rem' }}>Notifications</strong>
          {unread > 0 && (
            <span style={{ background: 'var(--accent)', color: 'white', borderRadius: 100, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>{unread}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unread > 0 && (
            <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', cursor: 'pointer' }}>
              Mark all read
            </button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><FiX /></button>
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner" /></div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No notifications yet</div>
        ) : notifications.map(n => (
          <div key={n._id} onClick={() => !n.isRead && markRead(n._id)}
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              cursor: n.isRead ? 'default' : 'pointer',
              background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.04)',
              transition: 'background 0.2s',
              display: 'flex', gap: 12, alignItems: 'flex-start'
            }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
              background: n.isRead ? 'transparent' : typeColors[n.type] || 'var(--accent)'
            }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{n.title}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </p>
            </div>
            {!n.isRead && <FiCheck style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: 4, flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
