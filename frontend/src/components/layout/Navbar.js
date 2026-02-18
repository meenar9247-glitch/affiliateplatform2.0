import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Handle scroll effect
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">AffiliatePro</span>
        </Link>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          <span className={`hamburger ${isOpen ? 'active' : ''}`}></span>
          <span className={`hamburger ${isOpen ? 'active' : ''}`}></span>
          <span className={`hamburger ${isOpen ? 'active' : ''}`}></span>
        </button>

        {/* Navigation Links */}
        <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/affiliates" className="nav-link" onClick={() => setIsOpen(false)}>
                Affiliate Links
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/leaderboard" className="nav-link" onClick={() => setIsOpen(false)}>
                Leaderboard
              </Link>
            </li>
            
            {user ? (
              // User is logged in
              <>
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/earnings" className="nav-link" onClick={() => setIsOpen(false)}>
                    Earnings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/wallet" className="nav-link" onClick={() => setIsOpen(false)}>
                    Wallet
                  </Link>
                </li>
                
                {/* User Menu */}
                <li className="nav-item user-menu">
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <button className="btn-logout" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                </li>
              </>
            ) : (
              // User is not logged in
              <li className="nav-item auth-buttons">
                <Link to="/login" className="btn-login" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn-register" onClick={() => setIsOpen(false)}>
                  Register
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

// Styles for the navbar
const styles = `
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: transparent;
    padding: 20px 0;
    transition: all 0.3s ease;
    z-index: 1000;
  }

  .navbar-scrolled {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    padding: 10px 0;
  }

  .navbar-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .navbar-logo {
    text-decoration: none;
    font-size: 24px;
    font-weight: bold;
  }

  .logo-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
  }

  .hamburger {
    display: block;
    width: 25px;
    height: 3px;
    background: #333;
    margin: 5px 0;
    transition: all 0.3s ease;
  }

  .hamburger.active:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }

  .hamburger.active:nth-child(2) {
    opacity: 0;
  }

  .hamburger.active:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
  }

  .nav-menu {
    display: flex;
    align-items: center;
  }

  .nav-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    align-items: center;
    gap: 30px;
  }

  .nav-link {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s ease;
    position: relative;
  }

  .nav-link:hover {
    color: #667eea;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: #667eea;
    transition: width 0.3s ease;
  }

  .nav-link:hover::after {
    width: 100%;
  }

  .auth-buttons {
    display: flex;
    gap: 15px;
  }

  .btn-login {
    text-decoration: none;
    color: #667eea;
    font-weight: 500;
    padding: 8px 20px;
    border: 2px solid #667eea;
    border-radius: 5px;
    transition: all 0.3s ease;
  }

  .btn-login:hover {
    background: #667eea;
    color: white;
  }

  .btn-register {
    text-decoration: none;
    color: white;
    font-weight: 500;
    padding: 8px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 5px;
    transition: all 0.3s ease;
  }

  .btn-register:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .user-name {
    font-weight: 500;
    color: #333;
  }

  .btn-logout {
    background: none;
    border: none;
    color: #dc3545;
    font-weight: 500;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 5px;
    transition: all 0.3s ease;
  }

  .btn-logout:hover {
    background: #dc3545;
    color: white;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .mobile-menu-btn {
      display: block;
    }

    .nav-menu {
      position: fixed;
      top: 70px;
      left: -100%;
      width: 100%;
      height: calc(100vh - 70px);
      background: white;
      flex-direction: column;
      padding: 40px;
      transition: left 0.3s ease;
    }

    .nav-menu.active {
      left: 0;
    }

    .nav-list {
      flex-direction: column;
      width: 100%;
    }

    .nav-item {
      width: 100%;
      text-align: center;
    }

    .auth-buttons {
      flex-direction: column;
      width: 100%;
    }

    .btn-login, .btn-register {
      display: block;
      width: 100%;
    }

    .user-info {
      flex-direction: column;
      width: 100%;
    }

    .btn-logout {
      width: 100%;
      padding: 10px;
    }
  }
`;

export default Navbar;
