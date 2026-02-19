import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
  FiShield,
  FiLock,
  FiUsers,
  FiDollarSign,
  FiClock,
  FiCalendar,
  FiDownload,
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiGlobe
} from 'react-icons/fi';

const Terms = () => {
  const [lastUpdated, setLastUpdated] = useState('January 1, 2026');
  const [accepted, setAccepted] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptChecked, setAcceptChecked] = useState(false);

  useEffect(() => {
    // Check if user has already accepted terms
    const hasAccepted = localStorage.getItem('termsAccepted');
    if (hasAccepted) {
      setAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    if (acceptChecked) {
      localStorage.setItem('termsAccepted', 'true');
      setAccepted(true);
      setShowAcceptModal(false);
    }
  };

  const handleDownload = () => {
    // Create terms text file
    const content = `Terms of Service - Last Updated: ${lastUpdated}\n\n` +
      `1. Acceptance of Terms\n` +
      `By accessing and using the Affiliate Platform ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.\n\n` +
      `2. Eligibility\n` +
      `You must be at least 18 years old to use this Platform. By using our services, you represent and warrant that you meet this requirement.\n\n` +
      `3. Account Registration\n` +
      `3.1 You must provide accurate and complete information when creating an account.\n` +
      `3.2 You are responsible for maintaining the security of your account credentials.\n` +
      `3.3 You must promptly notify us of any unauthorized use of your account.\n\n` +
      `4. Affiliate Program\n` +
      `4.1 Commission Structure: Affiliates earn commissions based on qualified referrals as outlined in the commission schedule.\n` +
      `4.2 Payment Terms: Commissions are paid within 30 days of the end of each month, subject to minimum payout thresholds.\n` +
      `4.3 Cookie Duration: Referrals are tracked using cookies with a standard 30-day attribution window.\n` +
      `4.4 Prohibited Activities: Affiliates may not engage in fraudulent activities, spamming, or misrepresentation.\n\n` +
      `5. Intellectual Property\n` +
      `All content, trademarks, and intellectual property on the Platform are owned by Affiliate Platform or its licensors.\n\n` +
      `6. User Conduct\n` +
      `You agree not to:\n` +
      `- Violate any applicable laws or regulations\n` +
      `- Infringe upon the rights of others\n` +
      `- Distribute malware or harmful code\n` +
      `- Interfere with the Platform's operation\n` +
      `- Engage in deceptive or fraudulent activities\n\n` +
      `7. Termination\n` +
      `We reserve the right to suspend or terminate your account for violations of these terms or for any other reason at our discretion.\n\n` +
      `8. Limitation of Liability\n` +
      `To the maximum extent permitted by law, Affiliate Platform shall not be liable for any indirect, incidental, or consequential damages.\n\n` +
      `9. Indemnification\n` +
      `You agree to indemnify and hold Affiliate Platform harmless from any claims arising from your use of the Platform.\n\n` +
      `10. Governing Law\n` +
      `These terms shall be governed by the laws of the State of California, without regard to its conflict of law provisions.\n\n` +
      `11. Changes to Terms\n` +
      `We may modify these terms at any time. Continued use of the Platform after changes constitutes acceptance.\n\n` +
      `12. Contact Information\n` +
      `Email: legal@affiliateplatform.com\n` +
      `Address: 123 Business Ave, Suite 100, San Francisco, CA 94105\n` +
      `Phone: +1 (888) 123-4567\n\n` +
      `This document was last updated on ${lastUpdated}.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Affiliate-Platform-Terms-of-Service-${lastUpdated.replace(/\s/g, '-')}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // Styles
  const styles = `
    .terms-page {
      padding: 40px 20px;
      max-width: 1000px;
      margin: 0 auto;
      background: linear-gradient(135deg, #f5f7fa 0%, #f0f4ff 100%);
      min-height: 100vh;
    }

    /* Header */
    .terms-header {
      background: white;
      border-radius: 20px;
      padding: 40px;
      margin-bottom: 30px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .terms-header::before {
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

    .terms-icon {
      font-size: 48px;
      color: #667eea;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }

    .terms-header h1 {
      margin: 0 0 10px;
      font-size: 36px;
      color: #333;
      position: relative;
      z-index: 1;
    }

    .terms-header p {
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

    /* Acceptance Banner */
    .acceptance-banner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 30px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 15px;
    }

    .acceptance-text {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .acceptance-icon {
      font-size: 24px;
    }

    .acceptance-buttons {
      display: flex;
      gap: 10px;
    }

    .acceptance-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .acceptance-btn.accept {
      background: white;
      color: #667eea;
    }

    .acceptance-btn.accept:hover {
      background: #f0f4ff;
      transform: translateY(-2px);
    }

    .acceptance-btn.view {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
    }

    .acceptance-btn.view:hover {
      background: rgba(255,255,255,0.3);
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
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .toc-item {
      padding: 12px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      color: #666;
      text-decoration: none;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toc-item:hover {
      background: #f0f4ff;
      border-color: #667eea;
      color: #667eea;
      transform: translateY(-2px);
    }

    .toc-number {
      font-weight: 600;
      color: #667eea;
    }

    /* Content Cards */
    .content-card {
      background: white;
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
      scroll-margin-top: 20px;
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
      padding-bottom: 15px;
      border-bottom: 2px solid #e9ecef;
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
      flex: 1;
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

    .card-content h4 {
      margin: 15px 0 8px;
      font-size: 16px;
      color: #333;
    }

    .card-content p {
      margin: 0 0 15px;
    }

    .card-content ul, 
    .card-content ol {
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

    .warning-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      color: #856404;
    }

    /* Prohibited Activities Grid */
    .prohibited-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }

    .prohibited-item {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      transition: all 0.3s ease;
    }

    .prohibited-item:hover {
      background: #fee;
      transform: translateY(-2px);
    }

    .prohibited-icon {
      font-size: 24px;
      color: #dc3545;
      margin-bottom: 10px;
    }

    .prohibited-item h4 {
      margin: 0 0 10px;
      color: #333;
    }

    .prohibited-item p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    /* Commission Table */
    .commission-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    .commission-table th {
      padding: 12px;
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
      text-align: left;
    }

    .commission-table td {
      padding: 12px;
      border-bottom: 1px solid #e9ecef;
      color: #666;
    }

    .commission-table tr:hover td {
      background: #f8f9fa;
    }

    /* Contact Grid */
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
      transform: translateY(-2px);
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

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 20px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-content h3 {
      margin: 0 0 15px;
      font-size: 24px;
      color: #333;
    }

    .modal-content p {
      margin: 0 0 20px;
      color: #666;
    }

    .accept-checkbox {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .accept-checkbox input {
      width: auto;
    }

    .accept-checkbox label {
      color: #333;
      font-size: 14px;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .modal-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .modal-btn.primary {
      background: #667eea;
      color: white;
    }

    .modal-btn.primary:hover:not(:disabled) {
      background: #5a67d8;
    }

    .modal-btn.primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .modal-btn.secondary {
      background: #f8f9fa;
      color: #666;
    }

    .modal-btn.secondary:hover {
      background: #e9ecef;
    }

    /* Footer */
    .terms-footer {
      text-align: center;
      margin-top: 40px;
      color: #999;
      font-size: 14px;
    }

    .terms-footer a {
      color: #667eea;
      text-decoration: none;
      margin: 0 5px;
    }

    .terms-footer a:hover {
      text-decoration: underline;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .terms-page {
        background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
      }

      .terms-header,
      .toc-section,
      .content-card,
      .modal-content {
        background: #2d3748;
      }

      .terms-header h1,
      .toc-section h2,
      .card-header h2,
      .modal-content h3,
      .contact-details h4,
      .prohibited-item h4 {
        color: #f7fafc;
      }

      .terms-header p,
      .card-content,
      .toc-item,
      .prohibited-item p,
      .contact-details p,
      .modal-content p {
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

      .card-header {
        border-bottom-color: #4a5568;
      }

      .highlight-box {
        background: #1a202c;
      }

      .warning-box {
        background: #332e1a;
        color: #ffd966;
      }

      .prohibited-item,
      .contact-item {
        background: #1a202c;
      }

      .prohibited-item:hover {
        background: #2a1a1a;
      }

      .commission-table th {
        background: #1a202c;
        color: #e2e8f0;
      }

      .commission-table td {
        border-bottom-color: #4a5568;
        color: #e2e8f0;
      }

      .commission-table tr:hover td {
        background: #1a202c;
      }

      .action-btn.secondary {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .action-btn.secondary:hover {
        background: #2d3748;
      }

      .accept-checkbox {
        background: #1a202c;
      }

      .accept-checkbox label {
        color: #e2e8f0;
      }

      .modal-btn.secondary {
        background: #1a202c;
        color: #e2e8f0;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .terms-header {
        padding: 30px 20px;
      }

      .terms-header h1 {
        font-size: 28px;
      }

      .terms-header p {
        font-size: 16px;
      }

      .toc-grid {
        grid-template-columns: 1fr;
      }

      .prohibited-grid {
        grid-template-columns: 1fr;
      }

      .contact-grid {
        grid-template-columns: 1fr;
      }

      .acceptance-banner {
        flex-direction: column;
        text-align: center;
      }

      .acceptance-text {
        flex-direction: column;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-btn {
        width: 100%;
        justify-content: center;
      }

      .modal-content {
        padding: 20px;
      }

      .modal-actions {
        flex-direction: column;
      }

      .modal-btn {
        width: 100%;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="terms-page">
        {/* Header */}
        <div className="terms-header">
          <div className="terms-icon">
            <FiFileText />
          </div>
          <h1>Terms of Service</h1>
          <p>Please read these terms carefully before using our platform</p>
          <div className="last-updated">
            <FiCalendar /> Last Updated: {lastUpdated}
          </div>
        </div>

        {/* Acceptance Banner */}
        {!accepted && (
          <div className="acceptance-banner">
            <div className="acceptance-text">
              <FiAlertCircle className="acceptance-icon" />
              <span>Please review and accept our Terms of Service to continue using the platform.</span>
            </div>
            <div className="acceptance-buttons">
              <button className="acceptance-btn view" onClick={() => setShowAcceptModal(true)}>
                View Terms
              </button>
            </div>
          </div>
        )}

        {/* Table of Contents */}
        <div className="toc-section">
          <h2>Table of Contents</h2>
          <div className="toc-grid">
            <a href="#acceptance" className="toc-item"><span className="toc-number">1.</span> Acceptance of Terms</a>
            <a href="#eligibility" className="toc-item"><span className="toc-number">2.</span> Eligibility</a>
            <a href="#account" className="toc-item"><span className="toc-number">3.</span> Account Registration</a>
            <a href="#affiliate" className="toc-item"><span className="toc-number">4.</span> Affiliate Program</a>
            <a href="#intellectual" className="toc-item"><span className="toc-number">5.</span> Intellectual Property</a>
            <a href="#conduct" className="toc-item"><span className="toc-number">6.</span> User Conduct</a>
            <a href="#termination" className="toc-item"><span className="toc-number">7.</span> Termination</a>
            <a href="#liability" className="toc-item"><span className="toc-number">8.</span> Limitation of Liability</a>
            <a href="#indemnification" className="toc-item"><span className="toc-number">9.</span> Indemnification</a>
            <a href="#governing" className="toc-item"><span className="toc-number">10.</span> Governing Law</a>
            <a href="#changes" className="toc-item"><span className="toc-number">11.</span> Changes to Terms</a>
            <a href="#contact" className="toc-item"><span className="toc-number">12.</span> Contact Information</a>
          </div>
        </div>

        {/* Content Sections */}
        <div id="acceptance" className="content-card">
          <div className="card-header">
            <div className="card-icon">
      <FiCheckCircle />
            </div>
            <h2>1. Acceptance of Terms</h2>
          </div>
          <div className="card-content">
            <p>By accessing and using the Affiliate Platform ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, you may not access or use the Platform.</p>
            <div className="highlight-box">
              <p><strong>Important:</strong> These terms constitute a legally binding agreement between you and Affiliate Platform. Please read them carefully.</p>
            </div>
          </div>
        </div>

        <div id="eligibility" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiUsers />
            </div>
            <h2>2. Eligibility</h2>
          </div>
          <div className="card-content">
            <p>To use our services, you must:</p>
            <ul>
              <li>Be at least 18 years old</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Not be located in a country subject to US trade sanctions</li>
              <li>Not have been previously suspended or removed from the Platform</li>
            </ul>
            <p>By using the Platform, you represent and warrant that you meet all eligibility requirements.</p>
          </div>
        </div>

        <div id="account" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiLock />
            </div>
            <h2>3. Account Registration</h2>
          </div>
          <div className="card-content">
            <h3>3.1 Account Creation</h3>
            <p>To access certain features, you must create an account. You agree to:</p>
            <ul>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information as needed</li>
              <li>Create a strong password and keep it confidential</li>
              <li>Not share your account credentials with others</li>
            </ul>

            <h3>3.2 Account Security</h3>
            <p>You are responsible for:</p>
            <ul>
              <li>All activities that occur under your account</li>
              <li>Maintaining the security of your account credentials</li>
              <li>Promptly notifying us of any unauthorized use</li>
            </ul>

            <h3>3.3 Account Types</h3>
            <ul>
              <li><strong>Standard Affiliate:</strong> Basic access to affiliate program features</li>
              <li><strong>Premium Affiliate:</strong> Enhanced features and higher commission rates (subject to additional terms)</li>
              <li><strong>Admin Account:</strong> For platform administrators only (by invitation)</li>
            </ul>
          </div>
        </div>

        <div id="affiliate" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiDollarSign />
            </div>
            <h2>4. Affiliate Program</h2>
          </div>
          <div className="card-content">
            <h3>4.1 Commission Structure</h3>
            <table className="commission-table">
              <thead>
                <tr>
                  <th>Commission Tier</th>
                  <th>Rate</th>
                  <th>Requirements</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Standard</td>
                  <td>5-10%</td>
                  <td>Default for new affiliates</td>
                </tr>
                <tr>
                  <td>Silver</td>
                  <td>10-15%</td>
                  <td>$1,000+ monthly sales</td>
                </tr>
                <tr>
                  <td>Gold</td>
                  <td>15-20%</td>
                  <td>$5,000+ monthly sales</td>
                </tr>
                <tr>
                  <td>Platinum</td>
                  <td>20-25%</td>
                  <td>$10,000+ monthly sales</td>
                </tr>
              </tbody>
            </table>

            <h3>4.2 Payment Terms</h3>
            <ul>
              <li>Commissions are calculated monthly</li>
              <li>Payments are processed within 30 days of month-end</li>
              <li>Minimum payout: $10</li>
              <li>Payment methods: PayPal, Bank Transfer, UPI</li>
            </ul>

            <h3>4.3 Cookie Duration</h3>
            <p>Referrals are tracked using cookies with the following duration:</p>
            <ul>
              <li>Standard: 30 days</li>
              <li>Premium: 60 days</li>
              <li>Platinum: 90 days</li>
            </ul>

            <h3>4.4 Commission Adjustments</h3>
            <p>We reserve the right to:</p>
            <ul>
              <li>Adjust commission rates with 30 days notice</li>
              <li>Withhold commissions for fraudulent activities</li>
              <li>Reverse commissions for refunded transactions</li>
            </ul>
          </div>
        </div>

        <div id="conduct" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiAlertCircle />
            </div>
            <h2>5. User Conduct</h2>
          </div>
          <div className="card-content">
            <h3>5.1 Prohibited Activities</h3>
            <div className="prohibited-grid">
              <div className="prohibited-item">
                <FiXCircle className="prohibited-icon" />
                <h4>Fraudulent Activity</h4>
                <p>Creating fake accounts, click fraud, or false conversions</p>
              </div>
              <div className="prohibited-item">
                <FiXCircle className="prohibited-icon" />
                <h4>Spamming</h4>
                <p>Unsolicited bulk emails, messages, or posts</p>
              </div>
              <div className="prohibited-item">
                <FiXCircle className="prohibited-icon" />
                <h4>Misrepresentation</h4>
                <p>False claims about products or earning potential</p>
              </div>
              <div className="prohibited-item">
                <FiXCircle className="prohibited-icon" />
                <h4>Intellectual Property Infringement</h4>
                <p>Using copyrighted materials without permission</p>
              </div>
              <div className="prohibited-item">
                <FiXCircle className="prohibited-icon" />
                <h4>Malicious Code</h4>
                <p>Distributing viruses, malware, or harmful code</p>
              </div>
              <div className="prohibited-item">
                <FiXCircle className="prohibited-icon" />
                <h4>System Interference</h4>
                <p>Attempting to disrupt or overload our systems</p>
              </div>
            </div>

            <h3>5.2 Reporting Violations</h3>
            <p>If you encounter violations of these terms, please report them to <strong>abuse@affiliateplatform.com</strong>.</p>
          </div>
        </div>

        <div id="termination" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiXCircle />
            </div>
            <h2>6. Termination</h2>
          </div>
          <div className="card-content">
            <h3>6.1 Termination by You</h3>
            <p>You may terminate your account at any time through account settings or by contacting support.</p>

            <h3>6.2 Termination by Us</h3>
            <p>We may suspend or terminate your account for:</p>
            <ul>
              <li>Violation of these terms</li>
              <li>Fraudulent or illegal activities</li>
              <li>Extended inactivity (12+ months)</li>
              <li>At our discretion, with notice where possible</li>
            </ul>

            <h3>6.3 Effect of Termination</h3>
            <p>Upon termination:</p>
            <ul>
              <li>Access to your account will be revoked</li>
              <li>Pending commissions may be forfeited if termination is for cause</li>
              <li>You must cease using our services</li>
            </ul>
          </div>
        </div>

        <div id="liability" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiShield />
            </div>
            <h2>7. Limitation of Liability</h2>
          </div>
          <div className="card-content">
            <p>To the maximum extent permitted by law, Affiliate Platform shall not be liable for:</p>
            <ul>
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Damages resulting from unauthorized access to your account</li>
              <li>Third-party claims arising from your use of the Platform</li>
            </ul>
            <div className="warning-box">
              <p><strong>Note:</strong> Some jurisdictions do not allow certain limitations of liability, so these limitations may not apply to you.</p>
            </div>
          </div>
        </div>

        <div id="governing" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiGlobe />
            </div>
            <h2>8. Governing Law</h2>
          </div>
          <div className="card-content">
            <p>These terms shall be governed by the laws of the State of California, without regard to its conflict of law provisions. Any disputes arising under these terms shall be resolved in the federal or state courts located in San Francisco, California.</p>
          </div>
        </div>

        <div id="changes" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiClock />
            </div>
            <h2>9. Changes to Terms</h2>
          </div>
          <div className="card-content">
            <p>We may modify these terms at any time. Changes will be effective upon posting to the Platform. Your continued use of the Platform after changes constitutes acceptance of the modified terms. For material changes, we will provide notice through email or platform notification.</p>
          </div>
        </div>

        <div id="contact" className="content-card">
          <div className="card-header">
            <div className="card-icon">
              <FiMail />
            </div>
            <h2>10. Contact Information</h2>
          </div>
          <div className="card-content">
            <p>If you have questions about these Terms, please contact us:</p>
            
            <div className="contact-grid">
              <div className="contact-item">
                <FiMail className="contact-icon" />
                <div className="contact-details">
                  <h4>Email</h4>
                  <p>legal@affiliateplatform.com</p>
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
            <FiDownload /> Download Terms
          </button>
          {!accepted && (
            <button className="action-btn primary" onClick={() => setShowAcceptModal(true)}>
              <FiCheckCircle /> Accept Terms
            </button>
          )}
          <button className="action-btn secondary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to Top
          </button>
        </div>

        {/* Footer */}
        <div className="terms-footer">
          <p>© 2026 Affiliate Platform. All rights reserved.</p>
          <p>
            <Link to="/privacy">Privacy Policy</Link> | 
            <Link to="/cookies">Cookie Policy</Link> | 
            <Link to="/disclaimer">Disclaimer</Link>
          </p>
        </div>

        {/* Accept Terms Modal */}
        {showAcceptModal && (
          <div className="modal-overlay" onClick={() => setShowAcceptModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Accept Terms of Service</h3>
              <p>Please confirm that you have read and agree to our Terms of Service.</p>
              
              <div className="accept-checkbox">
                <input
                  type="checkbox"
                  id="accept"
                  checked={acceptChecked}
                  onChange={(e) => setAcceptChecked(e.target.checked)}
                />
                <label htmlFor="accept">I have read and agree to the Terms of Service</label>
              </div>

              <div className="modal-actions">
                <button className="modal-btn secondary" onClick={() => setShowAcceptModal(false)}>
                  Cancel
                </button>
                <button
                  className="modal-btn primary"
                  onClick={handleAccept}
                  disabled={!acceptChecked}
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Terms;
