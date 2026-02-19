import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);
  const [resetComplete, setResetComplete] = useState(false);
  
  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Check password strength
  useEffect(() => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password)
    });
  }, [password]);

  // Calculate password strength score
  const getStrengthScore = () => {
    return Object.values(passwordStrength).filter(Boolean).length;
  };

  const getStrengthText = () => {
    const score = getStrengthScore();
    if (score <= 2) return { text: 'Weak', color: '#dc3545' };
    if (score <= 4) return { text: 'Medium', color: '#ffc107' };
    return { text: 'Strong', color: '#28a745' };
  };

  const validateForm = () => {
    if (!password) {
      toast.error('Password is required');
      return false;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/reset-password/${token}`,
        { password }
      );

      if (response.data.success) {
        setResetComplete(true);
        toast.success('Password reset successful!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
      if (error.response?.status === 400) {
        setValidToken(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const styles = `
    .reset-password-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .reset-password-box {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 450px;
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

    .reset-password-box h2 {
      margin: 0 0 10px;
      color: #333;
      font-size: 28px;
      font-weight: 600;
    }

    .reset-password-box p {
      color: #666;
      margin-bottom: 30px;
      line-height: 1.6;
      font-size: 14px;
    }

    /* Form Styles */
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

    .password-toggle {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      transition: color 0.3s ease;
    }

    .password-toggle:hover {
      color: #667eea;
    }

    /* Password Strength Meter */
    .strength-meter {
      margin: 10px 0;
    }

    .strength-bars {
      display: flex;
      gap: 5px;
      margin-bottom: 5px;
    }

    .strength-bar {
      flex: 1;
      height: 4px;
      background: #e9ecef;
      border-radius: 2px;
      transition: all 0.3s ease;
    }

    .strength-bar.active {
      background: ${getStrengthText().color};
    }

    .strength-text {
      font-size: 12px;
      color: #666;
    }

    /* Requirements List */
    .requirements {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }

    .requirement-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #666;
    }

    .requirement-item:last-child {
      margin-bottom: 0;
    }

    .requirement-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .valid-icon {
      color: #28a745;
    }

    .invalid-icon {
      color: #dc3545;
    }

    /* Button */
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

    /* Success Message */
    .success-message {
      text-align: center;
    }

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

    .success-icon svg {
      width: 40px;
      height: 40px;
      color: white;
    }

    .success-message h3 {
      margin: 0 0 10px;
      color: #333;
      font-size: 24px;
    }

    .success-message p {
      margin-bottom: 20px;
    }

    .redirect-text {
      font-size: 14px;
      color: #666;
      margin-top: 20px;
    }

    /* Invalid Token Message */
    .invalid-token {
      text-align: center;
    }

    .invalid-icon {
      width: 80px;
      height: 80px;
      background: #dc3545;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      animation: scaleIn 0.5s ease-in-out;
    }

    .invalid-icon svg {
      width: 40px;
      height: 40px;
      color: white;
    }

    .invalid-token h3 {
      margin: 0 0 10px;
      color: #333;
      font-size: 24px;
    }

    .invalid-token p {
      margin-bottom: 20px;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .reset-password-box {
        padding: 30px 20px;
      }

      .reset-password-box h2 {
        font-size: 24px;
      }

      .btn {
        padding: 10px;
      }

      .success-icon,
      .invalid-icon {
        width: 60px;
        height: 60px;
      }

      .success-icon svg,
      .invalid-icon svg {
        width: 30px;
        height: 30px;
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .reset-password-box {
        background: #2d3748;
      }

      .reset-password-box h2 {
        color: #f7fafc;
      }

      .reset-password-box p {
        color: #e2e8f0;
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

      .password-toggle {
        color: #a0aec0;
      }

      .strength-bar {
        background: #4a5568;
      }

      .requirements {
        background: #1a202c;
      }

      .requirement-item {
        color: #e2e8f0;
      }

      .success-message h3 {
        color: #f7fafc;
      }

      .invalid-token h3 {
        color: #f7fafc;
      }

      .redirect-text {
        color: #a0aec0;
      }
    }
  `;

  // Invalid Token View
  if (!validToken) {
    return (
      <>
        <style>{styles}</style>
        <div className="reset-password-container">
          <div className="reset-password-box">
            <div className="invalid-token">
              <div className="invalid-icon">
                <FiXCircle />
              </div>
              <h3>Invalid or Expired Link</h3>
              <p>
                This password reset link is no longer valid. Please request a new one.
              </p>
              <Link to="/forgot-password" className="btn btn-primary">
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Reset Complete View
  if (resetComplete) {
    return (
      <>
        <style>{styles}</style>
        <div className="reset-password-container">
          <div className="reset-password-box">
            <div className="success-message">
              <div className="success-icon">
                <FiCheckCircle />
              </div>
              <h3>Password Reset Successful!</h3>
              <p>
                Your password has been reset successfully. You will be redirected to login...
              </p>
              <div className="redirect-text">
                Redirecting in 3 seconds...
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main Reset Form
  return (
    <>
      <style>{styles}</style>
      <div className="reset-password-container">
        <div className="reset-password-box">
          <h2>Reset Password</h2>
          <p>Please enter your new password below.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              
              {/* Password Strength Meter */}
              <div className="strength-meter">
                <div className="strength-bars">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`strength-bar ${i <= getStrengthScore() ? 'active' : ''}`}
                    ></div>
                  ))}
                </div>
                <span className="strength-text" style={{ color: getStrengthText().color }}>
                  Password Strength: {getStrengthText().text}
                </span>
              </div>

              {/* Password Requirements */}
              <div className="requirements">
                <div className="requirement-item">
                  <span className="requirement-icon">
                    {passwordStrength.length ? (
                      <FiCheckCircle className="valid-icon" size={14} />
                    ) : (
                      <FiXCircle className="invalid-icon" size={14} />
                    )}
                  </span>
                  <span>At least 8 characters</span>
                </div>
                <div className="requirement-item">
                  <span className="requirement-icon">
                    {passwordStrength.uppercase ? (
                      <FiCheckCircle className="valid-icon" size={14} />
                    ) : (
                      <FiXCircle className="invalid-icon" size={14} />
                    )}
                  </span>
                  <span>At least one uppercase letter</span>
                </div>
                <div className="requirement-item">
                  <span className="requirement-icon">
                    {passwordStrength.lowercase ? (
                      <FiCheckCircle className="valid-icon" size={14} />
                    ) : (
                      <FiXCircle className="invalid-icon" size={14} />
                    )}
                  </span>
                  <span>At least one lowercase letter</span>
                </div>
                <div className="requirement-item">
                  <span className="requirement-icon">
                    {passwordStrength.number ? (
                      <FiCheckCircle className="valid-icon" size={14} />
                    ) : (
                      <FiXCircle className="invalid-icon" size={14} />
                    )}
                  </span>
                  <span>At least one number</span>
                </div>
                <div className="requirement-item">
                  <span className="requirement-icon">
                    {passwordStrength.special ? (
                      <FiCheckCircle className="valid-icon" size={14} />
                    ) : (
                      <FiXCircle className="invalid-icon" size={14} />
                    )}
                  </span>
                  <span>At least one special character</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
