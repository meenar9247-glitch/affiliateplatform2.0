import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiGlobe,
  FiMoon,
  FiSun,
  FiDollarSign,
  FiClock,
  FiCalendar,
  FiType,
  FiLayout,
  FiGrid,
  FiList,
  FiEye,
  FiEyeOff,
  FiSave,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiSettings,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiVolume2,
  FiVolumeX,
  FiWind,
  FiBluetooth,
  FiWifi,
  FiBattery,
  FiServer,
  FiCloud,
  FiDatabase,
  FiShield,
  FiLock,
  FiUnlock,
  FiTrendingUp,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiAward,
  FiStar,
  FiHeart,
  FiThumbsUp,
  FiMessageCircle,
  FiMail,
  FiBell,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiHelpCircle
} from 'react-icons/fi';

const Preferences = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // General Preferences
  const [preferences, setPreferences] = useState({
    // Display Settings
    display: {
      theme: 'light', // light, dark, system
      fontSize: 'medium', // small, medium, large
      density: 'comfortable', // comfortable, compact, cozy
      animations: true,
      reducedMotion: false,
      highContrast: false,
      sidebarCollapsed: false,
      showAvatars: true,
      showThumbnails: true,
      defaultView: 'grid', // grid, list, table
      itemsPerPage: 20,
      colorScheme: 'default' // default, blue, green, purple
    },
    
    // Language & Region
    language: {
      preferred: 'en',
      secondary: '',
      dateFormat: 'MM/DD/YYYY', // MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
      timeFormat: '12h', // 12h, 24h
      timezone: 'Asia/Kolkata',
      firstDayOfWeek: 'monday', // monday, sunday
      numberFormat: 'en-US',
      currencyFormat: 'en-US'
    },
    
    // Currency Settings
    currency: {
      preferred: 'USD', // USD, EUR, GBP, INR, etc.
      display: 'symbol', // symbol, code, name
      decimalPlaces: 2,
      thousandSeparator: ',',
      decimalSeparator: '.',
      showCents: true,
      autoConvert: false
    },
    
    // Dashboard Preferences
    dashboard: {
      defaultTab: 'overview',
      showStats: true,
      showCharts: true,
      showRecentActivity: true,
      showLeaderboard: true,
      showEarnings: true,
      chartType: 'line', // line, bar, area
      refreshInterval: 5, // minutes
      pinnedWidgets: ['earnings', 'referrals', 'clicks'],
      hiddenWidgets: []
    },
    
    // Accessibility
    accessibility: {
      screenReader: false,
      keyboardNavigation: true,
      focusIndicator: true,
      linkUnderline: false,
      largeCursors: false,
      disableAnimations: false,
      voiceControl: false,
      captionsEnabled: false
    },
    
    // Privacy
    privacy: {
      showOnlineStatus: true,
      showLastSeen: true,
      showProfile: true,
      showEarnings: false,
      allowAnalytics: true,
      allowTracking: false,
      allowMarketing: false,
      searchEngineIndexing: true,
      dataCollection: true
    },
    
    // Communication
    communication: {
      emailFrequency: 'immediate', // immediate, daily, weekly, never
      messageSound: true,
      desktopNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: false,
      telegramNotifications: false,
      slackIntegration: false,
      discordIntegration: false
    },
    
    // Performance
    performance: {
      lazyLoadImages: true,
      prefetchLinks: false,
      cacheEnabled: true,
      cacheDuration: 3600, // seconds
      compressionEnabled: true,
      imageQuality: 'high', // low, medium, high
      videoAutoplay: false,
      backgroundSync: true
    },
    
    // Data Management
    data: {
      autoSave: true,
      saveInterval: 30, // seconds
      backupEnabled: false,
      backupFrequency: 'weekly', // daily, weekly, monthly
      exportFormat: 'csv', // csv, json, excel
      dataRetention: 90, // days
      compressExports: true
    }
  });

  // Available Options
  const themeOptions = [
    { value: 'light', label: 'Light', icon: <FiSun /> },
    { value: 'dark', label: 'Dark', icon: <FiMoon /> },
    { value: 'system', label: 'System', icon: <FiMonitor /> }
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small', size: '12px' },
    { value: 'medium', label: 'Medium', size: '14px' },
    { value: 'large', label: 'Large', size: '16px' }
  ];

  const densityOptions = [
    { value: 'comfortable', label: 'Comfortable', spacing: 'loose' },
    { value: 'compact', label: 'Compact', spacing: 'tight' },
    { value: 'cozy', label: 'Cozy', spacing: 'medium' }
  ];

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'ur', name: 'Urdu', native: 'اردو' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
    { code: 'mai', name: 'Maithili', native: 'मैथिली' },
    { code: 'sat', name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
    { code: 'ks', name: 'Kashmiri', native: 'कॉशुर' },
    { code: 'sd', name: 'Sindhi', native: 'سنڌي' },
    { code: 'kok', name: 'Konkani', native: 'कोंकणी' },
    { code: 'doi', name: 'Dogri', native: 'डोगरी' },
    { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্' },
    { code: 'bodo', name: 'Bodo', native: 'बर' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'ar', name: 'Arabic', native: 'العربية' }
  ];

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' }
  ];

  const timezones = [
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'America/New_York', label: 'US Eastern (EST)' },
    { value: 'America/Chicago', label: 'US Central (CST)' },
    { value: 'America/Denver', label: 'US Mountain (MST)' },
    { value: 'America/Los_Angeles', label: 'US Pacific (PST)' },
    { value: 'Europe/London', label: 'UK (GMT)' },
    { value: 'Europe/Paris', label: 'Central European (CET)' },
    { value: 'Asia/Dubai', label: 'Gulf (GST)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'Asia/Tokyo', label: 'Japan (JST)' },
    { value: 'Australia/Sydney', label: 'Australia (AEDT)' }
  ];

  const [expandedSection, setExpandedSection] = useState('display');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/preferences`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      toast.error('Failed to fetch preferences');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (section, field, value) => {
    setPreferences({
      ...preferences,
      [section]: {
        ...preferences[section],
        [field]: value
      }
    });
  };

  const handleToggleChange = (section, field) => {
    setPreferences({
      ...preferences,
      [section]: {
        ...preferences[section],
        [field]: !preferences[section][field]
      }
    });
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/preferences`,
        preferences,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Preferences saved successfully');
        
        // Apply theme immediately
        if (preferences.display.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!window.confirm('Are you sure you want to reset all preferences to default?')) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/user/preferences/reset`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setPreferences(response.data.preferences);
        toast.success('Preferences reset to default');
      }
    } catch (error) {
      toast.error('Failed to reset preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleImportPreferences = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedPrefs = JSON.parse(e.target.result);
        setPreferences(importedPrefs);
        toast.success('Preferences imported successfully');
      } catch (error) {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const handleExportPreferences = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `preferences-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getCurrentTheme = () => {
    return preferences.display.theme;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="preferences-page">
      <div className="preferences-header">
        <div className="header-title">
          <h1>Preferences</h1>
          <p>Customize your experience</p>
        </div>
        
        <div className="header-actions">
          <button
            className={`preview-toggle ${previewMode ? 'active' : ''}`}
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <FiEyeOff /> : <FiEye />}
            {previewMode ? 'Exit Preview' : 'Preview Changes'}
          </button>
          
          <button
            className="export-btn"
            onClick={handleExportPreferences}
          >
            Export
          </button>
          
          <label className="import-btn">
            <input
              type="file"
              accept=".json"
              onChange={handleImportPreferences}
              style={{ display: 'none' }}
            />
            Import
          </label>
          
          <button
            className="reset-btn"
            onClick={handleResetToDefaults}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Theme Preview */}
      {previewMode && (
        <div className={`theme-preview theme-${getCurrentTheme()}`}>
          <div className="preview-content">
            <h3>Theme Preview</h3>
            <div className="preview-cards">
              <div className="preview-card">
                <div className="card-header">Earnings</div>
                <div className="card-body">$1,234</div>
              </div>
              <div className="preview-card">
                <div className="card-header">Referrals</div>
                <div className="card-body">45</div>
              </div>
              <div className="preview-card">
                <div className="card-header">Clicks</div>
                <div className="card-body">1.2k</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Sections */}
      <div className="preferences-container">
        
        {/* Display Settings */}
        <div className="preference-section">
          <div 
            className="section-header"
            onClick={() => setExpandedSection(expandedSection === 'display' ? '' : 'display')}
          >
            <div className="header-left">
              <FiMonitor className="section-icon" />
              <h2>Display Settings</h2>
            </div>
            <span className="section-toggle">
              {expandedSection === 'display' ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>
          
          {expandedSection === 'display' && (
            <div className="section-content">
              {/* Theme Selection */}
              <div className="preference-group">
                <label>Theme</label>
                <div className="theme-selector">
                  {themeOptions.map(theme => (
                    <button
                      key={theme.value}
                      className={`theme-option ${preferences.display.theme === theme.value ? 'active' : ''}`}
                      onClick={() => handlePreferenceChange('display', 'theme', theme.value)}
                    >
                      {theme.icon}
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="preference-group">
                <label>Font Size</label>
                <div className="font-size-selector">
                  {fontSizeOptions.map(size => (
                    <button
                      key={size.value}
                      className={`size-option ${preferences.display.fontSize === size.value ? 'active' : ''}`}
                      onClick={() => handlePreferenceChange('display', 'fontSize', size.value)}
                      style={{ fontSize: size.size }}
                    >
                      Aa
                    </button>
                  ))}
                </div>
              </div>

              {/* Density */}
              <div className="preference-group">
                <label>Layout Density</label>
                <div className="density-selector">
                  {densityOptions.map(density => (
                    <button
                      key={density.value}
                      className={`density-option ${preferences.display.density === density.value ? 'active' : ''}`}
                      onClick={() => handlePreferenceChange('display', 'density', density.value)}
                    >
                      <div className={`density-preview density-${density.spacing}`}>
                        <div className="preview-line"></div>
                        <div className="preview-line"></div>
                        <div className="preview-line"></div>
                      </div>
                      <span>{density.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Options */}
              <div className="preference-grid">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Animations</span>
                    <span className="toggle-desc">Enable UI animations</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.display.animations}
                      onChange={() => handleToggleChange('display', 'animations')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Reduced Motion</span>
                    <span className="toggle-desc">Minimize animations</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.display.reducedMotion}
                      onChange={() => handleToggleChange('display', 'reducedMotion')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">High Contrast</span>
                    <span className="toggle-desc">Increase contrast</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.display.highContrast}
                      onChange={() => handleToggleChange('display', 'highContrast')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Show Avatars</span>
                    <span className="toggle-desc">Display user avatars</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.display.showAvatars}
                      onChange={() => handleToggleChange('display', 'showAvatars')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Show Thumbnails</span>
                    <span className="toggle-desc">Display image thumbnails</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.display.showThumbnails}
                      onChange={() => handleToggleChange('display', 'showThumbnails')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

       <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Sidebar Collapsed</span>
                    <span className="toggle-desc">Start with sidebar closed</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.display.sidebarCollapsed}
                      onChange={() => handleToggleChange('display', 'sidebarCollapsed')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* Default View */}
              <div className="preference-group">
                <label>Default View</label>
                <div className="view-selector">
                  <button
                    className={`view-option ${preferences.display.defaultView === 'grid' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('display', 'defaultView', 'grid')}
                  >
                    <FiGrid />
                    <span>Grid</span>
                  </button>
                  <button
                    className={`view-option ${preferences.display.defaultView === 'list' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('display', 'defaultView', 'list')}
                  >
                    <FiList />
                    <span>List</span>
                  </button>
                  <button
                    className={`view-option ${preferences.display.defaultView === 'table' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('display', 'defaultView', 'table')}
                  >
                    <FiLayout />
                    <span>Table</span>
                  </button>
                </div>
              </div>

              {/* Items Per Page */}
              <div className="preference-group">
                <label>Items Per Page</label>
                <select
                  value={preferences.display.itemsPerPage}
                  onChange={(e) => handlePreferenceChange('display', 'itemsPerPage', parseInt(e.target.value))}
                >
                  <option value="10">10 items</option>
                  <option value="20">20 items</option>
                  <option value="50">50 items</option>
                  <option value="100">100 items</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Language & Region */}
        <div className="preference-section">
          <div 
            className="section-header"
            onClick={() => setExpandedSection(expandedSection === 'language' ? '' : 'language')}
          >
            <div className="header-left">
              <FiGlobe className="section-icon" />
              <h2>Language & Region</h2>
            </div>
            <span className="section-toggle">
              {expandedSection === 'language' ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>
          
          {expandedSection === 'language' && (
            <div className="section-content">
              {/* Language Selection */}
              <div className="preference-group">
                <label>Preferred Language</label>
                <select
                  value={preferences.language.preferred}
                  onChange={(e) => handlePreferenceChange('language', 'preferred', e.target.value)}
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.native} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Secondary Language */}
              <div className="preference-group">
                <label>Secondary Language</label>
                <select
                  value={preferences.language.secondary}
                  onChange={(e) => handlePreferenceChange('language', 'secondary', e.target.value)}
                >
                  <option value="">None</option>
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.native} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Format */}
              <div className="preference-group">
                <label>Date Format</label>
                <div className="format-selector">
                  <button
                    className={`format-option ${preferences.language.dateFormat === 'MM/DD/YYYY' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('language', 'dateFormat', 'MM/DD/YYYY')}
                  >
                    12/31/2024
                  </button>
                  <button
                    className={`format-option ${preferences.language.dateFormat === 'DD/MM/YYYY' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('language', 'dateFormat', 'DD/MM/YYYY')}
                  >
                    31/12/2024
                  </button>
                  <button
                    className={`format-option ${preferences.language.dateFormat === 'YYYY-MM-DD' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('language', 'dateFormat', 'YYYY-MM-DD')}
                  >
                    2024-12-31
                  </button>
                </div>
              </div>

              {/* Time Format */}
              <div className="preference-group">
                <label>Time Format</label>
                <div className="format-selector">
                  <button
                    className={`format-option ${preferences.language.timeFormat === '12h' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('language', 'timeFormat', '12h')}
                  >
                    12-hour (2:30 PM)
                  </button>
                  <button
                    className={`format-option ${preferences.language.timeFormat === '24h' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('language', 'timeFormat', '24h')}
                  >
                    24-hour (14:30)
                  </button>
                </div>
              </div>

              {/* Timezone */}
              <div className="preference-group">
                <label>Timezone</label>
                <select
                  value={preferences.language.timezone}
                  onChange={(e) => handlePreferenceChange('language', 'timezone', e.target.value)}
                >
                  {timezones.map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* First Day of Week */}
              <div className="preference-group">
                <label>First Day of Week</label>
                <div className="format-selector">
                  <button
                    className={`format-option ${preferences.language.firstDayOfWeek === 'monday' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('language', 'firstDayOfWeek', 'monday')}
                  >
                    Monday
                  </button>
                  <button
                    className={`format-option ${preferences.language.firstDayOfWeek === 'sunday' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('language', 'firstDayOfWeek', 'sunday')}
                  >
                    Sunday
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
                        {/* Currency Settings */}
        <div className="preference-section">
          <div 
            className="section-header"
            onClick={() => setExpandedSection(expandedSection === 'currency' ? '' : 'currency')}
          >
            <div className="header-left">
              <FiDollarSign className="section-icon" />
              <h2>Currency Settings</h2>
            </div>
            <span className="section-toggle">
              {expandedSection === 'currency' ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>
          
          {expandedSection === 'currency' && (
            <div className="section-content">
              {/* Preferred Currency */}
              <div className="preference-group">
                <label>Preferred Currency</label>
                <select
                  value={preferences.currency.preferred}
                  onChange={(e) => handlePreferenceChange('currency', 'preferred', e.target.value)}
                >
                  {currencies.map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.symbol} - {curr.name} ({curr.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency Display */}
              <div className="preference-group">
                <label>Display Format</label>
                <div className="format-selector">
                  <button
                    className={`format-option ${preferences.currency.display === 'symbol' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('currency', 'display', 'symbol')}
                  >
                    $1,234.56
                  </button>
                  <button
                    className={`format-option ${preferences.currency.display === 'code' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('currency', 'display', 'code')}
                  >
                    USD 1,234.56
                  </button>
                  <button
                    className={`format-option ${preferences.currency.display === 'name' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('currency', 'display', 'name')}
                  >
                    US Dollar 1,234.56
                  </button>
                </div>
              </div>

              {/* Decimal Places */}
              <div className="preference-group">
                <label>Decimal Places</label>
                <select
                  value={preferences.currency.decimalPlaces}
                  onChange={(e) => handlePreferenceChange('currency', 'decimalPlaces', parseInt(e.target.value))}
                >
                  <option value="0">0 (1234)</option>
                  <option value="1">1 (1234.5)</option>
                  <option value="2">2 (1234.56)</option>
                  <option value="3">3 (1234.567)</option>
                </select>
              </div>

              {/* Toggle Options */}
              <div className="preference-grid">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Show Cents</span>
                    <span className="toggle-desc">Display decimal places</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.currency.showCents}
                      onChange={() => handleToggleChange('currency', 'showCents')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Auto-Convert</span>
                    <span className="toggle-desc">Convert to preferred currency</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.currency.autoConvert}
                      onChange={() => handleToggleChange('currency', 'autoConvert')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Preferences */}
        <div className="preference-section">
          <div 
            className="section-header"
            onClick={() => setExpandedSection(expandedSection === 'dashboard' ? '' : 'dashboard')}
          >
            <div className="header-left">
              <FiActivity className="section-icon" />
              <h2>Dashboard Preferences</h2>
            </div>
            <span className="section-toggle">
              {expandedSection === 'dashboard' ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>
          
          {expandedSection === 'dashboard' && (
            <div className="section-content">
              {/* Default Tab */}
              <div className="preference-group">
                <label>Default Dashboard Tab</label>
                <select
                  value={preferences.dashboard.defaultTab}
                  onChange={(e) => handlePreferenceChange('dashboard', 'defaultTab', e.target.value)}
                >
                  <option value="overview">Overview</option>
                  <option value="earnings">Earnings</option>
                  <option value="referrals">Referrals</option>
                  <option value="analytics">Analytics</option>
                </select>
              </div>

              {/* Chart Type */}
              <div className="preference-group">
                <label>Default Chart Type</label>
                <div className="chart-selector">
                  <button
                    className={`chart-option ${preferences.dashboard.chartType === 'line' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('dashboard', 'chartType', 'line')}
                  >
                    <FiTrendingUp />
                    <span>Line</span>
                  </button>
                  <button
                    className={`chart-option ${preferences.dashboard.chartType === 'bar' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('dashboard', 'chartType', 'bar')}
                  >
                    <FiBarChart2 />
                    <span>Bar</span>
                  </button>
                  <button
                    className={`chart-option ${preferences.dashboard.chartType === 'area' ? 'active' : ''}`}
                    onClick={() => handlePreferenceChange('dashboard', 'chartType', 'area')}
                  >
                    <FiPieChart />
                    <span>Area</span>
                  </button>
                </div>
              </div>

              {/* Refresh Interval */}
              <div className="preference-group">
                <label>Auto-Refresh Interval</label>
                <select
                  value={preferences.dashboard.refreshInterval}
                  onChange={(e) => handlePreferenceChange('dashboard', 'refreshInterval', parseInt(e.target.value))}
                >
                  <option value="1">1 minute</option>
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>

              {/* Toggle Options */}
              <div className="preference-grid">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Show Stats</span>
                    <span className="toggle-desc">Display statistics cards</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.dashboard.showStats}
                      onChange={() => handleToggleChange('dashboard', 'showStats')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Show Charts</span>
                    <span className="toggle-desc">Display analytics charts</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.dashboard.showCharts}
                      onChange={() => handleToggleChange('dashboard', 'showCharts')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Recent Activity</span>
                    <span className="toggle-desc">Show recent activity feed</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.dashboard.showRecentActivity}
                      onChange={() => handleToggleChange('dashboard', 'showRecentActivity')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Leaderboard</span>
                    <span className="toggle-desc">Show top affiliates</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.dashboard.showLeaderboard}
                      onChange={() => handleToggleChange('dashboard', 'showLeaderboard')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>{/* Privacy Settings */}
        <div className="preference-section">
          <div 
            className="section-header"
            onClick={() => setExpandedSection(expandedSection === 'privacy' ? '' : 'privacy')}
          >
            <div className="header-left">
              <FiShield className="section-icon" />
              <h2>Privacy Settings</h2>
            </div>
            <span className="section-toggle">
              {expandedSection === 'privacy' ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>
          
          {expandedSection === 'privacy' && (
            <div className="section-content">
              <div className="preference-grid">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Show Online Status</span>
                    <span className="toggle-desc">Let others see when you're online</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.showOnlineStatus}
                      onChange={() => handleToggleChange('privacy', 'showOnlineStatus')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Show Last Seen</span>
                    <span className="toggle-desc">Display when you were last active</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.showLastSeen}
                      onChange={() => handleToggleChange('privacy', 'showLastSeen')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Show Profile</span>
                    <span className="toggle-desc">Make profile visible to others</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.showProfile}
                      onChange={() => handleToggleChange('privacy', 'showProfile')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Show Earnings</span>
                    <span className="toggle-desc">Display earnings on profile</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.showEarnings}
                      onChange={() => handleToggleChange('privacy', 'showEarnings')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Allow Analytics</span>
                    <span className="toggle-desc">Help us improve your experience</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.allowAnalytics}
                      onChange={() => handleToggleChange('privacy', 'allowAnalytics')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Marketing Emails</span>
                    <span className="toggle-desc">Receive promotional emails</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.allowMarketing}
                      onChange={() => handleToggleChange('privacy', 'allowMarketing')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accessibility */}
        <div className="preference-section">
          <div 
            className="section-header"
            onClick={() => setExpandedSection(expandedSection === 'accessibility' ? '' : 'accessibility')}
          >
            <div className="header-left">
              <FiHeart className="section-icon" />
              <h2>Accessibility</h2>
            </div>
            <span className="section-toggle">
              {expandedSection === 'accessibility' ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>
          
          {expandedSection === 'accessibility' && (
            <div className="section-content">
              <div className="preference-grid">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Screen Reader</span>
                    <span className="toggle-desc">Optimize for screen readers</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.accessibility.screenReader}
                      onChange={() => handleToggleChange('accessibility', 'screenReader')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Keyboard Navigation</span>
                    <span className="toggle-desc">Enable keyboard shortcuts</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.accessibility.keyboardNavigation}
                      onChange={() => handleToggleChange('accessibility', 'keyboardNavigation')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Focus Indicator</span>
                    <span className="toggle-desc">Show focus outline</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.accessibility.focusIndicator}
                      onChange={() => handleToggleChange('accessibility', 'focusIndicator')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Link Underline</span>
                    <span className="toggle-desc">Always underline links</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.accessibility.linkUnderline}
                      onChange={() => handleToggleChange('accessibility', 'linkUnderline')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Large Cursors</span>
                    <span className="toggle-desc">Increase cursor size</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.accessibility.largeCursors}
                      onChange={() => handleToggleChange('accessibility', 'largeCursors')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Disable Animations</span>
                    <span className="toggle-desc">Turn off all animations</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.accessibility.disableAnimations}
                      onChange={() => handleToggleChange('accessibility', 'disableAnimations')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance */}
        <div className="preference-section">
          <div 
            className="section-header"
            onClick={() => setExpandedSection(expandedSection === 'performance' ? '' : 'performance')}
          >
            <div className="header-left">
              <FiServer className="section-icon" />
              <h2>Performance</h2>
            </div>
            <span className="section-toggle">
              {expandedSection === 'performance' ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>
          
          {expandedSection === 'performance' && (
            <div className="section-content">
              <div className="preference-grid">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Lazy Load Images</span>
                    <span className="toggle-desc">Load images as you scroll</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.performance.lazyLoadImages}
                      onChange={() => handleToggleChange('performance', 'lazyLoadImages')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Prefetch Links</span>
                    <span className="toggle-desc">Preload linked pages</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.performance.prefetchLinks}
                      onChange={() => handleToggleChange('performance', 'prefetchLinks')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Enable Cache</span>
                    <span className="toggle-desc">Store data locally</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.performance.cacheEnabled}
                      onChange={() => handleToggleChange('performance', 'cacheEnabled')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Background Sync</span>
                    <span className="toggle-desc">Sync in background</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.performance.backgroundSync}
                      onChange={() => handleToggleChange('performance', 'backgroundSync')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* Image Quality */}
              <div className="preference-group">
                <label>Image Quality</label>
                <select
                  value={preferences.performance.imageQuality}
                  onChange={(e) => handlePreferenceChange('performance', 'imageQuality', e.target.value)}
                >
                  <option value="low">Low (Faster)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Better quality)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Data Management */}
        <div className="preference-section">
          <div 
            className="section-header"
            onClick={() => setExpandedSection(expandedSection === 'data' ? '' : 'data')}
          >
            <div className="header-left">
              <FiDatabase className="section-icon" />
              <h2>Data Management</h2>
            </div>
            <span className="section-toggle">
              {expandedSection === 'data' ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>
          
          {expandedSection === 'data' && (
            <div className="section-content">
              <div className="preference-grid">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Auto-Save</span>
                    <span className="toggle-desc">Automatically save changes</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
           checked={preferences.data.autoSave}
                      onChange={() => handleToggleChange('data', 'autoSave')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Enable Backup</span>
                    <span className="toggle-desc">Automatic data backup</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.data.backupEnabled}
                      onChange={() => handleToggleChange('data', 'backupEnabled')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <span className="toggle-label">Compress Exports</span>
                    <span className="toggle-desc">Zip exported files</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={preferences.data.compressExports}
                      onChange={() => handleToggleChange('data', 'compressExports')}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              {/* Save Interval */}
              <div className="preference-group">
                <label>Auto-Save Interval (seconds)</label>
                <select
                  value={preferences.data.saveInterval}
                  onChange={(e) => handlePreferenceChange('data', 'saveInterval', parseInt(e.target.value))}
                >
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="120">2 minutes</option>
                </select>
              </div>

              {/* Backup Frequency */}
              <div className="preference-group">
                <label>Backup Frequency</label>
                <select
                  value={preferences.data.backupFrequency}
                  onChange={(e) => handlePreferenceChange('data', 'backupFrequency', e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Export Format */}
              <div className="preference-group">
                <label>Export Format</label>
                <select
                  value={preferences.data.exportFormat}
                  onChange={(e) => handlePreferenceChange('data', 'exportFormat', e.target.value)}
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="excel">Excel</option>
                </select>
              </div>

              {/* Data Retention */}
              <div className="preference-group">
                <label>Data Retention (days)</label>
                <select
                  value={preferences.data.dataRetention}
                  onChange={(e) => handlePreferenceChange('data', 'dataRetention', parseInt(e.target.value))}
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="save-section">
        <button
          className="save-btn"
          onClick={handleSavePreferences}
          disabled={saving}
        >
          {saving ? <FiRefreshCw className="spin" /> : <FiSave />}
          {saving ? 'Saving...' : 'Save All Preferences'}
        </button>
      </div>

      <style jsx>{`
        .preferences-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
        }

        /* Header */
        .preferences-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .header-title h1 {
          margin: 0 0 10px;
          font-size: 32px;
          color: #333;
        }

        .header-title p {
          margin: 0;
          color: #666;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .preview-toggle,
        .export-btn,
        .import-btn,
        .reset-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .preview-toggle {
          background: #667eea;
          color: white;
        }

        .preview-toggle.active {
          background: #dc3545;
        }

        .export-btn,
        .import-btn {
          background: #28a745;
          color: white;
        }

        .reset-btn {
          background: #ffc107;
          color: #333;
        }

        /* Theme Preview */
        .theme-preview {
          background: white;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .theme-preview.dark {
          background: #1a202c;
          color: white;
        }

        .preview-content h3 {
          margin: 0 0 15px;
          font-size: 16px;
        }

        .preview-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .preview-card {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .dark .preview-card {
          background: #2d3748;
        }

        .card-header {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }

        .dark .card-header {
          color: #e2e8f0;
        }

        .card-body {
          font-size: 20px;
          font-weight: bold;
          color: #333;
        }

        .dark .card-body {
          color: #f7fafc;
        }

        /* Preferences Container */
        .preferences-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 30px;
        }

        /* Preference Section */
        .preference-section {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          padding: 20px;
          background: #f8f9fa;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-icon {
          color: #667eea;
          font-size: 20px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }

        .section-toggle {
          color: #999;
        }

        .section-content {
          padding: 20px;
        }

        /* Preference Group */
        .preference-group {
          margin-bottom: 20px;
        }

        .preference-group label {
          display: block;
          margin-bottom: 10px;
          font-weight: 500;
          color: #333;
        }

        .preference-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        /* Theme Selector */
        .theme-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .theme-option {
          padding: 15px;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .theme-option.active {
          border-color: #667eea;
          background: #f0f4ff;
        }

        /* Font Size Selector */
        .font-size-selector {
          display: flex;
          gap: 10px;
        }

        .size-option {
          width: 50px;
          height: 50px;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .size-option.active {
          border-color: #667eea;
          background: #f0f4ff;
        }

        /* Density Selector */
        .density-selector {
          display: flex;
          gap: 10px;
        }

        .density-option {
          flex: 1;
          padding: 15px;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .density-option.active {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .density-preview {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .density-preview .preview-line {
          height: 4px;
          background: #ddd;
          border-radius: 2px;
        }

        .density-loose .preview-line {
          height: 6px;
          margin: 3px 0;
        }

        .density-tight .preview-line {
          height: 3px;
          margin: 1px 0;
        }

        /* Preference Grid */
        .preference-grid {
          display: grid;
          gap: 15px;
        }

        .toggle-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e9ecef;
        }

        .toggle-item:last-child {
          border-bottom: none;
        }

        .toggle-info {
          flex: 1;
        }

        .toggle-label {
          display: block;
          font-weight: 500;
          color: #333;
          margin-bottom: 3px;
        }

        .toggle-desc {
          font-size: 12px;
          color: #999;
        }

        /* Format Selector */
        .format-selector {
          display: flex;
          gap: 10px;
        }

        .format-option {
          flex: 1;
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 5px;
          background: white;
          cursor: pointer;
          text-align: center;
        }

        .format-option.active {
          border-color: #667eea;
          background: #f0f4ff;
        }

        /* Chart Selector */
        .chart-selector {
          display: flex;
          gap: 10px;
        }

        .chart-option {
          flex: 1;
          padding: 15px;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .chart-option.active {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .chart-option svg {
          font-size: 24px;
              }


        /* View Selector */
        .view-selector {
          display: flex;
          gap: 10px;
        }

        .view-option {
          flex: 1;
          padding: 15px;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .view-option.active {
          border-color: #667eea;
          background: #f0f4ff;
        }

        /* Switch */
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

        /* Save Section */
        .save-section {
          display: flex;
          justify-content: flex-end;
        }

        .save-btn {
          padding: 12px 30px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 16px;
        }

        .save-btn:hover:not(:disabled) {
          background: #218838;
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

        /* Dark Mode */
        @media (prefers-color-scheme: dark) {
          .header-title h1,
          .section-header h2,
          .toggle-label,
          .preference-group label {
            color: #f7fafc;
          }

          .header-title p,
          .toggle-desc {
            color: #e2e8f0;
          }

          .preference-section,
          .theme-preview {
            background: #2d3748;
          }

          .section-header {
            background: #1a202c;
          }

          .section-header h2 {
            color: #f7fafc;
          }

          .preference-group select {
            background: #1a202c;
            border-color: #4a5568;
            color: #f7fafc;
          }

          .theme-option,
          .size-option,
          .density-option,
          .format-option,
          .chart-option,
          .view-option {
            background: #1a202c;
            border-color: #4a5568;
            color: #f7fafc;
          }

          .theme-option.active,
          .size-option.active,
          .density-option.active,
          .format-option.active,
          .chart-option.active,
          .view-option.active {
            background: #1a2a4a;
            border-color: #667eea;
          }

          .toggle-item {
            border-bottom-color: #4a5568;
          }

          .preview-card {
            background: #1a202c;
          }

          .card-body {
            color: #f7fafc;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .preferences-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .preview-toggle,
          .export-btn,
          .import-btn,
          .reset-btn {
            flex: 1;
            justify-content: center;
          }

          .theme-selector,
          .font-size-selector,
          .density-selector,
          .format-selector,
          .chart-selector,
          .view-selector {
            grid-template-columns: 1fr;
          }

          .preview-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Preferences;
