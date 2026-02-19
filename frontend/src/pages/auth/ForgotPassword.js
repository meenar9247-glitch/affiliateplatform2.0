import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/forgot-password`,
        { email }
      );

      if (response.data.success) {
        setSubmitted(true);
        toast.success('Password reset email sent! Please check your inbox.');
      } else {
        toast.error(response.data.message || 'Failed to send reset email');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const styles = `
    .forgot-password-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .forgot-password-box {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
      animation: fadeIn 0.5s ease-in-out;
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

    .forgot-password-box h2 {
      margin: 0 0 10px;
      color: #333;
      font-size: 28px;
      font-weight: 600;
    }

    .forgot-password-box p {
      color: #666;
      margin-bottom: 30px;
      line-height: 1.6;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #333;
      font-weight: 500;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 12px;
      color: #999;
    }

    .form-group input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-group input.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
      display: block;
    }

    .btn {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-loading {
      position: relative;
      color: transparent;
    }

    .btn-loading::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      margin: -10px 0 0 -10px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Success Message Styles */
    .success-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      animation: scaleIn 0.5s ease-in-out;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
      }
      to {
        transform: scale(1);
      }
    }

    .success-icon svg {
      width: 40px;
      height: 40px;
      color: white;
    }

    .email-highlight {
      font-weight: 600;
      color: #667eea;
      background: #f0f4ff;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .success-message {
      text-align: center;
    }

    .success-message h3 {
      margin: 0 0 10px;
      color: #333;
      font-size: 24px;
    }

    .success-message p {
      margin-bottom: 20px;
      font-size: 14px;
    }

    .try-again-btn {
      background: none;
      border: none;
      color: #667eea;
      text-decoration: underline;
      cursor: pointer;
      font-size: 14px;
      transition: color 0.3s ease;
    }

    .try-again-btn:hover {
      color: #764ba2;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .info-text {
      margin-top: 20px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }

    .info-text a {
      color: #667eea;
      text-decoration: none;
    }

    .info-text a:hover {
      text-decoration: underline;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .forgot-password-box {
        padding: 30px 20px;
      }

      .forgot-password-box h2 {
        font-size: 24px;
      }

      .btn {
        padding: 10px;
      }

      .success-icon {
        width: 60px;
        height: 60px;
      }

      .success-icon svg {
        width: 30px;
        height: 30px;
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .forgot-password-box {
        background: #2d3748;
      }

      .forgot-password-box h2 {
        color: #f7fafc;
      }

      .forgot-password-box p {
        color: #e2e8f0;
      }

      .back-link {
        color: #90cdf4;
      }

      .form-group label {
        color: #e2e8f0;
      }

      .form-group input {
        background: #1a202c;
        border-color: #4a5568;
        color: #f7fafc;
      }

      .form-group input:focus {
        border-color: #90cdf4;
      }

      .success-message h3 {
        color: #f7fafc;
      }

      .email-highlight {
        background: #4a5568;
        color: #90cdf4;
      }

      .info-text {
        color: #a0aec0;
      }
    }
  `;

  if (submitted) {
    return (
      <>
        <style>{styles}</style>
        <div className="forgot-password-container">
          <div className="forgot-password-box">
            <div className="success-icon">
              <FiCheckCircle />
            </div>
            <div className="success-message">
              <h3>Check Your Email</h3>
              <p>
                We've sent a password reset link to{' '}
                <span className="email-highlight">{email}</span>
              </p>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSubmitted(false)}
                  className="try-again-btn"
                >
                  try again
                </button>
              </p>
              <Link to="/login" className="btn btn-secondary" style={{ marginTop: '20px' }}>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="forgot-password-container">
        <div className="forgot-password-box">
          <Link to="/login" className="back-link">
            <FiArrowLeft /> Back to Login
          </Link>
          
          <h2>Forgot Password?</h2>
          <p>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your email"
                  className={error ? 'error' : ''}
                  disabled={loading}
                  autoFocus
                />
              </div>
              {error && <span className="error-message">{error}</span>}
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="info-text">
            <p>
              Remember your password? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
