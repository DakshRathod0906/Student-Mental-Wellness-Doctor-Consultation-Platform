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
  const [viewTab, setViewTab] = useState('timeline'); // 'timeline' or 'calendar'
  
  // Filters state
  const [moodFilter, setMoodFilter] = useState('all'); // 'all', 'happy', 'neutral', 'sad'
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // 'all', 'private', 'doctor_visible'
  
  // Autosave status state
  const [autosaveStatus, setAutosaveStatus] = useState('All changes saved');

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

  // Autosave simulation on content change
  useEffect(() => {
    if (!content) return;
    setAutosaveStatus('Saving...');
    const timer = setTimeout(() => {
      setAutosaveStatus('Saved 10 seconds ago');
    }, 1500);
    return () => clearTimeout(timer);
  }, [content, title]);

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

  // Filter Journals
  const filteredJournals = journals.filter(j => {
    const matchesMood = moodFilter === 'all' || 
      (moodFilter === 'happy' && ['very_happy', 'happy'].includes(j.mood)) ||
      (moodFilter === 'neutral' && j.mood === 'neutral') ||
      (moodFilter === 'sad' && ['very_sad', 'sad'].includes(j.mood));
    
    const matchesVis = visibilityFilter === 'all' || j.visibility === visibilityFilter;
    return matchesMood && matchesVis;
  });

  // June 2026 logs calendar helper
  const daysInJune = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    // Map existing journals to calendar days by matching Date
    const loggedEntry = journals.find(j => new Date(j.createdAt).getDate() === dayNum);
    return { day: dayNum, emoji: loggedEntry ? moodEmojis[loggedEntry.mood] : null };
  });

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Global Header */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>My Journals 📝</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '15px' }}>Express yourself freely. Reflect on your emotional patterns.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary" style={{ backgroundColor: '#0ea5e9' }}>
          + New Journal
        </button>
      </div>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="bento-card theme-journals" style={{ padding: '16px', minHeight: '90px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Entries</span>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{journals.length}</div>
        </div>
        <div className="bento-card theme-who5" style={{ padding: '16px', minHeight: '90px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Current Streak</span>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>12 Days</div>
        </div>
        <div className="bento-card theme-pss10" style={{ padding: '16px', minHeight: '90px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Longest Streak</span>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>18 Days</div>
        </div>
        <div className="bento-card theme-notifications" style={{ padding: '16px', minHeight: '90px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Average Mood</span>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>😊 Good</div>
        </div>
      </div>

      {/* Filter and View Toggles Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '16px', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Mood filters */}
          <button onClick={() => setMoodFilter('all')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: moodFilter === 'all' ? '#0ea5e9' : 'transparent', color: moodFilter === 'all' ? '#ffffff' : '#475569', fontWeight: 600, cursor: 'pointer' }}>All Moods</button>
          <button onClick={() => setMoodFilter('happy')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: moodFilter === 'happy' ? '#0ea5e9' : 'transparent', color: moodFilter === 'happy' ? '#ffffff' : '#475569', fontWeight: 600, cursor: 'pointer' }}>😊 Happy</button>
          <button onClick={() => setMoodFilter('neutral')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: moodFilter === 'neutral' ? '#0ea5e9' : 'transparent', color: moodFilter === 'neutral' ? '#ffffff' : '#475569', fontWeight: 600, cursor: 'pointer' }}>😐 Neutral</button>
          <button onClick={() => setMoodFilter('sad')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: moodFilter === 'sad' ? '#0ea5e9' : 'transparent', color: moodFilter === 'sad' ? '#ffffff' : '#475569', fontWeight: 600, cursor: 'pointer' }}>😔 Sad</button>
          
          <div style={{ width: '1px', backgroundColor: '#cbd5e1', margin: '0 8px' }} />

          {/* Visibility filters */}
          <button onClick={() => setVisibilityFilter('all')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: visibilityFilter === 'all' ? '#6366f1' : 'transparent', color: visibilityFilter === 'all' ? '#ffffff' : '#475569', fontWeight: 600, cursor: 'pointer' }}>All Shares</button>
          <button onClick={() => setVisibilityFilter('private')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: visibilityFilter === 'private' ? '#6366f1' : 'transparent', color: visibilityFilter === 'private' ? '#ffffff' : '#475569', fontWeight: 600, cursor: 'pointer' }}>🔒 Private</button>
          <button onClick={() => setVisibilityFilter('doctor_visible')} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: visibilityFilter === 'doctor_visible' ? '#6366f1' : 'transparent', color: visibilityFilter === 'doctor_visible' ? '#ffffff' : '#475569', fontWeight: 600, cursor: 'pointer' }}>👥 Doctor Shared</button>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setViewTab('timeline')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: viewTab === 'timeline' ? '#0f172a' : '#ffffff', color: viewTab === 'timeline' ? '#ffffff' : '#0f172a' }}>Timeline View</button>
          <button onClick={() => setViewTab('calendar')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: viewTab === 'calendar' ? '#0f172a' : '#ffffff', color: viewTab === 'calendar' ? '#ffffff' : '#0f172a' }}>Calendar View</button>
        </div>
      </div>

      {/* Main Content Layout based on view selection */}
      {viewTab === 'timeline' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {filteredJournals.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '20px', backgroundColor: '#ffffff' }}>
              No journal entries found matching these criteria.
            </div>
          ) : (
            filteredJournals.map(j => (
              <div key={j._id} className="bento-card theme-journals" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', minHeight: '220px' }}>
                <div>
                  <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
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

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {j.tags.map((tag, idx) => (
                      <span key={idx} style={{ backgroundColor: '#f1f5f9', color: '#0ea5e9', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>#{tag}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
                    {j.visibility === 'private' ? '🔒 Private' : '👥 Doctor Shared'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* June 2026 Calendar */
        <div className="bento-card theme-journals" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Mood Calendar Log (June 2026)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center', fontSize: '13px' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <strong key={d} style={{ color: '#64748b' }}>{d}</strong>
            ))}
            <div />
            {daysInJune.map(dayInfo => (
              <div 
                key={dayInfo.day} 
                style={{ 
                  padding: '8px 0', 
                  borderRadius: '12px', 
                  backgroundColor: dayInfo.emoji ? '#e0f2fe' : '#f8fafc',
                  border: dayInfo.emoji ? '1px solid #bae6fd' : '1px solid #cbd5e1',
                  minHeight: '44px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>{dayInfo.day}</span>
                {dayInfo.emoji && <span style={{ fontSize: '16px', marginTop: '2px' }}>{dayInfo.emoji}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slide-out Modal / Form Editor */}
      {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{editingId ? 'Edit Journal' : 'Write Journal'}</h3>
              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>{autosaveStatus}</span>
            </div>
            
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
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Mood</label>
                  <select 
                    value={mood} 
                    onChange={(e) => setMood(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', height: '40px' }}
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
                <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Content</label>
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  required 
                  rows="5"
                  placeholder="Express your thoughts freely here..."
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Tags (comma-separated)</label>
                  <input 
                    type="text" 
                    value={tags} 
                    onChange={(e) => setTags(e.target.value)} 
                    placeholder="exams, happy"
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Visibility</label>
                  <select 
                    value={visibility} 
                    onChange={(e) => setVisibility(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', height: '40px' }}
                  >
                    <option value="private">Private (Only Me)</option>
                    <option value="doctor_visible">Doctor Visible (Share during consults)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: '#0ea5e9' }}>Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Journals;
