import React, { useState, useEffect } from 'react';
import {
  FiDownload,
  FiPhone,
  FiMail,
  FiMapPin,
  FiGlobe,
  FiShield,
  FiLock,
  FiEye,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiHelpCircle,
  FiBookOpen,
  FiFileText,
  FiUsers,
  FiTrendingUp,
  FiDollarSign,
  FiClock,
  FiCalendar,
  FiEdit,
  FiTrash2,
  FiSave,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiSliders,
  FiToggleLeft,
  FiToggleRight,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUp,
  FiArrowDown,
  FiArrowLeft,
  FiArrowRight,
  FiHome,
  FiSettings,
  FiUser,
  FiUsers as FiUsersIcon,
  FiStar,
  FiAward,
  FiHeart,
  FiShare2,
  FiTwitter,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiYoutube,
  FiGithub,
  FiCopy,
  FiPrinter,
  FiExternalLink,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Privacy = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated] = useState('February 24, 2026');
  const [showConsent, setShowConsent] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [showDetails, setShowDetails] = useState({});
  const [language, setLanguage] = useState('en');
  const [fontSize, setFontSize] = useState('medium');

  // Check if user has already accepted cookies
  useEffect(() => {
    const consent = localStorage.getItem('privacyConsent');
    if (consent) {
      setAccepted(true);
      setShowConsent(false);
    }
  }, []);

  const handleAccept = () => {
    setAccepted(true);
    setShowConsent(false);
    localStorage.setItem('privacyConsent', 'accepted');
  };

  const handleDecline = () => {
    setShowConsent(false);
    localStorage.setItem('privacyConsent', 'declined');
  };

  const toggleDetails = (section) => {
    setShowDetails(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    alert('PDF download functionality would be implemented here');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Privacy Policy - Affiliate Platform');
    
    let shareUrl = '';
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Translations for multi-language support
  const translations = {
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated',
      overview: 'Overview',
      collection: 'Information Collection',
      usage: 'How We Use Information',
      sharing: 'Information Sharing',
      security: 'Data Security',
      rights: 'Your Rights',
      cookies: 'Cookies & Tracking',
      changes: 'Changes to Policy',
      contact: 'Contact Us',
      accept: 'Accept',
      decline: 'Decline',
      print: 'Print',
      download: 'Download PDF',
      copy: 'Copy Link',
      share: 'Share',
    },
    hi: {
      title: 'गोपनीयता नीति',
      lastUpdated: 'अंतिम अपडेट',
      overview: 'अवलोकन',
      collection: 'सूचना संग्रह',
      usage: 'सूचना का उपयोग',
      sharing: 'सूचना साझा करना',
      security: 'डेटा सुरक्षा',
      rights: 'आपके अधिकार',
      cookies: 'कुकीज़ और ट्रैकिंग',
      changes: 'नीति में बदलाव',
      contact: 'संपर्क करें',
      accept: 'स्वीकार करें',
      decline: 'अस्वीकार करें',
      print: 'प्रिंट करें',
      download: 'पीडीएफ डाउनलोड करें',
      copy: 'लिंक कॉपी करें',
      share: 'शेयर करें',
    },
  };

  const t = translations[language] || translations.en;

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
    },
    consentBanner: {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      background: 'white',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      border: '1px solid #e9ecef',
    },
    consentText: {
      flex: 1,
      fontSize: '14px',
      color: '#333',
      lineHeight: '1.6',
    },
    consentButtons: {
      display: 'flex',
      gap: '10px',
    },
    consentBtn: {
      padding: '8px 16px',
      borderRadius: '5px',
      fontSize: '14px',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.3s ease',
    },
    acceptBtn: {
      background: '#28a745',
      color: 'white',
    },
    declineBtn: {
      background: '#6c757d',
      color: 'white',
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '15px',
      padding: '40px',
      marginBottom: '30px',
      color: 'white',
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
    },
    headerIcon: {
      fontSize: '48px',
    },
    title: {
      fontSize: '36px',
      margin: '0 0 10px',
    },
    lastUpdated: {
      fontSize: '14px',
      opacity: 0.9,
      margin: 0,
    },
    headerActions: {
      marginLeft: 'auto',
      display: 'flex',
      gap: '10px',
    },
    actionBtn: {
      padding: '8px 16px',
      background: 'rgba(255,255,255,0.2)',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '5px',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '13px',
    },
  };
  const getContent = () => {
    return (
      <div style={styles.content}>
        {/* Overview Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader} onClick={() => toggleDetails('overview')}>
            <div style={styles.sectionTitle}>
              <FiInfo style={styles.sectionIcon} />
              <h2>{t.overview}</h2>
            </div>
            <span style={styles.sectionToggle}>
              {showDetails.overview ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>
          {(showDetails.overview || true) && (
            <div style={styles.sectionContent}>
              <p>
              At Affiliate Platform, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you visit our website or use our services.
              </p>
              <p>
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy,
              please do not access the site.
              </p>
              <div style={styles.infoBox}>
                <FiShield style={styles.infoIcon} />
                <div>
                  <strong>Our Commitment:</strong> We are committed to protecting your personal information and your right to privacy.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Information Collection Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader} onClick={() => toggleDetails('collection')}>
            <div style={styles.sectionTitle}>
              <FiDatabase style={styles.sectionIcon} />
              <h2>{t.collection}</h2>
            </div>
            <span style={styles.sectionToggle}>
              {showDetails.collection ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>
          {showDetails.collection && (
            <div style={styles.sectionContent}>
              <h3>Information You Provide</h3>
              <p>We collect information that you voluntarily provide to us when you:</p>
              <ul style={styles.list}>
                <li>Register for an account</li>
                <li>Express interest in becoming an affiliate</li>
                <li>Make a purchase or transaction</li>
                <li>Contact us for support</li>
                <li>Participate in promotions or surveys</li>
              </ul>

              <h3>Types of Information Collected</h3>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Examples</th>
                      <th>Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Identity Data</strong></td>
                      <td>Name, username, date of birth</td>
                      <td>Account creation, verification</td>
                    </tr>
                    <tr>
                      <td><strong>Contact Data</strong></td>
                      <td>Email address, phone number</td>
                      <td>Communication, notifications</td>
                    </tr>
                    <tr>
                      <td><strong>Financial Data</strong></td>
                      <td>Payment information, bank details</td>
                      <td>Process transactions, payouts</td>
                    </tr>
                    <tr>
                      <td><strong>Technical Data</strong></td>
                      <td>IP address, browser type, device info</td>
                      <td>Site optimization, security</td>
                    </tr>
                    <tr>
                      <td><strong>Profile Data</strong></td>
                      <td>Username, password, preferences</td>
                      <td>Account management</td>
                    </tr>
                    <tr>
                      <td><strong>Usage Data</strong></td>
                      <td>Clicks, referrals, conversions</td>
                      <td>Performance tracking, analytics</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={styles.warningBox}>
                <FiAlertCircle style={styles.warningIcon} />
                <div>
                  <strong>Note:</strong> We do not knowingly collect information from children under 13.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* How We Use Information Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader} onClick={() => toggleDetails('usage')}>
            <div style={styles.sectionTitle}>
              <FiTrendingUp style={styles.sectionIcon} />
              <h2>{t.usage}</h2>
            </div>
            <span style={styles.sectionToggle}>
              {showDetails.usage ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>
          {showDetails.usage && (
            <div style={styles.sectionContent}>
              <p>We use the information we collect for various purposes:</p>
            
              <div style={styles.grid}>
                <div style={styles.card}>
                  <FiCheckCircle style={styles.cardIcon} />
                  <h4>Account Management</h4>
                  <p>Create and manage your account, authenticate users</p>
                </div>
              
                <div style={styles.card}>
                  <FiDollarSign style={styles.cardIcon} />
                  <h4>Payment Processing</h4>
                  <p>Process transactions, handle withdrawals and payouts</p>
                </div>
              
                <div style={styles.card}>
                  <FiUsers style={styles.cardIcon} />
                  <h4>Referral Tracking</h4>
                  <p>Track referrals, calculate commissions, manage earnings</p>
                </div>
              
                <div style={styles.card}>
                  <FiMail style={styles.cardIcon} />
                  <h4>Communications</h4>
                  <p>Send updates, newsletters, promotional materials</p>
                </div>
              
                <div style={styles.card}>
                  <FiShield style={styles.cardIcon} />
                  <h4>Security</h4>
                  <p>Detect and prevent fraud, protect against unauthorized access</p>
                </div>
              
                <div style={styles.card}>
                  <FiBarChart2 style={styles.cardIcon} />
                  <h4>Analytics</h4>
                  <p>Analyze usage patterns, improve our services</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Information Sharing Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader} onClick={() => toggleDetails('sharing')}>
            <div style={styles.sectionTitle}>
              <FiUsersIcon style={styles.sectionIcon} />
              <h2>{t.sharing}</h2>
            </div>
            <span style={styles.sectionToggle}>
              {showDetails.sharing ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>
          {showDetails.sharing && (
            <div style={styles.sectionContent}>
              <p>We may share your information in the following situations:</p>
            
              <h3>When We Share</h3>
              <ul style={styles.list}>
                <li><strong>With your consent:</strong> We will share information when you have given us explicit permission.</li>
                <li><strong>Service providers:</strong> We share with third-party vendors who perform services on our behalf (payment processing, data analysis, email delivery).</li>
                <li><strong>Legal requirements:</strong> We may disclose information if required by law or to protect our rights.</li>
                <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                <li><strong>Affiliates:</strong> Information may be shared within our corporate family.</li>
              </ul>

              <h3>When We Don't Share</h3>
              <div style={styles.infoBox}>
                <FiLock style={styles.infoIcon} />
                <div>
                  <strong>We do not sell your personal information to third parties.</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Data Security Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader} onClick={() => toggleDetails('security')}>
            <div style={styles.sectionTitle}>
              <FiLock style={styles.sectionIcon} />
              <h2>{t.security}</h2>
            </div>
            <span style={styles.sectionToggle}>
              {showDetails.security ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>
          {showDetails.security && (
            <div style={styles.sectionContent}>
              <p>We implement various security measures to protect your information:</p>
            
              <div style={styles.securityGrid}>
                <div style={styles.securityItem}>
                  <FiLock style={styles.securityIcon} />
                  <span>Encryption (SSL/TLS)</span>
                </div>
                <div style={styles.securityItem}>
                  <FiShield style={styles.securityIcon} />
                  <span>Firewall protection</span>
                </div>
                <div style={styles.securityItem}>
                  <FiEye style={styles.securityIcon} />
                  <span>24/7 monitoring</span>
                </div>
                <div style={styles.securityItem}>
                  <FiUsers style={styles.securityIcon} />
                  <span>Access controls</span>
                </div>
                <div style={styles.securityItem}>
                  <FiClock style={styles.securityIcon} />
                  <span>Regular security audits</span>
                </div>
                <div style={styles.securityItem}>
                  <FiSave style={styles.securityIcon} />
                  <span>Regular backups</span>
                </div>
              </div>

              <div style={styles.warningBox}>
                <FiAlertCircle style={styles.warningIcon} />
                <div>
                  <strong>However, no method of transmission over the Internet is 100% secure.</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  return (
    <div style={styles.container}>
      {/* Consent Banner */}
      {showConsent && !accepted && (
        <div style={styles.consentBanner}>
          <div style={styles.consentText}>
            <strong>Cookie Consent</strong>
            <p style={{ margin: '5px 0 0', fontSize: '13px' }}>
              We use cookies to enhance your experience, analyze site traffic, and serve personalized content.
              By continuing to use this site, you consent to our use of cookies.
            </p>
          </div>
          <div style={styles.consentButtons}>
            <button 
              style={{...styles.consentBtn, ...styles.acceptBtn}}
              onClick={handleAccept}
            >
              <FiCheckCircle /> Accept
            </button>
            <button 
              style={{...styles.consentBtn, ...styles.declineBtn}}
              onClick={handleDecline}
            >
              <FiXCircle /> Decline
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <FiShield style={styles.headerIcon} />
          <div>
            <h1 style={styles.title}>{t.title}</h1>
            <p style={styles.lastUpdated}>{t.lastUpdated}: {lastUpdated}</p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.actionBtn} onClick={handlePrint}>
              <FiPrinter />
              {t.print}
            </button>
            <button style={styles.actionBtn} onClick={handleDownloadPDF}>
              <FiDownload />
              {t.download}
            </button>
            <button style={styles.actionBtn} onClick={handleCopyLink}>
              <FiCopy />
              {t.copy}
            </button>
            <div style={styles.shareDropdown}>
              <button style={styles.actionBtn}>
                <FiShare2 />
                {t.share} <FiChevronDown />
              </button>
              <div style={styles.shareOptions}>
                <button onClick={() => handleShare('twitter')}><FiTwitter /> Twitter</button>
                <button onClick={() => handleShare('facebook')}><FiFacebook /> Facebook</button>
                <button onClick={() => handleShare('linkedin')}><FiLinkedin /> LinkedIn</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Language and Accessibility Controls */}
      <div style={styles.controls}>
        <div style={styles.controlGroup}>
          <span>Language:</span>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            style={styles.select}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        <div style={styles.controlGroup}>
          <span>Font Size:</span>
          <select 
            value={fontSize} 
            onChange={(e) => setFontSize(e.target.value)}
            style={styles.select}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      {getContent()}

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerLinks}>
          <Link to="/terms">Terms of Service</Link>
          <span style={styles.separator}>|</span>
          <Link to="/cookies">Cookie Policy</Link>
          <span style={styles.separator}>|</span>
          <Link to="/gdpr">GDPR Compliance</Link>
          <span style={styles.separator}>|</span>
          <Link to="/ccpa">CCPA Notice</Link>
          <span style={styles.separator}>|</span>
          <Link to="/accessibility">Accessibility</Link>
        </div>
        <p style={styles.copyright}>
          © {new Date().getFullYear()} Affiliate Platform. All rights reserved.
        </p>
        <p style={styles.disclaimer}>
          This privacy policy was last updated on {lastUpdated}. Please check back regularly for any changes.
        </p>
      </div>
    </div>
  );
};

// Inject styles for share dropdown
const style = document.createElement('style');
style.textContent = `
  .share-dropdown {
    position: relative;
    display: inline-block;
  }

  .share-dropdown:hover .share-options {
    display: block;
  }

  .share-options {
    display: none;
    position: absolute;
    right: 0;
    top: 100%;
    background: white;
    min-width: 120px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border-radius: 5px;
    z-index: 10;
  }

  .share-options button {
    width: 100%;
    padding: 8px 12px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #333;
  }

  .share-options button:hover {
    background: #f8f9fa;
  }

  @media (max-width: 768px) {
    .consent-banner {
      flex-direction: column;
      align-items: stretch;
    }
  }
`;
document.head.appendChild(style);

export default Privacy;
