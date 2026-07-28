import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, User, LogOut, LayoutDashboard, FileText, PlusCircle } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <Briefcase size={22} />
          </div>
          <span>Campu<span style={{ color: 'var(--accent-primary)' }}>Sync</span></span>
        </Link>

        {isAuthenticated && (
          <nav className="nav-links">
            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`nav-item ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}
                >
                  <LayoutDashboard size={18} />
                  Placement Dashboard
                </Link>
                <Link
                  to="/admin/applications"
                  className={`nav-item ${location.pathname === '/admin/applications' ? 'active' : ''}`}
                >
                  <FileText size={18} />
                  Candidate Pipeline
                </Link>
              </>
            )}

            <div className="user-badge">
              <User size={16} style={{ color: 'var(--text-secondary)' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', lineHeight: '1.2' }}>
                  {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
                </span>
                <span className={`role-tag ${isAdmin ? 'admin' : 'student'}`}>
                  {isAdmin ? 'Placement Officer' : 'Student'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: '0.5rem', padding: '0.35rem 0.6rem' }}
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
