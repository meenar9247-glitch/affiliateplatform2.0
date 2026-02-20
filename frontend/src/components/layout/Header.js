import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMoon,
  FiSun,
  FiChevronDown,
  FiMail,
  FiHelpCircle,
  FiCreditCard,
  FiDollarSign,
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
  FiMessageSquare,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  // Mock notifications data
  useEffect(() => {
    // Fetch notifications from API
    const mockNotifications = [
      {
        id: 1,
        type: 'success',
        title: 'Withdrawal Completed',
        message: 'Your withdrawal of $500 has been processed successfully',
        time: '5 minutes ago',
        read: false,
        icon: FiCheckCircle
      },
      {
        id: 2,
        type: 'info',
        title: 'New Affiliate Link',
        message: 'Your new affiliate link has been approved',
        time: '1 hour ago',
        read: false,
        icon: FiInfo
      },
      {
        id: 3,
        type: 'warning',
        title: 'Commission Pending',
        message: 'Your commission of $50 is pending approval',
        time: '3 hours ago',
        read: true,
        icon: FiAlertCircle
      },
      {
        id: 4,
        type: 'success',
        title: 'Referral Bonus',
        message: 'You earned $25 from your referral',
        time: '1 day ago',
        read: true,
        icon: FiDollarSign
      }
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async () => {
    setSearchLoading(true);
    // Mock search results
    const results = [
      { id: 1, title: 'Dashboard', path: '/dashboard', icon: FiActivity },
      { id: 2, title: 'Affiliate Links', path: '/affiliates', icon: FiCreditCard },
      { id: 3, title: 'Earnings Report', path: '/earnings', icon: FiDollarSign },
      { id: 4, title: 'Profile Settings', path: '/settings', icon: FiSettings }
    ].filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
    setSearchLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="notification-icon success" />;
      case 'warning':
        return <FiAlertCircle className="notification-icon warning" />;
      case 'info':
        return <FiInfo className="notification-icon info" />;
      default:
        return <FiMessageSquare className="notification-icon" />;
    }
  };

  const formatTime = (time) => {
    return time;
  };

  // Styles
  const styles = `
    .header {
      position: fixed;
      top: 0;
      right: 0;
      left: 280px;
      height: var(--header-height);
      background: var(--bg-primary);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: var(--z-sticky);
      transition: left 0.3s var(--transition-ease);
    }

    .header.sidebar-collapsed {
      left: 80px;
    }

    /* Header Left */
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .menu-btn {
      display: none;
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 8px;
      border-radius: var(--radius-lg);
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .menu-btn:hover {
      background: var(--bg-tertiary);
      color: var(--primary);
    }

    /* Search */
    .search-wrapper {
      position: relative;
      width: 400px;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      padding: 8px 12px;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .search-box:focus-within {
      box-shadow: 0 0 0 2px var(--primary);
    }

    .search-icon {
      color: var(--text-secondary);
      margin-right: 8px;
    }

    .search-box input {
      flex: 1;
      background: none;
      border: none;
      color: var(--text-primary);
      font-size: var(--text-sm);
      outline: none;
    }

    .search-box input::placeholder {
      color: var(--text-disabled);
    }

    .search-box button {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      border-radius: var(--radius-sm);
    }

    .search-box button:hover {
      background: var(--bg-tertiary);
    }

    /* Search Results */
    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 8px;
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      max-height: 400px;
      overflow-y: auto;
      z-index: var(--z-dropdown);
    }

    .search-loading {
      padding: 16px;
      text-align: center;
      color: var(--text-secondary);
    }

    .search-result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--text-primary);
      text-decoration: none;
      transition: background var(--transition-fast) var(--transition-ease);
    }

    .search-result-item:hover {
      background: var(--bg-tertiary);
    }

    .result-icon {
      width: 32px;
      height: 32px;
      background: var(--primary-bg);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
    }

    .result-info {
      flex: 1;
    }

    .result-title {
      font-weight: var(--font-medium);
      margin-bottom: 4px;
    }

    .result-path {
      font-size: var(--text-xs);
      color: var(--text-secondary);
    }

    /* Header Right */
    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    /* Notifications */
    .notifications-wrapper {
      position: relative;
    }

    .notifications-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 8px;
      border-radius: var(--radius-lg);
      position: relative;
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .notifications-btn:hover {
      background: var(--bg-tertiary);
      color: var(--primary);
    }

    .notification-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: var(--danger);
      color: white;
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      min-width: 18px;
      height: 18px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notifications-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      width: 360px;
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      z-index: var(--z-dropdown);
    }

    .notifications-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid var(--border-light);
    }

    .notifications-header h3 {
      font-size: var(--text-base);
      font-weight: var(--font-semibold);
      margin: 0;
    }

    .mark-read-btn {
      background: none;
      border: none;
      color: var(--primary);
      cursor: pointer;
      font-size: var(--text-sm);
      transition: color var(--transition-fast) var(--transition-ease);
    }

    .mark-read-btn:hover {
      color: var(--primary-dark);
      text-decoration: underline;
    }

    .notifications-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      gap: 12px;
      padding: 16px;
      cursor: pointer;
      transition: background var(--transition-fast) var(--transition-ease);
      border-bottom: 1px solid var(--border-light);
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .notification-item:hover {
      background: var(--bg-tertiary);
    }

    .notification-item.unread {
      background: var(--primary-bg);
    }

    .notification-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-icon.success {
      background: var(--success-bg);
      color: var(--success);
    }

    .notification-icon.warning {
      background: var(--warning-bg);
      color: var(--warning);
    }

    .notification-icon.info {
      background: var(--info-bg);
      color: var(--info);
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-weight: var(--font-medium);
      margin-bottom: 4px;
      color: var(--text-primary);
    }

    .notification-message {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    .notification-time {
      font-size: var(--text-xs);
      color: var(--text-disabled);
    }

    .notifications-footer {
      padding: 12px;
      text-align: center;
      border-top: 1px solid var(--border-light);
    }

    .view-all-link {
      color: var(--primary);
      text-decoration: none;
      font-size: var(--text-sm);
    }

    .view-all-link:hover {
      text-decoration: underline;
    }

    .no-notifications {
      padding: 32px;
      text-align: center;
      color: var(--text-secondary);
    }

    /* Theme Toggle */
    .theme-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 8px;
      border-radius: var(--radius-lg);
      transition: all var(--transition-fast) var(--transition-ease);
    }

    .theme-btn:hover {
      background: var(--bg-tertiary);
      color: var(--primary);
    }

    /* Profile */
    .profile-wrapper {
      position: relative;
    }

    .profile-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: var(--radius-lg);
      transition: background var(--transition-fast) var(--transition-ease);
    }

    .profile-btn:hover {
      background: var(--bg-tertiary);
    }

    .profile-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: var(--font-semibold);
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .profile-name {
      font-weight: var(--font-medium);
      color: var(--text-primary);
      font-size: var(--text-sm);
    }

    .profile-role {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      text-transform: capitalize;
    }

    .profile-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      width: 240px;
      background: var(--bg-primary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      z-index: var(--z-dropdown);
    }

    .profile-header {
      padding: 16px;
      background: var(--bg-secondary);
      text-align: center;
    }

    .profile-header .profile-avatar {
      width: 48px;
      height: 48px;
      margin: 0 auto 8px;
    }

    .profile-header .profile-name {
      font-size: var(--text-base);
    }

    .profile-header .profile-email {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-top: 4px;
    }

    .profile-menu {
      padding: 8px 0;
    }

    .profile-menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      color: var(--text-primary);
      text-decoration: none;
      transition: background var(--transition-fast) var(--transition-ease);
    }

    .profile-menu-item:hover {
      background: var(--bg-tertiary);
    }

    .profile-menu-item.logout {
      color: var(--danger);
      border-top: 1px solid var(--border-light);
      margin-top: 8px;
      padding-top: 12px;
    }

    .profile-menu-item.logout:hover {
      background: var(--danger-bg);
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .header {
        left: 0;
      }

      .menu-btn {
        display: block;
      }

      .search-wrapper {
        width: 100%;
        max-width: 300px;
      }

      .search-wrapper.open {
        position: absolute;
        top: var(--header-height);
        left: 0;
        right: 0;
        padding: 16px;
        background: var(--bg-primary);
        box-shadow: var(--shadow-md);
        width: 100%;
        max-width: none;
      }

      .profile-info {
        display: none;
      }

      .notifications-dropdown {
        width: 300px;
      }
    }

    @media (max-width: 480px) {
      .notifications-dropdown {
        position: fixed;
        top: var(--header-height);
        left: 0;
        right: 0;
        width: 100%;
        margin: 0;
        border-radius: 0;
      }

      .search-wrapper {
        max-width: 200px;
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .search-box input {
        color: var(--dark-text-primary);
      }

      .notification-item.unread {
        background: var(--dark-bg-secondary);
      }

      .profile-header {
        background: var(--dark-bg-tertiary);
      }
    }

    /* Animations */
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .notifications-dropdown,
    .profile-dropdown,
    .search-results {
      animation: slideDown 0.2s var(--transition-ease);
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <header className={`header ${!toggleSidebar ? 'sidebar-collapsed' : ''}`}>
        {/* Header Left */}
        <div className="header-left">
          <button className="menu-btn" onClick={toggleSidebar}>
            <FiMenu size={20} />
          </button>

          {/* Search */}
          <div className="search-wrapper" ref={searchRef}>
            <div className="search-box" onClick={() => setSearchOpen(true)}>
              <FiSearch className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <FiXCircle size={16} />
                </button>
              )}
            </div>

            {searchOpen && searchQuery && (
              <div className="search-results">
                {searchLoading ? (
                  <div className="search-loading">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <Link
                      key={result.id}
                      to={result.path}
                      className="search-result-item"
                      onClick={() => setSearchOpen(false)}
                    >
                      <div className="result-icon">
                        <result.icon size={16} />
                      </div>
                      <div className="result-info">
                        <div className="result-title">{result.title}</div>
                        <div className="result-path">{result.path}</div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="no-notifications">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Header Right */}
        <div className="header-right">
          {/* Theme Toggle */}
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          {/* Notifications */}
          <div className="notifications-wrapper" ref={notificationsRef}>
            <button
              className="notifications-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {notificationsOpen && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button className="mark-read-btn" onClick={markAllAsRead}>
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="notifications-list">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`notification-item ${!notification.read ? 'unread': ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className={`notification-icon ${notification.type}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">{formatTime(notification.time)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">No notifications</div>
                  )}
                </div>

                <div className="notifications-footer">
                  <Link to="/notifications" className="view-all-link">
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="profile-wrapper" ref={profileRef}>
            <button
              className="profile-btn"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="profile-avatar">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="profile-info">
                <span className="profile-name">{user?.name || 'User'}</span>
                <span className="profile-role">{user?.role || 'Guest'}</span>
              </div>
              <FiChevronDown size={16} />
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="profile-name">{user?.name || 'User'}</div>
                  <div className="profile-email">{user?.email || 'user@example.com'}</div>
                </div>

                <div className="profile-menu">
                  <Link to="/profile" className="profile-menu-item">
                    <FiUser size={16} />
                    <span>My Profile</span>
                  </Link>
                  <Link to="/settings" className="profile-menu-item">
                    <FiSettings size={16} />
                    <span>Settings</span>
                  </Link>
                  <Link to="/support" className="profile-menu-item">
                    <FiHelpCircle size={16} />
                    <span>Help & Support</span>
                  </Link>
                  <button className="profile-menu-item logout" onClick={handleLogout}>
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header; 
