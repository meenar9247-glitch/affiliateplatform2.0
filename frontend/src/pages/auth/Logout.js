import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FiLogOut, FiCheckCircle, FiXCircle, FiLoader, FiHome, FiLogIn } from 'react-icons/fi';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [status, setStatus] = useState('logging-out'); // logging-out, success, error
  const [countdown, setCountdown] = useState(5);
  const [error, setError] = useState('');

  useEffect(() => {
    handleLogout();
  }, []);

  useEffect(() => {
    let timer;
    if (status === 'success' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (status === 'success' && countdown === 0) {
      navigate('/login');
    }
    return () => clearTimeout(timer);
  }, [status, countdown, navigate]);

  const handleLogout = async () => {
    try {
      setStatus('logging-out');
      await logout();
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Failed to logout. Please try again.');
    }
  };

  const handleManualRedirect = () => {
    navigate('/login');
  };

  const handleRetry = () => {
    setStatus('logging-out');
    setError('');
    handleLogout();
  };

  // Styles
  const styles = `
    .logout-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .logout-container::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: rotate 20s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .logout-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
      text-align: center;
      animation: fadeIn 0.5s ease-in-out;
      position: relative;
      z-index: 1;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Icon Styles */
    .logout-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .logout-icon.logging-out {
      color: #667eea;
      animation: spin 2s linear infinite;
    }

    .logout-icon.success {
      color: #28a745;
    }

    .logout-icon.error {
      color: #dc3545;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Title */
    .logout-title {
      margin: 0 0 10px;
      color: #333;
      font-size: 28px;
      font-weight: 600;
    }

    .logout-message {
      color: #666;
      margin-bottom: 30px;
      line-height: 1.6;
    }

    /* Progress Bar */
    .progress-bar {
      width: 100%;
      height: 4px;
      background: #e9ecef;
      border-radius: 2px;
      margin: 20px 0;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 1s linear;
    }

    /* Countdown */
    .countdown {
      font-size: 48px;
      font-weight: 700;
      color: #667eea;
      margin: 20px 0;
    }

    .countdown-label {
      color: #666;
      font-size: 14px;
    }

    /* Buttons */
    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .btn {
      flex: 1;
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a67d8;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-secondary:hover {
      background: #e9ecef;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    /* Error Message */
    .error-message {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 5px;
      padding: 15px;
      color: #721c24;
      margin: 20px 0;
    }

    /* Tips */
    .tips-section {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
      text-align: left;
    }

    .tips-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
    }

    .tips-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .tip-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .tip-icon {
      color: #667eea;
      font-size: 16px;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .logout-card {
        background: #2d3748;
      }

      .logout-title {
        color: #f7fafc;
      }

      .logout-message {
        color: #e2e8f0;
      }

      .progress-bar {
        background: #4a5568;
      }

      .countdown {
        color: #90cdf4;
      }

      .countdown-label {
        color: #a0aec0;
      }

      .btn-secondary {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .btn-secondary:hover {
        background: #2d3748;
      }

      .tips-section {
        border-top-color: #4a5568;
      }

      .tips-title {
        color: #f7fafc;
      }

      .tip-item {
        color: #e2e8f0;
      }

      .tip-icon {
        color: #90cdf4;
      }
    }

    /* Responsive */
    @media (max-width: 480px) {
      .logout-card {
        padding: 30px 20px;
      }

      .logout-title {
        font-size: 24px;
      }

      .countdown {
        font-size: 36px;
      }

      .button-group {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `;

  // Render different states
  const renderContent = () => {
    switch (status) {
      case 'logging-out':
        return (
          <>
            <FiLoader className="logout-icon logging-out" />
            <h2 className="logout-title">Logging Out</h2>
            <p className="logout-message">
              Please wait while we securely log you out...
            </p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '60%' }} />
            </div>
            <div className="tips-section">
              <h3 className="tips-title">💡 Tips</h3>
              <ul className="tips-list">
                <li className="tip-item">
                  <FiCheckCircle className="tip-icon" />
                  Clearing your session data
                </li>
                <li className="tip-item">
                  <FiCheckCircle className="tip-icon" />
                  Removing authentication tokens
                </li>
                <li className="tip-item">
                  <FiCheckCircle className="tip-icon" />
                  Redirecting to login page
                </li>
              </ul>
            </div>
          </>
        );

      case 'success':
        return (
          <>
            <FiCheckCircle className="logout-icon success" />
            <h2 className="logout-title">Logged Out Successfully!</h2>
            <p className="logout-message">
              You have been securely logged out of your account.
            </p>
            <div className="countdown">{countdown}</div>
            <p className="countdown-label">Redirecting to login page...</p>
            <div className="button-group">
              <Link to="/login" className="btn btn-primary">
                <FiLogIn /> Go to Login
              </Link>
              <Link to="/" className="btn btn-secondary">
                <FiHome /> Home
              </Link>
            </div>
          </>
        );

      case 'error':
        return (
          <>
            <FiXCircle className="logout-icon error" />
            <h2 className="logout-title">Logout Failed</h2>
            <p className="logout-message">{error}</p>
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
            <div className="button-group">
              <button onClick={handleRetry} className="btn btn-danger">
                <FiLogOut /> Retry Logout
              </button>
              <Link to="/" className="btn btn-secondary">
                <FiHome /> Go to Home
              </Link>
            </div>
            <div className="tips-section">
              <h3 className="tips-title">🔧 Troubleshooting</h3>
              <ul className="tips-list">
                <li className="tip-item">
                  <FiXCircle className="tip-icon" style={{ color: '#dc3545' }} />
                  Check your internet connection
                </li>
                <li className="tip-item">
                  <FiXCircle className="tip-icon" style={{ color: '#dc3545' }} />
                  Clear browser cache and cookies
                </li>
                <li className="tip-item">
                  <FiXCircle className="tip-icon" style={{ color: '#dc3545' }} />
                  Try using incognito mode
                </li>
              </ul>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="logout-container">
        <div className="logout-card">
          {renderContent()}
        </div>
      </div>
    </>
  );
};

// Immediate Logout Component (redirects immediately)
export const ImmediateLogout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      navigate('/login');
    };
    performLogout();
  }, [logout, navigate]);

  const styles = `
    .immediate-logout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .immediate-logout-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      text-align: center;
    }

    .immediate-logout-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .immediate-logout-text {
      color: #333;
      font-size: 18px;
      margin: 0;
    }

    @media (prefers-color-scheme: dark) {
      .immediate-logout-card {
        background: #2d3748;
      }

      .immediate-logout-text {
        color: #f7fafc;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="immediate-logout">
        <div className="immediate-logout-card">
          <div className="immediate-logout-spinner" />
          <p className="immediate-logout-text">Logging out...</p>
        </div>
      </div>
    </>
  );
};

// Session Expired Component
export const SessionExpired = () => {
  const navigate = useNavigate();

  const styles = `
    .session-expired {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .session-expired-card {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 400px;
    }

    .session-expired-icon {
      font-size: 64px;
      color: #ffc107;
      margin-bottom: 20px;
    }

    .session-expired-title {
      margin: 0 0 10px;
      color: #333;
      font-size: 28px;
    }

    .session-expired-message {
      color: #666;
      margin-bottom: 30px;
      line-height: 1.6;
    }

    .session-expired-buttons {
      display: flex;
      gap: 10px;
    }

    .session-expired-btn {
      flex: 1;
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .session-expired-btn.primary {
      background: #667eea;
      color: white;
    }

    .session-expired-btn.primary:hover {
      background: #5a67d8;
    }

    .session-expired-btn.secondary {
      background: #f8f9fa;
      color: #666;
    }

    .session-expired-btn.secondary:hover {
      background: #e9ecef;
    }

    @media (prefers-color-scheme: dark) {
      .session-expired-card {
        background: #2d3748;
      }

      .session-expired-title {
        color: #f7fafc;
      }

      .session-expired-message {
        color: #e2e8f0;
      }

      .session-expired-btn.secondary {
        background: #1a202c;
        color: #e2e8f0;
      }
    }

    @media (max-width: 480px) {
      .session-expired-buttons {
        flex-direction: column;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="session-expired">
        <div className="session-expired-card">
          <FiClock className="session-expired-icon" />
          <h2 className="session-expired-title">Session Expired</h2>
          <p className="session-expired-message">
            Your session has expired due to inactivity. Please log in again to continue.
          </p>
          <div className="session-expired-buttons">
            <Link to="/login" className="session-expired-btn primary">
              Log In Again
            </Link>
            <Link to="/" className="session-expired-btn secondary">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Logout;
