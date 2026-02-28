import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import { useLocalStorage } from './useLocalStorage';

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
  DIM: 'dim',
  CONTRAST: 'high-contrast',
  CUSTOM: 'custom',
};

// Theme colors
export const THEME_COLORS = {
  [THEMES.LIGHT]: {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#333333',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#e9ecef',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  [THEMES.DARK]: {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8',
    background: '#1a1a2e',
    surface: '#16213e',
    text: '#ffffff',
    textSecondary: '#e2e8f0',
    textMuted: '#a0aec0',
    border: '#2d3748',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  [THEMES.DIM]: {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545',
    info: '#17a2b8',
    background: '#2d3748',
    surface: '#1a202c',
    text: '#f7fafc',
    textSecondary: '#e2e8f0',
    textMuted: '#cbd5e0',
    border: '#4a5568',
    shadow: 'rgba(0, 0, 0, 0.4)',
  },
  [THEMES.CONTRAST]: {
    primary: '#0000ff',
    secondary: '#800080',
    success: '#008000',
    warning: '#ffff00',
    danger: '#ff0000',
    info: '#00ffff',
    background: '#ffffff',
    surface: '#f0f0f0',
    text: '#000000',
    textSecondary: '#333333',
    textMuted: '#666666',
    border: '#000000',
    shadow: 'none',
  },
};

// Font size presets
export const FONT_SIZES = {
  small: {
    base: '14px',
    h1: '2rem',
    h2: '1.75rem',
    h3: '1.5rem',
    body: '0.875rem',
    small: '0.75rem',
  },
  medium: {
    base: '16px',
    h1: '2.5rem',
    h2: '2rem',
    h3: '1.75rem',
    body: '1rem',
    small: '0.875rem',
  },
  large: {
    base: '18px',
    h1: '3rem',
    h2: '2.5rem',
    h3: '2rem',
    body: '1.125rem',
    small: '1rem',
  },
};

// Spacing presets
export const SPACING = {
  compact: {
    unit: '4px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
  },
  comfortable: {
    unit: '8px',
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '24px',
    xxl: '32px',
  },
  cozy: {
    unit: '12px',
    xs: '12px',
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
    xxl: '40px',
  },
};

// Animation presets
export const ANIMATIONS = {
  none: {
    duration: '0ms',
    timing: 'linear',
  },
  fast: {
    duration: '150ms',
    timing: 'ease',
  },
  normal: {
    duration: '300ms',
    timing: 'ease-in-out',
  },
  slow: {
    duration: '500ms',
    timing: 'ease-out',
  },
};

// Border radius presets
export const BORDER_RADIUS = {
  none: '0',
  small: '4px',
  medium: '8px',
  large: '12px',
  round: '50%',
  pill: '9999px',
};

// Box shadow presets
export const BOX_SHADOWS = {
  none: 'none',
  small: '0 2px 4px rgba(0,0,0,0.1)',
  medium: '0 4px 6px rgba(0,0,0,0.1)',
  large: '0 10px 15px rgba(0,0,0,0.1)',
  xl: '0 20px 25px rgba(0,0,0,0.1)',
};

export const useTheme = () => {
  // Core theme state
  const [theme, setTheme] = useLocalStorage('theme', THEMES.SYSTEM);
  const [customTheme, setCustomTheme] = useLocalStorage('customTheme', {});
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 'medium');
  const [spacing, setSpacing] = useLocalStorage('spacing', 'comfortable');
  const [animations, setAnimations] = useLocalStorage('animations', 'normal');
  const [borderRadius, setBorderRadius] = useLocalStorage('borderRadius', 'medium');
  const [boxShadow, setBoxShadow] = useLocalStorage('boxShadow', 'medium');
  const [reducedMotion, setReducedMotion] = useLocalStorage('reducedMotion', false);
  const [highContrast, setHighContrast] = useLocalStorage('highContrast', false);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', false);
  
  // Derived state
  const [systemTheme, setSystemTheme] = useState('light');
  const [effectiveTheme, setEffectiveTheme] = useState(theme);
  const [currentColors, setCurrentColors] = useState(THEME_COLORS[THEMES.LIGHT]);
  const [currentFontSize, setCurrentFontSize] = useState(FONT_SIZES[fontSize]);
  const [currentSpacing, setCurrentSpacing] = useState(SPACING[spacing]);
  const [currentAnimations, setCurrentAnimations] = useState(ANIMATIONS[animations]);
  const [currentBorderRadius, setCurrentBorderRadius] = useState(BORDER_RADIUS[borderRadius]);
  const [currentBoxShadow, setCurrentBoxShadow] = useState(BOX_SHADOWS[boxShadow]);

  // Refs for performance
  const mediaQueryRef = useRef(null);
  const styleRef = useRef(null);
  const observerRef = useRef(null);

  // Initialize theme
  useEffect(() => {
    // Create style element for CSS variables
    if (!styleRef.current) {
      styleRef.current = document.createElement('style');
      styleRef.current.id = 'theme-variables';
      document.head.appendChild(styleRef.current);
    }

    // Listen for system theme changes
    mediaQueryRef.current = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQueryRef.current.addEventListener('change', handleSystemThemeChange);
    setSystemTheme(mediaQueryRef.current.matches ? 'dark' : 'light');

    // Observe DOM changes for theme toggles
    observerRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
          setEffectiveTheme(newTheme);
        }
      });
    });

    observerRef.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      mediaQueryRef.current?.removeEventListener('change', handleSystemThemeChange);
      observerRef.current?.disconnect();
    };
  }, []);
  // Calculate effective theme
  useEffect(() => {
    let effective = theme;
  
    if (theme === THEMES.SYSTEM) {
      effective = systemTheme;
    }
  
    setEffectiveTheme(effective);
  
    // Get colors for effective theme
    if (theme === THEMES.CUSTOM) {
      setCurrentColors({
        ...THEME_COLORS[THEMES.LIGHT],
        ...customTheme,
      });
    } else {
      setCurrentColors(THEME_COLORS[effective] || THEME_COLORS[THEMES.LIGHT]);
    }
  }, [theme, systemTheme, customTheme]);

  // Update CSS variables
  useEffect(() => {
    if (!styleRef.current) return;

    const variables = generateCSSVariables();
    let cssText = ':root {\n';
  
    Object.entries(variables).forEach(([key, value]) => {
      cssText += `  ${key}: ${value};\n`;
    });
  
    cssText += '}';
  
    styleRef.current.textContent = cssText;
  }, [currentColors, currentFontSize, currentSpacing, currentAnimations, currentBorderRadius, currentBoxShadow, reducedMotion, highContrast]);

  // Generate CSS variables
  const generateCSSVariables = useCallback(() => {
    const vars = {};

    // Color variables
    Object.entries(currentColors).forEach(([key, value]) => {
      vars[`--color-${key}`] = value;
    });

    // Font size variables
    Object.entries(currentFontSize).forEach(([key, value]) => {
      vars[`--font-${key}`] = value;
    });

    // Spacing variables
    Object.entries(currentSpacing).forEach(([key, value]) => {
      vars[`--spacing-${key}`] = value;
    });

    // Animation variables
    Object.entries(currentAnimations).forEach(([key, value]) => {
      vars[`--animation-${key}`] = value;
    });

    // Border radius variables
    Object.entries(currentBorderRadius).forEach(([key, value]) => {
      if (typeof value === 'string') {
        vars[`--radius-${key}`] = value;
      }
    });

    // Box shadow variables
    Object.entries(currentBoxShadow).forEach(([key, value]) => {
      if (typeof value === 'string') {
        vars[`--shadow-${key}`] = value;
      }
    });

    // Accessibility variables
    vars['--reduced-motion'] = reducedMotion ? 'reduce' : 'normal';
    vars['--high-contrast'] = highContrast ? '1' : '0';

    return vars;
  }, [currentColors, currentFontSize, currentSpacing, currentAnimations, currentBorderRadius, currentBoxShadow, reducedMotion, highContrast]);

  // Theme switching functions
  const setThemeMode = useCallback((newTheme) => {
    setTheme(newTheme);
  }, [setTheme]);

  const toggleTheme = useCallback(() => {
    if (theme === THEMES.LIGHT) {
      setTheme(THEMES.DARK);
    } else if (theme === THEMES.DARK) {
      setTheme(THEMES.LIGHT);
    } else {
      setTheme(systemTheme === 'light' ? THEMES.DARK : THEMES.LIGHT);
    }
  }, [theme, systemTheme, setTheme]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, [setDarkMode]);

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion(prev => !prev);
  }, [setReducedMotion]);

  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => !prev);
  }, [setHighContrast]);

  // Font size functions
  const increaseFontSize = useCallback(() => {
    const sizes = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1]);
    }
  }, [fontSize, setFontSize]);

  const decreaseFontSize = useCallback(() => {
    const sizes = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1]);
    }
  }, [fontSize, setFontSize]);

  // Spacing functions
  const setSpacingMode = useCallback((mode) => {
    setSpacing(mode);
  }, [setSpacing]);

  // Animation functions
  const setAnimationSpeed = useCallback((speed) => {
    setAnimations(speed);
  }, [setAnimations]);

  // Border radius functions
  const setBorderRadiusMode = useCallback((mode) => {
    setBorderRadius(mode);
  }, [setBorderRadius]);

  // Box shadow functions
  const setBoxShadowMode = useCallback((mode) => {
    setBoxShadow(mode);
  }, [setBoxShadow]);

  // Custom theme functions
  const updateCustomColor = useCallback((colorKey, value) => {
    setCustomTheme(prev => ({
      ...prev,
      [colorKey]: value,
    }));
  }, [setCustomTheme]);

  const resetCustomTheme = useCallback(() => {
    setCustomTheme({});
  }, [setCustomTheme]);

  // Reset all to defaults
  const resetToDefaults = useCallback(() => {
    setTheme(THEMES.SYSTEM);
    setFontSize('medium');
    setSpacing('comfortable');
    setAnimations('normal');
    setBorderRadius('medium');
    setBoxShadow('medium');
    setReducedMotion(false);
    setHighContrast(false);
    setCustomTheme({});
  }, [setTheme, setFontSize, setSpacing, setAnimations, setBorderRadius, setBoxShadow, setReducedMotion, setHighContrast, setCustomTheme]);

  // Apply reduced motion to DOM
  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [reducedMotion]);

  // Apply high contrast to DOM
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Apply dark mode class
  useEffect(() => {
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [effectiveTheme]);
  // Utility functions
  const getThemeColor = useCallback((colorName, opacity = 1) => {
    const color = currentColors[colorName] || currentColors.primary;
    if (opacity === 1) return color;
    
    // Convert hex to rgba
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    return color;
  }, [currentColors]);

  const getSpacing = useCallback((size) => {
    return currentSpacing[size] || currentSpacing.md;
  }, [currentSpacing]);

  const getFontSize = useCallback((size) => {
    return currentFontSize[size] || currentFontSize.body;
  }, [currentFontSize]);

  const getRadius = useCallback((size) => {
    return currentBorderRadius[size] || currentBorderRadius.medium;
  }, [currentBorderRadius]);

  const getShadow = useCallback((size) => {
    return currentBoxShadow[size] || currentBoxShadow.medium;
  }, [currentBoxShadow]);

  const getAnimation = useCallback((type) => {
    return currentAnimations[type] || currentAnimations.normal;
  }, [currentAnimations]);

  // Theme class name for components
  const themeClassName = useMemo(() => {
    const classes = [];
    classes.push(`theme-${effectiveTheme}`);
    classes.push(`font-${fontSize}`);
    classes.push(`spacing-${spacing}`);
    classes.push(`animation-${animations}`);
    classes.push(`radius-${borderRadius}`);
    classes.push(`shadow-${boxShadow}`);
    if (reducedMotion) classes.push('reduce-motion');
    if (highContrast) classes.push('high-contrast');
    return classes.join(' ');
  }, [effectiveTheme, fontSize, spacing, animations, borderRadius, boxShadow, reducedMotion, highContrast]);

  // Check if dark mode is active
  const isDark = useMemo(() => {
    return effectiveTheme === 'dark' || effectiveTheme === THEMES.DARK;
  }, [effectiveTheme]);

  // Check if light mode is active
  const isLight = useMemo(() => {
    return effectiveTheme === 'light' || effectiveTheme === THEMES.LIGHT;
  }, [effectiveTheme]);

  // Check if system theme is active
  const isSystem = useMemo(() => {
    return theme === THEMES.SYSTEM;
  }, [theme]);

  // Check if custom theme is active
  const isCustom = useMemo(() => {
    return theme === THEMES.CUSTOM;
  }, [theme]);

  return {
    // Core theme
    theme,
    setTheme: setThemeMode,
    toggleTheme,
    effectiveTheme,
    systemTheme,
    
    // Theme modes
    isDark,
    isLight,
    isSystem,
    isCustom,
    
    // Dark mode
    darkMode,
    toggleDarkMode,
    
    // Accessibility
    reducedMotion,
    toggleReducedMotion,
    highContrast,
    toggleHighContrast,
    
    // Font size
    fontSize,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    currentFontSize,
    getFontSize,
    
    // Spacing
    spacing,
    setSpacing: setSpacingMode,
    currentSpacing,
    getSpacing,
    
    // Animations
    animations,
    setAnimationSpeed,
    currentAnimations,
    getAnimation,
    
    // Border radius
    borderRadius,
    setBorderRadius: setBorderRadiusMode,
    currentBorderRadius,
    getRadius,
    
    // Box shadow
    boxShadow,
    setBoxShadow: setBoxShadowMode,
    currentBoxShadow,
    getShadow,
    
    // Colors
    colors: currentColors,
    getThemeColor,
    
    // Custom theme
    customTheme,
    updateCustomColor,
    resetCustomTheme,
    
    // Utilities
    resetToDefaults,
    themeClassName,
    generateCSSVariables,
    
    // Constants
    THEMES,
    THEME_COLORS,
    FONT_SIZES,
    SPACING,
    ANIMATIONS,
    BORDER_RADIUS,
    BOX_SHADOWS,
  };
};

// Custom hook for specific theme features
export const useThemeColor = (colorName, opacity = 1) => {
  const { getThemeColor } = useTheme();
  return getThemeColor(colorName, opacity);
};

export const useThemeSpacing = (size) => {
  const { getSpacing } = useTheme();
  return getSpacing(size);
};

export const useThemeFontSize = (size) => {
  const { getFontSize } = useTheme();
  return getFontSize(size);
};

export const useThemeRadius = (size) => {
  const { getRadius } = useTheme();
  return getRadius(size);
};

export const useThemeShadow = (size) => {
  const { getShadow } = useTheme();
  return getShadow(size);
};

export const useThemeAnimation = (type) => {
  const { getAnimation } = useTheme();
  return getAnimation(type);
};

// CSS-in-JS helper
export const createThemeStyles = (styles) => {
  return (props) => {
    const theme = useTheme();
    return typeof styles === 'function' ? styles(theme, props) : styles;
  };
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const theme = useTheme();
  
  return (
    <ThemeContext.Provider value={theme}>
      <div className={theme.themeClassName}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Theme context
const ThemeContext = React.createContext(null);

// Theme consumer hook
export const useThemeConsumer = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeConsumer must be used within ThemeProvider');
  }
  return context;
};

// CSS variable injection helper
export const injectThemeVariables = (variables) => {
  const style = document.createElement('style');
  let css = ':root {\n';
  Object.entries(variables).forEach(([key, value]) => {
    css += `  ${key}: ${value};\n`;
  });
  css += '}';
  style.textContent = css;
  document.head.appendChild(style);
  return () => style.remove();
};

// Theme detection helper
export const detectSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Theme transition helper
export const withThemeTransition = (element, duration = '300ms') => {
  element.style.transition = `all ${duration} ease-in-out`;
  return () => {
    element.style.transition = '';
  };
};

// Export all constants
export {
  THEMES as THEME_NAMES,
  THEME_COLORS as COLORS,
  FONT_SIZES as FONT_SIZE_PRESETS,
  SPACING as SPACING_PRESETS,
  ANIMATIONS as ANIMATION_PRESETS,
  BORDER_RADIUS as RADIUS_PRESETS,
  BOX_SHADOWS as SHADOW_PRESETS,
};

export default useTheme;
