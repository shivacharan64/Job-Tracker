import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({
    name: user?.name || '', jobTitle: user?.jobTitle || '', location: user?.location || '',
    phone: user?.phone || '', linkedIn: user?.linkedIn || '', github: user?.github || '',
    portfolio: user?.portfolio || '', bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    emailNotifications: user?.emailNotifications ?? true,
    reminderDaysBefore: user?.reminderDaysBefore || 1,
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [] };
      const res = await authAPI.updateProfile(payload);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await authAPI.updatePassword(pwForm);
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Change failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="page-header"><h1>Profile Settings</h1><p>Manage your account and preferences</p></div>
      <div className="tabs" style={{ marginBottom: 24, width: 'fit-content' }}>
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Profile</button>
        <button className={`tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>Password</button>
        <button className={`tab ${tab === 'notifications' ? 'active' : ''}`} onClick={() => setTab('notifications')}>Notifications</button>
      </div>

      {tab === 'profile' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 28 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontWeight: 800 }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user?.email}</p>
              <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 99, background: user?.role === 'admin' ? 'rgba(124,58,237,0.15)' : 'rgba(79,142,247,0.15)', color: user?.role === 'admin' ? '#7c3aed' : '#4f8ef7', textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
          </div>
          <form onSubmit={handleProfile}>
            <div className="form-row">
              <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="form-group"><label>Job Title</label><input value={form.jobTitle} onChange={e => setForm({...form, jobTitle: e.target.value})} placeholder="Software Engineer" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Location</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="City, Country" /></div>
              <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 234 567 8900" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>LinkedIn URL</label><input value={form.linkedIn} onChange={e => setForm({...form, linkedIn: e.target.value})} placeholder="https://linkedin.com/in/..." /></div>
              <div className="form-group"><label>GitHub URL</label><input value={form.github} onChange={e => setForm({...form, github: e.target.value})} placeholder="https://github.com/..." /></div>
            </div>
            <div className="form-group"><label>Portfolio URL</label><input value={form.portfolio} onChange={e => setForm({...form, portfolio: e.target.value})} placeholder="https://yoursite.com" /></div>
            <div className="form-group"><label>Skills (comma separated)</label><input value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} placeholder="React, Node.js, Python..." /></div>
            <div className="form-group"><label>Bio</label><textarea rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Tell us about yourself..." /></div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : 'Save Profile'}</button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Change Password</h3>
          <form onSubmit={handlePassword}>
            <div className="form-group"><label>Current Password</label><input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} required /></div>
            <div className="form-group"><label>New Password</label><input type="password" value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} required /></div>
            <div className="form-group"><label>Confirm New Password</label><input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})} required /></div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : 'Change Password'}</button>
          </form>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Notification Preferences</h3>
          <form onSubmit={handleProfile}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.emailNotifications} onChange={e => setForm({...form, emailNotifications: e.target.checked})} style={{ width: 18, height: 18 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Email Notifications</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Receive email reminders for interviews and deadlines</div>
                </div>
              </label>
            </div>
            <div className="form-group">
              <label>Remind me before interview (days)</label>
              <input type="number" min={1} max={7} value={form.reminderDaysBefore} onChange={e => setForm({...form, reminderDaysBefore: e.target.value})} style={{ width: 100 }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : 'Save Preferences'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
