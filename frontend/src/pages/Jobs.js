import React, { useState, useEffect, useCallback } from 'react';
import { jobsAPI, uploadAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { MdAdd, MdSearch, MdEdit, MdDelete, MdStar, MdStarBorder, MdOpenInNew, MdUpload, MdClose } from 'react-icons/md';

const STATUSES = ['Bookmarked','Applied','Interviewing','Offer','Accepted','Rejected','Withdrawn'];
const JOB_TYPES = ['Full-time','Part-time','Contract','Internship','Freelance','Remote'];

const emptyForm = {
  company:'', position:'', location:'', jobType:'Full-time', workMode:'On-site',
  status:'Applied', salary:{min:'',max:'',currency:'USD'}, offerAmount:'',
  jobUrl:'', jobDescription:'',
  contactName:'', contactEmail:'',
  appliedDate: new Date().toISOString().split('T')[0],
  interviewDate:'', tags:'', statusNote:''
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ search:'', status:'', jobType:'', page:1, sortBy:'newest' });
  const [activeTab, setActiveTab] = useState('All');
  const [uploading, setUploading] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (activeTab !== 'All') params.status = activeTab;
      const res = await jobsAPI.getAll(params);
      setJobs(res.data.jobs);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, [filters, activeTab]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const openCreate = () => { setEditJob(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (job) => {
    setEditJob(job);
    setForm({
      ...emptyForm, ...job,
      salary: job.salary || {min:'',max:'',currency:'USD'},
      offerAmount: job.offerAmount || '',
      tags: job.tags?.join(', ') || '',
      appliedDate: job.appliedDate ? job.appliedDate.split('T')[0] : '',
      interviewDate: job.interviewDate ? job.interviewDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (editJob) {
        const res = await jobsAPI.update(editJob._id, payload);
        setJobs(jobs.map(j => j._id === editJob._id ? res.data.job : j));
        toast.success('Job updated!');
      } else {
        const res = await jobsAPI.create(payload);
        setJobs([res.data.job, ...jobs]);
        toast.success('Job added!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await jobsAPI.delete(id);
      setJobs(jobs.filter(j => j._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const toggleFav = async (job) => {
    try {
      const res = await jobsAPI.toggleFavorite(job._id);
      setJobs(jobs.map(j => j._id === job._id ? res.data.job : j));
    } catch {}
  };

  const handleResumeUpload = async (jobId, file) => {
    setUploading(jobId);
    try {
      const res = await uploadAPI.uploadResume(jobId, file);
      setJobs(jobs.map(j => j._id === jobId ? res.data.job : j));
      toast.success('Resume uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(null); }
  };

  const tabs = ['All', ...STATUSES];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Job Applications</h1><p>{total} total applications</p></div>
        <button className="btn btn-primary" onClick={openCreate}><MdAdd size={18} /> Add Job</button>
      </div>

      {/* Status Tabs */}
      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <div className="tabs" style={{ width: 'max-content', minWidth: '100%' }}>
          {tabs.map(t => <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => { setActiveTab(t); setFilters(f => ({ ...f, page: 1 })); }}>{t}</button>)}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input placeholder="Search company, position..." value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            style={{ paddingLeft: 38 }} />
        </div>
        <select value={filters.jobType} onChange={e => setFilters(f => ({ ...f, jobType: e.target.value, page: 1 }))} style={{ width: 140 }}>
          <option value="">All Types</option>
          {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))} style={{ width: 140 }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="company">Company A-Z</option>
        </select>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <div className="icon">💼</div>
          <h3>No applications found</h3>
          <p>Add your first job application to get started</p>
          <button className="btn btn-primary" onClick={openCreate}><MdAdd size={16} /> Add Job</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {jobs.map(job => (
            <div key={job._id} className="card" style={{ padding: 20, transition: 'transform 0.2s, border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,142,247,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, flex: 1, overflow: 'hidden' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                    {job.company[0].toUpperCase()}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.position}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{job.company}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button className="btn-icon" onClick={() => toggleFav(job)} style={{ padding: 4, fontSize: 16, color: job.isFavorite ? '#fbbf24' : 'var(--text-muted)' }}>
                    {job.isFavorite ? <MdStar /> : <MdStarBorder />}
                  </button>
                  <button className="btn-icon" onClick={() => openEdit(job)} style={{ padding: 4 }}><MdEdit size={14} /></button>
                  <button className="btn-icon" onClick={() => handleDelete(job._id)} style={{ padding: 4, color: 'var(--accent-rose)' }}><MdDelete size={14} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                <span className={`badge status-${job.status}`}>{job.status}</span>
                <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{job.jobType}</span>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {job.location && <span>📍 {job.location}</span>}
                {job.salary?.min && <span>💰 {job.salary.currency} {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()}</span>}
                {job.offerAmount && <span>🎉 Offer: {job.salary?.currency || 'USD'} {Number(job.offerAmount).toLocaleString()}</span>}
                <span>📅 Applied: {new Date(job.appliedDate).toLocaleDateString()}</span>
                {job.interviewDate && <span>🎯 Interview: {new Date(job.interviewDate).toLocaleDateString()}</span>}
              </div>

              {/* Resume upload */}
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, background: 'var(--bg-secondary)' }}>
                  <MdUpload size={14} />
                  {uploading === job._id ? 'Uploading...' : job.resume?.filename ? job.resume.filename.substring(0, 20) + '...' : 'Upload Resume'}
                  <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleResumeUpload(job._id, e.target.files[0])} />
                </label>
                {job.jobUrl && <a href={job.jobUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent-primary)' }}><MdOpenInNew size={14} /> View Job</a>}
              </div>

              {job.tags?.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {job.tags.map(tag => <span key={tag} style={{ fontSize: 11, padding: '2px 7px', borderRadius: 99, background: 'rgba(79,142,247,0.1)', color: 'var(--accent-primary)' }}>#{tag}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 800 }}>{editJob ? 'Edit Application' : 'New Job Application'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><MdClose size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Company *</label>
                    <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Google, Apple..." required />
                  </div>
                  <div className="form-group">
                    <label>Position *</label>
                    <input value={form.position} onChange={e => setForm({...form, position: e.target.value})} placeholder="Software Engineer..." required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="New York, NY" />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Type</label>
                    <select value={form.jobType} onChange={e => setForm({...form, jobType: e.target.value})}>
                      {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Work Mode</label>
                    <select value={form.workMode} onChange={e => setForm({...form, workMode: e.target.value})}>
                      {['On-site','Remote','Hybrid'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Salary Min</label>
                    <input type="number" value={form.salary.min} onChange={e => setForm({...form, salary: {...form.salary, min: e.target.value}})} placeholder="50000" />
                  </div>
                  <div className="form-group">
                    <label>Salary Max</label>
                    <input type="number" value={form.salary.max} onChange={e => setForm({...form, salary: {...form.salary, max: e.target.value}})} placeholder="80000" />
                  </div>
                </div>

                {/* Offer Amount — only shows when status is Offer */}
                {form.status === 'Offer' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>🎉 Offer Amount ({form.salary.currency || 'USD'})</label>
                      <input type="number" value={form.offerAmount}
                        onChange={e => setForm({...form, offerAmount: e.target.value})}
                        placeholder="e.g. 95000" />
                    </div>
                    <div className="form-group" />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Applied Date</label>
                    <input type="date" value={form.appliedDate} onChange={e => setForm({...form, appliedDate: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Interview Date</label>
                    <input type="date" value={form.interviewDate} onChange={e => setForm({...form, interviewDate: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Job URL</label>
                    <input type="url" value={form.jobUrl} onChange={e => setForm({...form, jobUrl: e.target.value})} placeholder="https://..." />
                  </div>
                  <div className="form-group">
                    <label>Contact Name</label>
                    <input value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} placeholder="HR Manager" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} placeholder="hr@company.com" />
                  </div>
                  <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="react, node, remote..." />
                  </div>
                </div>
                <div className="form-group">
                  <label>Job Description</label>
                  <textarea rows={4} value={form.jobDescription} onChange={e => setForm({...form, jobDescription: e.target.value})} placeholder="Paste the job description here..." />
                </div>
                {editJob && (
                  <div className="form-group">
                    <label>Status Change Note</label>
                    <input value={form.statusNote} onChange={e => setForm({...form, statusNote: e.target.value})} placeholder="Why did the status change?" />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : editJob ? 'Save Changes' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}