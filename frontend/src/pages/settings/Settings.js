import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLock,
  FiBell,
  FiMoon,
  FiSun,
  FiGlobe,
  FiDollarSign,
  FiCreditCard,
  FiSmartphone,
  FiShield,
  FiEye,
  FiEyeOff,
  FiSave,
  FiRefreshCw,
  FiTrash2,
  FiLogOut,
  FiChevronRight,
  FiCheck,
  FiX,
  FiInfo,
  FiAlertCircle
} from 'react-icons/fi';

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: null,
    bio: ''
  });
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  });
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    loginNotifications: true
  });
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
    fetchPreferences();
    fetchPaymentMethods();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/profile`
      );
      
      if (response.data.success) {
        setProfile(response.data.profile);
        setAddress(response.data.address || {});
      }
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/preferences`
      );
      
      if (response.data.success) {
        setPreferences(response.data.preferences);
        setSecurity(response.data.security);
      }
    } catch (error) {
      console.error('Failed to fetch preferences');
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/wallet/payment-methods`
      );
      
      if (response.data.success) {
        setPaymentMethods(response.data.methods);
      }
    } catch (error) {
      console.error('Failed to fetch payment methods');
    }
  };

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    });
  };

  const handleSecurityChange = (e) => {
    setSecurity({
      ...security,
      [e.target.name]: e.target.value
    });

    // Check password strength when new password changes
    if (e.target.name === 'newPassword') {
      checkPasswordStrength(e.target.value);
    }
  };

  const handleToggleChange = (field) => {
    setSecurity({
      ...security,
      [field]: !security[field]
    });
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences({
      ...preferences,
      [field]: value
    });
  };

  const handleCheckboxChange = (field) => {
    setPreferences({
      ...preferences,
      [field]: !preferences[field]
    });
  };

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password)
    });
  };

  const getPasswordStrengthScore = () => {
    return Object.values(passwordStrength).filter(Boolean).length;
  };

  const getPasswordStrengthText = () => {
    const score = getPasswordStrengthScore();
    if (score <= 2) return { text: 'Weak', color: '#dc3545' };
    if (score <= 4) return { text: 'Medium', color: '#ffc107' };
    return { text: 'Strong', color: '#28a745' };
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!profile.name) {
      newErrors.name = 'Name is required';
    }

    if (!profile.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (profile.phone && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(profile.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!security.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!security.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (security.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (security.newPassword !== security.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setSaving(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/user/profile`,
        { ...profile, address }
      );
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (!validatePassword()) return;

    setSaving(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/user/security`,
        {
          currentPassword: security.currentPassword,
          newPassword: security.newPassword,
          twoFactorEnabled: security.twoFactorEnabled
        }
      );
      
      if (response.data.success) {
        toast.success('Security settings updated');
        setSecurity({
          ...security,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update security');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/user/preferences`,
        preferences
      );
      
      if (response.data.success) {
        toast.success('Preferences updated');
      }
    } catch (error) {
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPaymentMethod = () => {
    navigate('/wallet/payment-methods/add');
  };

  const handleRemovePaymentMethod = async (id) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/wallet/payment-methods/${id}`
        );
        
        if (response.data.success) {
          setPaymentMethods(paymentMethods.filter(m => m._id !== id));
          toast.success('Payment method removed');
        }
      } catch (error) {
        toast.error('Failed to remove payment method');
      }
    }
  };

  const handleSetDefaultPaymentMethod = async (id) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/wallet/payment-methods/${id}/default`
      );
      
      if (response.data.success) {
        setPaymentMethods(paymentMethods.map(m => ({
          ...m,
          isDefault: m._id === id
        })));
        toast.success('Default payment method updated');
      }
    } catch (error) {
      toast.error('Failed to set default payment method');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/user/account`
        );
        
        if (response.data.success) {
          toast.success('Account deleted');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/register');
        }
      } catch (error) {
        toast.error('Failed to delete account');
      }
    }
  };

  // Tabs
  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'preferences', label: 'Preferences', icon: FiMoon },
    { id: 'payment', label: 'Payment Methods', icon: FiCreditCard },
    { id: 'notifications', label: 'Notifications', icon: FiBell }
  ];

  // Styles
  const styles = `
    .settings-page {
      padding: 40px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Header */
    .page-header {
      margin-bottom: 30px;
    }

    .page-header h1 {
      margin: 0 0 10px;
      font-size: 32px;
      color: #333;
    }

    .page-header p {
      margin: 0;
      color: #666;
    }

    /* Settings Container */
    .settings-container {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 30px;
    }

    /* Sidebar */
    .settings-sidebar {
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
      margin: 0 0 15px;
      font-size: 18px;
      color: #333;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group.full-width {
      grid-column: span 2;
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
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }

    .form-group input.error {
      border-color: #dc3545;
    }

    .form-group textarea {
      min-height: 100px;
      resize: vertical;
    }

    .error-message {
      color: #dc3545;
      font-size: 13px;
      margin-top: 5px;
    }

    .hint {
      color: #999;
      font-size: 12px;
      margin-top: 5px;
    }

    /* Password Input */
    .password-input-wrapper {
      position: relative;
    }

    .password-input-wrapper input {
      padding-right: 40px;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
    }

    /* Password Strength */
    .password-strength {
      margin-top: 10px;
    }

    .strength-bars {
      display: flex;
      gap: 5px;
      margin-bottom: 5px;
    }

    .strength-bar {
      flex: 1;
      height: 4px;
      background: #e9ecef;
      border-radius: 2px;
    }

    .strength-bar.active {
      background: ${getPasswordStrengthText().color};
    }

    .strength-text {
      font-size: 12px;
      color: #666;
    }

    .requirements {
      background: #f8f9fa;
      border-radius: 5px;
      padding: 15px;
      margin-top: 15px;
    }

    .requirement-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #666;
    }

    .requirement-item:last-child {
      margin-bottom: 0;
    }

    .requirement-icon {
      display: flex;
      align-items: center;
    }

    .valid-icon {
      color: #28a745;
    }

    .invalid-icon {
      color: #dc3545;
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

    /* Payment Methods */
    .payment-methods-list {
      display: grid;
      gap: 15px;
      margin-bottom: 20px;
    }

    .payment-method-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
    }

    .payment-method-item.default {
      border-color: #667eea;
      background: #f0f4ff;
    }

    .payment-method-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
    }

    .payment-method-info {
      flex: 1;
    }

    .payment-method-name {
      margin: 0 0 5px;
      font-weight: 600;
      color: #333;
    }

    .payment-method-detail {
      margin: 0;
      font-size: 13px;
      color: #999;
    }

    .payment-method-actions {
      display: flex;
      gap: 5px;
    }

    .payment-method-btn {
      padding: 5px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      color: #666;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.3s ease;
    }

    .payment-method-btn:hover {
      background: #f8f9fa;
    }

    .payment-method-btn.default-btn {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .payment-method-btn.default-btn:hover {
      background: #5a67d8;
    }

    .payment-method-btn.remove-btn {
      color: #dc3545;
      border-color: #dc3545;
    }

    .payment-method-btn.remove-btn:hover {
      background: #dc3545;
      color: white;
    }

    .add-payment-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 5px;
      color: #666;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .add-payment-btn:hover {
      background: #f8f9fa;
      border-color: #667eea;
      color: #667eea;
    }

    /* Danger Zone */
    .danger-zone {
      margin-top: 30px;
      padding: 20px;
      background: #fff5f5;
      border: 1px solid #fcc;
      border-radius: 8px;
    }

    .danger-zone h3 {
      color: #dc3545;
      margin: 0 0 10px;
    }

    .danger-zone p {
      color: #666;
      margin-bottom: 15px;
    }

    .danger-zone button {
      padding: 10px 20px;
      background: white;
      border: 1px solid #dc3545;
      border-radius: 5px;
      color: #dc3545;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .danger-zone button:hover {
      background: #dc3545;
      color: white;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
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
      transition: all 0.3s ease;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5a67d8;
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

      .page-header h1,
      .content-header h2,
      .form-section h3 {
        color: #f7fafc;
      }

      .page-header p,
      .content-header p,
      .form-group label,
      .toggle-label {
        color: #e2e8f0;
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

      .requirements {
        background: #1a202c;
      }

      .payment-method-item {
        border-color: #4a5568;
      }

      .payment-method-item.default {
        background: #1a2a4a;
      }

      .payment-method-name {
        color: #f7fafc;
      }

      .danger-zone {
        background: #2a1a1a;
        border-color: #5a2a2a;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .settings-container {
        grid-template-columns: 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-group.full-width {
        grid-column: span 1;
      }

      .payment-method-item {
        flex-direction: column;
        text-align: center;
      }

      .payment-method-actions {
        flex-wrap: wrap;
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
      <div className="settings-page">
        {/* Header */}
        <div className="page-header">
          <h1>Account Settings</h1>
          <p>Manage your account preferences and security</p>
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
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                <div className="content-header">
                  <h2>Profile Information</h2>
                  <p>Update your personal information</p>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="form-section">
                    <h3>Basic Information</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={profile.name}
                          onChange={handleProfileChange}
                          className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <div className="error-message">{errors.name}</div>}
                      </div>

                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={handleProfileChange}
                          className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <div className="error-message">{errors.email}</div>}
                      </div>

                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profile.phone}
                          onChange={handleProfileChange}
                          className={errors.phone ? 'error' : ''}
                        />
                        {errors.phone && <div className="error-message">{errors.phone}</div>}
                      </div>

                      <div className="form-group full-width">
                        <label>Bio</label>
                        <textarea
                          name="bio"
                          value={profile.bio}
                          onChange={handleProfileChange}
                          placeholder="Tell us a little about yourself"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Address Information</h3>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label>Street Address</label>
                        <input
                          type="text"
                          name="street"
                          value={address.street}
                          onChange={handleAddressChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          name="city"
                          value={address.city}
                          onChange={handleAddressChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>State / Province</label>
                        <input
                          type="text"
                          name="state"
                          value={address.state}
                          onChange={handleAddressChange}
                        />
                      </div>

                      <div className="form-group">
                        <label>Country</label>
                        <select
                          name="country"
                          value={address.country}
                          onChange={handleAddressChange}
                        >
                          <option value="">Select country</option>
                          <option value="US">United States</option>
                          <option value="UK">United Kingdom</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                          <option value="IN">India</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>ZIP / Postal Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={address.zipCode}
                          onChange={handleAddressChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={fetchProfile}
                    >
                      <FiRefreshCw /> Reset
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? <FiRefreshCw className="spin" /> : <FiSave />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <>
                <div className="content-header">
                  <h2>Security Settings</h2>
                  <p>Manage your password and security preferences</p>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="form-section">
                    <h3>Change Password</h3>
                    <div className="form-group">
                      <label>Current Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          name="currentPassword"
                          value={security.currentPassword}
                          onChange={handleSecurityChange}
                          className={errors.currentPassword ? 'error' : ''}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                        >
                          {showPassword.current ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      {errors.currentPassword && <div className="error-message">{errors.currentPassword}</div>}
                    </div>

                    <div className="form-group">
                      <label>New Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          name="newPassword"
                          value={security.newPassword}
                          onChange={handleSecurityChange}
                          className={errors.newPassword ? 'error' : ''}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        >
                          {showPassword.new ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <div className="password-input-wrapper">
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          name="confirmPassword"
                          value={security.confirmPassword}
                          onChange={handleSecurityChange}
                          className={errors.confirmPassword ? 'error' : ''}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        >
                          {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                    </div>

                    {security.newPassword && (
                      <div className="password-strength">
                        <div className="strength-bars">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div
                              key={i}
                              className={`strength-bar ${i <= getPasswordStrengthScore() ? 'active' : ''}`}
                            ></div>
                          ))}
                        </div>
                        <span className="strength-text" style={{ color: getPasswordStrengthText().color }}>
                          Password Strength: {getPasswordStrengthText().text}
                        </span>
                      </div>
                    )}

                    <div className="requirements">
                      <div className="requirement-item">
                        <span className="requirement-icon">
                          {passwordStrength.length ? <FiCheck className="valid-icon" /> : <FiX className="invalid-icon" />}
                        </span>
                        <span>At least 8 characters</span>
                      </div>
                      <div className="requirement-item">
                        <span className="requirement-icon">
                          {passwordStrength.uppercase ? <FiCheck className="valid-icon" /> : <FiX className="invalid-icon" />}
                        </span>
                        <span>At least one uppercase letter</span>
                      </div>
                      <div className="requirement-item">
                        <span className="requirement-icon">
                          {passwordStrength.lowercase ? <FiCheck className="valid-icon" /> : <FiX className="invalid-icon" />}
                        </span>
                        <span>At least one lowercase letter</span>
                      </div>
                      <div className="requirement-item">
                        <span className="requirement-icon">
                          {passwordStrength.number ? <FiCheck className="valid-icon" /> : <FiX className="invalid-icon" />}
                        </span>
                        <span>At least one number</span>
                      </div>
                      <div className="requirement-item">
                        <span className="requirement-icon">
                          {passwordStrength.special ? <FiCheck className="valid-icon" /> : <FiX className="invalid-icon" />}
                        </span>
                        <span>At least one special character</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Two-Factor Authentication</h3>
                    <div className="toggle-switch">
                      <span className="toggle-label">Enable 2FA</span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={security.twoFactorEnabled}
                          onChange={() => handleToggleChange('twoFactorEnabled')}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="hint">
                      <FiInfo /> Add an extra layer of security to your account
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setSecurity({
                          ...security,
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                    >
                      <FiRefreshCw /> Reset
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleSaveSecurity}
                      disabled={saving}
                    >
                      {saving ? <FiRefreshCw className="spin" /> : <FiSave />}
                      {saving ? 'Saving...' : 'Update Security'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <>
                <div className="content-header">
                  <h2>Preferences</h2>
                  <p>Customize your experience</p>
                </div>

                <div className="form-section">
                  <h3>Theme</h3>
                  <div className="form-group">
                    <label>Appearance</label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Regional Settings</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Language</label>
                      <select
                        value={preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="hi">Hindi</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Currency</label>
                      <select
                        value={preferences.currency}
                        onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Timezone</label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="IST">Indian Standard Time</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={fetchPreferences}
                  >
                    <FiRefreshCw /> Reset
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSavePreferences}
                    disabled={saving}
                  >
                    {saving ? <FiRefreshCw className="spin" /> : <FiSave />}
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <>
                <div className="content-header">
                  <h2>Payment Methods</h2>
                  <p>Manage your payment methods for withdrawals</p>
                </div>

                <div className="payment-methods-list">
              {paymentMethods.map(method => (
                    <div
                      key={method._id}
                      className={`payment-method-item ${method.isDefault ? 'default' : ''}`}
                    >
                      <div className="payment-method-icon">
                        {method.type === 'paypal' ? '💰' :
                         method.type === 'bank' ? '🏦' :
                         method.type === 'upi' ? '📱' : '💳'}
                      </div>
                      <div className="payment-method-info">
                        <p className="payment-method-name">{method.name}</p>
                        <p className="payment-method-detail">{method.detail}</p>
                      </div>
                      <div className="payment-method-actions">
                        {!method.isDefault && (
                          <button
                            className="payment-method-btn default-btn"
                            onClick={() => handleSetDefaultPaymentMethod(method._id)}
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          className="payment-method-btn remove-btn"
                          onClick={() => handleRemovePaymentMethod(method._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="add-payment-btn" onClick={handleAddPaymentMethod}>
                  <FiCreditCard /> Add Payment Method
                </button>
              </>
            )}

            {/* Danger Zone */}
            {activeTab === 'profile' && (
              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <p>Once you delete your account, there is no going back. Please be certain.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                  <button onClick={handleDeleteAccount}>
                    <FiTrash2 /> Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
