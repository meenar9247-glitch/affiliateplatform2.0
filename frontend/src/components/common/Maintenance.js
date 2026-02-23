import React, { useState, useEffect } from 'react';
import { FiClock, FiMail, FiTwitter, FiFacebook, FiGithub, FiAlertCircle, FiTool } from 'react-icons/fi';

const Maintenance = ({ 
  title = "Under Maintenance",
  message = "We're currently performing scheduled maintenance to improve your experience.",
  estimatedTime = "2 hours",
  contactEmail = "support@affiliateplatform.com",
  showProgress = true,
  showSocialLinks = true,
  showCountdown = false,
  scheduledTime = null
}) => {
  const [countdown, setCountdown] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress (for demo purposes)
    if (showProgress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 100;
          return prev + 1;
        });
      }, 30000); // 1% every 30 seconds

      return () => clearInterval(interval);
    }
  }, [showProgress]);

  useEffect(() => {
    if (showCountdown && scheduledTime) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = new Date(scheduledTime).getTime() - now;

        if (distance < 0) {
          setCountdown('Completed');
          clearInterval(timer);
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showCountdown, scheduledTime]);

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: '50px',
      maxWidth: '600px',
      width: '100%',
      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
      textAlign: 'center'
    },
    icon: {
      fontSize: '80px',
      color: '#667eea',
      marginBottom: '20px',
      animation: 'spin 4s linear infinite'
    },
    title: {
      fontSize: '36px',
      color: '#333',
      marginBottom: '15px',
      fontWeight: 600
    },
    message: {
      fontSize: '18px',
      color: '#666',
      marginBottom: '30px',
      lineHeight: '1.6'
    },
    infoBox: {
      background: '#f8f9fa',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '30px'
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '10px',
      color: '#666',
      fontSize: '16px'
    },
    progressContainer: {
      marginBottom: '30px'
    },
    progressBar: {
      width: '100%',
      height: '10px',
      background: '#e9ecef',
      borderRadius: '5px',
      overflow: 'hidden',
      marginBottom: '10px'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #667eea, #764ba2)',
      borderRadius: '5px',
      transition: 'width 0.5s ease',
      width: `${progress}%`
    },
    progressText: {
      fontSize: '14px',
      color: '#666',
      display: 'flex',
      justifyContent: 'space-between'
    },
    countdownBox: {
      background: '#f0f4ff',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '30px'
    },
    countdownTitle: {
      fontSize: '16px',
      color: '#667eea',
      marginBottom: '10px',
      fontWeight: 500
    },
    countdownTime: {
      fontSize: '32px',
      color: '#333',
      fontWeight: 'bold',
      fontFamily: 'monospace'
    },
    socialLinks: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      marginTop: '30px'
    },
    socialLink: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#667eea',
      fontSize: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none'
    },
    emailLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: 500
    },
    toolIcon: {
      fontSize: '60px',
      color: '#667eea',
      marginBottom: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }
          
          .social-link:hover {
            background: #667eea;
            color: white;
            transform: translateY(-3px);
          }
        `}
      </style>

      <div style={styles.card}>
        <FiTool style={styles.toolIcon} />
        
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.message}>{message}</p>

        <div style={styles.infoBox}>
          <div style={styles.infoItem}>
            <FiClock />
            <span>Estimated completion time: <strong>{estimatedTime}</strong></span>
          </div>
          <div style={styles.infoItem}>
            <FiMail />
            <span>Contact: <a href={`mailto:${contactEmail}`} style={styles.emailLink}>{contactEmail}</a></span>
          </div>
        </div>

        {showProgress && (
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={styles.progressFill} />
            </div>
            <div style={styles.progressText}>
              <span>Maintenance in progress</span>
              <span>{progress}% complete</span>
            </div>
          </div>
        )}

        {showCountdown && scheduledTime && (
          <div style={styles.countdownBox}>
            <div style={styles.countdownTitle}>Resuming in:</div>
            <div style={styles.countdownTime}>{countdown}</div>
          </div>
        )}

        {showSocialLinks && (
          <div style={styles.socialLinks}>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-link">
              <FiTwitter />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-link">
              <FiFacebook />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink} className="social-link">
              <FiGithub />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// Alternative minimal version
export const MinimalMaintenance = ({ message = "We'll be back soon!" }) => {
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    },
    content: {
      textAlign: 'center'
    },
    icon: {
      fontSize: '80px',
      color: '#667eea',
      marginBottom: '20px'
    },
    title: {
      fontSize: '48px',
      color: '#333',
      marginBottom: '15px',
      fontWeight: 600
    },
    message: {
      fontSize: '20px',
      color: '#666',
      marginBottom: '30px'
    },
    loader: {
      width: '50px',
      height: '50px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #667eea',
      borderRadius: '50%',
      margin: '0 auto',
      animation: 'spin 1s linear infinite'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.content}>
        <FiAlertCircle style={styles.icon} />
        <h1 style={styles.title}>Maintenance Mode</h1>
        <p style={styles.message}>{message}</p>
        <div style={styles.loader} />
      </div>
    </div>
  );
};

// Scheduled maintenance version
export const ScheduledMaintenance = ({ 
  scheduledDate = "2024-12-31T23:00:00",
  duration = "2 hours",
  message = "We'll be performing scheduled maintenance."
}) => {
  const [timeUntil, setTimeUntil] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const scheduled = new Date(scheduledDate).getTime();
      const distance = scheduled - now;

      if (distance < 0) {
        setTimeUntil('In progress');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setTimeUntil(`${days}d ${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, [scheduledDate]);

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    },
    card: {
      background: 'white',
      borderRadius: '15px',
      padding: '40px',
      maxWidth: '500px',
      width: '100%',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      textAlign: 'center'
    },
    icon: {
      fontSize: '60px',
      color: '#ff6b6b',
      marginBottom: '20px'
    },
    title: {
      fontSize: '28px',
      color: '#333',
      marginBottom: '10px'
    },
    message: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '25px'
    },
    infoBox: {
      background: '#f8f9fa',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '20px'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px',
      fontSize: '14px',
      color: '#666'
    },
    countdown: {
      fontSize: '24px',
      color: '#667eea',
      fontWeight: 'bold',
      marginTop: '10px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <FiClock style={styles.icon} />
        <h1 style={styles.title}>Scheduled Maintenance</h1>
        <p style={styles.message}>{message}</p>
        
        <div style={styles.infoBox}>
          <div style={styles.infoRow}>
            <span>Starts in:</span>
            <span><strong>{timeUntil}</strong></span>
          </div>
          <div style={styles.infoRow}>
            <span>Expected duration:</span>
            <span><strong>{duration}</strong></span>
          </div>
          <div style={styles.infoRow}>
            <span>Scheduled time:</span>
            <span><strong>{new Date(scheduledDate).toLocaleString()}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
