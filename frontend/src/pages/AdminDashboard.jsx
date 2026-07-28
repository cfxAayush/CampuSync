import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatusBadge } from '../components/StatusBadge';
import {
  Briefcase,
  Users,
  CheckCircle,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  FileText,
  ExternalLink,
  MessageSquare,
  Filter,
  Eye,
  X,
} from 'lucide-react';

import { API_BASE, SERVER_BASE, getFullMediaUrl } from '../config';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline', 'jobs'

  // Filter state for pipeline
  const [selectedJobFilter, setSelectedJobFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [previewResume, setPreviewResume] = useState(null);

  // Job creation modal state
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    company: '',
    location: 'Bangalore / Remote',
    job_type: 'Full-Time',
    salary: 'Rs. 15,00,000 CTC',
    description: '',
    requirements: '',
  });

  useEffect(() => {
    fetchStats();
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats/`);
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

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

  // State Machine Status Update Endpoint Call
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/applications/${appId}/status/`, {
        status: newStatus,
      });
      fetchApplications();
      fetchStats();
    } catch (err) {
      alert('Failed to update candidate application status.');
    }
  };

  const handleNotesChange = async (appId, notesText) => {
    try {
      await axios.patch(`${API_BASE}/applications/${appId}/status/`, {
        notes: notesText,
      });
      fetchApplications();
    } catch (err) {
      console.error('Failed to save notes', err);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/jobs/`, jobFormData);
      setShowCreateJobModal(false);
      setJobFormData({
        title: '',
        company: '',
        location: 'Bangalore / Remote',
        job_type: 'Full-Time',
        salary: 'Rs. 15,00,000 CTC',
        description: '',
        requirements: '',
      });
      fetchJobs();
      fetchStats();
    } catch (err) {
      alert('Failed to create job posting.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to remove this job posting?')) return;
    try {
      await axios.delete(`${API_BASE}/jobs/${jobId}/`);
      fetchJobs();
      fetchStats();
    } catch (err) {
      alert('Failed to delete job posting.');
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesJob = selectedJobFilter ? app.job === parseInt(selectedJobFilter) : true;
    const matchesStatus = selectedStatusFilter ? app.status === selectedStatusFilter : true;
    return matchesJob && matchesStatus;
  });

  return (
    <div className="main-content">
      {/* Overview Analytics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <div className="stat-val">{stats.total_jobs}</div>
              <div className="stat-lbl">Active Job Listings</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#C084FC' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="stat-val">{stats.total_applications}</div>
              <div className="stat-lbl">Total Student Applications</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="stat-val">{stats.status_counts?.SELECTED || 0}</div>
              <div className="stat-lbl">Selected / Hired Students</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="stat-val">{stats.placement_rate}%</div>
              <div className="stat-lbl">Campus Placement Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Header & Tab Controls */}
      <div
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className={`btn ${activeTab === 'pipeline' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('pipeline')}
          >
            <Users size={16} /> Candidate Pipeline ({applications.length})
          </button>
          <button
            className={`btn ${activeTab === 'jobs' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('jobs')}
          >
            <Briefcase size={16} /> Job Postings ({jobs.length})
          </button>
        </div>

        {activeTab === 'jobs' && (
          <button className="btn btn-primary" onClick={() => setShowCreateJobModal(true)}>
            <Plus size={16} /> Post New Job
          </button>
        )}
      </div>

      {/* TAB 1: CANDIDATE PIPELINE KANBAN & TABLE */}
      {activeTab === 'pipeline' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
              Student Applicant State Pipeline
            </h2>

            {/* Pipeline Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
              >
                <option value="">All Companies / Jobs</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company} - {j.title}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="APPLIED">Applied</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="INTERVIEWING">Interviewing</option>
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No candidate applications match the selected filter.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Candidate</th>
                    <th>Dept & CGPA</th>
                    <th>Target Position</th>
                    <th>Current Pipeline Status</th>
                    <th>Resume Document</th>
                    <th>Interview Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                          {app.student_details?.first_name} {app.student_details?.last_name}
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                          @{app.student_details?.username} • {app.student_details?.email}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                          {app.student_details?.department || 'CSE'}
                        </span>
                        <div style={{ fontSize: '0.775rem', color: '#34D399', fontWeight: '700' }}>
                          CGPA: {app.student_details?.cgpa || '8.5'}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                          {app.job_details?.title}
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                          {app.job_details?.company}
                        </div>
                      </td>

                      <td>
                        {/* Interactive Status Pipeline Dropdown */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <select
                            className="form-select"
                            style={{
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.825rem',
                              fontWeight: '700',
                              borderRadius: 'var(--radius-sm)',
                              borderColor: 'var(--border-color)',
                            }}
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          >
                            <option value="APPLIED">1. Applied</option>
                            <option value="IN_REVIEW">2. In Review</option>
                            <option value="INTERVIEWING">3. Interviewing</option>
                            <option value="SELECTED">4. Selected / Offer</option>
                            <option value="REJECTED">5. Rejected</option>
                          </select>
                          <StatusBadge status={app.status} />
                        </div>
                      </td>

                      <td>
                        {(() => {
                          const rawUrl = app.student_details?.resume_url || app.student_details?.resume;
                          const resumeHref = getFullMediaUrl(rawUrl);
                          const studentName = app.student_details?.first_name 
                            ? `${app.student_details.first_name} ${app.student_details.last_name || ''}`
                            : app.student_details?.username || 'Student';

                          return resumeHref ? (
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                style={{ gap: '0.25rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                onClick={() => setPreviewResume({ url: resumeHref, studentName })}
                              >
                                <Eye size={12} /> Preview PDF
                              </button>
                              <a
                                href={resumeHref}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.4rem' }}
                                title="Open in new tab"
                              >
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No File</span>
                          );
                        })()}
                      </td>

                      <td style={{ minWidth: '200px' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                          placeholder="Add feedback/notes..."
                          defaultValue={app.notes || ''}
                          onBlur={(e) => handleNotesChange(app.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: JOB POSTINGS MANAGEMENT */}
      {activeTab === 'jobs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {jobs.map((job) => (
            <div key={job.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
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
                  {job.job_type}
                </span>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteJob(job.id)}
                  title="Remove Job Posting"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.3rem' }}>{job.title}</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '0.75rem' }}>
                {job.company} • {job.location}
              </div>

              <div style={{ fontSize: '0.85rem', color: '#34D399', fontWeight: '700', marginBottom: '1rem' }}>
                {job.salary}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Applications Received: <strong style={{ color: 'var(--text-primary)' }}>{job.applications_count}</strong></span>
                <span>Posted by: {job.posted_by_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE JOB MODAL */}
      {showCreateJobModal && (
        <div className="modal-overlay" onClick={() => setShowCreateJobModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Post New Campus Job Drive</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCreateJobModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                    placeholder="e.g. Full Stack Engineer Trainee"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hiring Company</label>
                  <input
                    type="text"
                    className="form-input"
                    value={jobFormData.company}
                    onChange={(e) => setJobFormData({ ...jobFormData, company: e.target.value })}
                    placeholder="e.g. Google / Microsoft"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select
                    className="form-select"
                    value={jobFormData.job_type}
                    onChange={(e) => setJobFormData({ ...jobFormData, job_type: e.target.value })}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Part-Time">Part-Time</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={jobFormData.location}
                    onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary Package</label>
                  <input
                    type="text"
                    className="form-input"
                    value={jobFormData.salary}
                    onChange={(e) => setJobFormData({ ...jobFormData, salary: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea
                  className="form-textarea"
                  value={jobFormData.description}
                  onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                  placeholder="Describe the job role, team responsibilities, and work culture..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Requirements & Eligibility</label>
                <textarea
                  className="form-textarea"
                  value={jobFormData.requirements}
                  onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                  placeholder="e.g. B.Tech CSE/IT, CGPA > 7.5, Python, Django, React..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateJobModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Job Posting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Interactive Candidate Resume PDF Modal */}
      {previewResume && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 9999 }}>
          <div
            className="card"
            style={{
              width: '92%',
              maxWidth: '960px',
              height: '85vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                  Candidate Resume: {previewResume.studentName}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <a
                  href={previewResume.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  Open Original PDF <ExternalLink size={12} />
                </a>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPreviewResume(null)}
                >
                  <X size={16} /> Close
                </button>
              </div>
            </div>
            <iframe
              src={previewResume.url}
              title="Student Resume PDF"
              style={{
                width: '100%',
                flex: 1,
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: '#fff',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
