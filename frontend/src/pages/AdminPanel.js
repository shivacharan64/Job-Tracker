import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import {
  MdPeople, MdWork, MdTrendingUp, MdDelete, MdBlock, MdCheckCircle,
  MdSearch, MdAdminPanelSettings, MdDownload, MdArrowBack, MdClose
} from 'react-icons/md';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } },
  scales: {
    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
  }
};

const STATUS_COLORS = {
  Applied: '#4f8ef7', Interviewing: '#fbbf24', Offer: '#10b981',
  Accepted: '#14b8a6', Rejected: '#f43f5e', Bookmarked: '#7c3aed', Withdrawn: '#94a3b8'
};

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [appTotal, setAppTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [appSearch, setAppSearch] = useState('');
  const [appStatus, setAppStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // for drill-down
  const [userDetail, setUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Load stats
  useEffect(() => {
    adminAPI.getStats()
      .then(res => setStats(res.data.stats))
      .catch(() => toast.error('Failed to load stats'));
  }, []);

  // Load analytics when on overview tab
  useEffect(() => {
    if (tab === 'overview') {
      adminAPI.getAnalytics()
        .then(res => setAnalytics(res.data))
        .catch(() => {});
    }
  }, [tab]);

  // Load users
  useEffect(() => {
    if (tab === 'users') {
      setLoading(true);
      adminAPI.getUsers({ search, role: roleFilter })
        .then(res => { setUsers(res.data.users); setTotal(res.data.total); })
        .catch(() => toast.error('Failed to load users'))
        .finally(() => setLoading(false));
    }
  }, [tab, search, roleFilter]);

  // Load applications
  useEffect(() => {
    if (tab === 'applications') {
      setLoading(true);
      adminAPI.getAllApplications({ search: appSearch, status: appStatus })
        .then(res => { setApplications(res.data.applications); setAppTotal(res.data.total); })
        .catch(() => toast.error('Failed to load applications'))
        .finally(() => setLoading(false));
    }
  }, [tab, appSearch, appStatus]);

  const handleToggle = async (id) => {
    try {
      const res = await adminAPI.toggleUser(id);
      setUsers(users.map(u => u._id === id ? res.data.user : u));
      toast.success('User status updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const res = await adminAPI.changeRole(id, role);
      setUsers(users.map(u => u._id === id ? res.data.user : u));
      toast.success('Role updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user and ALL their data? This cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
      setSelectedIds(selectedIds.filter(i => i !== id));
      toast.success('User deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setLoadingDetail(true);
    try {
      const res = await adminAPI.getUserDetail(user._id);
      setUserDetail(res.data);
    } catch { toast.error('Failed to load user details'); }
    finally { setLoadingDetail(false); }
  };

  const handleExportUsers = async () => {
    try {
      const res = await adminAPI.exportUsers();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Export failed'); }
  };

  const handleExportApplications = async () => {
    try {
      const res = await adminAPI.exportApplications();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'applications.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Export failed'); }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return toast.error('No users selected');
    if (action === 'delete' && !window.confirm(`Delete ${selectedIds.length} users? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      await adminAPI.bulkAction(selectedIds, action);
      toast.success(`${selectedIds.length} users ${action}d`);
      setSelectedIds([]);
      // Reload users
      const res = await adminAPI.getUsers({ search, role: roleFilter });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch { toast.error('Bulk action failed'); }
    finally { setBulkLoading(false); }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) setSelectedIds([]);
    else setSelectedIds(users.map(u => u._id));
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // ── Analytics chart data ──────────────────────────────────────────────────
  const userGrowthChart = analytics ? {
    labels: analytics.userGrowth.map(d => d._id),
    datasets: [{
      label: 'New Users', data: analytics.userGrowth.map(d => d.count),
      fill: true, borderColor: '#4f8ef7', backgroundColor: 'rgba(79,142,247,0.1)', tension: 0.4, pointBackgroundColor: '#4f8ef7'
    }]
  } : null;

  const appTrendChart = analytics ? {
    labels: analytics.applicationTrend.map(d => d._id),
    datasets: [{
      label: 'Applications', data: analytics.applicationTrend.map(d => d.count),
      fill: true, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, pointBackgroundColor: '#10b981'
    }]
  } : null;

  const statusChart = analytics ? {
    labels: analytics.statusBreakdown.map(s => s._id),
    datasets: [{
      data: analytics.statusBreakdown.map(s => s.count),
      backgroundColor: analytics.statusBreakdown.map(s => STATUS_COLORS[s._id] || '#94a3b8'),
      borderWidth: 0
    }]
  } : null;

  const topCompaniesChart = analytics ? {
    labels: analytics.topCompanies.map(c => c._id),
    datasets: [{
      label: 'Applications', data: analytics.topCompanies.map(c => c.count),
      backgroundColor: 'rgba(124,58,237,0.7)', borderColor: '#7c3aed', borderWidth: 1, borderRadius: 6
    }]
  } : null;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <MdAdminPanelSettings size={32} style={{ color: 'var(--accent-secondary)' }} />
        <div><h1>Admin Panel</h1><p>Manage users and monitor platform activity</p></div>
      </div>

      <div className="tabs" style={{ marginBottom: 24, width: 'fit-content' }}>
        {['overview', 'users', 'applications'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
      {tab === 'overview' && stats && (
        <div>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: <MdPeople size={24} />, color: '#4f8ef7' },
              { label: 'Total Applications', value: stats.totalJobs, icon: <MdWork size={24} />, color: '#7c3aed' },
              { label: 'Active (7d)', value: stats.activeUsers, icon: <MdTrendingUp size={24} />, color: '#10b981' },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
                  <div style={{ color: s.color, opacity: 0.7 }}>{s.icon}</div>
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          {analytics && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>User Growth (30d)</h3>
                  {userGrowthChart && analytics.userGrowth.length > 0
                    ? <Line data={userGrowthChart} options={{ ...chartDefaults, responsive: true, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
                    : <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No data yet</div>}
                </div>
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Application Trend (30d)</h3>
                  {appTrendChart && analytics.applicationTrend.length > 0
                    ? <Line data={appTrendChart} options={{ ...chartDefaults, responsive: true, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
                    : <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No data yet</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Applications by Status</h3>
                  {statusChart && analytics.statusBreakdown.length > 0
                    ? <div style={{ maxWidth: 280, margin: '0 auto' }}>
                        <Doughnut data={statusChart} options={{ cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 10 } } } }} />
                      </div>
                    : <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No data yet</div>}
                </div>
                <div className="card">
                  <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Top Companies Applied To</h3>
                  {topCompaniesChart && analytics.topCompanies.length > 0
                    ? <Bar data={topCompaniesChart} options={{ ...chartDefaults, indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } }} />
                    : <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No data yet</div>}
                </div>
              </div>
            </>
          )}

          {/* Recent users + Jobs by status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Recent Users</h3>
              {stats.recentUsers?.map(u => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>{u.name[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.email}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: u.role === 'admin' ? 'rgba(124,58,237,0.15)' : 'rgba(79,142,247,0.15)', color: u.role === 'admin' ? '#7c3aed' : '#4f8ef7' }}>{u.role}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Jobs by Status</h3>
              {stats.jobsByStatus?.map(s => (
                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{s._id}</span>
                  <span style={{ fontWeight: 700 }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── USERS TAB ────────────────────────────────────────────────────── */}
      {tab === 'users' && !selectedUser && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input placeholder="Search users by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: 140 }}>
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn btn-secondary" onClick={handleExportUsers} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MdDownload size={16} /> Export CSV
            </button>
          </div>

          {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, padding: '10px 14px', background: 'rgba(79,142,247,0.08)', borderRadius: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedIds.length} selected</span>
              <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 12px' }} disabled={bulkLoading} onClick={() => handleBulkAction('activate')}>Activate</button>
              <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 12px' }} disabled={bulkLoading} onClick={() => handleBulkAction('deactivate')}>Deactivate</button>
              <button className="btn" style={{ fontSize: 12, padding: '4px 12px', background: 'rgba(244,63,94,0.15)', color: '#f43f5e', border: 'none' }} disabled={bulkLoading} onClick={() => handleBulkAction('delete')}>Delete</button>
              <button className="btn-icon" onClick={() => setSelectedIds([])}><MdClose size={14} /></button>
            </div>
          )}

          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{total} users found</div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)' }}>
                    <th style={{ padding: '12px 16px', width: 40 }}>
                      <input type="checkbox" checked={selectedIds.length === users.length && users.length > 0} onChange={toggleSelectAll} />
                    </th>
                    {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.includes(u._id)} onChange={() => toggleSelect(u._id)} />
                      </td>
                      <td style={{ padding: '12px 16px' }} onClick={() => handleUserClick(u)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{u.name[0]}</div>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                        <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                          style={{ fontSize: 12, padding: '4px 8px', width: 'auto', background: u.role === 'admin' ? 'rgba(124,58,237,0.15)' : 'rgba(79,142,247,0.15)', color: u.role === 'admin' ? '#7c3aed' : '#4f8ef7', border: 'none', borderRadius: 6 }}>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 99, background: u.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)', color: u.isActive ? '#10b981' : '#f43f5e' }}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-icon" onClick={() => handleToggle(u._id)} title={u.isActive ? 'Deactivate' : 'Activate'} style={{ padding: 5 }}>
                            {u.isActive ? <MdBlock size={14} style={{ color: '#fbbf24' }} /> : <MdCheckCircle size={14} style={{ color: '#10b981' }} />}
                          </button>
                          <button className="btn-icon" onClick={() => handleDelete(u._id)} title="Delete user" style={{ padding: 5 }}>
                            <MdDelete size={14} style={{ color: 'var(--accent-rose)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found</div>}
            </div>
          )}
        </div>
      )}

      {/* ── USER DETAIL DRILL-DOWN ───────────────────────────────────────── */}
      {tab === 'users' && selectedUser && (
        <div>
          <button className="btn btn-secondary" onClick={() => { setSelectedUser(null); setUserDetail(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            <MdArrowBack size={16} /> Back to Users
          </button>

          {loadingDetail ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
          ) : userDetail && (
            <div>
              {/* User info */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22 }}>
                    {userDetail.user.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>{userDetail.user.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{userDetail.user.email}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Joined {new Date(userDetail.user.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
                    {Object.entries(userDetail.stats.byStatus).map(([status, count]) => (
                      <div key={status} style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: 20, color: STATUS_COLORS[status] || '#94a3b8' }}>{count}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User applications */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', fontWeight: 700, fontSize: 15, borderBottom: '1px solid var(--border)' }}>
                  {userDetail.stats.total} Applications
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      {['Company', 'Position', 'Status', 'Applied'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {userDetail.applications.map(app => (
                      <tr key={app._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>{app.company}</td>
                        <td style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{app.position}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 99, background: `${STATUS_COLORS[app.status]}20`, color: STATUS_COLORS[app.status] || '#94a3b8' }}>{app.status}</span>
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{new Date(app.appliedDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {userDetail.applications.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No applications yet</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── APPLICATIONS TAB ─────────────────────────────────────────────── */}
      {tab === 'applications' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input placeholder="Search company or position..." value={appSearch} onChange={e => setAppSearch(e.target.value)} style={{ paddingLeft: 38 }} />
            </div>
            <select value={appStatus} onChange={e => setAppStatus(e.target.value)} style={{ width: 150 }}>
              <option value="">All Statuses</option>
              {Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-secondary" onClick={handleExportApplications} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MdDownload size={16} /> Export CSV
            </button>
          </div>

          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{appTotal} applications found</div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)' }}>
                    {['User', 'Company', 'Position', 'Status', 'Applied'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{app.user?.name || 'N/A'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{app.user?.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{app.company}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{app.position}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 99, background: `${STATUS_COLORS[app.status]}20`, color: STATUS_COLORS[app.status] || '#94a3b8' }}>{app.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{new Date(app.appliedDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {applications.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No applications found</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}