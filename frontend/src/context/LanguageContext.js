import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create context
const LanguageContext = createContext();

// Custom hook
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Available languages
const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    flag: '🇺🇸'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    dir: 'ltr',
    flag: '🇮🇳'
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    dir: 'ltr',
    flag: '🇧🇩'
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    dir: 'ltr',
    flag: '🇮🇳'
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    dir: 'ltr',
    flag: '🇮🇳'
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    dir: 'ltr',
    flag: '🇮🇳'
  },
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    dir: 'rtl',
    flag: '🇵🇰'
  },
  gu: {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    dir: 'ltr',
    flag: '🇮🇳'
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    dir: 'ltr',
    flag: '🇮🇳'
  },
  ml: {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    dir: 'ltr',
    flag: '🇮🇳'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    dir: 'ltr',
    flag: '🇪🇸'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    dir: 'ltr',
    flag: '🇫🇷'
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    dir: 'ltr',
    flag: '🇩🇪'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    dir: 'ltr',
    flag: '🇨🇳'
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    dir: 'ltr',
    flag: '🇯🇵'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    flag: '🇸🇦'
  }
};

// Default translations (you would expand this)
const DEFAULT_TRANSLATIONS = {
  en: {
    // Common
    'app.name': 'Affiliate Platform',
    'app.tagline': 'Earn money by promoting products',
    
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.affiliates': 'Affiliates',
    'nav.leaderboard': 'Leaderboard',
    'nav.support': 'Support',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    
    // Auth
    'auth.welcome': 'Welcome Back',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.rememberMe': 'Remember Me',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.haveAccount': 'Already have an account?',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.resetPassword': 'Reset Password',
    'auth.sendResetLink': 'Send Reset Link',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.analytics': 'Analytics',
    'dashboard.referrals': 'Referrals',
    'dashboard.earnings': 'Earnings',
    'dashboard.commissions': 'Commissions',
    'dashboard.payouts': 'Payouts',
    'dashboard.links': 'Links',
    'dashboard.products': 'Products',
    
    // Common actions
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Info',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.finish': 'Finish',
    'common.submit': 'Submit',
    'common.reset': 'Reset',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.print': 'Print',
    'common.share': 'Share',
    'common.copy': 'Copy',
    'common.refresh': 'Refresh',
    
    // Messages
    'message.welcome': 'Welcome to Affiliate Platform!',
    'message.logoutConfirm': 'Are you sure you want to logout?',
    'message.deleteConfirm': 'Are you sure you want to delete this item?',
    'message.unsavedChanges': 'You have unsaved changes. Do you want to leave?',
    'message.sessionExpired': 'Your session has expired. Please login again.',
    'message.networkError': 'Network error. Please check your connection.',
    'message.serverError': 'Server error. Please try again later.',
    
    // Errors
    'error.required': 'This field is required',
    'error.email': 'Please enter a valid email address',
    'error.password': 'Password must be at least 8 characters',
    'error.passwordMatch': 'Passwords do not match',
    'error.minLength': 'Must be at least {min} characters',
    'error.maxLength': 'Must be at most {max} characters',
    'error.invalid': 'Invalid value',
    'error.unauthorized': 'You are not authorized to perform this action',
    'error.forbidden': 'Access forbidden',
    'error.notFound': 'Page not found',
    
    // Success messages
    'success.saved': 'Saved successfully',
    'success.updated': 'Updated successfully',
    'success.deleted': 'Deleted successfully',
    'success.added': 'Added successfully',
    'success.removed': 'Removed successfully',
    'success.copied': 'Copied to clipboard',
    'success.emailSent': 'Email sent successfully',
    'success.passwordChanged': 'Password changed successfully',
    'success.profileUpdated': 'Profile updated successfully',
    'success.settingsUpdated': 'Settings updated successfully'
  }
};

// Provider component
export const LanguageProvider = ({ children, translations = {} }) => {
  const [language, setLanguage] = useState('en');
  const [direction, setDirection] = useState('ltr');
  const [messages, setMessages] = useState({});

  // Load saved language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred_language');
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      changeLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (LANGUAGES[browserLang]) {
        changeLanguage(browserLang);
      }
    }
  }, []);

  // Merge translations
  useEffect(() => {
    setMessages({
      ...DEFAULT_TRANSLATIONS.en,
      ...translations[language]
    });
  }, [language, translations]);

  // Change language
  const changeLanguage = useCallback((langCode) => {
    if (LANGUAGES[langCode]) {
      setLanguage(langCode);
      setDirection(LANGUAGES[langCode].dir);
      localStorage.setItem('preferred_language', langCode);
      
      // Update HTML dir attribute
      document.documentElement.dir = LANGUAGES[langCode].dir;
      document.documentElement.lang = langCode;
    }
  }, []);

  // Translate function
  const t = useCallback((key, params = {}) => {
    let text = messages[key] || key;
    
    // Replace parameters
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  }, [messages]);

  // Get current language info
  const currentLanguage = LANGUAGES[language] || LANGUAGES.en;

  // Get all languages
  const getLanguages = useCallback(() => {
    return Object.values(LANGUAGES);
  }, []);

  // Format date according to language
  const formatDate = useCallback((date, options = {}) => {
    return new Intl.DateTimeFormat(language, options).format(new Date(date));
  }, [language]);

  // Format number according to language
  const formatNumber = useCallback((number, options = {}) => {
    return new Intl.NumberFormat(language, options).format(number);
  }, [language]);

  // Format currency according to language
  const formatCurrency = useCallback((amount, currency = 'USD', options = {}) => {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency,
      ...options
    }).format(amount);
  }, [language]);

  // Format relative time
  const formatRelativeTime = useCallback((date) => {
    const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
    const now = new Date();
    const diff = new Date(date) - now;
    const diffInSeconds = Math.floor(diff / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (Math.abs(diffInYears) >= 1) {
      return rtf.format(diffInYears, 'year');
    }
    if (Math.abs(diffInMonths) >= 1) {
      return rtf.format(diffInMonths, 'month');
    }
    if (Math.abs(diffInDays) >= 1) {
      return rtf.format(diffInDays, 'day');
    }
    if (Math.abs(diffInHours) >= 1) {
      return rtf.format(diffInHours, 'hour');
    }
    if (Math.abs(diffInMinutes) >= 1) {
      return rtf.format(diffInMinutes, 'minute');
    }
    return rtf.format(diffInSeconds, 'second');
  }, [language]);

  const value = {
    language,
    direction,
    currentLanguage,
    changeLanguage,
    t,
    getLanguages,
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
    availableLanguages: LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      <div dir={direction} lang={language}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};
