import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Theme Context
const ThemeContext = createContext(null);

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  // Available themes
  const themes = {
    light: {
      name: 'light',
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#212529',
        textSecondary: '#6c757d',
        border: '#e9ecef',
        shadow: 'rgba(0, 0, 0, 0.1)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        secondary: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)'
      }
    },
    dark: {
      name: 'dark',
      colors: {
        primary: '#818cf8',
        secondary: '#a78bfa',
        success: '#34d399',
        danger: '#f87171',
        warning: '#fbbf24',
        info: '#60a5fa',
        background: '#1a1a2e',
        surface: '#16213e',
        text: '#ffffff',
        textSecondary: '#b7b7b7',
        border: '#2d3748',
        shadow: 'rgba(0, 0, 0, 0.3)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
        secondary: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)'
      }
    },
    cupcake: {
      name: 'cupcake',
      colors: {
        primary: '#65c3c8',
        secondary: '#ef9fbc',
        success: '#86efac',
        danger: '#fca5a5',
        warning: '#fcd34d',
        info: '#7dd3fc',
        background: '#faf7f5',
        surface: '#ffffff',
        text: '#291334',
        textSecondary: '#6b4b6b',
        border: '#e9e2e2',
        shadow: 'rgba(0, 0, 0, 0.05)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #65c3c8 0%, #ef9fbc 100%)',
        secondary: 'linear-gradient(135deg, #d9b6a0 0%, #c4a5a5 100%)'
      }
    },
    business: {
      name: 'business',
      colors: {
        primary: '#1e3a8a',
        secondary: '#64748b',
        success: '#059669',
        danger: '#b91c1c',
        warning: '#d97706',
        info: '#0284c7',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f8fafc',
        textSecondary: '#cbd5e1',
        border: '#334155',
        shadow: 'rgba(0, 0, 0, 0.5)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        secondary: 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)'
      }
    },
    emerald: {
      name: 'emerald',
      colors: {
        primary: '#10b981',
        secondary: '#34d399',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        background: '#ecfdf5',
        surface: '#ffffff',
        text: '#022c22',
        textSecondary: '#065f46',
        border: '#a7f3d0',
        shadow: 'rgba(0, 150, 0, 0.1)'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        secondary: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
      }
    }
  };

  // State
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme && themes[savedTheme] ? savedTheme : 'light';
  });

  const [customTheme, setCustomTheme] = useState(null);
  const [systemTheme, setSystemTheme] = useState('light');

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const theme = customTheme || themes[currentTheme];
    
    // Apply CSS variables
    const root = document.documentElement;
    
    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Gradients
    Object.entries(theme.gradients).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value);
    });

    // Set data attribute for CSS selectors
    root.setAttribute('data-theme', theme.name);

    // Save to localStorage
    localStorage.setItem('theme', currentTheme);

  }, [currentTheme, customTheme, themes]);

  // Toggle between light and dark
  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Set specific theme
  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      setCustomTheme(null);
    }
  };

  // Create custom theme
  const createCustomTheme = (customColors) => {
    const baseTheme = themes[currentTheme];
    const newCustomTheme = {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        ...customColors
      },
      name: 'custom'
    };
    setCustomTheme(newCustomTheme);
  };

  // Reset to default theme
  const resetTheme = () => {
    setCustomTheme(null);
    setCurrentTheme('light');
  };

  // Get current theme object
  const getCurrentTheme = () => {
    return customTheme || themes[currentTheme];
  };

  // Check if using custom theme
  const isCustomTheme = () => {
    return customTheme !== null;
  };

  // Get available themes list
  const getAvailableThemes = () => {
    return Object.keys(themes).map(key => ({
      id: key,
      name: themes[key].name,
      colors: themes[key].colors
    }));
  };

  // Context value
  const value = {
    currentTheme: getCurrentTheme(),
    themeName: currentTheme,
    systemTheme,
    themes,
    toggleTheme,
    setTheme,
    createCustomTheme,
    resetTheme,
    isCustomTheme,
    getAvailableThemes,
    // Color helpers
    colors: getCurrentTheme().colors,
    gradients: getCurrentTheme().gradients
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// CSS Variables (to be added to index.css)
export const themeCSSVariables = `
  :root {
    --color-primary: #667eea;
    --color-secondary: #764ba2;
    --color-success: #28a745;
    --color-danger: #dc3545;
    --color-warning: #ffc107;
    --color-info: #17a2b8;
    --color-background: #ffffff;
    --color-surface: #f8f9fa;
    --color-text: #212529;
    --color-text-secondary: #6c757d;
    --color-border: #e9ecef;
    --color-shadow: rgba(0, 0, 0, 0.1);
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-secondary: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    --transition-theme: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }

  [data-theme="dark"] {
    --color-primary: #818cf8;
    --color-secondary: #a78bfa;
    --color-success: #34d399;
    --color-danger: #f87171;
    --color-warning: #fbbf24;
    --color-info: #60a5fa;
    --color-background: #1a1a2e;
    --color-surface: #16213e;
    --color-text: #ffffff;
    --color-text-secondary: #b7b7b7;
    --color-border: #2d3748;
    --color-shadow: rgba(0, 0, 0, 0.3);
    --gradient-primary: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
    --gradient-secondary: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  }

  [data-theme="cupcake"] {
    --color-primary: #65c3c8;
    --color-secondary: #ef9fbc;
    --color-success: #86efac;
    --color-danger: #fca5a5;
    --color-warning: #fcd34d;
    --color-info: #7dd3fc;
    --color-background: #faf7f5;
    --color-surface: #ffffff;
    --color-text: #291334;
    --color-text-secondary: #6b4b6b;
    --color-border: #e9e2e2;
    --color-shadow: rgba(0, 0, 0, 0.05);
    --gradient-primary: linear-gradient(135deg, #65c3c8 0%, #ef9fbc 100%);
    --gradient-secondary: linear-gradient(135deg, #d9b6a0 0%, #c4a5a5 100%);
  }

  [data-theme="business"] {
    --color-primary: #1e3a8a;
    --color-secondary: #64748b;
    --color-success: #059669;
    --color-danger: #b91c1c;
    --color-warning: #d97706;
    --color-info: #0284c7;
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-text: #f8fafc;
    --color-text-secondary: #cbd5e1;
    --color-border: #334155;
    --color-shadow: rgba(0, 0, 0, 0.5);
    --gradient-primary: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
    --gradient-secondary: linear-gradient(135deg, #4b5563 0%, #1f2937 100%);
  }

  [data-theme="emerald"] {
    --color-primary: #10b981;
    --color-secondary: #34d399;
    --color-success: #22c55e;
    --color-danger: #ef4444;
    --color-warning: #f59e0b;
    --color-info: #3b82f6;
    --color-background: #ecfdf5;
    --color-surface: #ffffff;
    --color-text: #022c22;
    --color-text-secondary: #065f46;
    --color-border: #a7f3d0;
    --color-shadow: rgba(0, 150, 0, 0.1);
    --gradient-primary: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    --gradient-secondary: linear-gradient(135deg, #059669 0%, #10b981 100%);
  }

  /* Apply transitions */
  * {
    transition: var(--transition-theme);
  }

  /* Theme toggle button animation */
  .theme-toggle {
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: transform 0.3s ease;
  }

  .theme-toggle:hover {
    transform: rotate(30deg);
  }

  .theme-toggle:active {
    transform: scale(0.9);
  }

  /* Theme switcher menu */
  .theme-switcher {
    position: relative;
    display: inline-block;
  }

  .theme-switcher-menu {
    position: absolute;
    top: 100%;
    right: 0;
    min-width: 200px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    box-shadow: 0 4px 6px var(--color-shadow);
    z-index: 1000;
    overflow: hidden;
  }

  .theme-option {
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .theme-option:hover {
    background-color: var(--color-primary);
    color: white;
  }

  .theme-option.active {
    background-color: var(--color-primary);
    color: white;
  }

  /* Theme preview */
  .theme-preview {
    display: flex;
    gap: 8px;
    padding: 8px;
    border-radius: 4px;
    background: var(--color-background);
  }

  .theme-color {
    width: 24px;
    height: 24px;
    border-radius: 4px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .theme-switcher-menu {
      right: auto;
      left: 0;
    }
  }
`;

export default ThemeContext;
