import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '../features/auth/authSlice';
import '../styles/Layout.css'; // This will be our new, unique CSS

// Icons for a cleaner UI (install react-icons if not already: npm install react-icons)
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa';

const menus = {
  employee: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/my-assessment', label: 'My Assessment' },
    { to: '/skill-matrix', label: 'Skill Matrix' },
    { to: '/skill-upgrade-guide', label: 'Upgrade Guide' },
  ],
  lead: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/team-assessments', label: 'Team Assessments' },
    { to: '/skill-matrix', label: 'Skill Matrix' },
    { to: '/skill-criteria', label: 'Skill Criteria' },
    { to: '/skill-upgrade-guide', label: 'Upgrade Guide' },
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

  // Refs for clicking outside to close menus
  const profileMenuRef = useRef(null);
  const mobileNavRef = useRef(null);
  const mobileToggleRef = useRef(null); // Ref for hamburger button

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
      // Profile menu
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target) && isProfileMenuOpen) {
        setIsProfileMenuOpen(false);
      }
      // Mobile nav
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target) &&
          mobileToggleRef.current && !mobileToggleRef.current.contains(e.target) && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside); // Use mousedown for better behavior
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen, isMobileNavOpen]); // Dependencies updated

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Close mobile nav on route change
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
          {/* Current page title shown as a breadcrumb or primary heading */}
          <h1 className="current-page-title">{currentPageLabel}</h1>
        </div>

        {/* Desktop Navigation */}
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
          {/* Mobile Hamburger Toggle */}
          <button className="mobile-nav-toggle" onClick={toggleMobileNav} aria-label="Toggle navigation" ref={mobileToggleRef}>
            {isMobileNavOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation (Overlay) */}
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