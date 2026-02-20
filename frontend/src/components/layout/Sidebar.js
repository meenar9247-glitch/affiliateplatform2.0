import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FiHome,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiLink,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiAward,
  FiStar,
  FiShield,
  FiMail,
  FiBell,
  FiUser,
  FiCreditCard,
  FiActivity,
  FiPieChart,
  FiCalendar,
  FiClock,
  FiDownload,
  FiUpload,
  FiLock,
  FiEye,
  FiEyeOff,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [hovered, setHovered] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const toggleSubmenu = (menu) => {
    setActiveSubmenu(activeSubmenu === menu ? null : menu);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Navigation items
  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: FiHome,
      roles: ['user', 'admin'],
      exact: true
    },
    {
      title: 'Affiliates',
      path: '/affiliates',
      icon: FiLink,
      roles: ['user', 'admin'],
      submenu: [
        { title: 'All Links', path: '/affiliates', icon: FiLink },
        { title: 'My Links', path: '/affiliates/my-links', icon: FiStar },
        { title: 'Create Link', path: '/affiliates/create', icon: FiUpload }
      ]
    },
    {
      title: 'Referrals',
      path: '/referrals',
      icon: FiUsers,
      roles: ['user', 'admin'],
      submenu: [
        { title: 'My Referrals', path: '/referrals', icon: FiUsers },
        { title: 'Referral Tree', path: '/referrals/tree', icon: FiActivity },
        { title: 'Leaderboard', path: '/leaderboard', icon: FiAward }
      ]
    },
    {
      title: 'Earnings',
      path: '/earnings',
      icon: FiDollarSign,
      roles: ['user', 'admin'],
      submenu: [
        { title: 'Overview', path: '/earnings', icon: FiPieChart },
        { title: 'Commissions', path: '/earnings/commissions', icon: FiTrendingUp },
        { title: 'Payouts', path: '/earnings/payouts', icon: FiDownload }
      ]
    },
    {
      title: 'Wallet',
      path: '/wallet',
      icon: FiCreditCard,
      roles: ['user', 'admin'],
      submenu: [
        { title: 'Balance', path: '/wallet', icon: FiDollarSign },
        { title: 'Withdrawals', path: '/wallet/withdrawals', icon: FiUpload },
        { title: 'Transactions', path: '/wallet/transactions', icon: FiActivity },
        { title: 'Payment Methods', path: '/wallet/payment-methods', icon: FiCreditCard }
      ]
    },
    {
      title: 'Analytics',
      path: '/analytics',
      icon: FiBarChart2,
      roles: ['user', 'admin'],
      submenu: [
        { title: 'Overview', path: '/analytics', icon: FiPieChart },
        { title: 'Reports', path: '/analytics/reports', icon: FiBarChart2 },
        { title: 'Traffic', path: '/analytics/traffic', icon: FiTrendingUp },
        { title: 'Conversions', path: '/analytics/conversions', icon: FiActivity }
      ]
    }
  ];

  // Admin only items
  const adminItems = [
    {
      title: 'Admin',
      path: '/admin',
      icon: FiShield,
      roles: ['admin'],
      submenu: [
        { title: 'Dashboard', path: '/admin', icon: FiHome },
        { title: 'Users', path: '/admin/users', icon: FiUsers },
        { title: 'Affiliates', path: '/admin/affiliates', icon: FiLink },
        { title: 'Withdrawals', path: '/admin/withdrawals', icon: FiDollarSign },
        { title: 'Reports', path: '/admin/reports', icon: FiBarChart2 },
        { title: 'Analytics', path: '/admin/analytics', icon: FiActivity },
        { title: 'Settings', path: '/admin/settings', icon: FiSettings },
        { title: 'Logs', path: '/admin/logs', icon: FiClock }
      ]
    }
  ];

  // Bottom items
  const bottomItems = [
    {
      title: 'Settings',
      path: '/settings',
      icon: FiSettings,
      roles: ['user', 'admin']
    },
    {
      title: 'Support',
      path: '/support',
      icon: FiHelpCircle,
      roles: ['user', 'admin']
    }
  ];

  const renderNavItem = (item, index) => {
    const active = item.exact ? location.pathname === item.path : isActive(item.path);
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const submenuOpen = activeSubmenu === item.title || active;

    if (item.roles && !item.roles.includes(user?.role || 'guest')) {
      return null;
    }

    if (hasSubmenu && !collapsed) {
      return (
        <div key={index} className="nav-item-group">
          <button
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => toggleSubmenu(item.title)}
          >
            <item.icon className="nav-icon" />
            {!collapsed && (
              <>
                <span className="nav-text">{item.title}</span>
                <span className="nav-arrow">
                  {submenuOpen ? <FiChevronUp /> : <FiChevronDown />}
                </span>
              </>
            )}
          </button>
          {submenuOpen && !collapsed && (
            <div className="nav-submenu">
              {item.submenu.map((subItem, subIndex) => (
                <Link
                  key={subIndex}
                  to={subItem.path}
                  className={`nav-subitem ${isActive(subItem.path) ? 'active' : ''}`}
                >
                  <subItem.icon className="nav-icon" />
                  <span className="nav-text">{subItem.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={index}
        to={item.path}
        className={`nav-item ${active ? 'active' : ''}`}
      >
        <item.icon className="nav-icon" />
        {!collapsed && <span className="nav-text">{item.title}</span>}
      </Link>
    );
  };

  // Styles
  const styles = `
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: ${collapsed ? '80px' : '280px'};
      background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
      transition: width 0.3s var(--transition-ease);
      z-index: var(--z-fixed);
      overflow: hidden;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar.mobile-open {
      transform: translateX(0);
    }

    /* Sidebar Header */
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      border-bottom: 1px solid var(--border-light);
      height: var(--header-height);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-primary);
      font-weight: var(--font-bold);
      font-size: var(--text-xl);
      white-space: nowrap;
      overflow: hidden;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      flex-shrink: 0;
    }

    .toggle-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 8px;
      border-radius: var(--radius-lg);
      transition: all var(--transition-fast) var(--transition-ease);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .toggle-btn:hover {
      background: var(--bg-tertiary);
      color: var(--primary);
    }

    /* User Info */
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      border-bottom: 1px solid var(--border-light);
      white-space: nowrap;
      overflow: hidden;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: var(--font-bold);
      font-size: var(--text-lg);
      flex-shrink: 0;
    }

    .user-details {
      overflow: hidden;
    }

    .user-name {
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      text-transform: capitalize;
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 20px 0;
    }

    .nav-section {
      margin-bottom: 20px;
    }

    .nav-section-title {
      padding: 0 20px;
      margin-bottom: 10px;
      font-size: var(--text-xs);
      font-weight: var(--font-semibold);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all var(--transition-fast) var(--transition-ease);
      position: relative;
      white-space: nowrap;
      border: none;
      background: none;
      width: 100%;
      cursor: pointer;
      font-size: var(--text-sm);
    }

    .nav-item:hover {
      background: var(--bg-tertiary);
      color: var(--primary);
    }

    .nav-item.active {
      background: var(--primary-bg);
      color: var(--primary);
      border-right: 3px solid var(--primary);
    }

    .nav-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .nav-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-arrow {
      font-size: 16px;
      flex-shrink: 0;
    }

    /* Submenu */
    .nav-submenu {
      padding-left: 52px;
      margin: 5px 0;
    }

    .nav-subitem {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 20px 8px 0;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all var(--transition-fast) var(--transition-ease);
      white-space: nowrap;
      font-size: var(--text-sm);
    }

    .nav-subitem:hover {
      color: var(--primary);
    }

    .nav-subitem.active {
      color: var(--primary);
      font-weight: var(--font-medium);
    }

    .nav-subitem .nav-icon {
      font-size: 16px;
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid var(--border-light);
    }

    /* Mobile Overlay */
    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: var(--z-modal);
    }

    .sidebar-overlay.active {
      display: block;
    }

    /* Collapsed State */
    .sidebar.collapsed .nav-text,
    .sidebar.collapsed .nav-arrow,
    .sidebar.collapsed .user-details,
    .sidebar.collapsed .nav-section-title,
    .sidebar.collapsed .logo-text {
      display: none;
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 12px;
    }

    .sidebar.collapsed .user-info {
      justify-content: center;
      padding: 15px;
    }

    .sidebar.collapsed .logo {
      justify-content: center;
    }

    .sidebar.collapsed .toggle-btn {
      margin: 0 auto;
    }

    /* Hover Effect for Collapsed Sidebar */
    .sidebar.collapsed:hover {
      width: 280px;
    }

    .sidebar.collapsed:hover .nav-text,
    .sidebar.collapsed:hover .nav-arrow,
    .sidebar.collapsed:hover .user-details,
    .sidebar.collapsed:hover .nav-section-title,
    .sidebar.collapsed:hover .logo-text {
      display: block;
    }

    .sidebar.collapsed:hover .nav-item {
      justify-content: flex-start;
      padding: 12px 20px;
    }

    .sidebar.collapsed:hover .user-info {
      justify-content: flex-start;
      padding: 20px;
    }

    .sidebar.collapsed:hover .logo {
      justify-content: flex-start;
    }

    .sidebar.collapsed:hover .toggle-btn {
      margin: 0;
    }

    /* Main Content Shift */
    .main-content {
      margin-left: ${collapsed ? '80px' : '280px'};
      transition: margin-left 0.3s var(--transition-ease);
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        width: 280px !important;
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }

      .main-content {
        margin-left: 0 !important;
      }

      .sidebar.collapsed .nav-text,
      .sidebar.collapsed .nav-arrow,
      .sidebar.collapsed .user-details,
      .sidebar.collapsed .nav-section-title,
      .sidebar.collapsed .logo-text {
        display: block;
      }

      .sidebar.collapsed .nav-item {
        justify-content: flex-start;
        padding: 12px 20px;
      }

      .sidebar.collapsed .user-info {
        justify-content: flex-start;
        padding: 20px;
      }

      .sidebar.collapsed .logo {
        justify-content: flex-start;
      }

      .sidebar.collapsed .toggle-btn {
        margin: 0;
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .sidebar {
        background: linear-gradient(180deg, var(--dark-bg-primary) 0%, var(--dark-bg-secondary) 100%);
      }

      .sidebar-header,
      .user-info,
      .sidebar-footer {
        border-color: var(--dark-border);
      }

      .nav-item:hover {
        background: var(--dark-bg-tertiary);
      }

      .nav-item.active {
        background: var(--dark-bg-secondary);
      }
    }

    /* Animations */
    @keyframes slideIn {
      from {
        transform: translateX(-100%);
      }
      to {
        transform: translateX(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .sidebar {
      animation: slideIn 0.3s var(--transition-ease);
    }

    .sidebar-overlay {
      animation: fadeIn 0.3s var(--transition-ease);
    }
  `;

  return (
    <>
      <style>{styles}</style>
      
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <FiLink />
            </div>
            <span className="logo-text">AffiliatePro</span>
          </Link>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        {/* User Info */}
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role || 'Guest'}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {/* Main Navigation */}
          <div className="nav-section">
            {!collapsed && <div className="nav-section-title">Main</div>}
            {navItems.map((item, index) => renderNavItem(item, index))}
          </div>

          {/* Admin Navigation */}
          {user?.role === 'admin' && (
            <div className="nav-section">
              {!collapsed && <div className="nav-section-title">Administration</div>}
              {adminItems.map((item, index) => renderNavItem(item, index))}
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {bottomItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              {!collapsed && <span className="nav-text">{item.title}</span>}
            </Link>
          ))}
          <button className="nav-item" onClick={handleLogout}>
            <FiLogOut className="nav-icon" />
            {!collapsed && <span className="nav-text">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
