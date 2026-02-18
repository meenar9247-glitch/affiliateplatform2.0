import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
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
        `${process.env.REACT_APP_API_URL}/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          referralCode: formData.referralCode || undefined
        }
      );

      if (response.data.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Create Account</h2>
        <p>Join our affiliate platform today</p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="referralCode">Referral Code (Optional)</label>
            <input
              type="text"
              id="referralCode"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="Enter referral code if you have one"
            />
          </div>

          <div className="terms">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
              <Link to="/privacy">Privacy Policy</Link>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>

        <div className="social-register">
          <p>Or register with</p>
          <button className="btn btn-google">
            <i className="fab fa-google"></i> Google
          </button>
        </div>
      </div>
    </div>
  );
};

// Optional CSS if not already in index.css
const styles = `
  .register-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
  }

  .register-box {
    background: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 500px;
  }

  .register-box h2 {
    margin: 0 0 10px;
    color: #333;
    text-align: center;
  }

  .register-box p {
    text-align: center;
    color: #666;
    margin-bottom: 30px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .register-form .form-group {
    margin-bottom: 20px;
  }

  .register-form label {
    display: block;
    margin-bottom: 5px;
    color: #333;
    font-weight: 500;
  }

  .register-form input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
  }

  .register-form input:focus {
    outline: none;
    border-color: #667eea;
  }

  .terms {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 20px 0;
  }

  .terms input {
    width: auto;
  }

  .terms label {
    margin: 0;
    font-weight: normal;
    color: #666;
  }

  .terms a {
    color: #667eea;
    text-decoration: none;
  }

  .btn-block {
    width: 100%;
    padding: 12px;
    font-size: 16px;
  }

  .login-link {
    text-align: center;
    margin-top: 20px;
    color: #666;
  }

  .login-link a {
    color: #667eea;
    text-decoration: none;
  }

  .social-register {
    margin-top: 30px;
    text-align: center;
  }

  .social-register p {
    margin-bottom: 15px;
    color: #999;
  }

  .btn-google {
    background: #db4437;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    width: 100%;
  }

  .btn-google:hover {
    background: #c53929;
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
      gap: 0;
    }
  }
`;

export default Register;
