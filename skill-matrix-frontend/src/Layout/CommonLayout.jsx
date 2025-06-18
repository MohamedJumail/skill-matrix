import React, { useEffect, useState, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '../features/auth/authSlice';
import '../styles/Layout.css';

import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const menus = {
  employee: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/my-assessment', label: 'My Assessment' },
    { to: '/skill-matrix', label: 'Skill Matrix' },
    { to: '/skill-criteria', label: 'Skill Criteria' },
  ],
  lead: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/team-assessments', label: 'Assessments' },
    { to: '/team-skill-matrix', label: 'Skill Matrix' },
    { to: '/skill-criteria', label: 'Skill Criteria' },
    { to: '/manage-employees', label: 'View Teams' },
  ],
  hr: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/initiate-assessments', label: 'Initiate' },
    { to: '/pending-assessments', label: 'Approvals' },
    { to: '/manage-employees', label: 'Employees' },
    { to: '/team-management', label: 'Teams' },
  ],
};

const CommonLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const role = user?.role?.role_name?.toLowerCase() || 'employee';

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const profileMenuRef = useRef(null);
  const mobileNavRef = useRef(null);
  const mobileToggleRef = useRef(null);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  const goToProfile = () => {
    setIsProfileMenuOpen(false);
    navigate('/profile');
  };

  const toggleProfileMenu = () => setIsProfileMenuOpen((prev) => !prev);
  const toggleMobileNav = () => setIsMobileNavOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target) && isProfileMenuOpen) {
        setIsProfileMenuOpen(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target) &&
          mobileToggleRef.current && !mobileToggleRef.current.contains(e.target) && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen, isMobileNavOpen]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  if (!user || !menus[role]) {
    return (
      <div className="loading-screen">
        <p>Loading or unauthorized access. Please log in.</p>
      </div>
    );
  }

  const currentPageLabel = menus[role].find(item => item.to === location.pathname)?.label || 'Dashboard';

  return (
    <div className="app-wrapper">
      <header className="main-header">
        <div className="header-left">
          <div className="app-branding">
            <span className="app-logo">SKILL </span>
            <span className="app-name">Matrix</span>
          </div>
          <h1 className="current-page-title">{currentPageLabel}</h1>
        </div>

        <nav className="main-navigation desktop-nav">
          <ul className="nav-list">
            {(menus[role] || []).map(({ to, label }) => (
              <li key={to} className={`nav-item ${location.pathname === to ? 'active' : ''}`}>
                <Link to={to}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-right">
          <div className="profile-menu-container" ref={profileMenuRef}>
            <span className="user-greeting">Hi, {user.employee_name.split(' ')[0]}</span>
            <button className="user-avatar-btn" onClick={toggleProfileMenu} aria-label="User menu">
              {user.employee_name.charAt(0).toUpperCase()}
            </button>
            {isProfileMenuOpen && (
              <div className="profile-dropdown-menu">
                <div className="profile-dropdown-header">
                  <span className="profile-dropdown-name">{user.employee_name}</span>
                  <span className="profile-dropdown-role">{user.role?.role_name}</span>
                </div>
                <button onClick={goToProfile}><FaUserCircle /> View Profile</button>
                <button onClick={handleLogout}><FaSignOutAlt /> Logout</button>
              </div>
            )}
          </div>
          <button className="mobile-nav-toggle" onClick={toggleMobileNav} aria-label="Toggle navigation" ref={mobileToggleRef}>
            {isMobileNavOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      {isMobileNavOpen && (
        <nav className="mobile-navigation-overlay" ref={mobileNavRef}>
          <ul className="mobile-nav-list">
            {(menus[role] || []).map(({ to, label }) => (
              <li key={to} className={`mobile-nav-item ${location.pathname === to ? 'active' : ''}`}>
                <Link to={to} onClick={() => setIsMobileNavOpen(false)}>
                  {label}
                </Link>
              </li>
            ))}
            <li className="mobile-nav-item">
                <button onClick={goToProfile}><FaUserCircle /> View Profile</button>
            </li>
            <li className="mobile-nav-item">
                <button onClick={handleLogout}><FaSignOutAlt /> Logout</button>
            </li>
          </ul>
        </nav>
      )}

      <main className="content-area-wrapper">
        <Outlet />
      </main>
    </div>
  );
};

export default CommonLayout;