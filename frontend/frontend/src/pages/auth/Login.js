import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        formData
      );

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const styles = `
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-box {
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

    .login-box h2 {
      margin: 0 0 10px;
      color: #333;
      text-align: center;
      font-size: 28px;
    }

    .login-box p {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
    }

    .form-group {
      margin-bottom: 20px;
      position: relative;
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

    .password-input {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      font-size: 14px;
    }

    .password-toggle:hover {
      color: #667eea;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #666;
      cursor: pointer;
    }

    .remember-me input {
      width: auto;
      margin-right: 5px;
    }

    .forgot-link {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
    }

    .forgot-link:hover {
      text-decoration: underline;
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
      width: 100%;
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

    .register-link {
      text-align: center;
      margin-top: 20px;
      color: #666;
    }

    .register-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    .social-login {
      margin-top: 30px;
      text-align: center;
    }

    .social-login p {
      margin-bottom: 15px;
      color: #999;
      position: relative;
    }

    .social-login p::before,
    .social-login p::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 30%;
      height: 1px;
      background: #ddd;
    }

    .social-login p::before {
      left: 0;
    }

    .social-login p::after {
      right: 0;
    }

    .btn-google {
      background: #db4437;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 5px;
      cursor: pointer;
      width: 100%;
      font-size: 16px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-google:hover {
      background: #c53929;
      transform: translateY(-2px);
    }

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

    .error-message {
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .login-box {
        padding: 30px 20px;
      }

      .form-options {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }

      .social-login p::before,
      .social-login p::after {
        width: 25%;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="login-container">
        <div className="login-box">
          <h2>Welcome Back</h2>
          <p>Please login to your account</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="register-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>

          <div className="social-login">
            <p>Or continue with</p>
            <button className="btn-google">
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
