import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiSettings,
  FiDollarSign,
  FiPercent,
  FiClock,
  FiUsers,
  FiLink,
  FiMail,
  FiBell,
  FiShield,
  FiLock,
  FiGlobe,
  FiDatabase,
  FiServer,
  FiRefreshCw,
  FiSave,
  FiEye,
  FiEyeOff,
  FiToggleLeft,
  FiToggleRight,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
  FiHelpCircle,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiPlus,
  FiEdit,
  FiCopy
} from 'react-icons/fi';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Affiliate Platform',
      siteUrl: 'https://affiliateplatform.com',
      supportEmail: 'support@affiliateplatform.com',
      adminEmail: 'admin@affiliateplatform.com',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      language: 'en',
      maintenanceMode: false,
      debugMode: false
    },
    commission: {
      defaultRate: 10,
      minimumRate: 1,
      maximumRate: 50,
      tiers: [
        { level: 'Bronze', minEarnings: 0, rate: 5 },
        { level: 'Silver', minEarnings: 1000, rate: 10 },
        { level: 'Gold', minEarnings: 5000, rate: 15 },
        { level: 'Platinum', minEarnings: 10000, rate: 20 }
      ],
      cookieDuration: 30,
      referralCommission: 5,
      bonusEnabled: true,
      bonusAmount: 100
    },
    payments: {
      currency: 'USD',
      minimumWithdrawal: 10,
      maximumWithdrawal: 10000,
      withdrawalFee: 0,
      feeType: 'percentage', // percentage or fixed
      payoutSchedule: 'weekly', // daily, weekly, biweekly, monthly
      payoutDay: 'monday',
      autoApprove: false,
      requireVerification: true,
      paymentMethods: ['paypal', 'bank', 'upi']
    },
    users: {
      requireEmailVerification: true,
      requirePhoneVerification: false,
      allowRegistration: true,
      defaultUserRole: 'user',
      sessionTimeout: 30, // minutes
      maxLoginAttempts: 5,
      lockoutDuration: 15, // minutes
      passwordMinLength: 8,
      requireStrongPassword: true,
      twoFactorAuth: false
    },
    security: {
      rateLimiting: true,
      maxRequestsPerMinute: 60,
      enableCaptcha: true,
      captchaSiteKey: '',
      captchaSecretKey: '',
      enableSSL: true,
      enableFirewall: true,
      allowedIPs: [],
      blockedIPs: [],
      sessionEncryption: true,
      dataEncryption: true
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: true,
      smtpUser: '',
      smtpPass: '',
      fromEmail: 'noreply@affiliateplatform.com',
      fromName: 'Affiliate Platform',
      emailTemplates: {
        welcome: 'welcome.html',
        verification: 'verification.html',
        passwordReset: 'password-reset.html',
        payout: 'payout.html'
      }
    },
    affiliate: {
      allowMultiLevel: true,
      maxLevels: 3,
      autoApproveLinks: false,
      requireLinkApproval: true,
      maxLinksPerUser: 100,
      allowedDomains: [],
      blockedDomains: [],
      enableQrCodes: true,
      enableSocialSharing: true,
      defaultLinkType: 'direct'
    },
    appearance: {
      theme: 'light',
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      logo: '',
      favicon: '',
      customCSS: '',
      customJS: ''
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily', // hourly, daily, weekly, monthly
      backupTime: '02:00',
      backupRetention: 30, // days
      lastBackup: null,
      backupLocation: 's3'
    },
    api: {
      enableApi: true,
      apiRateLimit: 1000,
      requireApiKey: true,
      allowedOrigins: [],
      apiVersion: 'v1',
      documentation: true,
      sandboxMode: false
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/settings`
      );
      
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/settings`,
        settings
      );
      
      if (response.data.success) {
        toast.success('Settings saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/admin/settings/reset`
        );
        
        if (response.data.success) {
          setSettings(response.data.settings);
          toast.success('Settings reset to defaults');
        }
      } catch (error) {
        toast.error('Failed to reset settings');
      }
    }
  };

  const handleExportSettings = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/settings/export`,
        {
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'settings-backup.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Settings exported successfully');
    } catch (error) {
      toast.error('Failed to export settings');
    }
  };

  const handleImportSettings = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('settings', file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/settings/import`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      
      if (response.data.success) {
        setSettings(response.data.settings);
        toast.success('Settings imported successfully');
      }
    } catch (error) {
      toast.error('Failed to import settings');
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  const handleArrayChange = (section, field, index, value) => {
    const newArray = [...settings[section][field]];
    newArray[index] = value;
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: newArray
      }
    });
  };

  const handleAddArrayItem = (section, field, defaultItem) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: [...settings[section][field], defaultItem]
      }
    });
  };

  const handleRemoveArrayItem = (section, field, index) => {
    const newArray = settings[section][field].filter((_, i) => i !== index);
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: newArray
      }
    });
  };

  const handleToggle = (section, field) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: !settings[section][field]
      }
    });
  };

  // Tabs
  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'commission', label: 'Commission', icon: FiPercent },
    { id: 'payments', label: 'Payments', icon: FiDollarSign },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'email', label: 'Email', icon: FiMail },
    { id: 'affiliate', label: 'Affiliate', icon: FiLink },
    { id: 'appearance', label: 'Appearance', icon: FiEye },
    { id: 'backup', label: 'Backup', icon: FiDatabase },
    { id: 'api', label: 'API', icon: FiGlobe }
  ];

  // Styles
  const styles = `
    .admin-settings {
      padding: 40px 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-left h1 {
      margin: 0 0 10px;
      font-size: 32px;
      color: #333;
    }

    .header-left p {
      margin: 0;
      color: #666;
    }

    .header-right {
      display: flex;
      gap: 10px;
    }

    .save-btn,
    .reset-btn,
    .export-btn,
    .import-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .save-btn {
      background: #667eea;
      color: white;
    }

    .save-btn:hover:not(:disabled) {
      background: #5a67d8;
      transform: translateY(-2px);
    }

    .save-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .reset-btn {
      background: white;
      color: #666;
      border: 1px solid #ddd;
    }

    .reset-btn:hover {
      background: #f8f9fa;
      border-color: #dc3545;
      color: #dc3545;
    }

    .export-btn,
    .import-btn {
      background: white;
      color: #666;
      border: 1px solid #ddd;
    }

    .export-btn:hover,
    .import-btn:hover {
      background: #f8f9fa;
      border-color: #667eea;
      color: #667eea;
    }

    /* Settings Container */
    .settings-container {
      display: flex;
      gap: 30px;
    }

    /* Sidebar */
    .settings-sidebar {
      width: 250px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .settings-nav {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;
      color: #666;
    }

    .nav-item:hover {
      background: #f8f9fa;
    }

    .nav-item.active {
      background: #f0f4ff;
      border-left-color: #667eea;
      color: #667eea;
    }

    .nav-icon {
      font-size: 18px;
    }

    /* Main Content */
    .settings-content {
      flex: 1;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 30px;
    }

    .content-header {
      margin-bottom: 30px;
    }

    .content-header h2 {
      margin: 0 0 10px;
      font-size: 24px;
      color: #333;
    }

    .content-header p {
      margin: 0;
      color: #666;
    }

    /* Form Sections */
    .form-section {
      margin-bottom: 30px;
    }

    .form-section h3 {
      margin: 0 0 20px;
      font-size: 18px;
      color: #333;
      padding-bottom: 10px;
      border-bottom: 2px solid #e9ecef;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .form-group textarea {
      min-height: 100px;
      resize: vertical;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }

    .form-group.checkbox {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .form-group.checkbox input {
      width: auto;
    }

    .hint {
      display: block;
      margin-top: 5px;
      font-size: 12px;
      color: #999;
    }

    /* Toggle Switch */
    .toggle-switch {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
    }

    .toggle-label {
      font-size: 14px;
      color: #666;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.3s;
      border-radius: 24px;
    }

    .slider:before {
      position: absolute;
      content: '';
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #667eea;
    }

    input:checked + .slider:before {
      transform: translateX(26px);
    }

    /* Array Items */
    .array-item {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }

    .array-item input {
      flex: 1;
    }

    .array-remove-btn {
      padding: 0 10px;
      background: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 5px;
      color: #dc3545;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .array-remove-btn:hover {
      background: #dc3545;
      color: white;
      border-color: #dc3545;
    }

    .array-add-btn {
      padding: 10px;
      background: white;
      border: 1px dashed #ddd;
      border-radius: 5px;
      color: #667eea;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      width: 100%;
      transition: all 0.3s ease;
    }

    .array-add-btn:hover {
      border-color: #667eea;
      background: #f0f4ff;
    }

    /* Commission Tiers */
    .tiers-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    .tiers-table th {
      padding: 12px;
      text-align: left;
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }

    .tiers-table td {
      padding: 12px;
      border-bottom: 1px solid #e9ecef;
    }

    .tiers-table input {
      width: 100%;
      padding: 5px;
      border: 1px solid #ddd;
      border-radius: 3px;
    }

    .tier-remove-btn {
      padding: 5px 10px;
      background: none;
      border: none;
      color: #dc3545;
      cursor: pointer;
    }

    .tier-add-btn {
      padding: 10px;
      background: white;
      border: 1px dashed #667eea;
      border-radius: 5px;
      color: #667eea;
      cursor: pointer;
      width: 100%;
      margin-top: 10px;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
    }

    .btn-primary {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5a67d8;
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      padding: 12px 24px;
      background: white;
      color: #666;
      border: 1px solid #ddd;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: #f8f9fa;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .settings-sidebar,
      .settings-content {
        background: #2d3748;
      }

      .header-left h1 {
        color: #f7fafc;
      }

      .header-left p,
      .content-header p,
      .toggle-label {
        color: #e2e8f0;
      }

      .content-header h2,
      .form-section h3,
      .form-group label {
        color: #f7fafc;
      }

      .nav-item {
        color: #e2e8f0;
      }

      .nav-item:hover {
        background: #1a202c;
      }

      .nav-item.active {
        background: #1a2a4a;
      }

      .form-group input,
      .form-group select,
      .form-group textarea {
        background: #1a202c;
        border-color: #4a5568;
        color: #f7fafc;
      }

      .reset-btn,
      .export-btn,
      .import-btn,
      .btn-secondary {
        background: #1a202c;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .reset-btn:hover,
      .export-btn:hover,
      .import-btn:hover {
        background: #2d3748;
      }

      .tiers-table th {
        background: #1a202c;
        color: #e2e8f0;
      }

      .tiers-table td {
        border-bottom-color: #4a5568;
      }

      .tiers-table input {
        background: #1a202c;
        border-color: #4a5568;
        color: #f7fafc;
      }

      .array-remove-btn {
        background: #1a202c;
        border-color: #4a5568;
      }

      .array-add-btn {
        background: #1a202c;
        border-color: #4a5568;
      }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .settings-container {
        flex-direction: column;
      }

      .settings-sidebar {
        width: 100%;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-right {
        flex-direction: column;
      }

      .save-btn,
      .reset-btn,
      .export-btn,
      .import-btn {
        width: 100%;
        justify-content: center;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
        justify-content: center;
      }

      .tiers-table {
        display: block;
        overflow-x: auto;
      }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="admin-settings">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>System Settings</h1>
            <p>Configure platform settings and preferences</p>
          </div>
          <div className="header-right">
            <button className="save-btn" onClick={handleSaveSettings} disabled={saving}>
              {saving ? <FiRefreshCw className="spin" /> : <FiSave />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="reset-btn" onClick={handleResetSettings}>
              <FiRefreshCw /> Reset
            </button>
            <button className="export-btn" onClick={handleExportSettings}>
              <FiDownload /> Export
            </button>
            <button className="import-btn" onClick={() => document.getElementById('import-file').click()}>
              <FiUpload /> Import
            </button>
            <input
              type="file"
              id="import-file"
              style={{ display: 'none' }}
              accept=".json"
              onChange={handleImportSettings}
            />
          </div>
        </div>

        {/* Settings Container */}
        <div className="settings-container">
          {/* Sidebar */}
          <div className="settings-sidebar">
            <ul className="settings-nav">
              {tabs.map(tab => (
                <li
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="nav-icon" />
                  <span>{tab.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="settings-content">
            {/* General Settings */}
            {activeTab === 'general' && (
              <>
                <div className="content-header">
                  <h2>General Settings</h2>
                  <p>Basic platform configuration</p>
                </div>

                <div className="form-section">
                  <h3>Site Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Site Name</label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Site URL</label>
                      <input
                        type="url"
                        value={settings.general.siteUrl}
                        onChange={(e) => handleInputChange('general', 'siteUrl', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Support Email</label>
                      <input
                        type="email"
                        value={settings.general.supportEmail}
                        onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Admin Email</label>
                      <input
                        type="email"
                        value={settings.general.adminEmail}
                        onChange={(e) => handleInputChange('general', 'adminEmail', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Regional Settings</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Timezone</label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">EST</option>
                        <option value="PST">PST</option>
                        <option value="IST">IST</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Date Format</label>
                      <select
                        value={settings.general.dateFormat}
                        onChange={(e) => handleInputChange('general', 'dateFormat', e.target.value)}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Time Format</label>
                      <select
                        value={settings.general.timeFormat}
                        onChange={(e) => handleInputChange('general', 'timeFormat', e.target.value)}
                      >
                        <option value="12h">12-hour</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Language</label>
                      <select
                        value={settings.general.language}
                        onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="hi">Hindi</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>System Status</h3>
                  <div className="toggle-switch">
                    <span className="toggle-label">Maintenance Mode</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.general.maintenanceMode}
                        onChange={() => handleToggle('general', 'maintenanceMode')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="toggle-switch">
                    <span className="toggle-label">Debug Mode</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.general.debugMode}
                        onChange={() => handleToggle('general', 'debugMode')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Commission Settings */}
            {activeTab === 'commission' && (
              <>
                <div className="content-header">
                  <h2>Commission Settings</h2>
                  <p>Configure commission rates and tiers</p>
                </div>

                <div className="form-section">
                  <h3>Commission Rates</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Default Commission Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.commission.defaultRate}
                        onChange={(e) => handleInputChange('commission', 'defaultRate', parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Minimum Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.commission.minimumRate}
                        onChange={(e) => handleInputChange('commission', 'minimumRate', parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Maximum Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.commission.maximumRate}
                        onChange={(e) => handleInputChange('commission', 'maximumRate', parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Cookie Duration (days)</label>
                      <input
                        type="number"
                        value={settings.commission.cookieDuration}
                        onChange={(e) => handleInputChange('commission', 'cookieDuration', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Referral Commission (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.commission.referralCommission}
                        onChange={(e) => handleInputChange('commission', 'referralCommission', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Commission Tiers</h3>
                  <table className="tiers-table">
                    <thead>
                      <tr>
                        <th>Level</th>
                        <th>Min Earnings ($)</th>
                        <th>Rate (%)</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings.commission.tiers.map((tier, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="text"
                              value={tier.level}
                              onChange={(e) => handleArrayChange('commission', 'tiers', index, { ...tier, level: e.target.value })}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={tier.minEarnings}
                              onChange={(e) => handleArrayChange('commission', 'tiers', index, { ...tier, minEarnings: parseFloat(e.target.value) })}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.1"
                              value={tier.rate}
                              onChange={(e) => handleArrayChange('commission', 'tiers', index, { ...tier, rate: parseFloat(e.target.value) })}
                            />
                          </td>
                          <td>
                            <button
                              className="tier-remove-btn"
                              onClick={() => handleRemoveArrayItem('commission', 'tiers', index)}
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    className="tier-add-btn"
                    onClick={() => handleAddArrayItem('commission', 'tiers', { level: '', minEarnings: 0, rate: 0 })}
                  >
                    <FiPlus /> Add Tier
                  </button>
                </div>

                <div className="form-section">
                  <h3>Bonus Settings</h3>
                  <div className="toggle-switch">
                    <span className="toggle-label">Enable Signup Bonus</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.commission.bonusEnabled}
                        onChange={() => handleToggle('commission', 'bonusEnabled')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  {settings.commission.bonusEnabled && (
                    <div className="form-group">
                      <label>Bonus Amount ($)</label>
                      <input
                        type="number"
                        value={settings.commission.bonusAmount}
                        onChange={(e) => handleInputChange('commission', 'bonusAmount', parseFloat(e.target.value))}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Payment Settings */}
            {activeTab === 'payments' && (
              <>
                <div className="content-header">
                  <h2>Payment Settings</h2>
                  <p>Configure payment and withdrawal options</p>
                </div>

                <div className="form-section">
                  <h3>General Payment Settings</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        value={settings.payments.currency}
                        onChange={(e) => handleInputChange('payments', 'currency', e.target.value)}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Minimum Withdrawal ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.payments.minimumWithdrawal}
                        onChange={(e) => handleInputChange('payments', 'minimumWithdrawal', parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Maximum Withdrawal ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.payments.maximumWithdrawal}
                        onChange={(e) => handleInputChange('payments', 'maximumWithdrawal', parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Withdrawal Fee</label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.payments.withdrawalFee}
                        onChange={(e) => handleInputChange('payments', 'withdrawalFee', parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Fee Type</label>
                      <select
                        value={settings.payments.feeType}
                        onChange={(e) => handleInputChange('payments', 'feeType', e.target.value)}
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Payout Schedule</label>
                      <select
                        value={settings.payments.payoutSchedule}
                        onChange={(e) => handleInputChange('payments', 'payoutSchedule', e.target.value)}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {settings.payments.payoutSchedule === 'weekly' && (
                      <div className="form-group">
                        <label>Payout Day</label>
                        <select
                          value={settings.payments.payoutDay}
                          onChange={(e) => handleInputChange('payments', 'payoutDay', e.target.value)}
                        >
                          <option value="monday">Monday</option>
                          <option value="tuesday">Tuesday</option>
                          <option value="wednesday">Wednesday</option>
                          <option value="thursday">Thursday</option>
                          <option value="friday">Friday</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h3>Payment Methods</h3>
                  {settings.payments.paymentMethods.map((method, index) => (
                    <div key={index} className="array-item">
                      <input
                        type="text"
                        value={method}
                        onChange={(e) => handleArrayChange('payments', 'paymentMethods', index, e.target.value)}
                      />
                      <button
                        className="array-remove-btn"
                        onClick={() => handleRemoveArrayItem('payments', 'paymentMethods', index)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                  <button
                    className="array-add-btn"
                    onClick={() => handleAddArrayItem('payments', 'paymentMethods', '')}
                  >
                    <FiPlus /> Add Payment Method
                  </button>
                </div>

                <div className="form-section">
                  <h3>Payment Rules</h3>
                  <div className="toggle-switch">
                    <span className="toggle-label">Auto-approve Withdrawals</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.payments.autoApprove}
                        onChange={() => handleToggle('payments', 'autoApprove')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="toggle-switch">
                    <span className="toggle-label">Require Verification</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.payments.requireVerification}
                        onChange={() => handleToggle('payments', 'requireVerification')}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Other tabs would be similarly implemented */}
            {/* For brevity, only showing these tabs - you can add the rest following the same pattern */}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;
