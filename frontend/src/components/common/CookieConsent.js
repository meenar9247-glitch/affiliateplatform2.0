import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    functional: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    } else {
      try {
        setPreferences(JSON.parse(consent));
      } catch (error) {
        console.error('Failed to parse cookie consent:', error);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const allRejected = {
      necessary: true, // Necessary cookies always enabled
      functional: false,
      analytics: false,
      marketing: false
    };
    setPreferences(allRejected);
    localStorage.setItem('cookieConsent', JSON.stringify(allRejected));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleTogglePreference = (key) => {
    if (key === 'necessary') return; // Cannot toggle necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isVisible) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      boxShadow: '0 -4px 10px rgba(0,0,0,0.1)',
      zIndex: 9999,
      padding: '20px',
      borderTop: '1px solid #e9ecef'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: showPreferences ? 'column' : 'row',
      alignItems: showPreferences ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: '20px',
      flexWrap: 'wrap'
    },
    content: {
      flex: 1
    },
    title: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#333',
      marginBottom: '8px'
    },
    text: {
      fontSize: '14px',
      color: '#666',
      lineHeight: '1.6',
      marginBottom: '10px'
    },
    link: {
      color: '#667eea',
      textDecoration: 'none',
      cursor: 'pointer'
    },
    buttons: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap'
    },
    buttonPrimary: {
      padding: '10px 20px',
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background 0.3s ease'
    },
    buttonSecondary: {
      padding: '10px 20px',
      background: 'white',
      color: '#666',
      border: '1px solid #ddd',
      borderRadius: '5px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    preferencesPanel: {
      marginTop: '20px',
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '8px'
    },
    preferencesTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#333',
      marginBottom: '15px'
    },
    preferenceItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid #e9ecef'
    },
    preferenceInfo: {
      flex: 1
    },
    preferenceName: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#333',
      marginBottom: '3px'
    },
    preferenceDesc: {
      fontSize: '12px',
      color: '#999'
    },
    toggle: {
      position: 'relative',
      display: 'inline-block',
      width: '50px',
      height: '24px',
      marginLeft: '15px'
    },
    toggleInput: {
      opacity: 0,
      width: 0,
      height: 0
    },
    slider: {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ccc',
      transition: '0.3s',
      borderRadius: '24px'
    },
    sliderBefore: {
      position: 'absolute',
      content: '""',
      height: '20px',
      width: '20px',
      left: '2px',
      bottom: '2px',
      backgroundColor: 'white',
      transition: '0.3s',
      borderRadius: '50%'
    },
    toggleChecked: {
      backgroundColor: '#667eea'
    },
    toggleCheckedBefore: {
      transform: 'translateX(26px)'
    },
    toggleDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    preferenceActions: {
      display: 'flex',
      gap: '10px',
      marginTop: '20px',
      justifyContent: 'flex-end'
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.content}>
          <h3 style={styles.title}>🍪 Cookie Consent</h3>
          <p style={styles.text}>
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
          </p>
          <p style={styles.text}>
            <a 
              href="/privacy" 
              style={styles.link}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/privacy';
              }}
            >
              Privacy Policy
            </a>
            {' '}·{' '}
            <a 
              href="/terms" 
              style={styles.link}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/terms';
              }}
            >
              Terms of Service
            </a>
          </p>
        </div>

        <div style={styles.buttons}>
          <button 
            style={styles.buttonSecondary}
            onClick={() => setShowPreferences(!showPreferences)}
          >
            {showPreferences ? 'Hide' : 'Customize'}
          </button>
          <button 
            style={styles.buttonSecondary}
            onClick={handleRejectAll}
          >
            Reject All
          </button>
          <button 
            style={styles.buttonPrimary}
            onClick={handleAcceptAll}
          >
            Accept All
          </button>
        </div>

        {showPreferences && (
          <div style={styles.preferencesPanel}>
            <h4 style={styles.preferencesTitle}>Cookie Preferences</h4>
            
            {/* Necessary Cookies */}
            <div style={styles.preferenceItem}>
              <div style={styles.preferenceInfo}>
                <div style={styles.preferenceName}>Necessary Cookies</div>
                <div style={styles.preferenceDesc}>
                  Required for the website to function properly. Cannot be disabled.
                </div>
              </div>
              <label style={{...styles.toggle, ...styles.toggleDisabled}}>
                <input 
                  type="checkbox" 
                  checked={preferences.necessary}
                  disabled
                  style={styles.toggleInput}
                />
                <span style={{
                  ...styles.slider,
                  ...(preferences.necessary ? styles.toggleChecked : {}),
                  ...styles.toggleDisabled
                }}></span>
                <span style={{
                  ...styles.sliderBefore,
                  ...(preferences.necessary ? styles.toggleCheckedBefore : {})
                }}></span>
              </label>
            </div>

            {/* Functional Cookies */}
            <div style={styles.preferenceItem}>
              <div style={styles.preferenceInfo}>
                <div style={styles.preferenceName}>Functional Cookies</div>
                <div style={styles.preferenceDesc}>
                  Enable enhanced functionality and personalization.
                </div>
              </div>
              <label style={styles.toggle}>
                <input 
                  type="checkbox" 
                  checked={preferences.functional}
                  onChange={() => handleTogglePreference('functional')}
                  style={styles.toggleInput}
                />
                <span style={{
                  ...styles.slider,
                  ...(preferences.functional ? styles.toggleChecked : {})
                }}></span>
                <span style={{
                  ...styles.sliderBefore,
                  ...(preferences.functional ? styles.toggleCheckedBefore : {})
                }}></span>
              </label>
            </div>

            {/* Analytics Cookies */}
            <div style={styles.preferenceItem}>
              <div style={styles.preferenceInfo}>
                <div style={styles.preferenceName}>Analytics Cookies</div>
                <div style={styles.preferenceDesc}>
                  Help us understand how visitors interact with our website.
                </div>
              </div>
              <label style={styles.toggle}>
                <input 
                  type="checkbox" 
                  checked={preferences.analytics}
                  onChange={() => handleTogglePreference('analytics')}
                  style={styles.toggleInput}
                />
                <span style={{
                  ...styles.slider,
                  ...(preferences.analytics ? styles.toggleChecked : {})
                }}></span>
                <span style={{
                  ...styles.sliderBefore,
                  ...(preferences.analytics ? styles.toggleCheckedBefore : {})
                }}></span>
              </label>
            </div>

            {/* Marketing Cookies */}
            <div style={styles.preferenceItem}>
              <div style={styles.preferenceInfo}>
                <div style={styles.preferenceName}>Marketing Cookies</div>
                <div style={styles.preferenceDesc}>
                  Used to deliver relevant advertisements and marketing campaigns.
                </div>
              </div>
              <label style={styles.toggle}>
                <input 
                  type="checkbox" 
                  checked={preferences.marketing}
                  onChange={() => handleTogglePreference('marketing')}
                  style={styles.toggleInput}
                />
                <span style={{
                  ...styles.slider,
                  ...(preferences.marketing ? styles.toggleChecked : {})
                }}></span>
                <span style={{
                  ...styles.sliderBefore,
                  ...(preferences.marketing ? styles.toggleCheckedBefore : {})
                }}></span>
              </label>
            </div>

            <div style={styles.preferenceActions}>
              <button 
                style={styles.buttonSecondary}
                onClick={() => setShowPreferences(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.buttonPrimary}
                onClick={handleSavePreferences}
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
