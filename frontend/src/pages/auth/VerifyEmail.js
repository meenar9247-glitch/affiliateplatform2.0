import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiLoader, 
  FiMail, 
  FiArrowLeft,
  FiRefreshCw,
  FiSend
} from 'react-icons/fi';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setVerifying(false);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let timer;
    if (resending) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResending(false);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resending]);

  const verifyEmail = async () => {
    setLoading(true);
    setVerifying(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/verify-email/${token}`
      );

      if (response.data.success) {
        setVerified(true);
        toast.success('Email verified successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
      toast.error('Email verification failed');
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setResending(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/resend-verification`,
        { email }
      );

      if (response.data.success) {
        toast.success('Verification email resent! Please check your inbox.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
      setResending(false);
    }
  };

  // Styles
  const styles = `
    .verify-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .verify-container::before {
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

    .verify-box {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 450px;
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

    .verify-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .verify-icon.loading {
      color: #667eea;
      animation: spin 2s linear infinite;
    }

    .verify-icon.success {
      color: #28a745;
    }

    .verify-icon.error {
      color: #dc3545;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .verify-box h2 {
      margin: 0 0 10px;
      color: #333;
      font-size: 28px;
    }

    .verify-box p {
      margin: 0 0 20px;
      color: #666;
      line-height: 1.6;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
      margin-bottom: 20px;
      transition: color 0.3s ease;
    }

    .back-link:hover {
      color: #764ba2;
    }

    /* Form Styles */
    .form-group {
      margin-bottom: 20px;
      text-align: left;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .form-group input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }

    .btn {
      display: inline-block;
      padding: 12px 24px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
      width: 100%;
    }

    .btn:hover:not(:disabled) {
      background: #5a67d8;
      transform: translateY(-2px);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e9ecef;
    }

    .countdown {
      margin-top: 10px;
      font-size: 14px;
      color: #999;
    }

    .info-text {
      margin-top: 20px;
      font-size: 14px;
      color: #999;
    }

    .info-text a {
      color: #667eea;
      text-decoration: none;
    }

    .info-text a:hover {
      text-decoration: underline;
    }

    .success-message {
      margin-top: 20px;
      padding: 15px;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 5px;
      color: #155724;
    }

    .error-message {
      margin-top: 20px;
      padding: 15px;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 5px;
      color: #721c24;
    }

    .resend-section {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .verify-box {
        background: #2d3748;
      }

      .verify-box h2 {
        color: #f7fafc;
      }

      .verify-box p,
      .form-group label {
        color: #e2e8f0;
      }

      .form-group input {
        background: #1a202c;
        border-color: #4a5568;
        color: #f7fafc;
      }

      .btn-secondary {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .btn-secondary:hover:not(:disabled) {
        background: #2d3748;
      }

      .info-text {
        color: #a0aec0;
      }

      .resend-section {
        border-top-color: #4a5568;
      }
    }

    /* Responsive */
    @media (max-width: 480px) {
      .verify-box {
        padding: 30px 20px;
      }

      .verify-box h2 {
        font-size: 24px;
      }

      .verify-icon {
        font-size: 48px;
      }

      .btn {
        padding: 10px;
      }
    }
  `;

  // Loading State
  if (loading && verifying) {
    return (
      <>
        <style>{styles}</style>
        <div className="verify-container">
          <div className="verify-box">
            <FiLoader className="verify-icon loading" />
            <h2>Verifying Email</h2>
            <p>Please wait while we verify your email address...</p>
          </div>
        </div>
      </>
    );
  }

  // Success State
  if (verified) {
    return (
      <>
        <style>{styles}</style>
        <div className="verify-container">
          <div className="verify-box">
            <FiCheckCircle className="verify-icon success" />
            <h2>Email Verified!</h2>
            <p>Your email has been successfully verified.</p>
            <div className="success-message">
              <p>✓ You can now access all features of your account.</p>
              <p>✓ You'll be redirected to login in a moment.</p>
            </div>
            <Link to="/login" className="btn" style={{ marginTop: '20px' }}>
              Go to Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Error State (with token)
  if (token && error) {
    return (
      <>
        <style>{styles}</style>
        <div className="verify-container">
          <div className="verify-box">
            <Link to="/login" className="back-link">
              <FiArrowLeft /> Back to Login
            </Link>
            
            <FiXCircle className="verify-icon error" />
            <h2>Verification Failed</h2>
            <p>{error || 'Invalid or expired verification link'}</p>
            
            <div className="error-message">
              <p>❌ The verification link may have expired or is invalid.</p>
              <p>❌ Please request a new verification email.</p>
            </div>

            <div className="resend-section">
              <h3 style={{ marginBottom: '15px' }}>Resend Verification Email</h3>
              <form onSubmit={handleResendVerification}>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={resending}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn"
                  disabled={resending}
                >
                  {resending ? (
                    <>
                      <FiLoader className="spin" /> Resend in {countdown}s
                    </>
                  ) : (
                    <>
                      <FiSend /> Resend Verification
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="info-text">
              <p>
                Need help? <Link to="/support">Contact Support</Link>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // No token state (manual verification request)
  return (
    <>
      <style>{styles}</style>
      <div className="verify-container">
        <div className="verify-box">
          <Link to="/login" className="back-link">
            <FiArrowLeft /> Back to Login
          </Link>

          <FiMail className="verify-icon" style={{ color: '#667eea' }} />
          <h2>Verify Your Email</h2>
          <p>Please enter your email address to receive a verification link.</p>

          <form onSubmit={handleResendVerification}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={resending}
                autoFocus
              />
            </div>

            <button 
              type="submit" 
              className="btn"
              disabled={resending}
            >
              {resending ? (
                <>
                  <FiLoader className="spin" /> Sending... {countdown}s
                </>
              ) : (
                <>
                  <FiSend /> Send Verification Email
                </>
              )}
            </button>
          </form>

          {resending && (
            <p className="countdown">
              Please wait {countdown} seconds before requesting again.
            </p>
          )}

          <div className="info-text">
            <p>
              Already verified? <Link to="/login">Sign in</Link>
            </p>
            <p>
              Didn't receive the email? Check your spam folder.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;
