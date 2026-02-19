import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

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

    .forgot-password-box h2 {
      margin: 0 0 10px;
      color: #333;
      text-align: center;
      font-size: 28px;
    }

    .forgot-password-box p {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      line-height: 1.6;
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
      display: inline-block;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
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

    .btn-block {
      width: 100%;
    }

    .back-to-login {
      text-align: center;
      margin-top: 20px;
    }

    .back-to-login a {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.3s ease;
    }

    .back-to-login a:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    /* Loading spinner */
    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Success message styles */
    .success-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      color: white;
      font-size: 40px;
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

    .email-highlight {
      font-weight: 600;
      color: #667eea;
      background: #f0f4ff;
      padding: 2px 6px;
      border-radius: 4px;
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
        padding: 10px 20px;
      }
    }
  `;

  // If submitted successfully, show success message
  if (submitted) {
    return (
      <>
        <style>{styles}</style>
        <div className="forgot-password-container">
          <div className="forgot-password-box">
            <div className="success-icon">✓</div>
            <h2>Check Your Email</h2>
            <p>
              We've sent a password reset link to{' '}
              <span className="email-highlight">{email}</span>
            </p>
            <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setSubmitted(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                try again
              </button>
            </p>
            <Link to="/login" className="btn btn-primary btn-block" style={{ marginTop: '20px' }}>
              Back to Login
            </Link>
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
          <h2>Forgot Password?</h2>
          <p>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
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
              {error && <span className="error-message">{error}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="back-to-login">
            <Link to="/login">← Back to Login</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
