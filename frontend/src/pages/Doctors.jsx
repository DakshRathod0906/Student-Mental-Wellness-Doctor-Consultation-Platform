import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const CONCERN_TAGS = [
  "All",
  "Anxiety",
  "Depression",
  "Academic Stress",
  "Relationship Issues",
  "Sleep Issues",
  "Panic Attacks",
  "Career Anxiety",
  "Self Esteem"
];

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter States
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTag, setSelectedTag] = useState('All');

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const specFilter = selectedTag !== 'All' ? selectedTag : specialization;
      const { data } = await API.get('/doctors', {
        params: {
          search,
          specialization: specFilter,
          sort,
          page,
          limit: 6
        }
      });
      setDoctors(data.doctors);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError('Failed to fetch doctor directory list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [search, specialization, sort, page, selectedTag]);

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setSpecialization('');
    setPage(1);
  };

  return (
    <div style={{ padding: '32px', color: '#0f172a', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 800 }}>Certified Clinical Consultants</h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
          Find, filter, and schedule Jitsi consultations with certified professionals to help navigate campus challenges.
        </p>
      </div>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      {/* Filter and Search Panel Bento Card */}
      <div className="bento-card" style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Search bar */}
          <div style={{ flex: 2, minWidth: '240px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Search by Name</label>
            <input 
              type="text" 
              placeholder="e.g. Dr. Priya Shah..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
            />
          </div>

          {/* Specialty Dropdown */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Specialization</label>
            <select
              value={specialization}
              onChange={(e) => { setSpecialization(e.target.value); setSelectedTag('All'); setPage(1); }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', fontSize: '14px', height: '42px' }}
            >
              <option value="">All Specializations</option>
              <option value="Psychologist">Psychologist</option>
              <option value="Psychiatrist">Psychiatrist</option>
              <option value="Counselor">Counselor</option>
              <option value="Therapist">Therapist</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', fontSize: '14px', height: '42px' }}
            >
              <option value="rating">Rating (Highest First)</option>
              <option value="experience">Experience (Highest First)</option>
              <option value="fee">Consultation Fee</option>
            </select>
          </div>

        </div>

        {/* Concern Tags Filter Row */}
        <div>
          <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Filter by Concern Area</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CONCERN_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: selectedTag === tag ? '1px solid #14b8a6' : '1px solid #e2e8f0',
                  backgroundColor: selectedTag === tag ? '#14b8a6' : '#ffffff',
                  color: selectedTag === tag ? '#ffffff' : '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#64748b' }}>Loading clinical consultants...</div>
      ) : doctors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#64748b' }} className="bento-card">
          No certified consultants found matching your criteria. Try adjusting your search queries.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            {doctors.map(doc => (
              <div key={doc._id} className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px'
                    }}>
                      🩺
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>Dr. {doc.firstName} {doc.lastName}</h4>
                      <span style={{ fontSize: '13px', color: '#14b8a6', fontWeight: 600 }}>
                        {doc.doctorProfile?.specialization || 'Clinical Consultant'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    <div>🎓 <strong>Degree:</strong> {doc.doctorProfile?.qualification || 'MD / Counselor'}</div>
                    <div>📅 <strong>Exp:</strong> {doc.doctorProfile?.experience || 0} Years</div>
                  </div>

                  {/* Areas of Expertise Check tags */}
                  {doc.doctorProfile?.specialization && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: '#475569', fontWeight: 500 }}>
                        ✓ {doc.doctorProfile.specialization}
                      </span>
                      <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: '#475569', fontWeight: 500 }}>
                        ✓ Exam Stress
                      </span>
                      <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: '#475569', fontWeight: 500 }}>
                        ✓ Burnout
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#eab308' }}>
                      ⭐ {doc.doctorProfile?.averageRating || '0'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>
                      ({doc.doctorProfile?.reviewCount || 0} reviews)
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
                      ${doc.doctorProfile?.fee || 0} / session
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/doctor/${doc._id}`)}
                    className="btn-primary" 
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    View Profile
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary"
                style={{ padding: '6px 12px', opacity: page === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary"
                style={{ padding: '6px 12px', opacity: page === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Doctors;
