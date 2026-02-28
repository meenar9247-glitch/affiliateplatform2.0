import React, { useState } from 'react';
import { 
  FiShield, 
  FiLock, 
  FiEye, 
  FiTrash2, 
  FiDownload, 
  FiCheckCircle, 
  FiAlertCircle,
  FiInfo,
  FiMail,
  FiClock,
  FiUser,
  FiDatabase,
  FiGlobe,
  FiSettings,
  FiEdit,
} from 'react-icons/fi';

const GDPR = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [requestType, setRequestType] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [consentSettings, setConsentSettings] = useState({
    analytics: true,
    marketing: false,
    functional: true,
    preferences: true,
  });

  const handleConsentToggle = (key) => {
    setConsentSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDataRequest = (e) => {
    e.preventDefault();
    setRequestSubmitted(true);
    setTimeout(() => setRequestSubmitted(false), 5000);
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px',
    },
    title: {
      fontSize: '36px',
      color: '#333',
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
    },
    subtitle: {
      fontSize: '18px',
      color: '#666',
      lineHeight: '1.6',
      maxWidth: '800px',
      margin: '0 auto',
    },
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '30px',
      borderBottom: '2px solid #e9ecef',
      paddingBottom: '10px',
      flexWrap: 'wrap',
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
      transition: 'all 0.3s ease',
    },
    activeTab: {
      background: '#667eea',
      color: 'white',
    },
    section: {
      background: 'white',
      borderRadius: '10px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
      fontSize: '24px',
      color: '#333',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '30px',
    },
    card: {
      background: '#f8f9fa',
      borderRadius: '10px',
      padding: '25px',
    },
    cardTitle: {
      fontSize: '18px',
      color: '#333',
      marginBottom: '15px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    cardText: {
      color: '#666',
      lineHeight: '1.6',
      marginBottom: '15px',
    },
    list: {
      listStyle: 'none',
      padding: 0,
    },
    listItem: {
      padding: '10px 0',
      borderBottom: '1px solid #e9ecef',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#666',
    },
    badge: {
      padding: '3px 10px',
      borderRadius: '15px',
      fontSize: '12px',
      fontWeight: 500,
    },
    badgeSuccess: {
      background: '#e8f5e9',
      color: '#28a745',
    },
    badgeWarning: {
      background: '#fff3e0',
      color: '#ffc107',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#333',
    },
    input: {
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      fontSize: '14px',
    },
    select: {
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      fontSize: '14px',
    },
    textarea: {
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '5px',
      fontSize: '14px',
      minHeight: '100px',
      resize: 'vertical',
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
    },
    buttonSecondary: {
      background: '#6c757d',
    },
    buttonDanger: {
      background: '#dc3545',
    },
    alert: {
      padding: '15px',
      borderRadius: '5px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    alertSuccess: {
      background: '#e8f5e9',
      color: '#28a745',
      border: '1px solid #c3e6cb',
    },
    alertInfo: {
      background: '#e3f2fd',
      color: '#1976d2',
      border: '1px solid #bee5eb',
    },
    consentItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '15px 0',
      borderBottom: '1px solid #e9ecef',
    },
    consentInfo: {
      flex: 1,
    },
    consentTitle: {
      fontSize: '16px',
      fontWeight: 500,
      color: '#333',
      marginBottom: '3px',
    },
    consentDesc: {
      fontSize: '13px',
      color: '#999',
    },
    toggle: {
      position: 'relative',
      display: 'inline-block',
      width: '50px',
      height: '24px',
      marginLeft: '15px',
    },
    toggleInput: {
      opacity: 0,
      width: 0,
      height: 0,
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
      borderRadius: '24px',
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
      borderRadius: '50%',
    },
    toggleChecked: {
      backgroundColor: '#667eea',
    },
    toggleCheckedBefore: {
      transform: 'translateX(26px)',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <FiShield /> GDPR Compliance
        </h1>
        <p style={styles.subtitle}>
          General Data Protection Regulation (GDPR) is a regulation in EU law on data protection and privacy.
          Learn how we protect your data and manage your privacy rights.
        </p>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{...styles.tab, ...(activeTab === 'overview' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('overview')}
        >
          <FiInfo /> Overview
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'rights' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('rights')}
        >
          <FiUser /> Your Rights
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'consent' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('consent')}
        >
          <FiSettings /> Consent Preferences
        </button>
        <button
          style={{...styles.tab, ...(activeTab === 'requests' ? styles.activeTab : {})}}
          onClick={() => setActiveTab('requests')}
        >
          <FiMail /> Data Requests
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div style={styles.grid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FiDatabase /> Data We Collect
              </h3>
              <ul style={styles.list}>
                <li style={styles.listItem}>• Account information (name, email, phone)</li>
                <li style={styles.listItem}>• Profile information (bio, avatar, preferences)</li>
                <li style={styles.listItem}>• Payment information (transactions, withdrawals)</li>
                <li style={styles.listItem}>• Affiliate data (links, referrals, earnings)</li>
                <li style={styles.listItem}>• Usage data (clicks, conversions, activity)</li>
                <li style={styles.listItem}>• Technical data (IP address, browser, device)</li>
              </ul>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FiEye /> How We Use Data
              </h3>
              <ul style={styles.list}>
                <li style={styles.listItem}>• Provide and improve our services</li>
                <li style={styles.listItem}>• Process payments and withdrawals</li>
                <li style={styles.listItem}>• Track affiliate performance</li>
                <li style={styles.listItem}>• Communicate with you</li>
                <li style={styles.listItem}>• Detect and prevent fraud</li>
                <li style={styles.listItem}>• Comply with legal obligations</li>
              </ul>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FiLock /> Data Protection
              </h3>
              <ul style={styles.list}>
                <li style={styles.listItem}>• Encrypted data transmission (SSL/TLS)</li>
                <li style={styles.listItem}>• Secure data storage</li>
                <li style={styles.listItem}>• Regular security audits</li>
                <li style={styles.listItem}>• Access controls and authentication</li>
                <li style={styles.listItem}>• Data minimization practices</li>
                <li style={styles.listItem}>• Regular backups</li>
              </ul>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <FiGlobe /> Legal Basis for Processing
            </h3>
            <p style={styles.cardText}>
              We process your personal data based on the following legal grounds:
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                <strong>Contract performance:</strong> Processing necessary to provide our services
              </li>
              <li style={styles.listItem}>
                <strong>Consent:</strong> Marketing communications and optional features
              </li>
              <li style={styles.listItem}>
                <strong>Legal obligations:</strong> Tax and financial reporting
              </li>
              <li style={styles.listItem}>
                <strong>Legitimate interests:</strong> Fraud prevention and service improvement
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Your Rights Tab */}
      {activeTab === 'rights' && (
        <div>
          <div style={styles.grid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FiEye /> Right to Access
              </h3>
              <p style={styles.cardText}>
                You have the right to obtain confirmation about whether your personal data is being processed,
                and access to that data along with supplementary information.
              </p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FiEdit /> Right to Rectification
              </h3>
              <p style={styles.cardText}>
                You have the right to have inaccurate personal data corrected or completed if it is incomplete.
              </p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FiTrash2 /> Right to Erasure
              </h3>
              <p style={styles.cardText}>
                Also known as 'right to be forgotten', you can request deletion of your personal data
                under certain circumstances.
              </p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FiLock /> Right to Restriction
              </h3>
              <p style={styles.cardText}>
                You have the right to restrict the processing of your personal data under certain conditions.
              </p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FiDownload /> Right to Data Portability
              </h3>
              <p style={styles.cardText}>
                You have the right to receive your personal data in a structured, commonly used format
                and transmit it to another controller.
              </p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FiAlertCircle /> Right to Object
              </h3>
              <p style={styles.cardText}>
                You have the right to object to processing of your personal data based on legitimate interests
                or for direct marketing purposes.
              </p>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.alert} style={{...styles.alert, ...styles.alertInfo}}>
              <FiInfo />
              <span>
                To exercise any of these rights, please use the Data Requests tab or contact us at
                <strong> privacy@affiliateplatform.com</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Consent Preferences Tab */}
      {activeTab === 'consent' && (
        <div>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <FiSettings /> Manage Your Consent
            </h3>
            
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
                  ...(consentSettings.analytics ? styles.toggleChecked : {}),
                }}></span>
                <span style={{
                  ...styles.sliderBefore,
                  ...(consentSettings.analytics ? styles.toggleCheckedBefore : {}),
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
                  ...(consentSettings.marketing ? styles.toggleChecked : {}),
                }}></span>
                <span style={{
                  ...styles.sliderBefore,
                  ...(consentSettings.marketing ? styles.toggleCheckedBefore : {}),
                }}></span>
              </label>
            </div>

            <div style={styles.consentItem}>
              <div style={styles.consentInfo}>
                <div style={styles.consentTitle}>Functional Cookies</div>
                <div style={styles.consentDesc}>
                  Enable enhanced functionality and personalization
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
                  ...(consentSettings.functional ? styles.toggleChecked : {}),
                }}></span>
                <span style={{
                  ...styles.sliderBefore,
                  ...(consentSettings.functional ? styles.toggleCheckedBefore : {}),
                }}></span>
              </label>
            </div>

            <div style={styles.consentItem}>
              <div style={styles.consentInfo}>
                <div style={styles.consentTitle}>Preference Cookies</div>
                <div style={styles.consentDesc}>
                  Remember your settings and preferences
                </div>
              </div>
              <label style={styles.toggle}>
                <input 
                  type="checkbox"
                  checked={consentSettings.preferences}
                  onChange={() => handleConsentToggle('preferences')}
                  style={styles.toggleInput}
                />
                <span style={{
                  ...styles.slider,
                  ...(consentSettings.preferences ? styles.toggleChecked : {}),
                }}></span>
                <span style={{
                  ...styles.sliderBefore,
                  ...(consentSettings.preferences ? styles.toggleCheckedBefore : {}),
                }}></span>
              </label>
            </div>

            <button style={{...styles.button, marginTop: '20px'}}>
              <FiCheckCircle /> Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Data Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <FiMail /> Submit a Data Request
            </h3>

            {requestSubmitted && (
              <div style={{...styles.alert, ...styles.alertSuccess}}>
                <FiCheckCircle />
                Your request has been submitted successfully. We'll process it within 30 days.
              </div>
            )}

            <form style={styles.form} onSubmit={handleDataRequest}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Request Type *</label>
                <select 
                  style={styles.select}
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  required
                >
                  <option value="">Select request type</option>
                  <option value="access">Access my data</option>
                  <option value="rectify">Rectify my data</option>
                  <option value="erase">Erase my data (Right to be forgotten)</option>
                  <option value="restrict">Restrict processing</option>
                  <option value="port">Port my data</option>
                  <option value="object">Object to processing</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input 
                  type="text"
                  style={styles.input}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Additional Information</label>
                <textarea 
                  style={styles.textarea}
                  placeholder="Please provide any additional information that might help us process your request"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Verification Method *</label>
                <select style={styles.select} required>
                  <option value="">Select verification method</option>
                  <option value="email">Email verification</option>
                  <option value="phone">Phone verification</option>
                  <option value="password">Password confirmation</option>
                </select>
              </div>

              <button type="submit" style={styles.button}>
                <FiMail /> Submit Request
              </button>
            </form>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <FiClock /> Previous Requests
            </h3>
            
            <div style={styles.list}>
              <div style={styles.listItem}>
                <FiCheckCircle style={{color: '#28a745'}} />
                <div style={{flex: 1}}>
                  <strong>Data Access Request</strong>
                  <div style={{fontSize: '12px', color: '#999'}}>Submitted on Jan 15, 2024</div>
                </div>
                <span style={{...styles.badge, ...styles.badgeSuccess}}>Completed</span>
              </div>
              
              <div style={styles.listItem}>
                <FiClock style={{color: '#ffc107'}} />
                <div style={{flex: 1}}>
                  <strong>Data Rectification Request</strong>
                  <div style={{fontSize: '12px', color: '#999'}}>Submitted on Feb 1, 2024</div>
                </div>
                <span style={{...styles.badge, ...styles.badgeWarning}}>In Progress</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DPO Information */}
      <div style={{...styles.section, background: '#f8f9fa'}}>
        <h3 style={styles.sectionTitle}>
          <FiShield /> Data Protection Officer (DPO)
        </h3>
        <div style={styles.grid}>
          <div style={styles.cardText}>
            <p><strong>Name:</strong> John Smith</p>
            <p><strong>Email:</strong> dpo@affiliateplatform.com</p>
            <p><strong>Phone:</strong> +1 (800) 123-4567</p>
            <p><strong>Address:</strong> 123 Business Street, New York, NY 10001, USA</p>
          </div>
          <div style={styles.cardText}>
            <p><strong>Supervisory Authority:</strong></p>
            <p>Information Commissioner's Office (ICO)</p>
            <p>Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF</p>
            <p>United Kingdom</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPR;
