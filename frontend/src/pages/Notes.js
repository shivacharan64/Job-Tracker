import React, { useState, useEffect } from 'react';
import { notesAPI, jobsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { MdAdd, MdEdit, MdDelete, MdPushPin, MdClose } from 'react-icons/md';

const COLORS = ['#ffffff10','#4f8ef720','#fbbf2420','#10b98120','#f43f5e20','#7c3aed20'];
const NOTE_TYPES = ['General','Interview Prep','Follow-up','Research','Feedback'];

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [form, setForm] = useState({ title:'', content:'', type:'General', job:'', color: COLORS[0], isPinned: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([notesAPI.getAll(), jobsAPI.getAll({ limit: 100 })])
      .then(([nr, jr]) => { setNotes(nr.data.notes); setJobs(jr.data.jobs); })
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditNote(null); setForm({ title:'', content:'', type:'General', job:'', color: COLORS[0], isPinned: false }); setShowModal(true); };
  const openEdit = (note) => { setEditNote(note); setForm({ title: note.title, content: note.content, type: note.type, job: note.job?._id || '', color: note.color || COLORS[0], isPinned: note.isPinned }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, job: form.job || undefined };
      if (editNote) {
        const res = await notesAPI.update(editNote._id, payload);
        setNotes(notes.map(n => n._id === editNote._id ? res.data.note : n));
        toast.success('Note updated!');
      } else {
        const res = await notesAPI.create(payload);
        setNotes([res.data.note, ...notes]);
        toast.success('Note created!');
      }
      setShowModal(false);
    } catch (err) { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try { await notesAPI.delete(id); setNotes(notes.filter(n => n._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const togglePin = async (note) => {
    try {
      const res = await notesAPI.update(note._id, { ...note, isPinned: !note.isPinned });
      setNotes(notes.map(n => n._id === note._id ? res.data.note : n).sort((a,b) => b.isPinned - a.isPinned));
    } catch {}
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Notes</h1><p>{notes.length} notes saved</p></div>
        <button className="btn btn-primary" onClick={openCreate}><MdAdd size={18} /> New Note</button>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📝</div>
          <h3>No notes yet</h3>
          <p>Create notes for interview prep, research, and follow-ups</p>
          <button className="btn btn-primary" onClick={openCreate}><MdAdd size={16} /> Create Note</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {notes.map(note => (
            <div key={note._id} className="card" style={{ padding: 18, borderLeft: `3px solid ${note.color?.replace('20','') || '#4f8ef7'}`, position: 'relative' }}>
              {note.isPinned && <div style={{ position: 'absolute', top: 12, right: 12, color: '#fbbf24', fontSize: 16 }}>📌</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, paddingRight: 24 }}>{note.title}</div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{note.type}</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10, marginBottom: 14, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.content}</p>
              {note.job && <div style={{ fontSize: 11, color: 'var(--accent-primary)', marginBottom: 10 }}>🔗 {note.job.company} - {note.job.position}</div>}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <button className="btn-icon" onClick={() => togglePin(note)} style={{ padding: 4 }}><MdPushPin size={14} /></button>
                <button className="btn-icon" onClick={() => openEdit(note)} style={{ padding: 4 }}><MdEdit size={14} /></button>
                <button className="btn-icon" onClick={() => handleDelete(note._id)} style={{ padding: 4, color: 'var(--accent-rose)' }}><MdDelete size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ fontWeight: 800 }}>{editNote ? 'Edit Note' : 'New Note'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><MdClose size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Note title..." required /></div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      {NOTE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Link to Job</label>
                    <select value={form.job} onChange={e => setForm({...form, job: e.target.value})}>
                      <option value="">No job linked</option>
                      {jobs.map(j => <option key={j._id} value={j._id}>{j.company} - {j.position}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Content *</label><textarea rows={6} value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Write your note here..." required /></div>
                <div className="form-group">
                  <label>Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {COLORS.map(c => <button key={c} type="button" onClick={() => setForm({...form, color: c})} style={{ width: 28, height: 28, borderRadius: '50%', background: c.replace('10','ff').replace('20','88'), border: form.color === c ? '2px solid var(--accent-primary)' : '2px solid transparent', cursor: 'pointer' }} />)}
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={form.isPinned} onChange={e => setForm({...form, isPinned: e.target.checked})} style={{ width: 16, height: 16 }} />
                  Pin this note
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : editNote ? 'Save' : 'Create Note'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
