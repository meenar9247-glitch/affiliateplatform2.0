import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Company Info */}
          <div className="footer-section">
            <h3 className="footer-title">AffiliatePro</h3>
            <p className="footer-description">
              Empowering affiliates to earn more with cutting-edge tools and 
              top-tier merchant partnerships. Join thousands of successful 
              marketers today.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/affiliates" className="footer-link">Affiliate Links</Link></li>
              <li><Link to="/leaderboard" className="footer-link">Leaderboard</Link></li>
              <li><Link to="/dashboard" className="footer-link">Dashboard</Link></li>
              <li><Link to="/earnings" className="footer-link">Earnings</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              <li><Link to="/faq" className="footer-link">FAQ</Link></li>
              <li><Link to="/support" className="footer-link">Support Center</Link></li>
              <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
              <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section">
            <h3 className="footer-title">Newsletter</h3>
            <p className="newsletter-text">
              Subscribe to get updates on new affiliate programs and tips.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="copyright">
            © {currentYear} AffiliatePro. All rights reserved.
          </div>
          <div className="footer-bottom-links">
            <Link to="/terms" className="bottom-link">Terms</Link>
            <Link to="/privacy" className="bottom-link">Privacy</Link>
            <Link to="/cookies" className="bottom-link">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Styles for the footer
const styles = `
  .footer {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #fff;
    padding: 60px 0 20px;
    margin-top: auto;
  }

  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .footer-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;
    margin-bottom: 40px;
  }

  .footer-section {
    display: flex;
    flex-direction: column;
  }

  .footer-title {
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    position: relative;
    padding-bottom: 10px;
  }

  .footer-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
  }

  .footer-description {
    color: #b7b7b7;
    line-height: 1.6;
    margin-bottom: 20px;
    font-size: 14px;
  }

  .social-links {
    display: flex;
    gap: 15px;
  }

  .social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: #fff;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .social-link:hover {
    background: linear-gradient(135deg, #667eea, #764ba2);
    transform: translateY(-3px);
  }

  .footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .footer-links li {
    margin-bottom: 10px;
  }

  .footer-link {
    color: #b7b7b7;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;
    position: relative;
    padding-left: 15px;
  }

  .footer-link::before {
    content: '›';
    position: absolute;
    left: 0;
    color: #667eea;
    transition: transform 0.3s ease;
  }

  .footer-link:hover {
    color: #fff;
  }

  .footer-link:hover::before {
    transform: translateX(3px);
  }

  .newsletter-text {
    color: #b7b7b7;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 15px;
  }

  .newsletter-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .newsletter-input {
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    font-size: 14px;
    transition: all 0.3s ease;
  }

  .newsletter-input::placeholder {
    color: #888;
  }

  .newsletter-input:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.1);
  }

  .newsletter-btn {
    padding: 12px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .newsletter-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  .copyright {
    color: #b7b7b7;
    font-size: 14px;
  }

  .footer-bottom-links {
    display: flex;
    gap: 20px;
  }

  .bottom-link {
    color: #b7b7b7;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;
  }

  .bottom-link:hover {
    color: #667eea;
  }

  /* Responsive Design */
  @media (max-width: 992px) {
    .footer-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 576px) {
    .footer-grid {
      grid-template-columns: 1fr;
    }

    .footer-bottom {
      flex-direction: column;
      text-align: center;
    }

    .footer-bottom-links {
      justify-content: center;
    }

    .footer-section {
      text-align: center;
    }

    .footer-title::after {
      left: 50%;
      transform: translateX(-50%);
    }

    .social-links {
      justify-content: center;
    }

    .footer-link::before {
      display: none;
    }

    .footer-link {
      padding-left: 0;
    }
  }
`;

export default Footer;
