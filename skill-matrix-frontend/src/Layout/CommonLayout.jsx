import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '../features/auth/authSlice'; // Adjust path if authSlice is in 'features'
import '../styles/Layout.css'; // This will be our new, unique CSS

const menus = {
  employee: [
    { to: '/dashboard', label: 'My Dashboard' },
    { to: '/my-assessment', label: 'My Assessment' },
    { to: '/skill-matrix', label: 'My Skill Matrix' },
    { to: '/skill-upgrade-guide', label: 'Skill Upgrade Guide' },
  ],
  lead: [
    { to: '/dashboard', label: 'Team Dashboard' },
    { to: '/team-assessments', label: 'Team Assessments' },
    { to: '/skill-matrix', label: 'Team Skill Matrix' },
    { to: '/skill-criteria', label: 'Skill Criteria' },
    { to: '/skill-upgrade-guide', label: 'Skill Upgrade Guide' },
  ],
  hr: [
    { to: '/dashboard', label: 'HR Dashboard' },
    { to: '/initiate-assessments', label: 'Initiate Assessments' },
    { to: '/pending-assessments', label: 'Pending Approvals' },
    { to: '/skill-matrix', label: 'Org Skill Matrix' },
    { to: '/skill-criteria', label: 'Manage Criteria' },
    { to: '/manage-employees', label: 'Manage Employees' },
    { to: '/team-management', label: 'Manage Teams' },
    { to: '/skill-upgrade-guide', label: 'Manage Skill Guides' },
  ],
};

const CommonLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const role = user?.role?.role_name?.toLowerCase() || 'employee';

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false); // For hamburger menu on mobile

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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isProfileMenuOpen && !e.target.closest('.profile-menu-container')) {
        setIsProfileMenuOpen(false);
      }
      if (isMobileNavOpen && !e.target.closest('.mobile-nav-toggle') && !e.target.closest('.main-navigation')) {
        setIsMobileNavOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileMenuOpen, isMobileNavOpen]);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

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
            <span className="app-logo">SKILL</span>
            <span className="app-name">Matrix</span>
          </div>
          <h1 className="current-page-title">{currentPageLabel}</h1>
        </div>

        <nav className={`main-navigation ${isMobileNavOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            {(menus[role] || []).map(({ to, label }) => (
              <li key={to} className={`nav-item ${location.pathname === to ? 'active' : ''}`}>
                <Link to={to} onClick={() => setIsMobileNavOpen(false)}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-right">
          <div className="profile-menu-container">
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
                <button onClick={goToProfile}>View Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
          <button className="mobile-nav-toggle" onClick={toggleMobileNav} aria-label="Toggle navigation">
            &#9776; {/* Hamburger icon */}
          </button>
        </div>
      </header>

      {/* Main content area below the header */}
      <main className="content-area-wrapper">
        <Outlet />
      </main>
    </div>
  );
};

export default CommonLayout;