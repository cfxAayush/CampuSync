import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, ApplicationPipelineTracker } from '../components/StatusBadge';
import {
  Search,
  Building2,
  MapPin,
  Briefcase,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Award,
  Layers,
  Calendar,
  Check,
  X,
  ChevronRight,
  Filter,
} from 'lucide-react';

import { API_BASE, getFullMediaUrl } from '../config';

export const StudentDashboard = () => {
  const { user, token, updateProfile } = useAuth();
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
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [token]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/jobs/`);
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/applications/`);
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    }
  };

  const handleApply = async (jobId) => {
    setApplyLoading(true);
    setApplyMessage(null);
    try {
      await axios.post(`${API_BASE}/jobs/${jobId}/apply/`);
      setApplyMessage({ type: 'success', text: 'Application submitted successfully!' });
      fetchJobs();
      fetchApplications();
      setTimeout(() => setSelectedJob(null), 1400);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Application submission failed.';
      setApplyMessage({ type: 'error', text: detail });
    } finally {
      setApplyLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    setUploadError('');
    const formData = new FormData();
    formData.append('resume', resumeFile);
    try {
      await updateProfile(formData);
      setUploadSuccess('Official resume PDF attached to your profile.');
      setTimeout(() => setUploadSuccess(''), 4000);
    } catch {
      setUploadError('Failed to upload PDF. Please ensure file is a valid PDF under 5MB.');
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

  // Real statistics calculated from API responses
  const activeInterviews = applications.filter((a) => a.status === 'INTERVIEWING').length;
  const selectedOffers = applications.filter((a) => a.status === 'SELECTED').length;

  return (
    <div className="main-content">
      {/* Editorial Page Header & Student Summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>
            Welcome back, {user?.first_name || user?.username}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Campus placement drives, corporate interviews, and candidate pipeline tracking
          </p>
        </div>

        {/* Compact Student Meta Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 0.85rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Academic Profile
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.department || 'Engineering'}
            </span>
          </div>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CGPA
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--status-selected-text)' }}>
              {user?.cgpa ? `${user.cgpa} / 10` : '8.50'}
            </span>
          </div>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-card-label">Active Opportunities</div>
            <div className="stat-card-value">{jobs.length}</div>
          </div>
          <div className="stat-card-icon">
            <Briefcase size={18} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-card-label">Submitted Applications</div>
            <div className="stat-card-value">{applications.length}</div>
          </div>
          <div className="stat-card-icon" style={{ backgroundColor: 'var(--status-applied-bg)', color: 'var(--status-applied-text)' }}>
            <FileText size={18} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-card-label">Interview Rounds</div>
            <div className="stat-card-value">{activeInterviews}</div>
          </div>
          <div className="stat-card-icon" style={{ backgroundColor: 'var(--status-interview-bg)', color: 'var(--status-interview-text)' }}>
            <Calendar size={18} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-card-label">Placement Offers</div>
            <div className="stat-card-value" style={{ color: 'var(--status-selected-text)' }}>
              {selectedOffers}
            </div>
          </div>
          <div className="stat-card-icon" style={{ backgroundColor: 'var(--status-selected-bg)', color: 'var(--status-selected-text)' }}>
            <Award size={18} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-bar">
        <button
          type="button"
          className={`tab-item ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <Briefcase size={16} />
          <span>Open Positions ({jobs.length})</span>
        </button>
        <button
          type="button"
          className={`tab-item ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <Layers size={16} />
          <span>My Applications ({applications.length})</span>
        </button>
        <button
          type="button"
          className={`tab-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FileText size={16} />
          <span>Resume & Documents</span>
        </button>
      </div>

      {/* TAB 1: JOB LISTINGS */}
      {activeTab === 'jobs' && (
        <div>
          {/* Search & Filter Toolbar */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search by job title, company name, or skills..."
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
                <option value="">All Employment Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
                <option value="Part-Time">Part-Time</option>
              </select>
            </div>

            {(searchTerm || jobTypeFilter) && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearchTerm(''); setJobTypeFilter(''); }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Job Cards Grid */}
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Loading verified campus postings...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search size={22} />
              </div>
              <h3 style={{ marginBottom: '0.35rem' }}>No positions found</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.25rem auto' }}>
                There are no open positions matching your filter criteria. Try adjusting your search term.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearchTerm(''); setJobTypeFilter(''); }}
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="job-grid">
              {filteredJobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div>
                    {/* Top Row: Type & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: job.job_type === 'Internship' ? '#F4EBFF' : 'var(--bg-accent-subtle)',
                          color: job.job_type === 'Internship' ? '#6941C6' : 'var(--accent-primary)',
                        }}
                      >
                        {job.job_type}
                      </span>

                      {job.has_applied ? (
                        <StatusBadge status={job.my_application?.status || 'APPLIED'} />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {job.applications_count || 0} applicants
                        </span>
                      )}
                    </div>

                    {/* Job Title */}
                    <h3 className="job-card-title">{job.title}</h3>

                    {/* Company & Location */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.35rem' }}>
                      <div className="job-card-company">
                        <Building2 size={14} style={{ color: 'var(--text-muted)' }} />
                        <span>{job.company}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        <MapPin size={13} />
                        <span>{job.location}</span>
                      </div>
                    </div>

                    {/* Salary Tag */}
                    <div className="job-card-salary">
                      {job.salary || 'Competitive CTC'}
                    </div>

                    {/* Short Description */}
                    <p className="job-card-desc">{job.description}</p>
                  </div>

                  {/* Actions Footer */}
                  <div className="job-card-footer">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => { setSelectedJob(job); setApplyMessage(null); }}
                    >
                      View Details
                    </button>

                    {job.has_applied ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled
                        style={{ flex: 1, backgroundColor: 'var(--bg-surface-subtle)' }}
                      >
                        <Check size={14} style={{ color: 'var(--status-selected-text)' }} /> Applied
                      </button>
                    ) : (
                      <button
                        type="button"
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

      {/* TAB 2: APPLICATION TRACKER */}
      {activeTab === 'applications' && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ marginBottom: '0.25rem' }}>My Application Status</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Track recruitment progression, technical rounds, and placement feedback
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileText size={22} />
              </div>
              <h3 style={{ marginBottom: '0.35rem' }}>No active applications</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
                You have not submitted applications yet. Browse open company positions and apply with your uploaded resume.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('jobs')}
              >
                Browse Open Roles
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applications.map((app) => (
                <div key={app.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.875rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{app.job_details?.title}</h3>
                        <StatusBadge status={app.status} />
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{app.job_details?.company}</strong> • Applied on{' '}
                        {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                      {app.job_details?.salary}
                    </span>
                  </div>

                  {/* Multi-Stage Visual Pipeline Tracker */}
                  <div style={{ backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '0.75rem' }}>
                    <ApplicationPipelineTracker currentStatus={app.status} />
                  </div>

                  {/* Officer Feedback Note */}
                  {app.notes && (
                    <div
                      style={{
                        padding: '0.75rem 0.85rem',
                        backgroundColor: 'var(--bg-accent-subtle)',
                        borderLeft: '3px solid var(--accent-primary)',
                        borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
                        fontSize: '0.8125rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <strong style={{ color: 'var(--accent-primary)', marginRight: '0.35rem' }}>Placement Officer Feedback:</strong>
                      {app.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RESUME & PROFILE */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="card">
            <h2 style={{ marginBottom: '0.35rem' }}>Resume Document & Verification</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Your attached resume PDF is submitted with your job applications and viewed by campus recruiters.
            </p>

            {uploadSuccess && (
              <div className="alert alert-success">
                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {uploadError && (
              <div className="alert alert-error">
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Current Active Resume */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Active Verified Resume</label>
              {user?.resume ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Official Candidate Resume (PDF)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Verified for recruiter preview
                      </div>
                    </div>
                  </div>
                  <a
                    href={getFullMediaUrl(user.resume_url || user.resume)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    View Document <ExternalLink size={12} />
                  </a>
                </div>
              ) : (
                <div
                  style={{
                    padding: '1.25rem',
                    textAlign: 'center',
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                  }}
                >
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    No resume PDF currently attached to your account.
                  </p>
                </div>
              )}
            </div>

            {/* Upload New File Form */}
            <form onSubmit={handleResumeUpload}>
              <div className="form-group">
                <label className="form-label" htmlFor="resume_upload">
                  Upload New Resume File (PDF only, max 5MB)
                </label>
                <input
                  id="resume_upload"
                  type="file"
                  accept=".pdf"
                  className="form-input"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <Upload size={15} /> Upload & Update Resume
              </button>
            </form>
          </div>
        </div>
      )}

      {/* JOB DETAIL & APPLICATION MODAL */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-accent-subtle)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {selectedJob.job_type}
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.35rem', marginBottom: '0.15rem' }}>
                  {selectedJob.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <strong>{selectedJob.company}</strong> • <span>{selectedJob.location}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedJob(null)}
                style={{ padding: '0.35rem' }}
              >
                <X size={16} />
              </button>
            </div>

            {applyMessage && (
              <div className={`alert ${applyMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {applyMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{applyMessage.text}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Compensation Package
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '0.15rem' }}>
                  {selectedJob.salary || 'Competitive CTC'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Role Overview
                </span>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem', whiteSpace: 'pre-line' }}>
                  {selectedJob.description}
                </p>
              </div>

              {selectedJob.requirements && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Key Eligibility & Requirements
                  </span>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      marginTop: '0.35rem',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem 1rem',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {selectedJob.requirements}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedJob(null)}
              >
                Cancel
              </button>

              {selectedJob.has_applied ? (
                <button type="button" className="btn btn-secondary" disabled>
                  <Check size={15} style={{ color: 'var(--status-selected-text)' }} /> Already Applied
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleApply(selectedJob.id)}
                  disabled={applyLoading}
                >
                  {applyLoading ? 'Submitting Application...' : 'Confirm & Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
