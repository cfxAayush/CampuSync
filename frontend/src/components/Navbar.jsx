import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User, LayoutDashboard, FileText, Briefcase } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : user?.username || 'User';

  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-badge">
          <div className="brand-icon">
            <GraduationCap size={18} strokeWidth={2.2} />
          </div>
          <span style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Campu<span style={{ color: 'var(--accent-primary)' }}>Sync</span>
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '0.15rem 0.45rem',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-accent-subtle)',
              color: 'var(--accent-primary)',
              marginLeft: '0.25rem',
            }}
          >
            Placement Portal
          </span>
        </Link>

        {isAuthenticated ? (
          <nav className="nav-links">
            {isAdmin && (
              <div style={{ display: 'flex', gap: '0.25rem', marginRight: '0.5rem' }}>
                <Link
                  to="/admin/dashboard"
                  className={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
                >
                  <LayoutDashboard size={15} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/admin/applications"
                  className={`nav-link ${location.pathname === '/admin/applications' ? 'active' : ''}`}
                >
                  <FileText size={15} />
                  <span>Pipeline</span>
                </Link>
              </div>
            )}

            {/* Profile User Info Chip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.25rem 0.5rem 0.25rem 0.25rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {userInitial}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {displayName}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {isAdmin ? 'Placement Officer' : 'Student Applicant'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '0.25rem 0.5rem',
                  marginLeft: '0.25rem',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                }}
                title="Sign out of account"
              >
                <LogOut size={14} />
              </button>
            </div>
          </nav>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link
              to="/login"
              className="btn btn-secondary btn-sm"
              style={{ fontWeight: 500 }}
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 500 }}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
