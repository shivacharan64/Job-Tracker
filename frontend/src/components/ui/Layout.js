import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationsAPI } from '../../utils/api';
import {
  MdDashboard, MdWork, MdNotes, MdBarChart, MdPerson,
  MdAdminPanelSettings, MdNotifications, MdLogout, MdMenu, MdClose,
  MdSearch
} from 'react-icons/md';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationsAPI.getAll()
      .then(res => { setNotifications(res.data.notifications); setUnread(res.data.unreadCount); })
      .catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', icon: <MdDashboard size={20} />, label: 'Dashboard' },
    { to: '/jobs', icon: <MdWork size={20} />, label: 'Jobs' },
    { to: '/notes', icon: <MdNotes size={20} />, label: 'Notes' },
    { to: '/analytics', icon: <MdBarChart size={20} />, label: 'Analytics' },
    { to: '/profile', icon: <MdPerson size={20} />, label: 'Profile' },
    ...(user?.role === 'admin' ? [{ to: '/admin', icon: <MdAdminPanelSettings size={20} />, label: 'Admin' }] : []),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0,
        height: '100vh', zIndex: 100,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s ease'
      }} className="sidebar">
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💼</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>JobTracker</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pro</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(79,142,247,0.1)' : 'transparent',
                transition: 'all 0.2s',
                textDecoration: 'none'
              })}>
              {item.icon}{item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
            <MdLogout size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Topbar */}
        <header style={{ height: 64, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button className="btn-icon" onClick={() => setShowNotifs(!showNotifs)} style={{ position: 'relative' }}>
              <MdNotifications size={20} />
              {unread > 0 && <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: 'var(--accent-rose)', borderRadius: '50%' }} />}
            </button>
            {showNotifs && (
              <div style={{ position: 'absolute', right: 0, top: 46, width: 340, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)', zIndex: 200 }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                  {unread > 0 && <button onClick={() => { notificationsAPI.markAllRead(); setUnread(0); }} style={{ fontSize: 12, color: 'var(--accent-primary)', background: 'none', border: 'none' }}>Mark all read</button>}
                </div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications</div>
                  ) : notifications.slice(0, 8).map(n => (
                    <div key={n._id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: !n.isRead ? 'rgba(79,142,247,0.05)' : 'transparent' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 32px' }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} />}
    </div>
  );
}
