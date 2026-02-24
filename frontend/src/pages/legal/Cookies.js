import React, { useState } from 'react';
import {
  FiSettings,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiShield,
  FiLock,
  FiEye,
  FiTrash2,
  FiDownload,
  FiMail,
  FiClock,
  FiUser,
  FiDatabase,
  FiGlobe,
  FiEdit,
  FiXCircle,
  FiHelpCircle
} from 'react-icons/fi';

const Cookies = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPreferences, setShowPreferences] = useState(false);
  const [consentSettings, setConsentSettings] = useState({
    necessary: true, // Always true, cannot be disabled
    functional: true,
    analytics: false,
    marketing: false,
    preferences: true,
    social: false
  });

  const [cookieConsent, setCookieConsent] = useState({
    essential: true,
    performance: false,
    functional: false,
    targeting: false
  });

  const handleConsentToggle = (key) => {
    if (key === 'necessary') return; // Cannot toggle necessary cookies
    setConsentSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(consentSettings));
    setShowPreferences(false);
    alert('Cookie preferences saved!');
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      preferences: true,
      social: true
    };
    setConsentSettings(allAccepted);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    setShowPreferences(false);
  };

  const handleRejectAll = () => {
    const allRejected = {
      necessary: true, // Necessary cookies always enabled
      functional: false,
      analytics: false,
      marketing: false,
      preferences: false,
      social: false
    };
    setConsentSettings(allRejected);
    localStorage.setItem('cookiePreferences', JSON.stringify(allRejected));
    setShowPreferences(false);
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '36px',
      color: '#333',
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    },
    subtitle: {
      fontSize: '18px',
      color: '#666',
      lineHeight: '1.6',
      maxWidth: '800px',
      margin: '0 auto'
    },
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '30px',
      borderBottom: '2px solid #e9ecef',
      paddingBottom: '10px',
      flexWrap: 'wrap'
    },
    tab: {
      padding: '12px 24px',
      background: 'none',
      border: 'none',
      borderRadius: '8px',
      color: '#666',
      cursor: 'pointer',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease'
    },
    activeTab: {
      background: '#667eea',
      color: 'white'
    },
    section: {
      background: 'white',
      borderRadius: '10px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    sectionTitle: {
      fontSize: '24px',
      color: '#333',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    card: {
      background: '#f8f9fa',
      borderRadius: '10px',
      padding: '25px'
    },
    cardTitle: {
      fontSize: '18px',
      color: '#333',
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    cardText: {
      color: '#666',
      lineHeight: '1.6',
      marginBottom: '15px'
    },
    list: {
      listStyle: 'none',
      padding: 0
    },
    listItem: {
      padding: '10px 0',
      borderBottom: '1px solid #e9ecef',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#666'
    },
    badge: {
      padding: '3px 10px',
      borderRadius: '15px',
      fontSize: '12px',
      fontWeight: 500
    },
    badgeSuccess: {
      background: '#e8f5e9',
      color: '#28a745'
    },
    badgeWarning: {
      background: '#fff3e0',
      color: '#ffc107'
    },
    badgeInfo: {
      background: '#e3f2fd',
      color: '#1976d2'
    },
    cookieTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px'
    },
    th: {
      textAlign: 'left',
      padding: '12px',
      background: '#f8f9fa',
      borderBottom: '2px solid #e9ecef',
      fontSize: '14px',
      fontWeight: 600,
      color: '#666'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #e9ecef',
      fontSize: '14px',
      color: '#333'
    },
    consentItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '15px 0',
      borderBottom: '1px solid #e9ecef'
    },
    consentInfo: {
      flex: 1
    },
    consentTitle: {
      fontSize: '16px',
      fontWeight: 500,
      color: '#333',
      marginBottom: '3px'
    },
    consentDesc: {
      fontSize: '13px',
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
    button: {
      padding: '12px 24px',
      background: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      fontSize: '16px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      justifyContent: 'center',
      transition: 'background 0.3s ease',
      marginRight: '10px',
      marginBottom: '10px'
    },
    buttonSecondary: {
      background: '#6c757d'
    },
    buttonSuccess: {
      background: '#28a745'
    },
    buttonWarning: {
      background: '#ffc107',
      color: '#333'
    },
    alert: {
      padding: '15px',
      borderRadius: '5px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    alertInfo: {
      background: '#e3f2fd',
      color: '#1976d2',
      border: '1px solid #bee5eb'
    },
    alertWarning: {
      background: '#fff3e0',
      color: '#ffc107',
      border: '1px solid #ffeeba'
    },
    preferencePanel: {
      background: '#f8f9fa',
      borderRadius: '10px',
      padding: '25px',
      marginTop: '20px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      marginTop: '20px',
      flexWrap: 'wrap'
    },
    footer: {
      marginTop: '40px',
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '10px',
      textAlign: 'center'
    },
    link: {
      color: '#667eea',
      textDecoration: 'none',
      margin: '0 10px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <FiCookie /> Cookie Policy
        </h1>
        <p style={styles.subtitle}>
          Learn about how we use cookies to improve your experience on our platform.
          This policy explains what cookies are, how we use them, and how you can control them.
        </p>
      </div>

      {/* Cookie Consent Bar (if not accepted) */}
      {!localStorage.getItem('cookiePreferences') && (
        <div style={{...styles.alert, ...styles.alertInfo, marginBottom: '30px'}}>
          <FiInfo size={24} />
          <div style={{flex: 1}}>
            <strong>We use cookies</strong> to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
            By clicking "Accept All", you consent to our use of cookies.
          </div>
          <div style={styles.buttonGroup}>
            <button 
              style={{...styles.button, ...styles.buttonSuccess}}
              onClick={handleAcceptAll}
            >
              <FiCheckCircle /> Accept All
            </button>
            <button 
              style={{...styles.button, ...styles.buttonSecondary}}
              onClick={() => setShowPreferences(true)}
            >
              <FiSettings /> Customize
            </button>
            <button 
              style={{...styles.button, ...styles.buttonWarning}}
              onClick={handleRejectAll}
            >
              <FiXCircle /> Reject All
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'overview' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('overview')}
        >
          <FiInfo /> Overview
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'cookies' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('cookies')}
        >
          <FiCookie /> Cookies We Use
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'preferences' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('preferences')}
        >
          <FiSettings /> Preferences
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'faq' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('faq')}
        >
          <FiHelpCircle /> FAQ
        </button>
      </div>
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div style={styles.grid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FiInfo /> What are Cookies?
              </h3>
              <p style={styles.cardText}>
                Cookies are small text files that are placed on your computer or mobile device when you visit a website.
                They are widely used to make websites work more efficiently and provide information to the website owners.
              </p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FiLock /> How We Use Cookies
              </h3>
              <p style={styles.cardText}>
                We use cookies to:
              </p>
              <ul style={styles.list}>
                <li style={styles.listItem}>• Keep you signed in</li>
                <li style={styles.listItem}>• Remember your preferences</li>
                <li style={styles.listItem}>• Understand how you use our site</li>
                <li style={styles.listItem}>• Improve your experience</li>
                <li style={styles.listItem}>• Provide personalized content</li>
              </ul>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FiEye /> Types of Cookies
              </h3>
              <ul style={styles.list}>
                <li style={styles.listItem}>
                  <strong>Essential Cookies:</strong> Required for site functionality
                </li>
                <li style={styles.listItem}>
                  <strong>Functional Cookies:</strong> Remember your preferences
                </li>
                <li style={styles.listItem}>
                  <strong>Analytics Cookies:</strong> Help us improve our site
                </li>
                <li style={styles.listItem}>
                  <strong>Marketing Cookies:</strong> Used for advertising
                </li>
              </ul>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Cookie Duration</h3>
            <div style={styles.grid}>
              <div style={styles.card}>
                <h4 style={styles.cardTitle}>Session Cookies</h4>
                <p style={styles.cardText}>
                  These cookies are temporary and expire when you close your browser.
                  They are used to remember you during your browsing session.
                </p>
              </div>
              <div style={styles.card}>
                <h4 style={styles.cardTitle}>Persistent Cookies</h4>
                <p style={styles.cardText}>
                  These cookies remain on your device until they expire or you delete them.
                  They help us remember your preferences for future visits.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookies We Use Tab */}
      {activeTab === 'cookies' && (
        <div>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Essential Cookies</h3>
            <p style={styles.cardText}>
              These cookies are necessary for the website to function and cannot be switched off.
            </p>
            <table style={styles.cookieTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Cookie Name</th>
                  <th style={styles.th}>Purpose</th>
                  <th style={styles.th}>Duration</th>
                  <th style={styles.th}>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>session_id</td>
                  <td style={styles.td}>Maintains user session</td>
                  <td style={styles.td}>Session</td>
                  <td style={styles.td}><span style={{...styles.badge, ...styles.badgeInfo}}>Essential</span></td>
                </tr>
                <tr>
                  <td style={styles.td}>csrf_token</td>
                  <td style={styles.td}>Prevents CSRF attacks</td>
                  <td style={styles.td}>Session</td>
                  <td style={styles.td}><span style={{...styles.badge, ...styles.badgeInfo}}>Essential</span></td>
                </tr>
                <tr>
                  <td style={styles.td}>auth_token</td>
                  <td style={styles.td}>Authenticates user</td>
                  <td style={styles.td}>30 days</td>
                  <td style={styles.td}><span style={{...styles.badge, ...styles.badgeInfo}}>Essential</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Functional Cookies</h3>
            <p style={styles.cardText}>
              These cookies enable enhanced functionality and personalization.
            </p>
            <table style={styles.cookieTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Cookie Name</th>
                  <th style={styles.th}>Purpose</th>
                  <th style={styles.th}>Duration</th>
                  <th style={styles.th}>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>language</td>
                  <td style={styles.td}>Remembers language preference</td>
                  <td style={styles.td}>1 year</td>
                  <td style={styles.td}><span style={{...styles.badge, ...styles.badgeSuccess}}>Functional</span></td>
                </tr>
                <tr>
                  <td style={styles.td}>theme</td>
                  <td style={styles.td}>Remembers theme preference</td>
                  <td style={styles.td}>1 year</td>
                  <td style={styles.td}><span style={{...styles.badge, ...styles.badgeSuccess}}>Functional</span></td>
                </tr>
                <tr>
                  <td style={styles.td}>currency</td>
                  <td style={styles.td}>Remembers currency preference</td>
                  <td style={styles.td}>1 year</td>
                  <td style={styles.td}><span style={{...styles.badge, ...styles.badgeSuccess}}>Functional</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Analytics Cookies</h3>
            <p style={styles.cardText}>
              These cookies help us understand how visitors interact with our website.
            </p>
            <table style={styles.cookieTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Cookie Name</th>
                  <th style={styles.th}>Purpose</th>
                  <th style={styles.th}>Duration</th>
                  <th style={styles.th}>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>_ga</td>
                  <td style={styles.td}>Google Analytics - distinguishes users</td>
                  <td style={styles.td}>2 years</td>
                  <td style={styles.td}><span style={{...styles.badge, ...styles.badgeWarning}}>Analytics</span></td>
                </tr>
                <tr>
                  <td style={styles.td}>_gid</td>
                  <td style={styles.td}>Google Analytics - distinguishes users</td>
                  <td style={styles.td}>24 hours</td>
                  <td style={styles.td}><span style={{...styles.badge, ...styles.badgeWarning}}>Analytics</span></td>
                </tr>
                <tr>
                  <td style={styles.td}>_gat</td>
                  <td style={styles.td}>Google Analytics - throttles request rate</td>
                  <td style={styles.td}>1 minute</td>
                  <td style={styles.td}><span style={{...styles.badge, ...styles.badgeWarning}}>Analytics</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Marketing Cookies</h3>
            <p style={styles.cardText}>
              These cookies are used to deliver relevant advertisements and track marketing effectiveness.
            </p>
            <table style={styles.cookieTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Cookie Name</th>
                  <th style={styles.th}>Purpose</th>
                  <th style={styles.th}>Duration</th>
                  <th style={styles.th}>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>_fbp</td>
                  <td style={styles.td}>Facebook Pixel - tracks visits</td>
                  <td style={styles.td}>3 months</td>
                  <td style={styles.td}><span style={{...styles.badge, ...styles.badgeWarning}}>Marketing</span></td>
                </tr>
                <tr>
                  <td style={styles.td}>_gcl_au</td>
                  <td style={styles.td}>Google Ads - conversion tracking</td>
                  <td style={styles.td}>3 months</td>
                  <td style={styles.td}><span style={{...styles.badge, ...styles.badgeWarning}}>Marketing</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Manage Cookie Preferences</h3>
            
            <div style={styles.consentItem}>
              <div style={styles.consentInfo}>
                <div style={styles.consentTitle}>Essential Cookies</div>
                <div style={styles.consentDesc}>
                  Required for the website to function properly. Cannot be disabled.
                </div>
              </div>
              <label style={{...styles.toggle, ...styles.toggleDisabled}}>
                <input 
                  type="checkbox"
                  checked={consentSettings.necessary}
                  disabled
                  style={styles.toggleInput}
                />
                <span style={{
                  ...styles.slider,
                  ...(consentSettings.necessary ? styles.toggleChecked : {}),
                  ...styles.toggleDisabled
                }}></span>
                <span style={{
                  ...styles.sliderBefore,
                  ...(consentSettings.necessary ? styles.toggleCheckedBefore : {})
                }}></span>
              </label>
            </div>

            <div style={styles.consentItem}>
              <div style={styles.consentInfo}>
                <div style={styles.consentTitle}>Functional Cookies</div>
                <div style={styles.consentDesc}>
                  Enable enhanced functionality and personalization (language, theme, currency)
                </div>
              </div>
              <label style={styles.toggle}>
                <input 
                  type="checkbox"
                  checked={consentSettings.functional}
                  onChange={() => handleConsentToggle('functional')}
                  style={styles.toggleInput}
                />
                <span style={{
                  ...styles.slider,
                  ...(consentSettings.functional ? styles.toggleChecked : {})
                }}></span>
                <span style={{
                  ...styles.sliderBefore,
                  ...(consentSettings.functional ? styles.toggleCheckedBefore : {})
                }}></span>
              </label>
            </div>

            <div style={styles.consentItem}>
              <div style={styles.consentInfo}>
                <div style={styles.consentTitle}>Analytics Cookies</div>
                <div style={styles.consentDesc}>
                  Help us understand how visitors interact with our website
                </div>
              </div>
              <label style={styles.toggle}>
                <input 
                  type="checkbox"
                  checked={consentSettings.analytics}
                  onChange={() => handleConsentToggle('analytics')}
                  style={styles.toggleInput}
                />
                <span style={{
                  ...styles.slider,
                  ...(consentSettings.analytics ? styles.toggleChecked : {})
                }}></span>
                <span style={{
                  ...styles.sliderBefore,
                  ...(consentSettings.analytics ? styles.toggleCheckedBefore : {})
                }}></span>
              </label>
            </div>

            <div style={styles.consentItem}>
              <div style={styles.consentInfo}>
                <div style={styles.consentTitle}>Marketing Cookies</div>
                <div style={styles.consentDesc}>
                  Used to deliver relevant advertisements and marketing campaigns
                </div>
              </div>
              <label style={styles.toggle}>
                <input 
                  type="checkbox"
                  checked={consentSettings.marketing}
                  onChange={() => handleConsentToggle('marketing')}
                  style={styles.toggleInput}
                />
                <span style={{
                  ...styles.slider,
                  ...(consentSettings.marketing ? styles.toggleChecked : {})
                }}></span>
                <span style={{
                  ...styles.sliderBefore,
                  ...(consentSettings.marketing ? styles.toggleCheckedBefore : {})
                }}></span>
              </label>
            </div>

            <div style={styles.consentItem}>
              <div style={styles.consentInfo}>
                <div style={styles.consentTitle}>Social Media Cookies</div>
                <div style={styles.consentDesc}>
                  Enable social media sharing and integration
                </div>
              </div>
              <label style={styles.toggle}>
                <input 
                  type="checkbox"
                  checked={consentSettings.social}
                  onChange={() => handleConsentToggle('social')}
                  style={styles.toggleInput}
                />
                <span style={{
                  ...styles.slider,
                  ...(consentSettings.social ? styles.toggleChecked : {})
                }}></span>
                <span style={{
                  ...styles.sliderBefore,
                  ...(consentSettings.social ? styles.toggleCheckedBefore : {})
                }}></span>
              </label>
            </div>

            <div style={styles.buttonGroup}>
              <button 
                style={{...styles.button, ...styles.buttonSuccess}}
                onClick={handleSavePreferences}
              >
                <FiCheckCircle /> Save Preferences
              </button>
              <button 
                style={{...styles.button, ...styles.buttonSecondary}}
                onClick={handleAcceptAll}
              >
                Accept All
              </button>
              <button 
                style={{...styles.button, ...styles.buttonWarning}}
                onClick={handleRejectAll}
              >
                Reject All
              </button>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Browser Settings</h3>
            <p style={styles.cardText}>
              You can also control cookies through your browser settings. Here's how:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
              </li>
              <li style={styles.listItem}>
                <strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data
              </li>
              <li style={styles.listItem}>
                <strong>Safari:</strong> Preferences → Privacy → Cookies and website data
              </li>
              <li style={styles.listItem}>
                <strong>Edge:</strong> Settings → Site permissions → Cookies and site data
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Frequently Asked Questions</h3>
            
            <div style={styles.card}>
              <h4 style={styles.cardTitle}>What happens if I disable cookies?</h4>
              <p style={styles.cardText}>
                Disabling cookies may affect your experience on our website. Some features may not work properly,
                such as staying logged in, remembering your preferences, or completing purchases.
              </p>
            </div>

            <div style={styles.card}>
              <h4 style={styles.cardTitle}>How long do cookies last?</h4>
              <p style={styles.cardText}>
                Cookie duration varies. Session cookies last until you close your browser, while persistent cookies
                remain for a set period (from 24 hours to 2 years) or until you delete them.
              </p>
            </div>

            <div style={styles.card}>
              <h4 style={styles.cardTitle}>Do you use third-party cookies?</h4>
              <p style={styles.cardText}>
                Yes, we use third-party cookies for analytics (Google Analytics) and marketing purposes.
                These cookies are subject to the respective third-party privacy policies.
              </p>
            </div>

            <div style={styles.card}>
              <h4 style={styles.cardTitle}>How can I delete cookies?</h4>
              <p style={styles.cardText}>
                You can delete cookies through your browser settings. You can also clear your browser history
                and cache, which typically includes cookies.
              </p>
            </div>

            <div style={styles.card}>
              <h4 style={styles.cardTitle}>Will my preferences be saved?</h4>
              <p style={styles.cardText}>
                Yes, your cookie preferences are saved using cookies. If you clear all cookies,
                you may need to set your preferences again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.cardText}>
          Last updated: February 23, 2024
        </p>
        <p style={styles.cardText}>
          For questions about our Cookie Policy, please contact us at:
          <br />
          <a href="mailto:privacy@affiliateplatform.com" style={styles.link}>
            privacy@affiliateplatform.com
          </a>
        </p>
        <div style={styles.buttonGroup}>
          <a href="/privacy" style={styles.link}>Privacy Policy</a>
          <span style={{color: '#ccc'}}>|</span>
          <a href="/terms" style={styles.link}>Terms of Service</a>
          <span style={{color: '#ccc'}}>|</span>
          <a href="/gdpr" style={styles.link}>GDPR Compliance</a>
        </div>
      </div>
    </div>
  );
};

export default Cookies;
