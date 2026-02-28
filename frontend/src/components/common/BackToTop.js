import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';

const BackToTop = ({ threshold = 300, showBelow = true }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const styles = {
    button: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      display: isVisible ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      boxShadow: '0 4px 10px rgba(102, 126, 234, 0.4)',
      transition: 'all 0.3s ease',
      zIndex: 999,
      animation: 'fadeIn 0.3s ease-in-out',
    },
    buttonHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 6px 15px rgba(102, 126, 234, 0.5)',
    },
    buttonMobile: {
      bottom: '20px',
      right: '20px',
      width: '45px',
      height: '45px',
      fontSize: '20px',
    },
  };

  return (
    <>
      <style>
        {`
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
          
          .back-to-top:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 6px 15px rgba(102, 126, 234, 0.5) !important;
          }
          
          @media (max-width: 768px) {
            .back-to-top {
              bottom: 20px !important;
              right: 20px !important;
              width: 45px !important;
              height: 45px !important;
              font-size: 20px !important;
            }
          }
        `}
      </style>
      
      <button
        className="back-to-top"
        onClick={scrollToTop}
        style={styles.button}
        aria-label="Back to top"
        title="Back to top"
      >
        <FiArrowUp />
      </button>
    </>
  );
};

// Alternative version with progress indicator
export const BackToTopWithProgress = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      
      setScrollProgress(scrolled);
      
      if (winScroll > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const size = 56;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (scrollProgress / 100) * circumference;

  const styles = {
    button: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: 'white',
      border: 'none',
      cursor: 'pointer',
      display: isVisible ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      zIndex: 999,
      animation: 'fadeIn 0.3s ease-in-out',
    },
    svg: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: size,
      height: size,
      transform: 'rotate(-90deg)',
    },
    circle: {
      stroke: '#667eea',
      strokeWidth,
      fill: 'none',
      strokeDasharray: circumference,
      strokeDashoffset: offset,
      transition: 'stroke-dashoffset 0.2s',
    },
    icon: {
      color: '#667eea',
      fontSize: '24px',
      zIndex: 1,
    },
    buttonMobile: {
      bottom: '20px',
      right: '20px',
    },
  };

  return (
    <>
      <style>
        {`
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
          
          @media (max-width: 768px) {
            .back-to-top-progress {
              bottom: 20px !important;
              right: 20px !important;
            }
          }
        `}
      </style>
      
      <button
        className="back-to-top-progress"
        onClick={scrollToTop}
        style={styles.button}
        aria-label="Back to top"
        title="Back to top"
      >
        <svg style={styles.svg}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            style={styles.circle}
          />
        </svg>
        <FiArrowUp style={styles.icon} />
      </button>
    </>
  );
};

// Export both versions
export default BackToTop;
