import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiLock,
  FiShield,
  FiEye,
  FiEyeOff,
  FiSmartphone,
  FiMail,
  FiClock,
  FiGlobe,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiKey,
  FiRefreshCw,
  FiLogOut,
  FiTrash2,
  FiInfo,
  FiSave,
  FiBell,
  FiMonitor,
  FiMapPin
} from 'react-icons/fi';

const Security = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Security Settings State
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    twoFactorMethod: 'app', // app, sms, email
    twoFactorPhone: '',
    twoFactorEmail: '',
    loginNotifications: true,
    emailNotifications: true,
    deviceNotifications: true,
    sessionTimeout: 30, // minutes
    ipWhitelist: [],
    trustedDevices: []
  });

  // Sessions State
  const [sessions, setSessions] = useState([]);
  
  // Login History
  const [loginHistory, setLoginHistory] = useState([]);

  // UI State
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFAQRCode, setTwoFAQRCode] = useState('');
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFAVerification, setTwoFAVerification] = useState('');
  
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('password'); // password, twofactor, sessions, history

  useEffect(() => {
    fetchSecurityData();
    fetchSessions();
    fetchLoginHistory();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/security`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setSecurity(response.data.security);
      }
    } catch (error) {
      toast.error('Failed to fetch security settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/sessions`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions');
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/login-history`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setLoginHistory(response.data.history);
      }
    } catch (error) {
      console.error('Failed to fetch login history');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });

    // Check password strength for new password
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleToggleChange = (field) => {
    setSecurity({
      ...security,
      [field]: !security[field]
    });
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurity({
      ...security,
      [name]: value
    });
  };

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const getPasswordStrengthScore = () => {
    return Object.values(passwordStrength).filter(Boolean).length;
  };

  const getPasswordStrengthText = () => {
    const score = getPasswordStrengthScore();
    if (score <= 2) return { text: 'Weak', color: '#dc3545', message: 'Your password is too easy to guess' };
    if (score <= 4) return { text: 'Medium', color: '#ffc107', message: 'Your password is decent but could be stronger' };
    return { text: 'Strong', color: '#28a745', message: 'Your password is very secure' };
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (getPasswordStrengthScore() < 3) {
      newErrors.newPassword = 'Password is too weak. Include uppercase, numbers, and special characters';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData.newPassword === passwordData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/change-password`,
        passwordData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordStrength({
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/2fa/setup`,
        { method: security.twoFactorMethod },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setTwoFAQRCode(response.data.qrCode);
        setTwoFASecret(response.data.secret);
        setShow2FASetup(true);
      }
    } catch (error) {
      toast.error('Failed to setup 2FA');
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFAVerification) {
      toast.error('Please enter verification code');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/2fa/verify`,
        {
          code: twoFAVerification,
          secret: twoFASecret
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setSecurity({ ...security, twoFactorEnabled: true });
        setShow2FASetup(false);
        toast.success('2FA enabled successfully');
      }
    } catch (error) {
      toast.error('Invalid verification code');
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/2fa/disable`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setSecurity({ ...security, twoFactorEnabled: false });
        toast.success('2FA disabled successfully');
      }
    } catch (error) {
      toast.error('Failed to disable 2FA');
    }
  };

  const handleTerminateSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to terminate this session?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/user/sessions/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        toast.success('Session terminated');
      }
    } catch (error) {
      toast.error('Failed to terminate session');
    }
  };

  const handleTerminateAllSessions = async () => {
    if (!window.confirm('Are you sure you want to terminate all other sessions?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/user/sessions`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setSessions(sessions.filter(s => s.isCurrent));
        toast.success('All other sessions terminated');
      }
    } catch (error) {
      toast.error('Failed to terminate sessions');
    }
  };

  const handleSaveSecuritySettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/security-settings`,
        security,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Security settings updated');
      }
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (device) => {
    if (device.includes('Mobile')) return '📱';
    if (device.includes('Tablet')) return '📟';
    if (device.includes('Mac')) return '💻';
    if (device.includes('Windows')) return '🖥️';
    return '🌐';
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading security settings...</p>
      </div>
    );
  }

  return (
    <div className="security-page">
      <div className="security-header">
        <h1>Security Settings</h1>
        <p>Manage your account security and privacy</p>
      </div>

      {/* Security Score Card */}
      <div className="security-score-card">
        <div className="score-header">
          <FiShield className="shield-icon" />
          <h3>Security Score</h3>
        </div>
        <div className="score-circle">
          <svg viewBox="0 0 36 36" className="score-svg">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e9ecef"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#667eea"
              strokeWidth="3"
              strokeDasharray={`${security.twoFactorEnabled ? 70 : 40}, 100`}
            />
          </svg>
          <div className="score-text">
            <span className="score-value">{security.twoFactorEnabled ? '70' : '40'}</span>
            <span className="score-max">/100</span>
          </div>
        </div>
        <p className="score-message">
          {security.twoFactorEnabled 
            ? 'Good security! Enable 2FA to improve further.'
            : 'Enable two-factor authentication to improve your security score.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="security-tabs">
        <button
          className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <FiKey />
          Password
        </button>
        <button
          className={`tab-btn ${activeTab === 'twofactor' ? 'active' : ''}`}
          onClick={() => setActiveTab('twofactor')}
        >
          <FiShield />
          Two-Factor Auth
        </button>
        <button
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <FiMonitor />
          Active Sessions
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FiClock />
          Login History
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="password-tab">
            <h2>Change Password</h2>
            <p className="tab-description">
              Use a strong password that you don't use for other accounts
            </p>

            <div className="form-group">
              <label>Current Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className={errors.currentPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                >
                  {showPassword.current ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.currentPassword && (
                <span className="error-message">{errors.currentPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className={errors.newPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                >
                  {showPassword.new ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.newPassword && (
                <span className="error-message">{errors.newPassword}</span>
              )}

              {/* Password Strength Meter */}
              {passwordData.newPassword && (
                <div className="password-strength">
                  <div className="strength-header">
                    <span className="strength-label">Password Strength:</span>
                    <span 
                      className="strength-value"
                      style={{ color: getPasswordStrengthText().color }}
                    >
                      {getPasswordStrengthText().text}
                    </span>
                  </div>
                  <div className="strength-bars">
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <div
                        key={bar}
                        className={`strength-bar ${bar <= getPasswordStrengthScore() ? 'active' : ''}`}
                        style={{ backgroundColor: bar <= getPasswordStrengthScore() ? getPasswordStrengthText().color : '#e9ecef' }}
                      ></div>
                    ))}
                  </div>
                  <p className="strength-message">{getPasswordStrengthText().message}</p>

                  <div className="password-requirements">
                    <p className="requirements-title">Password must contain:</p>
                    <div className="requirement-list">
                      <div className={`requirement-item ${passwordStrength.length ? 'valid' : ''}`}>
                        {passwordStrength.length ? <FiCheck /> : <FiX />}
                        At least 8 characters
                      </div>
                      <div className={`requirement-item ${passwordStrength.uppercase ? 'valid' : ''}`}>
                        {passwordStrength.uppercase ? <FiCheck /> : <FiX />}
                        At least one uppercase letter
                      </div>
                      <div className={`requirement-item ${passwordStrength.lowercase ? 'valid' : ''}`}>
                        {passwordStrength.lowercase ? <FiCheck /> : <FiX />}
                        At least one lowercase letter
                      </div>
                      <div className={`requirement-item ${passwordStrength.number ? 'valid' : ''}`}>
                        {passwordStrength.number ? <FiCheck /> : <FiX />}
                        At least one number
                      </div>
                      <div className={`requirement-item ${passwordStrength.special ? 'valid' : ''}`}>
                        {passwordStrength.special ? <FiCheck /> : <FiX />}
                        At least one special character
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                >
                  {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <button
              className="save-btn"
              onClick={handleChangePassword}
              disabled={saving}
            >
     {saving ? <FiRefreshCw className="spin" /> : <FiSave />}
              {saving ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        )}

        {/* Two-Factor Auth Tab */}
        {activeTab === 'twofactor' && (
          <div className="twofactor-tab">
            <h2>Two-Factor Authentication</h2>
            <p className="tab-description">
              Add an extra layer of security to your account
            </p>

            <div className="twofactor-status">
              <div className={`status-badge ${security.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </div>
              <p className="status-text">
                {security.twoFactorEnabled 
                  ? 'Your account is protected with 2FA'
                  : 'Enable 2FA to better protect your account'}
              </p>
            </div>

            {!security.twoFactorEnabled ? (
              !show2FASetup ? (
                <div className="twofactor-setup">
                  <h3>Choose 2FA Method</h3>
                  
                  <div className="method-options">
                    <label className="method-option">
                      <input
                        type="radio"
                        name="twoFactorMethod"
                        value="app"
                        checked={security.twoFactorMethod === 'app'}
                        onChange={handleSecurityChange}
                      />
                      <div className="method-content">
                        <span className="method-icon">📱</span>
                        <div className="method-info">
                          <span className="method-name">Authenticator App</span>
                          <span className="method-desc">Google Authenticator, Authy, etc.</span>
                        </div>
                      </div>
                    </label>

                    <label className="method-option">
                      <input
                        type="radio"
                        name="twoFactorMethod"
                        value="sms"
                        checked={security.twoFactorMethod === 'sms'}
                        onChange={handleSecurityChange}
                      />
                      <div className="method-content">
                        <span className="method-icon">📨</span>
                        <div className="method-info">
                          <span className="method-name">SMS</span>
                          <span className="method-desc">Receive codes via text message</span>
                        </div>
                      </div>
                    </label>

                    <label className="method-option">
                      <input
                        type="radio"
                        name="twoFactorMethod"
                        value="email"
                        checked={security.twoFactorMethod === 'email'}
                        onChange={handleSecurityChange}
                      />
                      <div className="method-content">
                        <span className="method-icon">📧</span>
                        <div className="method-info">
                          <span className="method-name">Email</span>
                          <span className="method-desc">Receive codes via email</span>
                        </div>
                      </div>
                    </label>
                  </div>

                  {security.twoFactorMethod === 'sms' && (
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="twoFactorPhone"
                        value={security.twoFactorPhone}
                        onChange={handleSecurityChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                  )}

                  {security.twoFactorMethod === 'email' && (
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="twoFactorEmail"
                        value={security.twoFactorEmail}
                        onChange={handleSecurityChange}
                        placeholder="Enter email address"
                      />
                    </div>
                  )}

                  <button
                    className="setup-btn"
                    onClick={handleSetup2FA}
                  >
                    Setup 2FA
                  </button>
                </div>
              ) : (
                <div className="twofactor-verify">
                  <h3>Verify 2FA Setup</h3>
                  
                  {twoFAQRCode && (
                    <div className="qr-code">
                      <img src={twoFAQRCode} alt="2FA QR Code" />
                    </div>
                  )}

                  <p className="secret-text">
                    Can't scan the QR code? Use this secret key:
                  </p>
                  <div className="secret-key">
                    <code>{twoFASecret}</code>
                  </div>

                  <div className="form-group">
                    <label>Verification Code</label>
                    <input
                      type="text"
                      value={twoFAVerification}
                      onChange={(e) => setTwoFAVerification(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                    />
                  </div>

                  <div className="verify-actions">
                    <button
                      className="verify-btn"
                      onClick={handleVerify2FA}
                    >
                      Verify & Enable
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setShow2FASetup(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="twofactor-enabled">
                <div className="enabled-info">
                  <FiCheck className="check-icon" />
                  <div className="info-text">
                    <h4>2FA is active</h4>
                    <p>Your account is protected with two-factor authentication</p>
                  </div>
                </div>

                <div className="backup-codes">
                  <h4>Backup Codes</h4>
                  <p className="backup-info">
                    Save these backup codes in a safe place. You can use them to access your account if you lose your phone.
                  </p>
                  <div className="codes-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((code) => (
                      <div key={code} className="backup-code">
                        XXXXX-XXXXX
                      </div>
                    ))}
                  </div>
                  <button className="download-codes-btn">
                    Download Backup Codes
                  </button>
                </div>

                <button
                  className="disable-btn"
                  onClick={handleDisable2FA}
                >
                  Disable 2FA
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="sessions-tab">
            <div className="sessions-header">
              <h2>Active Sessions</h2>
              <button
                className="terminate-all-btn"
                onClick={handleTerminateAllSessions}
              >
                <FiLogOut />
                Terminate All
              </button>
            </div>
            <p className="tab-description">
              Manage your active sessions across all devices
            </p>

            <div className="sessions-list">
              {sessions.map((session) => (
                <div key={session.id} className={`session-item ${session.isCurrent ? 'current' : ''}`}>
                  <div className="session-icon">
                    {getDeviceIcon(session.device)}
                  </div>
                  <div className="session-info">
                    <div className="session-device">
                      <span className="device-name">{session.device}</span>
                      {session.isCurrent && (
                        <span className="current-badge">Current</span>
                      )}
                    </div>
                    <div className="session-details">
                      <span className="session-location">
                        <FiMapPin />
                        {session.location}
                      </span>
                      <span className="session-time">
                        <FiClock />
                        Last active: {formatDate(session.lastActive)}
                      </span>
                    </div>
                    <div className="session-ip">
                      IP: {session.ip}
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      className="terminate-btn"
                      onClick={() => handleTerminateSession(session.id)}
                      title="Terminate session"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              ))}
            </div>
                          {/* Session Settings */}
            <div className="session-settings">
              <h3>Session Settings</h3>
              
              <div className="setting-item">
                <div className="setting-info">
                  <label>Auto-logout after</label>
                  <select
                    name="sessionTimeout"
                    value={security.sessionTimeout}
                    onChange={handleSecurityChange}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="240">4 hours</option>
                  </select>
                </div>
                <p className="setting-desc">
                  Automatically log out after period of inactivity
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Login History Tab */}
        {activeTab === 'history' && (
          <div className="history-tab">
            <h2>Login History</h2>
            <p className="tab-description">
              Review recent login activity on your account
            </p>

            <div className="history-list">
              {loginHistory.map((login, index) => (
                <div key={index} className="history-item">
                  <div className="history-icon">
                    {login.success ? '✅' : '❌'}
                  </div>
                  <div className="history-info">
                    <div className="history-device">
                      {login.device}
                      {!login.success && (
                        <span className="failed-badge">Failed</span>
                      )}
                    </div>
                    <div className="history-details">
                      <span className="history-location">
                        <FiMapPin />
                        {login.location}
                      </span>
                      <span className="history-time">
                        <FiClock />
                        {formatDate(login.time)}
                      </span>
                    </div>
                    <div className="history-ip">
                      IP: {login.ip}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="notification-settings">
        <h3>Security Notifications</h3>
        
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-info">
              <FiBell />
              <div>
                <label>Login Notifications</label>
                <p>Get notified when someone logs into your account</p>
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={security.loginNotifications}
                onChange={() => handleToggleChange('loginNotifications')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <FiMail />
              <div>
                <label>Email Notifications</label>
                <p>Receive security alerts via email</p>
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={security.emailNotifications}
                onChange={() => handleToggleChange('emailNotifications')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <FiSmartphone />
              <div>
                <label>Device Notifications</label>
                <p>Get alerts when new device logs in</p>
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={security.deviceNotifications}
                onChange={() => handleToggleChange('deviceNotifications')}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <button
          className="save-settings-btn"
          onClick={handleSaveSecuritySettings}
          disabled={saving}
        >
          {saving ? <FiRefreshCw className="spin" /> : <FiSave />}
          Save Notification Settings
        </button>
      </div>

      <style jsx>{`
        .security-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
        }

        .security-header {
          margin-bottom: 30px;
        }

        .security-header h1 {
          margin: 0 0 10px;
          font-size: 32px;
          color: #333;
        }

        .security-header p {
          margin: 0;
          color: #666;
        }

        /* Security Score Card */
        .security-score-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          padding: 25px;
          color: white;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .score-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .shield-icon {
          font-size: 32px;
        }

        .score-header h3 {
          margin: 0;
          font-size: 20px;
        }

        .score-circle {
          position: relative;
          width: 100px;
          height: 100px;
        }

        .score-svg {
          width: 100px;
          height: 100px;
          transform: rotate(-90deg);
        }

        .score-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .score-value {
          font-size: 28px;
          font-weight: bold;
          display: block;
        }

        .score-max {
          font-size: 12px;
          opacity: 0.8;
        }

        .score-message {
          flex: 1;
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }

        /* Tabs */
        .security-tabs {
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
        }

        .tab-content h2 {
          margin: 0 0 10px;
          font-size: 24px;
          color: #333;
        }

        .tab-description {
          margin: 0 0 30px;
          color: #666;
        }

        /* Password Tab */
        .password-tab {
          max-width: 500px;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-input-wrapper input {
          width: 100%;
          padding: 12px;
          padding-right: 40px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }

        .password-input-wrapper input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .password-input-wrapper input.error {
          border-color: #dc3545;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
        }

        .error-message {
          color: #dc3545;
          font-size: 13px;
          margin-top: 5px;
          display: block;
        }

        /* Password Strength */
        .password-strength {
          margin-top: 15px;
        }

        .strength-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        .strength-label {
          font-size: 13px;
          color: #666;
        }

        .strength-value {
          font-size: 13px;
          font-weight: 500;
        }

        .strength-bars {
          display: flex;
          gap: 5px;
          margin-bottom: 10px;
        }

        .strength-bar {
          flex: 1;
          height: 4px;
          background: #e9ecef;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .strength-bar.active {
          background: currentColor;
        }

        .strength-message {
          margin: 0 0 15px;
          font-size: 13px;
          color: #666;
        }

        .password-requirements {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
        }

        .requirements-title {
          margin: 0 0 10px;
          font-size: 13px;
          font-weight: 500;
          color: #333;
        }

        .requirement-list {
          display: grid;
          gap: 8px;
        }

        .requirement-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #999;
        }

        .requirement-item.valid {
          color: #28a745;
        }

        .requirement-item svg {
          width: 14px;
          height: 14px;
        }

        /* Two Factor Tab */
        .twofactor-status {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .status-badge {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.enabled {
          background: #28a745;
          color: white;
        }

        .status-badge.disabled {
          background: #dc3545;
          color: white;
        }

        .status-text {
          margin: 0;
          color: #666;
        }

        .method-options {
          display: grid;
          gap: 15px;
          margin-bottom: 25px;
        }

        .method-option {
          display: flex;
          align-items: center;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
        }

        .method-option input[type="radio"] {
          margin-right: 15px;
        }

        .method-content {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
        }

        .method-icon {
          font-size: 24px;
        }

        .method-info {
          display: flex;
          flex-direction: column;
        }

        .method-name {
          font-weight: 500;
          color: #333;
        }

        .method-desc {
          font-size: 12px;
          color: #999;
        }

        .qr-code {
          text-align: center;
          margin: 20px 0;
        }

        .qr-code img {
          max-width: 200px;
        }

        .secret-text {
          margin: 0 0 10px;
          font-size: 14px;
          color: #666;
        }

        .secret-key {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
        }

        .secret-key code {
          font-size: 16px;
          color: #667eea;
        }

        .enabled-info {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          background: #d4edda;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .check-icon {
          color: #28a745;
          font-size: 24px;
        }

        .info-text h4 {
          margin: 0 0 5px;
          color: #155724;
        }

        .info-text p {
          margin: 0;
          color: #155724;
        }

        .backup-codes {
          margin-bottom: 30px;
        }

        .backup-codes h4 {
          margin: 0 0 10px;
          color: #333;
        }

        .backup-info {
          margin: 0 0 15px;
          color: #666;
        }

        .codes-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 15px;
          }.backup-code {
          padding: 8px;
          background: #f8f9fa;
          border: 1px dashed #ddd;
          border-radius: 5px;
          text-align: center;
          font-family: monospace;
          font-size: 12px;
        }

        /* Sessions Tab */
        .sessions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .sessions-header h2 {
          margin: 0;
        }

        .terminate-all-btn {
          padding: 8px 16px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 5px;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        }

        .sessions-list {
          display: grid;
          gap: 15px;
          margin-bottom: 30px;
        }

        .session-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .session-item.current {
          background: #e3f2fd;
          border: 1px solid #667eea;
        }

        .session-icon {
          font-size: 24px;
        }

        .session-info {
          flex: 1;
        }

        .session-device {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 5px;
        }

        .device-name {
          font-weight: 500;
          color: #333;
        }

        .current-badge {
          padding: 2px 8px;
          background: #667eea;
          color: white;
          border-radius: 12px;
          font-size: 11px;
        }

        .session-details {
          display: flex;
          gap: 20px;
          margin-bottom: 5px;
          font-size: 12px;
          color: #666;
        }

        .session-details span {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .session-ip {
          font-size: 11px;
          color: #999;
        }

        .terminate-btn {
          width: 30px;
          height: 30px;
          background: none;
          border: 1px solid #ddd;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          cursor: pointer;
        }

        .terminate-btn:hover {
          background: #dc3545;
          color: white;
          border-color: #dc3545;
        }

        /* Login History */
        .history-list {
          display: grid;
          gap: 15px;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .history-icon {
          font-size: 20px;
        }

        .history-info {
          flex: 1;
        }

        .history-device {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
        }

        .failed-badge {
          padding: 2px 8px;
          background: #dc3545;
          color: white;
          border-radius: 12px;
          font-size: 11px;
        }

        .history-details {
          display: flex;
          gap: 20px;
          margin-bottom: 5px;
          font-size: 12px;
          color: #666;
        }

        .history-details span {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .history-ip {
          font-size: 11px;
          color: #999;
        }

        /* Notification Settings */
        .notification-settings {
          background: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .notification-settings h3 {
          margin: 0 0 20px;
          font-size: 18px;
          color: #333;
        }

        .settings-grid {
          display: grid;
          gap: 20px;
          margin-bottom: 30px;
        }

        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 0;
          border-bottom: 1px solid #e9ecef;
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .setting-info svg {
          font-size: 20px;
          color: #667eea;
        }

        .setting-info label {
          font-weight: 500;
          color: #333;
          display: block;
          margin-bottom: 5px;
        }

        .setting-info p {
          margin: 0;
          font-size: 13px;
          color: #999;
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

        /* Buttons */
        .save-btn,
        .setup-btn,
        .verify-btn,
        .disable-btn,
        .save-settings-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .save-btn,
        .setup-btn,
        .verify-btn,
        .save-settings-btn {
          background: #667eea;
          color: white;
        }

        .save-btn:hover:not(:disabled),
        .setup-btn:hover,
        .verify-btn:hover,
        .save-settings-btn:hover:not(:disabled) {
          background: #5a67d8;
        }

        .save-btn:disabled,
        .save-settings-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-btn {
          padding: 12px 24px;
          background: white;
          color: #666;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
        }

        .disable-btn {
          background: #dc3545;
          color: white;
        }

        .disable-btn:hover {
          background: #c82333;
        }

        .verify-actions {
          display: flex;
          gap: 10px;
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
          .security-header h1 {
            color: #f7fafc;
          }

          .security-header p,
          .tab-description {
            color: #e2e8f0;
          }

          .tab-content,
          .notification-settings {
            background: #2d3748;
          }

          .tab-content h2,
          .notification-settings h3,
          .form-group label,
          .device-name,
          .method-name {
            color: #f7fafc;
          }

          .form-group input {
            background: #1a202c;
            border-color: #4a5568;
            color: #f7fafc;
          }

          .session-item,
          .history-item,
          .password-requirements,
          .twofactor-status,
          .secret-key {
            background: #1a202c;
          }

          .session-item.current {
            background: #1a2a4a;
          }

          .session-details,
          .history-details,
          .setting-info p,
          .method-desc {
            color: #a0aec0;
          }

          .setting-info label {
            color: #f7fafc;
          }

          .setting-item {
            border-bottom-color: #4a5568;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .security-tabs {
            flex-wrap: wrap;
          }

          .tab-btn {
            flex: 1;
            justify-content: center;
          }

          .sessions-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }

          .codes-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .session-details,
          .history-details {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default Security;
