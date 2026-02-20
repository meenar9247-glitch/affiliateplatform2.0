import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FiMenu,
  FiX,
  FiHome,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiLink,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiAward,
  FiStar,
  FiShield,
  FiUser,
  FiCreditCard,
  FiActivity,
  FiPieChart,
  FiChevronDown,
  FiChevronUp,
  FiBell,
  FiMail,
  FiMessageSquare
} from 'react-icons/fi';

const MobileMenu = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setActiveSubmenu(null);
  }, [location.pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSubmenu = (menu) => {
    setActiveSubmenu(activeSubmenu === menu ? null : menu);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
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
      roles: ['user', 'admin']
    },
    {
      title: 'Affiliates',
      path: '/affiliates',
      icon: FiLink,
      roles: ['user', 'admin'],
      submenu: [
        { title: 'All Links', path: '/affiliates', icon: FiLink },
        { title: 'My Links', path: '/affiliates/my-links', icon: FiStar },
        { title: 'Create Link', path: '/affiliates/create', icon: FiActivity }
      ]
    },
    {
      title: 'Referrals',
      path: '/referrals',
      icon: FiUsers,
      roles: ['user', 'admin'],
      submenu: [
        { title: 'My Referrals', path: '/referrals', icon: FiUsers },
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
        { title: 'Payouts', path: '/earnings/payouts', icon: FiCreditCard }
      ]
    },
    {
      title: 'Wallet',
      path: '/wallet',
      icon: FiCreditCard,
      roles: ['user', 'admin'],
      submenu: [
        { title: 'Balance', path: '/wallet', icon: FiDollarSign },
        { title: 'Withdrawals', path: '/wallet/withdrawals', icon: FiActivity },
        { title: 'Transactions', path: '/wallet/transactions', icon: FiBarChart2 }
      ]
    },
    {
      title: 'Analytics',
      path: '/analytics',
      icon: FiBarChart2,
      roles: ['user', 'admin']
    },
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

  // Admin items
  const adminItems = [
    {
      title: 'Admin Dashboard',
      path: '/admin',
      icon: FiShield,
      roles: ['admin']
    },
    {
      title: 'Manage Users',
      path: '/admin/users',
      icon: FiUsers,
      roles: ['admin']
    },
    {
      title: 'Manage Affiliates',
      path: '/admin/affiliates',
      icon: FiLink,
      roles: ['admin']
    },
    {
      title: 'Withdrawals',
      path: '/admin/withdrawals',
      icon: FiDollarSign,
      roles: ['admin']
    },
    {
      title: 'System Settings',
      path: '/admin/settings',
      icon: FiSettings,
      roles: ['admin']
    }
  ];

  const renderNavItem = (item, index) => {
    const active = isActive(item.path);
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const submenuOpen = activeSubmenu === item.title;

    if (item.roles && !item.roles.includes(user?.role || 'guest')) {
      return null;
    }

    return (
      <div key={index} className="mobile-nav-item">
        {hasSubmenu ? (
          <>
            <button
              className={`mobile-nav-link ${active ? 'active' : ''}`}
              onClick={() => toggleSubmenu(item.title)}
            >
              <item.icon className="nav-icon" />
              <span className="nav-text">{item.title}</span>
              <span className="nav-arrow">
                {submenuOpen ? <FiChevronUp /> : <FiChevronDown />}
              </span>
            </button>
            {submenuOpen && (
              <div className="mobile-submenu">
                {item.submenu.map((subItem, subIndex) => (
                  <Link
                    key={subIndex}
                    to={subItem.path}
                    className={`mobile-submenu-link ${isActive(subItem.path) ? 'active' : ''}`}
                  >
                    <subItem.icon className="nav-icon" />
                    <span className="nav-text">{subItem.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <Link
            to={item.path}
            className={`mobile-nav-link ${active ? 'active' : ''}`}
          >
            <item.icon className="nav-icon" />
            <span className="nav-text">{item.title}</span>
          </Link>
        )}
      </div>
    );
  };

  // Styles
  const styles = `
    .mobile-header {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--header-height);
      background: var(--bg-primary);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: var(--z-fixed);
      padding: 0 16px;
      align-items: center;
      justify-content: space-between;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .mobile-header.scrolled {
      box-shadow: var(--shadow-md);
    }

    .mobile-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: var(--text-primary);
      font-weight: var(--font-bold);
      font-size: var(--text-lg);
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }

    .mobile-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mobile-action-btn {
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
    }

    .mobile-action-btn:hover {
      background: var(--bg-tertiary);
      color: var(--primary);
    }

    .menu-btn {
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
    }

    .menu-btn:hover {
      background: var(--bg-tertiary);
      color: var(--primary);
    }

    /* Mobile Menu Overlay */
    .mobile-menu-overlay {
      position: fixed;
      top: var(--header-height);
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: calc(var(--z-fixed) - 1);
      opacity: 0;
      visibility: hidden;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .mobile-menu-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    /* Mobile Menu */
    .mobile-menu {
      position: fixed;
      top: var(--header-height);
      left: 0;
      bottom: 0;
      width: 300px;
      background: var(--bg-primary);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-fixed);
      transform: translateX(-100%);
      transition: transform var(--transition-base) var(--transition-ease);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .mobile-menu.open {
      transform: translateX(0);
    }

    /* User Info */
    .mobile-user-info {
      padding: 20px 16px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
    }

    .mobile-user-avatar {
      width: 48px;
      height: 48px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      font-weight: var(--font-bold);
      font-size: var(--text-lg);
      margin-bottom: 12px;
    }

    .mobile-user-name {
      font-weight: var(--font-semibold);
      font-size: var(--text-base);
      margin-bottom: 4px;
    }

    .mobile-user-email {
      font-size: var(--text-xs);
      opacity: 0.9;
    }

    /* Navigation */
    .mobile-nav {
      flex: 1;
      overflow-y: auto;
      padding: 16px 0;
    }

    .mobile-nav-section {
      margin-bottom: 16px;
    }

    .mobile-nav-section-title {
      padding: 8px 16px;
      font-size: var(--text-xs);
      font-weight: var(--font-semibold);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
    }

    .mobile-nav-item {
      margin: 2px 0;
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--text-primary);
      text-decoration: none;
      transition: all var(--transition-fast) var(--transition-ease);
      width: 100%;
      border: none;
      background: none;
      cursor: pointer;
      font-size: var(--text-sm);
    }

    .mobile-nav-link:hover {
      background: var(--bg-tertiary);
    }

    .mobile-nav-link.active {
      background: var(--primary-bg);
      color: var(--primary);
      border-left: 3px solid var(--primary);
    }

    .mobile-nav-link .nav-icon {
      font-size: 20px;
      width: 24px;
      text-align: center;
    }

    .mobile-nav-link .nav-text {
      flex: 1;
      text-align: left;
    }

    .mobile-nav-link .nav-arrow {
      font-size: 16px;
      color: var(--text-secondary);
    }

    /* Submenu */
    .mobile-submenu {
      padding-left: 52px;
      background: var(--bg-secondary);
    }

    .mobile-submenu-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all var(--transition-fast) var(--transition-ease);
      font-size: var(--text-sm);
    }

    .mobile-submenu-link:hover {
      color: var(--primary);
    }

    .mobile-submenu-link.active {
      color: var(--primary);
      font-weight: var(--font-medium);
    }

    .mobile-submenu-link .nav-icon {
      font-size: 16px;
      width: 20px;
    }

    /* Footer */
    .mobile-menu-footer {
      padding: 16px;
      border-top: 1px solid var(--border-light);
    }

    .mobile-logout-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px;
      border: none;
      background: var(--danger-bg);
      color: var(--danger);
      border-radius: var(--radius-lg);
      cursor: pointer;
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .mobile-logout-btn:hover {
      background: var(--danger);
      color: white;
    }

    /* Quick Stats */
    .mobile-quick-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      padding: 16px;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-light);
    }

    .quick-stat {
      text-align: center;
    }

    .quick-stat-value {
      font-weight: var(--font-bold);
      color: var(--primary);
      font-size: var(--text-lg);
    }

    .quick-stat-label {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    /* Media Queries */
    @media (max-width: 768px) {
      .mobile-header {
        display: flex;
      }

      .desktop-sidebar {
        display: none;
      }

      .main-content {
        margin-top: var(--header-height);
        padding-top: 0;
      }
    }

    @media (max-width: 480px) {
      .mobile-menu {
        width: 100%;
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .mobile-header {
        background: var(--dark-bg-primary);
      }

      .mobile-menu {
        background: var(--dark-bg-primary);
      }

      .mobile-submenu {
        background: var(--dark-bg-secondary);
      }

      .mobile-quick-stats {
        background: var(--dark-bg-tertiary);
        border-top-color: var(--dark-border);
      }

      .mobile-user-info {
        background: linear-gradient(135deg, var(--dark-primary) 0%, var(--dark-secondary) 100%);
      }

      .mobile-user-avatar {
        color: var(--dark-primary);
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

    @keyframes slideOut {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-100%);
      }
    }

    .mobile-menu.open {
      animation: slideIn 0.3s var(--transition-ease);
    }

    .mobile-menu:not(.open) {
      animation: slideOut 0.3s var(--transition-ease);
    }
  `;

  return (
    <>
      <style>{styles}</style>

      {/* Mobile Header */}
      <header className={`mobile-header ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="mobile-logo">
          <div className="logo-icon">
            <FiLink />
          </div>
          <span>AffiliatePro</span>
        </Link>

        <div className="mobile-actions">
          <button className="mobile-action-btn">
            <FiBell size={20} />
          </button>
          <button className="menu-btn" onClick={toggleMenu}>
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </header>

      {/* Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        {/* User Info */}
        <div className="mobile-user-info">
          <div className="mobile-user-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="mobile-user-name">{user?.name || 'Guest User'}</div>
          <div className="mobile-user-email">{user?.email || 'guest@example.com'}</div>
        </div>

        {/* Quick Stats */}
        {user && (
          <div className="mobile-quick-stats">
            <div className="quick-stat">
              <div className="quick-stat-value">$1,234</div>
              <div className="quick-stat-label">Balance</div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-value">156</div>
              <div className="quick-stat-label">Clicks</div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-value">23</div>
              <div className="quick-stat-label">Conversions</div>
            </div>
            <div className="quick-stat">
              <div className="quick-stat-value">$89</div>
              <div className="quick-stat-label">Earnings</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="mobile-nav">
          {/* Main Navigation */}
          <div className="mobile-nav-section">
            <div className="mobile-nav-section-title">Main Menu</div>
            {navItems.map((item, index) => renderNavItem(item, index))}
          </div>

          {/* Admin Navigation */}
          {user?.role === 'admin' && (
            <div className="mobile-nav-section">
              <div className="mobile-nav-section-title">Administration</div>
              {adminItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="nav-icon" />
                  <span className="nav-text">{item.title}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="mobile-menu-footer">
          <button className="mobile-logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
