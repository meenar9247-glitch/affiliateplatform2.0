// ==================== Theme Constants ====================

export const THEME_NAMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
  DIM: 'dim',
  CONTRAST: 'high-contrast',
  CUSTOM: 'custom',
};

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const COLOR_SCHEMES = {
  DEFAULT: 'default',
  BLUE: 'blue',
  GREEN: 'green',
  PURPLE: 'purple',
  ORANGE: 'orange',
  RED: 'red',
  TEAL: 'teal',
  INDIGO: 'indigo',
};

export const FONT_FAMILIES = {
  SANS: 'sans-serif',
  SERIF: 'serif',
  MONO: 'monospace',
  SYSTEM: 'system-ui',
  INTER: 'Inter, sans-serif',
  ROBOTO: 'Roboto, sans-serif',
  OPEN_SANS: 'Open Sans, sans-serif',
  POPPINS: 'Poppins, sans-serif',
  MONTSERRAT: 'Montserrat, sans-serif',
  LATO: 'Lato, sans-serif',
  SOURCE_SANS: 'Source Sans Pro, sans-serif',
  RALEWAY: 'Raleway, sans-serif',
  OSWALD: 'Oswald, sans-serif',
  MERRIWEATHER: 'Merriweather, serif',
  PLAYFAIR: 'Playfair Display, serif',
  SOURCE_CODE: 'Source Code Pro, monospace',
};

export const FONT_SIZES = {
  XS: '0.75rem',    // 12px
  SM: '0.875rem',   // 14px
  BASE: '1rem',      // 16px
  LG: '1.125rem',    // 18px
  XL: '1.25rem',     // 20px
  '2XL': '1.5rem',   // 24px
  '3XL': '1.875rem', // 30px
  '4XL': '2.25rem',  // 36px
  '5XL': '3rem',     // 48px
  '6XL': '3.75rem',  // 60px
  '7XL': '4.5rem',   // 72px
  '8XL': '6rem',     // 96px
  '9XL': '8rem',      // 128px
};

export const FONT_WEIGHTS = {
  THIN: 100,
  EXTRA_LIGHT: 200,
  LIGHT: 300,
  NORMAL: 400,
  MEDIUM: 500,
  SEMI_BOLD: 600,
  BOLD: 700,
  EXTRA_BOLD: 800,
  BLACK: 900,
};

export const LINE_HEIGHTS = {
  NONE: 1,
  TIGHT: 1.25,
  SNUG: 1.375,
  NORMAL: 1.5,
  RELAXED: 1.625,
  LOOSE: 2,
};

export const LETTER_SPACINGS = {
  TIGHTER: '-0.05em',
  TIGHT: '-0.025em',
  NORMAL: '0',
  WIDE: '0.025em',
  WIDER: '0.05em',
  WIDEST: '0.1em',
};

export const SPACING = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',      // 384px
};

export const BORDER_RADIUS = {
  NONE: '0',
  SM: '0.125rem',  // 2px
  BASE: '0.25rem', // 4px
  MD: '0.375rem',  // 6px
  LG: '0.5rem',    // 8px
  XL: '0.75rem',   // 12px
  '2XL': '1rem',   // 16px
  '3XL': '1.5rem', // 24px
  FULL: '9999px',
};

export const BORDER_WIDTHS = {
  0: '0',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px',
};

export const OPACITY = {
  0: '0',
  5: '0.05',
  10: '0.1',
  20: '0.2',
  25: '0.25',
  30: '0.3',
  40: '0.4',
  50: '0.5',
  60: '0.6',
  70: '0.7',
  75: '0.75',
  80: '0.8',
  90: '0.9',
  95: '0.95',
  100: '1',
};

export const Z_INDEX = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  AUTO: 'auto',
  MODAL: 1000,
  OVERLAY: 2000,
  DROPDOWN: 3000,
  TOOLTIP: 4000,
  TOAST: 5000,
};

export const TRANSITIONS = {
  NONE: 'none',
  FAST: '150ms',
  BASE: '300ms',
  SLOW: '500ms',
  SLOWER: '700ms',
  SLOWEST: '1000ms',
};

export const EASINGS = {
  LINEAR: 'linear',
  IN: 'cubic-bezier(0.4, 0, 1, 1)',
  OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// ==================== Light Theme Colors ====================

export const LIGHT_THEME = {
  // Brand colors
  primary: '#667eea',
  primaryLight: '#8a9ef0',
  primaryDark: '#4c63b6',
  secondary: '#764ba2',
  secondaryLight: '#9a6fc9',
  secondaryDark: '#5a3a7a',
  
  // Status colors
  success: '#28a745',
  successLight: '#48c768',
  successDark: '#1e7e34',
  warning: '#ffc107',
  warningLight: '#ffd34d',
  warningDark: '#d39e00',
  error: '#dc3545',
  errorLight: '#e4606d',
  errorDark: '#bd2130',
  info: '#17a2b8',
  infoLight: '#3ab7cc',
  infoDark: '#117a8b',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Background colors
  background: '#ffffff',
  backgroundAlt: '#f9fafb',
  backgroundHover: '#f3f4f6',
  backgroundActive: '#e5e7eb',
  
  // Text colors
  text: '#111827',
  textLight: '#6b7280',
  textLighter: '#9ca3af',
  textDark: '#000000',
  textInverse: '#ffffff',
  
  // Border colors
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  borderDark: '#d1d5db',
  borderFocus: '#667eea',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  
  // Chart colors
  chart1: '#667eea',
  chart2: '#764ba2',
  chart3: '#28a745',
  chart4: '#ffc107',
  chart5: '#dc3545',
  chart6: '#17a2b8',
  chart7: '#ff6b6b',
  chart8: '#4ecdc4',
};
// ==================== Dark Theme Colors ====================

export const DARK_THEME = {
  // Brand colors
  primary: '#667eea',
  primaryLight: '#8a9ef0',
  primaryDark: '#4c63b6',
  secondary: '#764ba2',
  secondaryLight: '#9a6fc9',
  secondaryDark: '#5a3a7a',
  
  // Status colors
  success: '#28a745',
  successLight: '#48c768',
  successDark: '#1e7e34',
  warning: '#ffc107',
  warningLight: '#ffd34d',
  warningDark: '#d39e00',
  error: '#dc3545',
  errorLight: '#e4606d',
  errorDark: '#bd2130',
  info: '#17a2b8',
  infoLight: '#3ab7cc',
  infoDark: '#117a8b',
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray50: '#1a1a2e',
  gray100: '#16213e',
  gray200: '#1f2937',
  gray300: '#374151',
  gray400: '#4b5563',
  gray500: '#6b7280',
  gray600: '#9ca3af',
  gray700: '#d1d5db',
  gray800: '#e5e7eb',
  gray900: '#f3f4f6',
  
  // Background colors
  background: '#1a1a2e',
  backgroundAlt: '#16213e',
  backgroundHover: '#1f2937',
  backgroundActive: '#374151',
  
  // Text colors
  text: '#f3f4f6',
  textLight: '#9ca3af',
  textLighter: '#6b7280',
  textDark: '#ffffff',
  textInverse: '#111827',
  
  // Border colors
  border: '#374151',
  borderLight: '#1f2937',
  borderDark: '#4b5563',
  borderFocus: '#667eea',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowLight: 'rgba(0, 0, 0, 0.2)',
  shadowDark: 'rgba(0, 0, 0, 0.4)',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.9)',
  
  // Chart colors
  chart1: '#667eea',
  chart2: '#764ba2',
  chart3: '#28a745',
  chart4: '#ffc107',
  chart5: '#dc3545',
  chart6: '#17a2b8',
  chart7: '#ff6b6b',
  chart8: '#4ecdc4',
};

// ==================== Dim Theme Colors ====================

export const DIM_THEME = {
  // Brand colors (same as dark)
  primary: '#667eea',
  primaryLight: '#8a9ef0',
  primaryDark: '#4c63b6',
  secondary: '#764ba2',
  secondaryLight: '#9a6fc9',
  secondaryDark: '#5a3a7a',
  
  // Status colors
  success: '#28a745',
  successLight: '#48c768',
  successDark: '#1e7e34',
  warning: '#ffc107',
  warningLight: '#ffd34d',
  warningDark: '#d39e00',
  error: '#dc3545',
  errorLight: '#e4606d',
  errorDark: '#bd2130',
  info: '#17a2b8',
  infoLight: '#3ab7cc',
  infoDark: '#117a8b',
  
  // Neutral colors (dimmer than dark)
  gray50: '#2d3748',
  gray100: '#1a202c',
  gray200: '#2d3748',
  gray300: '#4a5568',
  gray400: '#718096',
  gray500: '#a0aec0',
  gray600: '#cbd5e0',
  gray700: '#e2e8f0',
  gray800: '#f7fafc',
  gray900: '#ffffff',
  
  // Background colors (dim)
  background: '#2d3748',
  backgroundAlt: '#1a202c',
  backgroundHover: '#4a5568',
  backgroundActive: '#718096',
  
  // Text colors
  text: '#f7fafc',
  textLight: '#cbd5e0',
  textLighter: '#a0aec0',
  textDark: '#ffffff',
  textInverse: '#1a202c',
  
  // Border colors
  border: '#4a5568',
  borderLight: '#2d3748',
  borderDark: '#718096',
  borderFocus: '#667eea',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowLight: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.6)',
  overlayDark: 'rgba(0, 0, 0, 0.9)',
  
  // Chart colors
  chart1: '#667eea',
  chart2: '#764ba2',
  chart3: '#28a745',
  chart4: '#ffc107',
  chart5: '#dc3545',
  chart6: '#17a2b8',
  chart7: '#ff6b6b',
  chart8: '#4ecdc4',
};

// ==================== High Contrast Theme Colors ====================

export const CONTRAST_THEME = {
  // Brand colors (high contrast)
  primary: '#0000ff',
  primaryLight: '#4444ff',
  primaryDark: '#0000cc',
  secondary: '#800080',
  secondaryLight: '#9932cc',
  secondaryDark: '#660066',
  
  // Status colors (high contrast)
  success: '#008000',
  successLight: '#00a000',
  successDark: '#006000',
  warning: '#ffff00',
  warningLight: '#ffff33',
  warningDark: '#cccc00',
  error: '#ff0000',
  errorLight: '#ff3333',
  errorDark: '#cc0000',
  info: '#00ffff',
  infoLight: '#33ffff',
  infoDark: '#00cccc',
  
  // Neutral colors (high contrast)
  white: '#ffffff',
  black: '#000000',
  gray50: '#f0f0f0',
  gray100: '#e0e0e0',
  gray200: '#c0c0c0',
  gray300: '#a0a0a0',
  gray400: '#808080',
  gray500: '#606060',
  gray600: '#404040',
  gray700: '#202020',
  gray800: '#101010',
  gray900: '#000000',
  
  // Background colors
  background: '#ffffff',
  backgroundAlt: '#f0f0f0',
  backgroundHover: '#e0e0e0',
  backgroundActive: '#c0c0c0',
  
  // Text colors
  text: '#000000',
  textLight: '#404040',
  textLighter: '#606060',
  textDark: '#000000',
  textInverse: '#ffffff',
  
  // Border colors
  border: '#000000',
  borderLight: '#404040',
  borderDark: '#000000',
  borderFocus: '#0000ff',
  
  // Shadow colors (none for high contrast)
  shadow: 'none',
  shadowLight: 'none',
  shadowDark: 'none',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.9)',
  
  // Chart colors (high contrast)
  chart1: '#0000ff',
  chart2: '#800080',
  chart3: '#008000',
  chart4: '#ffff00',
  chart5: '#ff0000',
  chart6: '#00ffff',
  chart7: '#ff00ff',
  chart8: '#00ff00',
};

// ==================== Theme Color Schemes ====================

export const COLOR_SCHEME_VARIANTS = {
  [COLOR_SCHEMES.DEFAULT]: {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8',
  },
  [COLOR_SCHEMES.BLUE]: {
    primary: '#4299e1',
    secondary: '#3182ce',
    success: '#38a169',
    warning: '#ecc94b',
    error: '#f56565',
    info: '#4299e1',
  },
  [COLOR_SCHEMES.GREEN]: {
    primary: '#48bb78',
    secondary: '#38a169',
    success: '#48bb78',
    warning: '#ecc94b',
    error: '#f56565',
    info: '#4299e1',
  },
  [COLOR_SCHEMES.PURPLE]: {
    primary: '#9f7aea',
    secondary: '#805ad5',
    success: '#48bb78',
    warning: '#ecc94b',
    error: '#f56565',
    info: '#4299e1',
  },
  [COLOR_SCHEMES.ORANGE]: {
    primary: '#ed8936',
    secondary: '#dd6b20',
    success: '#48bb78',
    warning: '#ecc94b',
    error: '#f56565',
    info: '#4299e1',
  },
  [COLOR_SCHEMES.RED]: {
    primary: '#f56565',
    secondary: '#e53e3e',
    success: '#48bb78',
    warning: '#ecc94b',
    error: '#f56565',
    info: '#4299e1',
  },
  [COLOR_SCHEMES.TEAL]: {
    primary: '#4fd1c5',
    secondary: '#38b2ac',
    success: '#48bb78',
    warning: '#ecc94b',
    error: '#f56565',
    info: '#4299e1',
  },
  [COLOR_SCHEMES.INDIGO]: {
    primary: '#667eea',
    secondary: '#5a67d8',
    success: '#48bb78',
    warning: '#ecc94b',
    error: '#f56565',
    info: '#4299e1',
  },
};

// ==================== Component Styles ====================

export const COMPONENT_STYLES = {
  // Button styles
  button: {
    primary: {
      background: LIGHT_THEME.primary,
      color: LIGHT_THEME.white,
      hoverBackground: LIGHT_THEME.primaryDark,
      activeBackground: LIGHT_THEME.primaryDarker,
      border: 'none',
      borderRadius: BORDER_RADIUS.MD,
      padding: `${SPACING[2]} ${SPACING[4]}`,
      fontSize: FONT_SIZES.BASE,
      fontWeight: FONT_WEIGHTS.MEDIUM,
    },
    secondary: {
      background: LIGHT_THEME.white,
      color: LIGHT_THEME.primary,
      hoverBackground: LIGHT_THEME.gray100,
      activeBackground: LIGHT_THEME.gray200,
      border: `1px solid ${LIGHT_THEME.border}`,
      borderRadius: BORDER_RADIUS.MD,
      padding: `${SPACING[2]} ${SPACING[4]}`,
      fontSize: FONT_SIZES.BASE,
      fontWeight: FONT_WEIGHTS.MEDIUM,
    },
    danger: {
      background: LIGHT_THEME.error,
      color: LIGHT_THEME.white,
      hoverBackground: LIGHT_THEME.errorDark,
      activeBackground: LIGHT_THEME.errorDarker,
      border: 'none',
      borderRadius: BORDER_RADIUS.MD,
      padding: `${SPACING[2]} ${SPACING[4]}`,
      fontSize: FONT_SIZES.BASE,
      fontWeight: FONT_WEIGHTS.MEDIUM,
    },
  },

  // Input styles
  input: {
    default: {
      background: LIGHT_THEME.white,
      color: LIGHT_THEME.text,
      border: `1px solid ${LIGHT_THEME.border}`,
      borderRadius: BORDER_RADIUS.MD,
      padding: `${SPACING[2]} ${SPACING[3]}`,
      fontSize: FONT_SIZES.BASE,
      focusBorder: LIGHT_THEME.primary,
      focusShadow: `0 0 0 3px ${LIGHT_THEME.primary}20`,
      errorBorder: LIGHT_THEME.error,
      errorFocusShadow: `0 0 0 3px ${LIGHT_THEME.error}20`,
      disabledBackground: LIGHT_THEME.gray100,
      disabledColor: LIGHT_THEME.gray400,
    },
  },

  // Card styles
  card: {
    default: {
      background: LIGHT_THEME.white,
      border: `1px solid ${LIGHT_THEME.border}`,
      borderRadius: BORDER_RADIUS.LG,
      padding: SPACING[6],
      shadow: `0 4px 6px ${LIGHT_THEME.shadow}`,
      hoverShadow: `0 10px 15px ${LIGHT_THEME.shadowDark}`,
    },
  },

  // Modal styles
  modal: {
    overlay: {
      background: LIGHT_THEME.overlay,
      zIndex: Z_INDEX.MODAL,
    },
    content: {
      background: LIGHT_THEME.white,
      borderRadius: BORDER_RADIUS.LG,
      padding: SPACING[6],
      maxWidth: '500px',
      maxHeight: '90vh',
      shadow: `0 20px 25px ${LIGHT_THEME.shadowDark}`,
    },
  },

  // Dropdown styles
  dropdown: {
    menu: {
      background: LIGHT_THEME.white,
      border: `1px solid ${LIGHT_THEME.border}`,
      borderRadius: BORDER_RADIUS.MD,
      padding: `${SPACING[1]} 0`,
      shadow: `0 10px 15px ${LIGHT_THEME.shadow}`,
      zIndex: Z_INDEX.DROPDOWN,
    },
    item: {
      padding: `${SPACING[2]} ${SPACING[4]}`,
      hoverBackground: LIGHT_THEME.gray100,
      activeBackground: LIGHT_THEME.gray200,
      color: LIGHT_THEME.text,
      fontSize: FONT_SIZES.BASE,
    },
  },

  // Tooltip styles
  tooltip: {
    background: LIGHT_THEME.gray800,
    color: LIGHT_THEME.white,
    fontSize: FONT_SIZES.SM,
    padding: `${SPACING[1]} ${SPACING[2]}`,
    borderRadius: BORDER_RADIUS.SM,
    zIndex: Z_INDEX.TOOLTIP,
  },

  // Toast styles
  toast: {
    success: {
      background: LIGHT_THEME.success,
      color: LIGHT_THEME.white,
      borderRadius: BORDER_RADIUS.MD,
      padding: SPACING[3],
      zIndex: Z_INDEX.TOAST,
    },
    error: {
      background: LIGHT_THEME.error,
      color: LIGHT_THEME.white,
      borderRadius: BORDER_RADIUS.MD,
      padding: SPACING[3],
      zIndex: Z_INDEX.TOAST,
    },
    warning: {
      background: LIGHT_THEME.warning,
      color: LIGHT_THEME.text,
      borderRadius: BORDER_RADIUS.MD,
      padding: SPACING[3],
      zIndex: Z_INDEX.TOAST,
    },
    info: {
      background: LIGHT_THEME.info,
      color: LIGHT_THEME.white,
      borderRadius: BORDER_RADIUS.MD,
      padding: SPACING[3],
      zIndex: Z_INDEX.TOAST,
    },
  },
};
// ==================== Theme Configurations ====================

export const THEMES = {
  [THEME_NAMES.LIGHT]: LIGHT_THEME,
  [THEME_NAMES.DARK]: DARK_THEME,
  [THEME_NAMES.DIM]: DIM_THEME,
  [THEME_NAMES.CONTRAST]: CONTRAST_THEME,
};

// ==================== Typography Configuration ====================

export const TYPOGRAPHY = {
  fontFamily: {
    sans: FONT_FAMILIES.INTER,
    serif: FONT_FAMILIES.MERRIWEATHER,
    mono: FONT_FAMILIES.SOURCE_CODE,
    system: FONT_FAMILIES.SYSTEM,
  },
  fontSize: FONT_SIZES,
  fontWeight: FONT_WEIGHTS,
  lineHeight: LINE_HEIGHTS,
  letterSpacing: LETTER_SPACINGS,
};

// ==================== Spacing Configuration ====================

export const SPACING_CONFIG = {
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  borderWidth: BORDER_WIDTHS,
};

// ==================== Effects Configuration ====================

export const EFFECTS = {
  opacity: OPACITY,
  zIndex: Z_INDEX,
  transitions: TRANSITIONS,
  easings: EASINGS,
};

// ==================== Breakpoints Configuration ====================

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const MEDIA_QUERIES = {
  sm: `@media (min-width: ${BREAKPOINTS.sm}px)`,
  md: `@media (min-width: ${BREAKPOINTS.md}px)`,
  lg: `@media (min-width: ${BREAKPOINTS.lg}px)`,
  xl: `@media (min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `@media (min-width: ${BREAKPOINTS['2xl']}px)`,
  dark: '@media (prefers-color-scheme: dark)',
  light: '@media (prefers-color-scheme: light)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  highContrast: '@media (prefers-contrast: high)',
};

// ==================== Theme Context ====================

export const createThemeContext = (themeName = THEME_NAMES.LIGHT, colorScheme = COLOR_SCHEMES.DEFAULT) => {
  const baseTheme = THEMES[themeName] || LIGHT_THEME;
  const schemeColors = COLOR_SCHEME_VARIANTS[colorScheme] || COLOR_SCHEME_VARIANTS[COLOR_SCHEMES.DEFAULT];
  
  return {
    name: themeName,
    colorScheme,
    colors: {
      ...baseTheme,
      ...schemeColors,
    },
    typography: TYPOGRAPHY,
    spacing: SPACING_CONFIG,
    effects: EFFECTS,
    breakpoints: BREAKPOINTS,
    mediaQueries: MEDIA_QUERIES,
    components: COMPONENT_STYLES,
  };
};

// ==================== CSS Variables Generator ====================

export const generateCSSVariables = (theme) => {
  const variables = {};
  
  // Color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      variables[`--color-${key}`] = value;
    }
  });
  
  // Typography variables
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    variables[`--font-size-${key}`] = value;
  });
  
  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    variables[`--font-weight-${key}`] = value;
  });
  
  Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
    variables[`--line-height-${key}`] = value;
  });
  
  // Spacing variables
  Object.entries(theme.spacing.spacing).forEach(([key, value]) => {
    variables[`--spacing-${key}`] = value;
  });
  
  Object.entries(theme.spacing.borderRadius).forEach(([key, value]) => {
    variables[`--radius-${key}`] = value;
  });
  
  // Effect variables
  Object.entries(theme.effects.opacity).forEach(([key, value]) => {
    variables[`--opacity-${key}`] = value;
  });
  
  variables['--transition-fast'] = theme.effects.transitions.FAST;
  variables['--transition-base'] = theme.effects.transitions.BASE;
  variables['--transition-slow'] = theme.effects.transitions.SLOW;
  
  return variables;
};

// ==================== Theme Helpers ====================

export const themeHelpers = {
  // Get current theme
  getTheme: (themeName = THEME_NAMES.LIGHT) => THEMES[themeName] || LIGHT_THEME,
  
  // Get color scheme
  getColorScheme: (scheme = COLOR_SCHEMES.DEFAULT) => COLOR_SCHEME_VARIANTS[scheme] || COLOR_SCHEME_VARIANTS[COLOR_SCHEMES.DEFAULT],
  
  // Get component style
  getComponentStyle: (component, variant = 'default', theme = LIGHT_THEME) => {
    return COMPONENT_STYLES[component]?.[variant] || COMPONENT_STYLES[component]?.default || {};
  },
  
  // Apply dark mode
  applyDarkMode: (theme) => {
    return { ...theme, ...DARK_THEME };
  },
  
  // Apply color scheme
  applyColorScheme: (theme, scheme) => {
    const schemeColors = COLOR_SCHEME_VARIANTS[scheme] || COLOR_SCHEME_VARIANTS[COLOR_SCHEMES.DEFAULT];
    return { ...theme, ...schemeColors };
  },
  
  // Generate media query
  media: (breakpoint) => MEDIA_QUERIES[breakpoint] || MEDIA_QUERIES.md,
  
  // Check if dark mode
  isDarkMode: (themeName) => themeName === THEME_NAMES.DARK || themeName === THEME_NAMES.DIM,
  
  // Check if high contrast
  isHighContrast: (themeName) => themeName === THEME_NAMES.CONTRAST,
  
  // Get contrast color
  getContrastColor: (backgroundColor) => {
    // Simple contrast calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  },
  
  // Get theme from system preference
  getSystemTheme: () => {
    if (typeof window === 'undefined') return THEME_NAMES.LIGHT;
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? THEME_NAMES.DARK 
      : THEME_NAMES.LIGHT;
  },
};

// ==================== Default Theme ====================

export const defaultTheme = createThemeContext(THEME_NAMES.LIGHT, COLOR_SCHEMES.DEFAULT);

// ==================== Export all ====================

export const themeConfig = {
  // Theme names
  THEME_NAMES,
  THEME_MODES,
  COLOR_SCHEMES,
  
  // Fonts
  FONT_FAMILIES,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  LETTER_SPACINGS,
  
  // Spacing
  SPACING,
  BORDER_RADIUS,
  BORDER_WIDTHS,
  
  // Effects
  OPACITY,
  Z_INDEX,
  TRANSITIONS,
  EASINGS,
  
  // Themes
  THEMES,
  LIGHT_THEME,
  DARK_THEME,
  DIM_THEME,
  CONTRAST_THEME,
  
  // Color schemes
  COLOR_SCHEME_VARIANTS,
  
  // Components
  COMPONENT_STYLES,
  
  // Typography
  TYPOGRAPHY,
  
  // Breakpoints
  BREAKPOINTS,
  MEDIA_QUERIES,
  
  // Helpers
  createThemeContext,
  generateCSSVariables,
  themeHelpers,
  defaultTheme,
};

export default themeConfig;
