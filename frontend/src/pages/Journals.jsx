import React, { useEffect, useState } from 'react';
import API from '../services/api';

const Journals = () => {
  const [journals, setJournals] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('private');
  
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const fetchJournals = async () => {
    try {
      const { data } = await API.get('/journals');
      setJournals(data);
    } catch (err) {
      setError('Failed to fetch journal entries');
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);

    try {
      if (editingId) {
        await API.put(`/journals/${editingId}`, { title, content, mood, tags: tagArray, visibility });
      } else {
        await API.post('/journals', { title, content, mood, tags: tagArray, visibility });
      }
      resetForm();
      fetchJournals();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save entry');
    }
  };

  const handleEdit = (j) => {
    setEditingId(j._id);
    setTitle(j.title);
    setContent(j.content);
    setMood(j.mood);
    setTags(j.tags.join(', '));
    setVisibility(j.visibility);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;
    try {
      await API.delete(`/journals/${id}`);
      fetchJournals();
    } catch (err) {
      setError('Failed to delete entry');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setMood('neutral');
    setTags('');
    setVisibility('private');
    setEditingId(null);
    setShowForm(false);
  };

  const moodEmojis = {
    very_happy: '😊',
    happy: '🙂',
    neutral: '😐',
    sad: '😞',
    very_sad: '😭'
  };

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>My Journals</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '15px' }}>Express yourself freely. Reflect on your emotional patterns.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary"
        >
          + New Journal
        </button>
      </div>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      {/* Directory Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {journals.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '20px' }}>
            Start your wellness journey by creating your first journal entry.
          </div>
        ) : (
          journals.map(j => (
            <div key={j._id} className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                      {j.title} <span title={j.mood} style={{ fontSize: '20px' }}>{moodEmojis[j.mood]}</span>
                    </h3>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(j.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleEdit(j)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => handleDelete(j._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Delete</button>
                  </div>
                </div>
                <p style={{ margin: '0 0 16px 0', color: '#475569', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{j.content}</p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {j.tags.map((tag, idx) => (
                    <span key={idx} style={{ backgroundColor: '#f1f5f9', color: '#14b8a6', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>#{tag}</span>
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                  🔒 {j.visibility === 'private' ? 'Private' : 'Doctor Shared'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide-out Panel / Write Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800 }}>{editingId ? 'Edit Journal Entry' : 'Write Daily Journal'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Title</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    placeholder="Reflecting on my week..."
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Current Mood</label>
                  <select 
                    value={mood} 
                    onChange={(e) => setMood(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', fontSize: '14px', height: '40px' }}
                  >
                    <option value="very_happy">😊 Very Happy</option>
                    <option value="happy">🙂 Happy</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="sad">😞 Sad</option>
                    <option value="very_sad">😭 Very Sad</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Journal Content</label>
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  required 
                  rows="5"
                  placeholder="Express your thoughts freely here..."
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Tags (comma-separated)</label>
                  <input 
                    type="text" 
                    value={tags} 
                    onChange={(e) => setTags(e.target.value)} 
                    placeholder="stress, exam, success"
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Visibility</label>
                  <select 
                    value={visibility} 
                    onChange={(e) => setVisibility(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', fontSize: '14px', height: '40px' }}
                  >
                    <option value="private">Private (Only Me)</option>
                    <option value="doctor_visible">Doctor Visible (Share during consults)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={resetForm} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '10px' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px', borderRadius: '10px' }}>Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Journals;
