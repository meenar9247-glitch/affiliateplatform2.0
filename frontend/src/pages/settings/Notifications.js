import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiBell,
  FiMail,
  FiSmartphone,
  FiDollarSign,
  FiUsers,
  FiGift,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiSettings,
  FiVolume2,
  FiVolumeX,
  FiMoon,
  FiSun,
  FiRefreshCw,
  FiSave,
  FiBellOff,
  FiMessageCircle,
  FiAward,
  FiTrendingUp,
  FiShoppingBag,
  FiStar,
  FiCalendar,
  FiInfo
} from 'react-icons/fi';

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testSending, setTestSending] = useState(false);
  
  // Notification Preferences
  const [preferences, setPreferences] = useState({
    // Email Notifications
    email: {
      earnings: true,
      withdrawals: true,
      referrals: true,
      commissions: true,
      promotions: false,
      security: true,
      newsletter: false,
      productUpdates: true,
      dailyDigest: false,
      weeklyReport: true,
      monthlyStatement: true
    },
    
    // Push Notifications
    push: {
      earnings: true,
      withdrawals: true,
      referrals: true,
      commissions: true,
      promotions: false,
      security: true,
      newProducts: true,
      leaderboard: false,
      achievements: true,
      reminders: true
    },
    
    // SMS Notifications
    sms: {
      earnings: false,
      withdrawals: true,
      security: true,
      twoFactor: true,
      promotions: false
    },
    
    // In-App Notifications
    inApp: {
      earnings: true,
      withdrawals: true,
      referrals: true,
      commissions: true,
      promotions: false,
      security: true,
      messages: true,
      system: true,
      achievements: true,
      leaderboard: true
    }
  });

  // Notification Schedule
  const [schedule, setSchedule] = useState({
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    digestFrequency: 'daily', // daily, weekly, never
    reminderTime: '09:00'
  });

  // Notification History
  const [history, setHistory] = useState([]);
  
  // Notification Stats
  const [stats, setStats] = useState({
    unread: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  // UI State
  const [activeTab, setActiveTab] = useState('preferences'); // preferences, schedule, history
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [expandedSection, setExpandedSection] = useState('all');

  useEffect(() => {
    fetchPreferences();
    fetchHistory();
    fetchStats();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/notifications/preferences`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setPreferences(response.data.preferences);
        setSchedule(response.data.schedule);
        setSoundEnabled(response.data.soundEnabled);
        setDoNotDisturb(response.data.doNotDisturb);
      }
    } catch (error) {
      toast.error('Failed to fetch notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/notifications/history?limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setHistory(response.data.history);
      }
    } catch (error) {
      console.error('Failed to fetch notification history');
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/notifications/stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch notification stats');
    }
  };

  const handlePreferenceChange = (type, key) => {
    setPreferences({
      ...preferences,
      [type]: {
        ...preferences[type],
        [key]: !preferences[type][key]
      }
    });
  };

  const handleScheduleChange = (field, value) => {
    setSchedule({
      ...schedule,
      [field]: value
    });
  };

  const handleQuietHoursChange = (field, value) => {
    setSchedule({
      ...schedule,
      quietHours: {
        ...schedule.quietHours,
        [field]: value
      }
    });
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/notifications/preferences`,
        {
          preferences,
          schedule,
          soundEnabled,
          doNotDisturb
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Notification preferences saved');
      }
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setHistory(history.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setHistory(history.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/user/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setHistory([]);
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleSendTestNotification = async () => {
    setTestSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/notifications/test`,
        { type: activeTab === 'email' ? 'email' : 'push' },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Test notification sent! Check your notifications');
      }
    } catch (error) {
      toast.error('Failed to send test notification');
    } finally {
      setTestSending(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'earnings': return <FiDollarSign />;
      case 'withdrawal': return <FiCheckCircle />;
      case 'referral': return <FiUsers />;
      case 'commission': return <FiGift />;
      case 'security': return <FiAlertCircle />;
      case 'promotion': return <FiStar />;
      case 'achievement': return <FiAward />;
      case 'product': return <FiShoppingBag />;
      case 'message': return <FiMessageCircle />;
      case 'system': return <FiInfo />;
      default: return <FiBell />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour ago`;
    if (diffDays < 7) return `${diffDays} day ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading notification settings...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="header-title">
          <h1>Notification Settings</h1>
          <p>Manage how and when you receive notifications</p>
        </div>
        
        <div className="header-actions">
          <button
            className={`sound-toggle ${soundEnabled ? 'enabled' : 'disabled'}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
            {soundEnabled ? 'Sound On' : 'Sound Off'}
          </button>
          
          <button
            className={`dnd-toggle ${doNotDisturb ? 'enabled' : ''}`}
            onClick={() => setDoNotDisturb(!doNotDisturb)}
          >
            {doNotDisturb ? <FiBellOff /> : <FiBell />}
            {doNotDisturb ? 'Do Not Disturb' : 'All Notifications'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon unread">
            <FiBell />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.unread}</span>
            <span className="stat-label">Unread</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon today">
            <FiClock />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.today}</span>
            <span className="stat-label">Today</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon week">
            <FiCalendar />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.thisWeek}</span>
            <span className="stat-label">This Week</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon month">
            <FiTrendingUp />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.thisMonth}</span>
            <span className="stat-label">This Month</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="notification-tabs">
        <button
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <FiSettings />
          Preferences
        </button>
        <button
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <FiClock />
          Schedule
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FiBell />
          History
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="preferences-tab">
            {/* Test Notification Button */}
            <div className="test-section">
              <button
                className="test-btn"
                onClick={handleSendTestNotification}
                disabled={testSending}
              >
                {testSending ? <FiRefreshCw className="spin" /> : <FiBell />}
                Send Test Notification
              </button>
              <p>Send a test notification to see how they look</p>
            </div>

            {/* Email Notifications */}
            <div className="preference-section">
              <div 
                className="section-header"
                onClick={() => setExpandedSection(expandedSection === 'email' ? 'all' : 'email')}
              >
                <FiMail className="section-icon" />
                <h3>Email Notifications</h3>
                <span className="section-toggle">
                  {expandedSection === 'email' ? '−' : '+'}
                </span>
              </div>
              
              {(expandedSection === 'all' || expandedSection === 'email') && (
                <div className="section-content">
                  <div className="preference-grid">
                    {Object.entries(preferences.email).map(([key, value]) => (
                      <div key={key} className="preference-item">
                        <div className="preference-info">
                          <span className="preference-label">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <span className="preference-desc">
                            Receive {key} notifications via email
                          </span>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => handlePreferenceChange('email', key)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Push Notifications */}
            <div className="preference-section">
              <div 
                className="section-header"
                onClick={() => setExpandedSection(expandedSection === 'push' ? 'all' : 'push')}
              >
                <FiSmartphone className="section-icon" />
                <h3>Push Notifications</h3>
                <span className="section-toggle">
                  {expandedSection === 'push' ? '−' : '+'}
                </span>
              </div>
              
              {(expandedSection === 'all' || expandedSection === 'push') && (
                <div className="section-content">
                  <div className="preference-grid">
                    {Object.entries(preferences.push).map(([key, value]) => (
                      <div key={key} className="preference-item">
                        <div className="preference-info">
                          <span className="preference-label">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <span className="preference-desc">
                            Receive {key} notifications on your device
                          </span>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => handlePreferenceChange('push', key)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SMS Notifications */}
            <div className="preference-section">
              <div 
                className="section-header"
                onClick={() => setExpandedSection(expandedSection === 'sms' ? 'all' : 'sms')}
              >
                <FiMessageCircle className="section-icon" />
                <h3>SMS Notifications</h3>
                <span className="section-toggle">
                  {expandedSection === 'sms' ? '−' : '+'}
                </span>
              </div>
              
              {(expandedSection === 'all' || expandedSection === 'sms') && (
                <div className="section-content">
                  <div className="preference-grid">
                    {Object.entries(preferences.sms).map(([key, value]) => (
                      <div key={key} className="preference-item">
                        <div className="preference-info">
                          <span className="preference-label">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <span className="preference-desc">
                            Receive {key} notifications via SMS
                          </span>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => handlePreferenceChange('sms', key)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* In-App Notifications */}
            <div className="preference-section">
              <div 
                className="section-header"
                onClick={() => setExpandedSection(expandedSection === 'inApp' ? 'all' : 'inApp')}
              >
                <FiBell className="section-icon" />
                <h3>In-App Notifications</h3>
                <span className="section-toggle">
                  {expandedSection === 'inApp' ? '−' : '+'}
                </span>
              </div>
              
              {(expandedSection === 'all' || expandedSection === 'inApp') && (
                <div className="section-content">
                  <div className="preference-grid">
                    {Object.entries(preferences.inApp).map(([key, value]) => (
                      <div key={key} className="preference-item">
                        <div className="preference-info">
                          <span className="preference-label">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                          <span className="preference-desc">
                            Show {key} notifications in-app
                          </span>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => handlePreferenceChange('inApp', key)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <button
                className="quick-action-btn"
                onClick={() => {
                  // Enable all notifications
                  const newPrefs = { ...preferences };
                  Object.keys(newPrefs).forEach(type => {
                    Object.keys(newPrefs[type]).forEach(key => {
                      newPrefs[type][key] = true;
                    });
                  });
                  setPreferences(newPrefs);
                }}
              >
                Enable All
              </button>
              <button
                className="quick-action-btn"
                onClick={() => {
                  // Disable all non-essential notifications
                  const newPrefs = { ...preferences };
                  Object.keys(newPrefs).forEach(type => {
                    Object.keys(newPrefs[type]).forEach(key => {
                      if (!['earnings', 'withdrawals', 'security'].includes(key)) {
                        newPrefs[type][key] = false;
                      }
                    });
                  });
                  setPreferences(newPrefs);
                }}
              >
                Essential Only
              </button>
              <button
                className="quick-action-btn"
                onClick={() => {
                  // Reset to defaults
                  fetchPreferences();
                }}
              >
                Reset to Default
              </button>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="schedule-tab">
            <h2>Notification Schedule</h2>
            <p className="tab-description">
              Control when you receive notifications
            </p>

            {/* Quiet Hours */}
            <div className="schedule-section">
              <h3>
                <FiMoon />
                Quiet Hours
              </h3>
              
              <div className="quiet-hours-toggle">
                <span>Enable Quiet Hours</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={schedule.quietHours.enabled}
                    onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              {schedule.quietHours.enabled && (
                <div className="quiet-hours-inputs">
                  <div className="time-input">
                    <label>From</label>
                    <input
                      type="time"
                      value={schedule.quietHours.start}
                      onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                    />
                  </div>
                  <div className="time-input">
                    <label>To</label>
                    <input
                      type="time"
                      value={schedule.quietHours.end}
                      onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <p className="input-hint">
                During quiet hours, you won't receive any non-critical notifications
              </p>
            </div>

            {/* Digest Frequency */}
            <div className="schedule-section">
              <h3>
                <FiMail />
                Email Digest
              </h3>
              
              <div className="digest-options">
                <label className="digest-option">
                  <input
                    type="radio"
                    name="digest"
                    value="daily"
                    checked={schedule.digestFrequency === 'daily'}
                    onChange={(e) => handleScheduleChange('digestFrequency', e.target.value)}
                  />
                  <div className="option-content">
                    <span className="option-title">Daily Digest</span>
                    <span className="option-desc">Receive a daily summary of your activity</span>
                  </div>
                </label>

                <label className="digest-option">
                  <input
                    type="radio"
                    name="digest"
                    value="weekly"
                    checked={schedule.digestFrequency === 'weekly'}
                    onChange={(e) => handleScheduleChange('digestFrequency', e.target.value)}
                  />
                  <div className="option-content">
                    <span className="option-title">Weekly Digest</span>
                    <span className="option-desc">Receive a weekly summary every Monday</span>
                  </div>
                </label>

                <label className="digest-option">
                  <input
                    type="radio"
                    name="digest"
                    value="never"
                    checked={schedule.digestFrequency === 'never'}
                    onChange={(e) => handleScheduleChange('digestFrequency', e.target.value)}
                  />
                  <div className="option-content">
                    <span className="option-title">No Digest</span>
                    <span className="option-desc">Receive individual notifications only</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Daily Reminder Time */}
            <div className="schedule-section">
              <h3>
                <FiClock />
                Daily Reminder Time
              </h3>
              
              <div className="reminder-input">
                <input
                  type="time"
                  value={schedule.reminderTime}
                  onChange={(e) => handleScheduleChange('reminderTime', e.target.value)}
                />
              </div>
              <p className="input-hint">
                Set the time for daily reminders and notifications
              </p>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="history-tab">
            <div className="history-header">
              <h2>Notification History</h2>
              <div className="history-actions">
                <button
                  className="mark-read-btn"
                  onClick={handleMarkAllAsRead}
                >
                  Mark All Read
                </button>
                <button
                  className="clear-btn"
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="empty-state">
                <FiBell className="empty-icon" />
                <h3>No notifications yet</h3>
                <p>When you receive notifications, they'll appear here</p>
              </div>
            ) : (
              <div className="history-list">
                {history.map((notification) => (
                  <div
                    key={notification.id}
                    className={`history-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className={`notification-icon ${notification.type}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="notification-content">
                      <div className="notification-header">
                        <h4>{notification.title}</h4>
                        <span className="notification-time">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      
                      {notification.data && (
                        <div className="notification-meta">
                          {notification.data.amount && (
                            <span className="meta-badge amount">
                              ${notification.data.amount}
                            </span>
                          )}
                          {notification.data.status && (
                            <span className={`meta-badge status ${notification.data.status}`}>
                              {notification.data.status}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {!notification.read && (
                      <span className="unread-dot"></span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {history.length >= 20 && (
              <button className="load-more-btn">
                Load More
              </button>
            )}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="save-section">
        <button
          className="save-btn"
          onClick={handleSavePreferences}
          disabled={saving}
        >
          {saving ? <FiRefreshCw className="spin" /> : <FiSave />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <style jsx>{`
        .notifications-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
        }

        /* Header */
        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header-title h1 {
          margin: 0 0 10px;
          font-size: 32px;
          color: #333;
        }

        .header-title p {
          margin: 0;
          color: #666;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .sound-toggle,
        .dnd-toggle {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .sound-toggle.enabled {
          background: #667eea;
          color: white;
        }

        .sound-toggle.disabled {
          background: #e9ecef;
          color: #666;
        }

        .dnd-toggle {
          background: #e9ecef;
          color: #666;
        }

        .dnd-toggle.enabled {
          background: #dc3545;
          color: white;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .stat-icon.unread {
          background: #fee;
          color: #dc3545;
        }

        .stat-icon.today {
          background: #e3f2fd;
          color: #2196f3;
        }

        .stat-icon.week {
          background: #e8f5e9;
          color: #4caf50;
        }

        .stat-icon.month {
          background: #fff3e0;
          color: #ff9800;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
        }

        .stat-label {
          font-size: 13px;
          color: #666;
        }

        /* Tabs */
        .notification-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 10px;
        }

        .tab-btn {
          padding: 10px 20px;
          background: none;
          border: none;
          border-radius: 8px;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .tab-btn:hover {
          background: #f8f9fa;
        }

        .tab-btn.active {
          background: #667eea;
          color: white;
        }

        /* Tab Content */
        .tab-content {
          background: white;
          border-radius: 10px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          min-height: 500px;
        }

        /* Preferences Tab */
        .test-section {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .test-btn {
          padding: 12px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          margin-bottom: 10px;
        }

        .test-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .test-section p {
          margin: 0;
          color: #666;
          font-size: 13px;
        }

        .preference-section {
          margin-bottom: 25px;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          overflow: hidden;
        }

        .section-header {
          padding: 15px 20px;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .section-icon {
          color: #667eea;
          font-size: 20px;
        }

        .section-header h3 {
          flex: 1;
          margin: 0;
          font-size: 16px;
          color: #333;
        }

        .section-toggle {
          font-size: 24px;
          color: #999;
        }

        .section-content {
          padding: 20px;
        }

        .preference-grid {
          display: grid;
          gap: 15px;
        }

        .preference-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e9ecef;
        }

        .preference-item:last-child {
          border-bottom: none;
        }

        .preference-info {
          flex: 1;
        }

        .preference-label {
          display: block;
          font-weight: 500;
          color: #333;
          margin-bottom: 3px;
        }

        .preference-desc {
          font-size: 12px;
          color: #999;
        }

        /* Quick Actions */
        .quick-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }

        .quick-action-btn {
          padding: 8px 16px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          color: #666;
          cursor: pointer;
          font-size: 13px;
        }

        .quick-action-btn:hover {
          background: #f8f9fa;
          border-color: #667eea;
          color: #667eea;
        }

        /* Schedule Tab */
        .schedule-tab h2 {
          margin: 0 0 10px;
          font-size: 24px;
          color: #333;
        }

        .tab-description {
          margin: 0 0 30px;
          color: #666;
        }

        .schedule-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .schedule-section h3 {
          margin: 0 0 20px;
          font-size: 18px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .schedule-section h3 svg {
          color: #667eea;
        }

        .quiet-hours-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .quiet-hours-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .time-input label {
          display: block;
          margin-bottom: 5px;
          font-size: 13px;
          color: #666;
        }

        .time-input input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }

        .input-hint {
          margin: 10px 0 0;
          font-size: 12px;
          color: #999;
        }

        .digest-options {
          display: grid;
          gap: 10px;
        }

        .digest-option {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
        }

        .digest-option input[type="radio"] {
          width: 18px;
          height: 18px;
        }

        .option-content {
          flex: 1;
        }

        .option-title {
          display: block;
          font-weight: 500;
          color: #333;
          margin-bottom: 3px;
        }

        .option-desc {
          font-size: 12px;
          color: #999;
        }

        .reminder-input {
          max-width: 200px;
        }

        .reminder-input input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }

        /* History Tab */
        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .history-header h2 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }

        .history-actions {
          display: flex;
          gap: 10px;
        }

        .mark-read-btn,
        .clear-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 13px;
        }

        .mark-read-btn {
          background: #667eea;
          color: white;
        }

        .clear-btn {
          background: #dc3545;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 48px;
          color: #ddd;
          margin-bottom: 15px;
        }

        .empty-state h3 {
          margin: 0 0 10px;
          color: #666;
        }

        .empty-state p {
          margin: 0;
          color: #999;
        }

        .history-list {
          display: grid;
          gap: 10px;
        }

        .history-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          cursor: pointer;
          position: relative;
        }

        .history-item.unread {
          background: #e3f2fd;
        }

        .notification-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .notification-icon.earnings {
          background: #e8f5e9;
          color: #4caf50;
        }

        .notification-icon.withdrawal {
          background: #fff3e0;
          color: #ff9800;
        }

        .notification-icon.referral {
          background: #e3f2fd;
          color: #2196f3;
        }

        .notification-icon.security {
          background: #ffebee;
          color: #f44336;
        }

        .notification-content {
          flex: 1;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }

        .notification-header h4 {
          margin: 0;
          font-size: 15px;
          color: #333;
        }

        .notification-time {
          font-size: 11px;
          color: #999;
        }

        .notification-message {
          margin: 0 0 8px;
          font-size: 13px;
          color: #666;
        }

        .notification-meta {
          display: flex;
          gap: 8px;
        }

        .meta-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
        }

        .meta-badge.amount {
          background: #e8f5e9;
          color: #4caf50;
        }

        .meta-badge.status {
          background: #e3f2fd;
          color: #2196f3;
        }

        .meta-badge.status.completed {
          background: #e8f5e9;
          color: #4caf50;
        }

        .meta-badge.status.pending {
          background: #fff3e0;
          color: #ff9800;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #2196f3;
          border-radius: 50%;
          position: absolute;
          top: 15px;
          right: 15px;
        }

        .load-more-btn {
          width: 100%;
          padding: 12px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          color: #666;
          cursor: pointer;
          margin-top: 20px;
        }

        .load-more-btn:hover {
          background: #f8f9fa;
          border-color: #667eea;
          color: #667eea;
        }

        /* Save Section */
        .save-section {
          display: flex;
          justify-content: flex-end;
        }

        .save-btn {
          padding: 12px 30px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .save-btn:hover:not(:disabled) {
          background: #218838;
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Switch */
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.3s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: '';
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #667eea;
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 60px 20px;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          .header-title h1,
          .stat-value,
          .section-header h3,
          .preference-label,
          .schedule-tab h2,
          .history-header h2 {
            color: #f7fafc;
          }

          .header-title p,
          .stat-label,
          .tab-description,
          .preference-desc,
          .option-desc,
          .input-hint,
          .notification-time,
          .notification-message {
            color: #e2e8f0;
          }

          .tab-content,
          .stat-card,
          .digest-option {
            background: #2d3748;
          }

          .preference-section {
            border-color: #4a5568;
          }

          .section-header {
            background: #1a202c;
          }

          .section-header h3 {
            color: #f7fafc;
          }

          .preference-item {
            border-bottom-color: #4a5568;
          }

          .schedule-section,
          .test-section,
          .history-item {
            background: #1a202c;
          }

          .time-input input,
          .reminder-input input {
            background: #2d3748;
            border-color: #4a5568;
            color: #f7fafc;
          }

          .quick-action-btn,
          .load-more-btn {
            background: #2d3748;
            border-color: #4a5568;
            color: #e2e8f0;
          }

          .quick-action-btn:hover,
          .load-more-btn:hover {
            background: #1a202c;
          }

          .history-item.unread {
            background: #1a2a4a;
          }

          .notification-header h4 {
            color: #f7fafc;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .notification-tabs {
            flex-wrap: wrap;
          }

          .tab-btn {
            flex: 1;
            justify-content: center;
          }

          .quiet-hours-inputs {
            grid-template-columns: 1fr;
          }

          .history-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }

          .history-actions {
            width: 100%;
          }

          .mark-read-btn,
          .clear-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Notifications;
  
