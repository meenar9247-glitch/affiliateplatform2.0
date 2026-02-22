import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

// Create context
const SettingsContext = createContext();

// Custom hook to use settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
  DIM: 'dim',
  CONTRAST: 'high-contrast'
};

// Language options
export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', dir: 'ltr' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', native: 'اردو', dir: 'rtl' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', dir: 'ltr' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', dir: 'ltr' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', dir: 'ltr' },
  { code: 'mai', name: 'Maithili', native: 'मैथिली', dir: 'ltr' },
  { code: 'es', name: 'Spanish', native: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'French', native: 'Français', dir: 'ltr' },
  { code: 'de', name: 'German', native: 'Deutsch', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', native: '中文', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', native: '日本語', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', native: 'العربية', dir: 'rtl' }
];

// Currency options
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', decimals: 2 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2 },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimals: 0 },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', decimals: 2 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimals: 2 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', decimals: 2 }
];

// Timezone options
export const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: '+5:30' },
  { value: 'America/New_York', label: 'US Eastern (EST)', offset: '-5:00' },
  { value: 'America/Chicago', label: 'US Central (CST)', offset: '-6:00' },
  { value: 'America/Denver', label: 'US Mountain (MST)', offset: '-7:00' },
  { value: 'America/Los_Angeles', label: 'US Pacific (PST)', offset: '-8:00' },
  { value: 'Europe/London', label: 'UK (GMT)', offset: '+0:00' },
  { value: 'Europe/Paris', label: 'Central European (CET)', offset: '+1:00' },
  { value: 'Europe/Berlin', label: 'German (CET)', offset: '+1:00' },
  { value: 'Europe/Rome', label: 'Italian (CET)', offset: '+1:00' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: '+3:00' },
  { value: 'Asia/Dubai', label: 'Gulf (GST)', offset: '+4:00' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: '+8:00' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)', offset: '+9:00' },
  { value: 'Australia/Sydney', label: 'Australia (AEDT)', offset: '+11:00' },
  { value: 'Pacific/Auckland', label: 'New Zealand (NZDT)', offset: '+13:00' }
];

// Date format options
export const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)', example: '12/31/2024' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)', example: '31/12/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)', example: '2024-12-31' },
  { value: 'MMMM D, YYYY', label: 'MMMM D, YYYY (December 31, 2024)', example: 'December 31, 2024' },
  { value: 'D MMMM YYYY', label: 'D MMMM YYYY (31 December 2024)', example: '31 December 2024' }
];

// Time format options
export const TIME_FORMATS = [
  { value: '12h', label: '12-hour (12:30 PM)', example: '12:30 PM' },
  { value: '24h', label: '24-hour (14:30)', example: '14:30' }
];

// Number format options
export const NUMBER_FORMATS = [
  { value: 'en-US', label: 'US (1,234.56)', example: '1,234.56' },
  { value: 'en-IN', label: 'Indian (1,23,456.78)', example: '1,23,456.78' },
  { value: 'de-DE', label: 'German (1.234,56)', example: '1.234,56' },
  { value: 'fr-FR', label: 'French (1 234,56)', example: '1 234,56' },
  { value: 'ja-JP', label: 'Japanese (1,234.56)', example: '1,234.56' }
];

// Week start options
export const WEEK_STARTS = [
  { value: 'monday', label: 'Monday' },
  { value: 'sunday', label: 'Sunday' },
  { value: 'saturday', label: 'Saturday' }
];

// Default settings
const DEFAULT_SETTINGS = {
  // Display
  theme: THEMES.LIGHT,
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
  
  // Language & Region
  language: 'en',
  secondaryLanguage: '',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  timezone: 'Asia/Kolkata',
  firstDayOfWeek: 'monday',
  numberFormat: 'en-US',
  
  // Currency
  currency: 'USD',
  currencyDisplay: 'symbol', // symbol, code, name
  currencyDecimals: 2,
  thousandSeparator: ',',
  decimalSeparator: '.',
  showCents: true,
  autoConvert: false,
  
  // Dashboard
  defaultDashboardTab: 'overview',
  showStats: true,
  showCharts: true,
  showRecentActivity: true,
  showLeaderboard: true,
  showEarnings: true,
  chartType: 'line', // line, bar, area, pie
  refreshInterval: 5, // minutes
  
  // Notifications
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false,
  desktopNotifications: true,
  notificationSound: true,
  notificationPosition: 'top-right',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  
  // Privacy
  showOnlineStatus: true,
  showLastSeen: true,
  showProfile: true,
  showEarnings: false,
  allowAnalytics: true,
  allowTracking: false,
  allowMarketing: false,
  
  // Accessibility
  screenReader: false,
  keyboardNavigation: true,
  focusIndicator: true,
  linkUnderline: false,
  largeCursors: false,
  disableAnimations: false,
  
  // Performance
  lazyLoadImages: true,
  prefetchLinks: false,
  cacheEnabled: true,
  cacheDuration: 3600,
  compressionEnabled: true,
  imageQuality: 'high',
  videoAutoplay: false,
  backgroundSync: true,
  
  // Data
  autoSave: true,
  saveInterval: 30,
  backupEnabled: false,
  backupFrequency: 'weekly',
  exportFormat: 'csv',
  dataRetention: 90,
  
  // Communication
  emailFrequency: 'immediate',
  messageSound: true,
  
  // Advanced
  debugMode: false,
  experimentalFeatures: false,
  betaAccess: false,
  developerMode: false
};
export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
    setLoading(false);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('appSettings', JSON.stringify(settings));
      applyTheme(settings.theme);
      applyLanguage(settings.language);
      setIsDirty(false);
      setLastSaved(new Date());
    }
  }, [settings, loading]);

  // Load user settings from server when user logs in
  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  // Fetch user settings from server
  const fetchUserSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/settings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
    }
  };

  // Apply theme to document
  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'dim', 'high-contrast');
    
    if (theme === THEMES.SYSTEM) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Apply high contrast if enabled
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    }
    
    // Apply reduced motion if enabled
    if (settings.reducedMotion || settings.disableAnimations) {
      root.classList.add('reduce-motion');
    }
  };

  // Apply language to document
  const applyLanguage = (langCode) => {
    const html = document.documentElement;
    html.setAttribute('lang', langCode);
    
    const language = LANGUAGES.find(l => l.code === langCode);
    if (language) {
      html.setAttribute('dir', language.dir);
    }
  };

  // Update settings
  const updateSettings = async (newSettings, saveToServer = true) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      setIsDirty(true);
      return updated;
    });

    if (saveToServer && user) {
      await saveSettingsToServer(newSettings);
    }
  };

  // Save settings to server
  const saveSettingsToServer = async (newSettings) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/settings`,
        newSettings,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success('Settings saved successfully');
        setLastSaved(new Date());
        setIsDirty(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save settings');
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Reset settings to default
  const resetToDefault = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings(DEFAULT_SETTINGS);
      if (user) {
        await saveSettingsToServer(DEFAULT_SETTINGS);
      }
      toast.success('Settings reset to default');
    }
  };

  // Import settings from file
  const importSettings = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setSettings(prev => ({ ...prev, ...imported }));
          if (user) {
            await saveSettingsToServer(imported);
          }
          toast.success('Settings imported successfully');
          resolve(imported);
        } catch (error) {
          toast.error('Invalid settings file');
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  };

  // Export settings to file
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `settings-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Settings exported');
  };

  // Format value based on settings
  const formatCurrency = (value, currencyCode = null) => {
    const currency = CURRENCIES.find(c => c.code === (currencyCode || settings.currency));
    if (!currency) return value;
    
    const formatter = new Intl.NumberFormat(settings.numberFormat, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: settings.showCents ? settings.currencyDecimals : 0,
      maximumFractionDigits: settings.showCents ? settings.currencyDecimals : 0
    });
    
    return formatter.format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat(settings.numberFormat).format(value);
  };

  const formatPercentage = (value) => {
    return new Intl.NumberFormat(settings.numberFormat, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const formatDate = (date, format = null) => {
    const d = new Date(date);
    const dateFormat = format || settings.dateFormat;
    
    switch(dateFormat) {
      case 'MM/DD/YYYY':
        return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
      case 'DD/MM/YYYY':
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      case 'YYYY-MM-DD':
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      case 'MMMM D, YYYY':
        return d.toLocaleDateString(settings.language, { month: 'long', day: 'numeric', year: 'numeric' });
      case 'D MMMM YYYY':
        return d.toLocaleDateString(settings.language, { day: 'numeric', month: 'long', year: 'numeric' });
      default:
        return d.toLocaleDateString(settings.language);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString(settings.language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: settings.timeFormat === '12h'
    });
  };

  const formatDateTime = (date) => {
    return `${formatDate(date)} ${formatTime(date)}`;
  };

  // Get current language info
  const currentLanguage = LANGUAGES.find(l => l.code === settings.language) || LANGUAGES[0];
  
  // Get current currency info
  const currentCurrency = CURRENCIES.find(c => c.code === settings.currency) || CURRENCIES[0];

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (settings.theme === THEMES.SYSTEM) {
        applyTheme(THEMES.SYSTEM);
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [settings.theme]);

  // Apply settings on mount and when they change
  useEffect(() => {
    applyTheme(settings.theme);
    applyLanguage(settings.language);
    
    // Apply font size
    document.documentElement.style.fontSize = 
      settings.fontSize === 'small' ? '14px' : 
      settings.fontSize === 'large' ? '18px' : '16px';
    
    // Apply density
    document.documentElement.setAttribute('data-density', settings.density);
    
    // Apply reduced motion
    if (settings.reducedMotion || settings.disableAnimations) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    
    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [settings]);
    const value = {
    // State
    settings,
    loading,
    saving,
    error,
    isDirty,
    lastSaved,
    
    // Methods
    updateSettings,
    resetToDefault,
    importSettings,
    exportSettings,
    
    // Formatting utilities
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatDate,
    formatTime,
    formatDateTime,
    
    // Current values
    currentLanguage,
    currentCurrency,
    
    // Available options
    themes: THEMES,
    languages: LANGUAGES,
    currencies: CURRENCIES,
    timezones: TIMEZONES,
    dateFormats: DATE_FORMATS,
    timeFormats: TIME_FORMATS,
    numberFormats: NUMBER_FORMATS,
    weekStarts: WEEK_STARTS,
    
    // Theme utils
    applyTheme,
    applyLanguage
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
      
      {/* Auto-save indicator */}
      {isDirty && (
        <div style={styles.autoSaveIndicator}>
          <span>Unsaved changes...</span>
          {saving && <span>Saving...</span>}
        </div>
      )}
      
      {/* Settings debug panel (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={styles.debugPanel}>
          <button
            onClick={() => console.log('Current settings:', settings)}
            style={styles.debugButton}
          >
            🐛 Log Settings
          </button>
        </div>
      )}
    </SettingsContext.Provider>
  );
};

// Styles
const styles = {
  autoSaveIndicator: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '30px',
    fontSize: '13px',
    zIndex: 9999,
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  debugPanel: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 9999
  },
  debugButton: {
    background: 'rgba(102,126,234,0.9)',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    padding: '8px 16px',
    fontSize: '12px',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  }
};

// CSS to inject
const settingsStyles = `
  /* Theme variables */
  :root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #28a745;
    --warning-color: #ffc107;
    --danger-color: #dc3545;
    --info-color: #17a2b8;
  }

  /* Light theme */
  :root,
  .light {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-tertiary: #e9ecef;
    --text-primary: #333333;
    --text-secondary: #666666;
    --text-tertiary: #999999;
    --border-color: #e9ecef;
    --shadow-color: rgba(0,0,0,0.1);
  }

  /* Dark theme */
  .dark {
    --bg-primary: #1a1a2e;
    --bg-secondary: #16213e;
    --bg-tertiary: #0f3460;
    --text-primary: #ffffff;
    --text-secondary: #e2e8f0;
    --text-tertiary: #a0aec0;
    --border-color: #2d3748;
    --shadow-color: rgba(0,0,0,0.3);
  }

  /* Dim theme */
  .dim {
    --bg-primary: #2d3748;
    --bg-secondary: #1a202c;
    --bg-tertiary: #4a5568;
    --text-primary: #f7fafc;
    --text-secondary: #e2e8f0;
    --text-tertiary: #cbd5e0;
    --border-color: #4a5568;
    --shadow-color: rgba(0,0,0,0.4);
  }

  /* High contrast theme */
  .high-contrast {
    --bg-primary: #000000;
    --bg-secondary: #1a1a1a;
    --bg-tertiary: #333333;
    --text-primary: #ffffff;
    --text-secondary: #ffff00;
    --text-tertiary: #00ff00;
    --border-color: #ffffff;
    --shadow-color: none;
  }

  /* Reduce motion */
  .reduce-motion * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }

  /* Density variants */
  [data-density="compact"] {
    --spacing-unit: 4px;
    --font-size-base: 13px;
  }

  [data-density="comfortable"] {
    --spacing-unit: 8px;
    --font-size-base: 14px;
  }

  [data-density="cozy"] {
    --spacing-unit: 12px;
    --font-size-base: 16px;
  }

  /* RTL support */
  [dir="rtl"] {
    text-align: right;
  }

  [dir="rtl"] .ml-auto {
    margin-left: 0;
    margin-right: auto;
  }

  [dir="rtl"] .mr-auto {
    margin-right: 0;
    margin-left: auto;
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = settingsStyles;
document.head.appendChild(styleSheet);

export { SettingsProvider };
