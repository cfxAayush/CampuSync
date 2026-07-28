import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, ApplicationPipelineTracker } from '../components/StatusBadge';
import {
  Search,
  Building,
  MapPin,
  DollarSign,
  Briefcase,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
} from 'lucide-react';

import { API_BASE, SERVER_BASE } from '../config';

export const StudentDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs', 'applications', 'profile'
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');

  // Selected job for apply modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMessage, setApplyMessage] = useState(null);

  // Resume upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/jobs/`);
      setJobs(res.data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/applications/`);
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    }
  };

  const handleApply = async (jobId) => {
    setApplyLoading(true);
    setApplyMessage(null);
    try {
      const res = await axios.post(`${API_BASE}/jobs/${jobId}/apply/`);
      setApplyMessage({ type: 'success', text: 'Application submitted successfully!' });
      fetchJobs();
      fetchApplications();
      setTimeout(() => setSelectedJob(null), 1500);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Application failed.';
      setApplyMessage({ type: 'error', text: detail });
    } finally {
      setApplyLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append('resume', resumeFile);
    try {
      await updateProfile(formData);
      setUploadSuccess('Resume PDF uploaded and attached to profile!');
      setTimeout(() => setUploadSuccess(''), 4000);
    } catch (err) {
      alert('Failed to upload resume PDF.');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = jobTypeFilter ? job.job_type === jobTypeFilter : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="main-content">
      {/* Top Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #22272E, #1C2128)',
          borderColor: 'var(--border-color)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Welcome back, {user?.first_name || user?.username}! 🎓
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Department: <strong style={{ color: 'var(--text-primary)' }}>{user?.department || 'N/A'}</strong> | CGPA:{' '}
              <strong style={{ color: 'var(--accent-green)' }}>{user?.cgpa || 'N/A'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              className={`btn ${activeTab === 'jobs' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('jobs')}
            >
              <Briefcase size={16} /> Explore Jobs ({jobs.length})
            </button>
            <button
              className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('applications')}
            >
              <FileText size={16} /> My Applications ({applications.length})
            </button>
            <button
              className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('profile')}
            >
              <Upload size={16} /> Resume & Profile
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: EXPLORE JOBS */}
      {activeTab === 'jobs' && (
        <div>
          {/* Search Bar & Filters */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Search jobs by title, company, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ minWidth: '180px' }}>
              <select
                className="form-select"
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
              >
                <option value="">All Job Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
                <option value="Part-Time">Part-Time</option>
              </select>
            </div>
          </div>

          {/* Job Listings Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading active job postings...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No active job postings found matching your search query.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {filteredJobs.map((job) => (
                <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          background: job.job_type === 'Internship' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: job.job_type === 'Internship' ? '#C084FC' : '#60A5FA',
                          border: `1px solid ${job.job_type === 'Internship' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                        }}
                      >
                        {job.job_type}
                      </span>
                      {job.has_applied && (
                        <StatusBadge status={job.my_application?.status || 'APPLIED'} />
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                      {job.title}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building size={14} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{job.company}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                        <span>{job.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <DollarSign size={14} style={{ color: '#34D399' }} />
                        <span style={{ color: '#34D399', fontWeight: '600' }}>{job.salary}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
                      {job.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => { setSelectedJob(job); setApplyMessage(null); }}
                    >
                      View Details
                    </button>

                    {job.has_applied ? (
                      <button className="btn btn-secondary btn-sm btn-disabled" disabled style={{ flex: 1 }}>
                        <CheckCircle2 size={14} style={{ color: '#34D399' }} /> Applied
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => { setSelectedJob(job); setApplyMessage(null); }}
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS & PIPELINE TRACKER */}
      {activeTab === 'applications' && (
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.25rem' }}>
            Application Pipeline & Status Tracker
          </h2>

          {applications.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              You haven't submitted any job applications yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {applications.map((app) => (
                <div key={app.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{app.job_details?.title}</h3>
                        <StatusBadge status={app.status} />
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: '#F3F4F6' }}>{app.job_details?.company}</strong> • Applied on{' '}
                        {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Visual State Pipeline Component */}
                  <div style={{ margin: '1.25rem 0', background: 'rgba(17, 24, 39, 0.5)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <ApplicationPipelineTracker currentStatus={app.status} />
                  </div>

                  {app.notes && (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(59, 130, 246, 0.08)',
                        borderLeft: '3px solid var(--accent-primary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <strong style={{ color: 'var(--text-primary)' }}>Placement Cell Note:</strong> {app.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RESUME & PROFILE MANAGER */}
      {activeTab === 'profile' && (
        <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1rem' }}>
            Resume & Profile Management
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Attach your official PDF resume. When you click "Apply Now" for campus job postings, your uploaded resume is automatically presented to company recruiters and placement officers.
          </p>

          {uploadSuccess && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-sm)',
                color: '#34D399',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <form onSubmit={handleResumeUpload}>
            <div className="form-group">
              <label className="form-label">Attached Resume Document</label>
              {user?.resume ? (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(31, 41, 55, 0.6)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Active Resume PDF</span>
                  </div>
                  <a
                    href={user.resume.startsWith('http') ? user.resume : `${SERVER_BASE}${user.resume}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.3rem' }}
                  >
                    Preview File <ExternalLink size={13} />
                  </a>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  No resume PDF uploaded yet. Please attach your resume below.
                </p>
              )}

              <input
                type="file"
                accept=".pdf"
                className="form-input"
                onChange={(e) => setResumeFile(e.target.files[0])}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <Upload size={16} /> Upload Resume PDF
            </button>
          </form>
        </div>
      )}

      {/* JOB DETAIL & APPLICATION MODAL */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#60A5FA',
                  }}
                >
                  {selectedJob.job_type}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '0.4rem' }}>
                  {selectedJob.title}
                </h2>
                <p style={{ fontSize: '0.95rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                  {selectedJob.company} • {selectedJob.location}
                </p>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedJob(null)}
                style={{ padding: '0.25rem 0.6rem' }}
              >
                ✕
              </button>
            </div>

            {applyMessage && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: applyMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${applyMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  borderRadius: 'var(--radius-sm)',
                  color: applyMessage.type === 'success' ? '#34D399' : '#F87171',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {applyMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{applyMessage.text}</span>
              </div>
            )}

            <div style={{ margin: '1.25rem 0' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Job Description
              </h4>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line', color: 'var(--text-primary)' }}>
                {selectedJob.description}
              </p>
            </div>

            <div style={{ margin: '1.25rem 0' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Requirements & Eligibility
              </h4>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line', color: 'var(--text-primary)' }}>
                {selectedJob.requirements}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-color)',
                marginTop: '1.5rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Salary Package: </span>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: '#34D399' }}>{selectedJob.salary}</span>
              </div>

              {selectedJob.has_applied ? (
                <button className="btn btn-secondary btn-disabled" disabled>
                  <CheckCircle2 size={16} style={{ color: '#34D399' }} /> Already Applied
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => handleApply(selectedJob.id)}
                  disabled={applyLoading}
                >
                  {applyLoading ? 'Submitting...' : 'Confirm & Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
