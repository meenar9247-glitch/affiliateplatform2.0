import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiLock, FiEye, FiUsers, FiMail, FiDatabase, FiCookie, FiDownload, FiCalendar, FiCheckCircle } from 'react-icons/fi';

const Privacy = () => {
  const [lastUpdated, setLastUpdated] = useState('January 1, 2026');
  const [accepted, setAccepted] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already accepted privacy policy
    const hasAccepted = localStorage.getItem('privacyAccepted');
    if (!hasAccepted) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('privacyAccepted', 'true');
    setAccepted(true);
    setShowConsent(false);
  };

  const handleDownload = () => {
    // Create privacy policy text file
    const content = `Privacy Policy - Last Updated: ${lastUpdated}\n\n` +
      `1. Information We Collect\n` +
      `1.1 Personal Information: When you register, we collect your name, email address, phone number, and payment information.\n` +
      `1.2 Usage Data: We collect information about how you interact with our platform, including clicks, conversions, and earnings.\n` +
      `1.3 Device Information: We collect information about your device, browser, and IP address.\n\n` +
      `2. How We Use Your Information\n` +
      `2.1 To provide and maintain our services\n` +
      `2.2 To process your transactions and payments\n` +
      `2.3 To communicate with you about your account\n` +
      `2.4 To improve and personalize your experience\n` +
      `2.5 To detect and prevent fraud\n\n` +
      `3. Information Sharing\n` +
      `3.1 We do not sell your personal information\n` +
      `3.2 We may share information with service providers who assist in operating our platform\n` +
      `3.3 We may disclose information if required by law\n\n` +
      `4. Data Security\n` +
      `4.1 We implement industry-standard security measures\n` +
      `4.2 Your data is encrypted in transit and at rest\n` +
      `4.3 We regularly review and update our security practices\n\n` +
      `5. Your Rights\n` +
      `5.1 Access and update your personal information\n` +
      `5.2 Request deletion of your data\n` +
      `5.3 Opt-out of marketing communications\n` +
      `5.4 Export your data\n\n` +
      `6. Cookies and Tracking\n` +
      `6.1 We use cookies to enhance your experience\n` +
      `6.2 You can control cookie settings in your browser\n` +
      `6.3 Third-party services may use cookies\n\n` +
      `7. Children's Privacy\n` +
      `7.1 Our services are not intended for users under 18\n` +
      `7.2 We do not knowingly collect information from children\n\n` +
      `8. International Data Transfers\n` +
      `8.1 Your data may be processed in different countries\n` +
      `8.2 We ensure appropriate safeguards are in place\n\n` +
      `9. Changes to This Policy\n` +
      `9.1 We may update this policy from time to time\n` +
      `9.2 We will notify you of significant changes\n\n` +
      `10. Contact Us\n` +
      `10.1 Email: privacy@affiliateplatform.com\n` +
      `10.2 Address: 123 Business Ave, Suite 100, San Francisco, CA 94105\n` +
      `10.3 Phone: +1 (888) 123-4567\n\n` +
      `This document was last updated on ${lastUpdated}.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Affiliate-Platform-Privacy-Policy-${lastUpdated.replace(/\s/g, '-')}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // Styles
  const styles = `
    .privacy-page {
      padding: 40px 20px;
      max-width: 1000px;
      margin: 0 auto;
      background: linear-gradient(135deg, #f5f7fa 0%, #f0f4ff 100%);
      min-height: 100vh;
    }

    /* Header */
    .privacy-header {
      background: white;
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 30px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .privacy-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(102,126,234,0.05) 0%, transparent 70%);
      animation: rotate 20s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .privacy-icon {
      font-size: 48px;
      color: #667eea;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }

    .privacy-header h1 {
      margin: 0 0 10px;
      font-size: 36px;
      color: #333;
      position: relative;
      z-index: 1;
    }

    .privacy-header p {
      margin: 0;
      color: #666;
      font-size: 18px;
      position: relative;
      z-index: 1;
    }

    .last-updated {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 20px;
      padding: 8px 16px;
      background: #f0f4ff;
      border-radius: 30px;
      color: #667eea;
      font-size: 14px;
      position: relative;
      z-index: 1;
    }

    /* Table of Contents */
    .toc-section {
      background: white;
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .toc-section h2 {
      margin: 0 0 20px;
      font-size: 24px;
      color: #333;
    }

    .toc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .toc-item {
      padding: 10px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      color: #666;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .toc-item:hover {
      background: #f0f4ff;
      border-color: #667eea;
      color: #667eea;
      transform: translateY(-2px);
    }

    .toc-item span {
      font-weight: 500;
    }

    /* Content Cards */
    .content-card {
      background: white;
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }

    .content-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .card-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
    }

    .card-header h2 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .card-content {
      color: #666;
      line-height: 1.8;
    }

    .card-content h3 {
      margin: 20px 0 10px;
      font-size: 18px;
      color: #333;
    }

    .card-content p {
      margin: 0 0 15px;
    }

    .card-content ul {
      margin: 0 0 15px;
      padding-left: 20px;
    }

    .card-content li {
      margin-bottom: 8px;
    }

    .highlight-box {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .highlight-box p:last-child {
      margin-bottom: 0;
    }

    /* Rights Grid */
    .rights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }

    .right-item {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      transition: all 0.3s ease;
    }

    .right-item:hover {
      background: #f0f4ff;
      transform: translateY(-2px);
    }

    .right-icon {
      font-size: 32px;
      color: #667eea;
      margin-bottom: 15px;
    }

    .right-item h4 {
      margin: 0 0 10px;
      color: #333;
    }

    .right-item p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    /* Contact Info */
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      transition: all 0.3s ease;
    }

    .contact-item:hover {
      background: #f0f4ff;
    }

    .contact-icon {
      font-size: 24px;
      color: #667eea;
    }

    .contact-details h4 {
      margin: 0 0 5px;
      color: #333;
    }

    .contact-details p {
      margin: 0;
      color: #666;
    }

    /* Consent Banner */
    .consent-banner {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 50px;
      padding: 15px 30px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 20px;
      z-index: 1000;
      max-width: 90%;
      flex-wrap: wrap;
      justify-content: center;
    }

    .consent-text {
      color: #333;
      font-size: 14px;
    }

    .consent-buttons {
      display: flex;
      gap: 10px;
    }

    .consent-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .consent-btn.accept {
      background: #667eea;
      color: white;
    }

    .consent-btn.accept:hover {
      background: #5a67d8;
    }

    .consent-btn.decline {
      background: #f8f9fa;
      color: #666;
    }

    .consent-btn.decline:hover {
      background: #e9ecef;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 15px;
      margin-top: 30px;
      flex-wrap: wrap;
    }

    .action-btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .action-btn.primary {
      background: #667eea;
      color: white;
    }

    .action-btn.primary:hover {
      background: #5a67d8;
      transform: translateY(-2px);
    }

    .action-btn.secondary {
      background: white;
      color: #666;
      border: 1px solid #ddd;
    }

    .action-btn.secondary:hover {
      background: #f8f9fa;
      border-color: #667eea;
      color: #667eea;
      transform: translateY(-2px);
    }

    /* Footer */
    .privacy-footer {
      text-align: center;
      margin-top: 40px;
      color: #999;
      font-size: 14px;
    }

    .privacy-footer a {
      color: #667eea;
      text-decoration: none;
    }

    .privacy-footer a:hover {
      text-decoration: underline;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .privacy-page {
        background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
      }

      .privacy-header,
      .toc-section,
      .content-card {
        background: #2d3748;
      }

      .privacy-header h1,
      .toc-section h2,
      .card-header h2,
      .card-content h3,
      .right-item h4,
      .contact-details h4 {
        color: #f7fafc;
      }

      .privacy-header p,
      .card-content,
      .right-item p,
      .contact-details p,
      .toc-item {
        color: #e2e8f0;
      }

      .last-updated {
        background: #1a202c;
        color: #90cdf4;
      }

      .toc-item {
        border-color: #4a5568;
      }

      .toc-item:hover {
        background: #1a202c;
      }

      .highlight-box {
        background: #1a202c;
      }

      .right-item,
      .contact-item {
        background: #1a202c;
      }

      .right-item:hover,
      .contact-item:hover {
        background: #2a3a5a;
      }

      .action-btn.secondary {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .action-btn.secondary:hover {
        background: #2d3748;
      }

      .consent-banner {
        background: #2d3748;
      }

      .consent-text {
        color: #f7fafc;
      }

      .consent-btn.decline {
        background: #1a202c;
        color: #e2e8f0;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .privacy-header {
        padding: 30px 20px;
      }

      .privacy-header h1 {
        font-size: 28px;
      }

      .privacy-header p {
        font-size: 16px;
      }

      .toc-grid {
        grid-template-columns: 1fr;
      }

      .rights-grid {
        grid-template-columns: 1fr;
      }

      .contact-grid {
        grid-template-columns: 1fr;
      }

      .consent-banner {
        flex-direction: column;
        text-align: center;
        border-radius: 20px;
        width: 90%;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="privacy-page">
        {/* Header */}
        <div className="privacy-header">
          <div className="privacy-icon">
            <FiShield />
          </div>
          <h1>Privacy Policy</h1>
          <p>How we collect, use, and protect your information</p>
          <div className="last-updated">
            <FiCalendar /> Last Updated: {lastUpdated}
          </div>
        </div>

        {/* Table of Contents */}
        <div className="toc-section">
          <h2>Table of Contents</h2>
          <div className="toc-grid">
            <a href="#information" className="toc-item"><span>1. Information We Collect</span></a>
            <a href="#usage" className="toc-item"><span>2. How We Use Your Information</span></a>
            <a href="#sharing" className="toc-item"><span>3. Information Sharing</span></a>
            <a href="#security" className="toc-item"><span>4. Data Security</span></a>
            <a href="#rights" className="toc-item"><span>5. Your Rights</span></a>
            <a href="#cookies" className="toc-item"><span>6. Cookies and Tracking</span></a>
            <a href="#children" className="toc-item"><span>7. Children's Privacy</span></a>
            <a href="#international" className="toc-item"><span>8. International Data Transfers</span></a>
            <a href="#changes" className="toc-item"><span>9. Changes to This Policy</span></a>
            <a href="#contact" className="toc-item"><span>10. Contact Us</span></a>
          </div>
        </div>

        {/* Information We Collect */}
        <div id="information" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiDatabase />
            </div>
            <h2>1. Information We Collect</h2>
          </div>
          <div className="card-content">
            <h3>1.1 Personal Information</h3>
            <p>When you register for an account, we collect:</p>
            <ul>
              <li>Full name and email address</li>
              <li>Phone number and address</li>
              <li>Payment information (PayPal, bank details, UPI)</li>
              <li>Tax identification information</li>
              <li>Profile picture and preferences</li>
            </ul>

            <h3>1.2 Usage Data</h3>
            <p>We automatically collect information about how you interact with our platform:</p>
            <ul>
              <li>Affiliate links clicked and shared</li>
              <li>Conversions and earnings data</li>
              <li>Referrals and network connections</li>
              <li>Pages visited and features used</li>
              <li>Time spent on platform</li>
            </ul>

            <h3>1.3 Device Information</h3>
            <p>We collect information about your device:</p>
            <ul>
              <li>IP address and location data</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Device identifiers</li>
            </ul>

            <div className="highlight-box">
              <p><strong>Important:</strong> We only collect information that is necessary to provide and improve our services. You can choose not to provide certain information, but this may limit your ability to use some features.</p>
            </div>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div id="usage" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiEye />
            </div>
            <h2>2. How We Use Your Information</h2>
          </div>
          <div className="card-content">
            <p>We use your information for the following purposes:</p>
            <ul>
              <li><strong>Service Delivery:</strong> To provide and maintain our affiliate marketing platform</li>
              <li><strong>Payment Processing:</strong> To process commissions and withdrawals</li>
              <li><strong>Communication:</strong> To send important updates, newsletters, and marketing materials</li>
              <li><strong>Analytics:</strong> To analyze usage patterns and improve our services</li>
              <li><strong>Fraud Prevention:</strong> To detect and prevent fraudulent activities</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </div>
        </div>

        {/* Information Sharing */}
        <div id="sharing" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiUsers />
            </div>
            <h2>3. Information Sharing</h2>
          </div>
          <div className="card-content">
            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul>
              <li><strong>Service Providers:</strong> With third-party vendors who assist in operating our platform (payment processors, analytics providers)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share your information</li>
            </ul>
          </div>
        </div>

        {/* Data Security */}
        <div id="security" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiLock />
            </div>
            <h2>4. Data Security</h2>
          </div>
          <div className="card-content">
            <p>We implement robust security measures to protect your information:</p>
            <ul>
              <li>256-bit SSL/TLS encryption for all data in transit</li>
              <li>AES-256 encryption for stored data</li>
              <li>Regular security audits and penetration testing</li>
              <li>Strict access controls and authentication requirements</li>
              <li>24/7 monitoring for suspicious activities</li>
            </ul>
            <div className="highlight-box">
              <p><strong>Note:</strong> While we take every precaution, no method of transmission over the Internet is 100% secure. We encourage you to use strong passwords and enable two-factor authentication.</p>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div id="rights" className="content-card">
          <div className="card-header">
      div className="card-icon">
              <FiCheckCircle />
            </div>
            <h2>5. Your Rights</h2>
          </div>
          <div className="card-content">
            <p>You have the following rights regarding your personal information:</p>
            
            <div className="rights-grid">
              <div className="right-item">
                <div className="right-icon">
                  <FiEye />
                </div>
                <h4>Access</h4>
                <p>Request a copy of your personal data</p>
              </div>
              <div className="right-item">
                <div className="right-icon">
                  <FiCheckCircle />
                </div>
                <h4>Rectification</h4>
                <p>Correct inaccurate information</p>
              </div>
              <div className="right-item">
                <div className="right-icon">
                  <FiTrash2 />
                </div>
                <h4>Erasure</h4>
                <p>Request deletion of your data</p>
              </div>
              <div className="right-item">
                <div className="right-icon">
                  <FiDownload />
                </div>
                <h4>Portability</h4>
                <p>Export your data in a portable format</p>
              </div>
              <div className="right-item">
                <div className="right-icon">
                  <FiXCircle />
                </div>
                <h4>Opt-out</h4>
                <p>Object to processing or opt-out of marketing</p>
              </div>
            </div>

            <p>To exercise these rights, please contact our privacy team at <strong>privacy@affiliateplatform.com</strong>.</p>
          </div>
        </div>

        {/* Cookies and Tracking */}
        <div id="cookies" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiCookie />
            </div>
            <h2>6. Cookies and Tracking</h2>
          </div>
          <div className="card-content">
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Keep you logged in to your account</li>
              <li>Remember your preferences</li>
              <li>Track affiliate link clicks and conversions</li>
              <li>Analyze platform usage and performance</li>
              <li>Personalize your experience</li>
            </ul>
            <p>You can control cookie settings through your browser preferences. However, disabling cookies may affect platform functionality.</p>
          </div>
        </div>

        {/* Children's Privacy */}
        <div id="children" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiUsers />
            </div>
            <h2>7. Children's Privacy</h2>
          </div>
          <div className="card-content">
            <p>Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from minors. If you become aware that a child has provided us with personal information, please contact us immediately.</p>
          </div>
        </div>

        {/* International Data Transfers */}
        <div id="international" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiGlobe />
            </div>
            <h2>8. International Data Transfers</h2>
          </div>
          <div className="card-content">
            <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place through:</p>
            <ul>
              <li>Standard contractual clauses approved by the European Commission</li>
              <li>Binding corporate rules</li>
              <li>Certification under privacy frameworks (GDPR, CCPA, etc.)</li>
            </ul>
          </div>
        </div>

        {/* Changes to This Policy */}
        <div id="changes" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiCalendar />
            </div>
            <h2>9. Changes to This Policy</h2>
          </div>
          <div className="card-content">
            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
            <ul>
              <li>Posting the new policy on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending an email notification (for significant changes)</li>
            </ul>
            <p>We encourage you to review this policy periodically.</p>
          </div>
        </div>

        {/* Contact Us */}
        <div id="contact" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiMail />
            </div>
            <h2>10. Contact Us</h2>
          </div>
          <div className="card-content">
            <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
            
            <div className="contact-grid">
              <div className="contact-item">
                <FiMail className="contact-icon" />
                <div className="contact-details">
                  <h4>Email</h4>
                  <p>privacy@affiliateplatform.com</p>
                </div>
              </div>
              
              <div className="contact-item">
                <FiGlobe className="contact-icon" />
                <div className="contact-details">
                  <h4>Address</h4>
                  <p>123 Business Ave, Suite 100<br />San Francisco, CA 94105</p>
                </div>
              </div>
              
              <div className="contact-item">
                <FiPhone className="contact-icon" />
                <div className="contact-details">
                  <h4>Phone</h4>
                  <p>+1 (888) 123-4567</p>
                  <p>Mon-Fri, 9am-5pm PT</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-btn primary" onClick={handleDownload}>
            <FiDownload /> Download Privacy Policy
          </button>
          <button className="action-btn secondary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to Top
          </button>
        </div>

        {/* Footer */}
        <div className="privacy-footer">
          <p>© 2026 Affiliate Platform. All rights reserved.</p>
          <p>
            <Link to="/terms">Terms of Service</Link> | 
            <Link to="/cookies">Cookie Policy</Link> | 
            <Link to="/gdpr">GDPR Compliance</Link>
          </p>
        </div>

        {/* Consent Banner */}
        {showConsent && !accepted && (
          <div className="consent-banner">
            <span className="consent-text">
              We use cookies to enhance your experience. By continuing to visit this site, you agree to our use of cookies.
            </span>
            <div className="consent-buttons">
              <button className="consent-btn accept" onClick={handleAccept}>
                Accept
              </button>
              <button className="consent-btn decline" onClick={() => setShowConsent(false)}>
                Decline
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Privacy;
