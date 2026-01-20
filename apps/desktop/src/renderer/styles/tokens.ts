/**
 * Design Tokens for Orion's Gate UI
 * YouTube-like, cross-platform consistent
 */

// ============================================================================
// LAYOUT & SPACING TOKENS
// ============================================================================
export const SPACING = {
  xs: 2,    // 2px
  sm: 4,    // 4px
  md: 8,    // 8px
  lg: 12,   // 12px
  xl: 16,   // 16px
  '2xl': 24, // 24px
} as const;

// ============================================================================
// FAB TOKENS
// ============================================================================
export const FAB = {
  sizes: {
    s: 52,   // small
    m: 60,   // medium (default)
    l: 68,   // large
  },
  radius: {
    circle: 9999,
    rounded: 16,
  },
  // Offset from safe area (respects notches, taskbars)
  offset: {
    x: SPACING.xl,    // 16px from right/left
    y: SPACING.xl,    // 16px from bottom
  },
  shadow: {
    default: '0 4px 16px rgba(0, 0, 0, 0.3)',
    hover: '0 8px 24px rgba(0, 0, 0, 0.4)',
    active: '0 2px 8px rgba(0, 0, 0, 0.25)',
  },
  icon: {
    s: 24,
    m: 28,
    l: 32,
  },
} as const;

// ============================================================================
// PANEL TOKENS (ActionPanel)
// ============================================================================
export const PANEL = {
  sizes: {
    s: {
      button: 40,
      gap: 6,     // 1.5 * 4px
      padding: 8, // 2 * 4px
    },
    m: {
      button: 48,
      gap: 8,     // 2 * 4px
      padding: 12, // 3 * 4px
    },
    l: {
      button: 56,
      gap: 10,    // 2.5 * 4px
      padding: 16, // 4 * 4px
    },
  },
  radius: 16,
  border: '1px solid',
} as const;

// ============================================================================
// BUTTON TOKENS
// ============================================================================
export const BUTTON = {
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  minSize: 40,           // Minimum 40x40 for accessibility
  focusRing: '2px solid', // Focus ring thickness
  focusRingOffset: 2,    // Offset between element and ring
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================
export const TYPOGRAPHY = {
  fontFamily: {
    base: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  fontSize: {
    xs: 12,
    sm: 13,
    base: 14,
    lg: 16,
    xl: 18,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// ANIMATION TOKENS
// ============================================================================
export const ANIMATION = {
  // Durations (ms)
  duration: {
    instant: 0,
    fast: 80,      // Press/release
    base: 150,     // Hover transitions
    slow: 200,     // Panel open/close
    slower: 300,   // Search overlay
  },
  // Easing functions (cubic-bezier)
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Custom YouTube-like easing
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
} as const;

// ============================================================================
// Z-INDEX STACKING CONTEXT
// ============================================================================
export const Z_INDEX = {
  // Grouped by layer
  content: 0,
  overlay: 2147483000,    // FAB, ActionPanel
  search: 2147483100,     // SearchOverlay (above FAB)
  settings: 2147483050,   // SettingsOverlay
  backdrop: 2147482999,   // Backdrops behind modals
} as const;

// ============================================================================
// INTERACTION STATES (Multipliers/Adjustments)
// ============================================================================
export const STATES = {
  hover: {
    opacity: 0.8,      // Slight opacity increase or decrease
    scale: 1.05,       // 5% scale up
    brightness: 1.08,  // +8% brightness (for light surfaces)
  },
  active: {
    scale: 0.98,       // 2% scale down
    duration: 80,      // Quick response
  },
  disabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  focus: {
    // YouTube-style focus ring
    ringColor: 'currentColor',
    ringWidth: 2,
    ringOffset: 2,
  },
} as const;

// ============================================================================
// SEARCH OVERLAY TOKENS
// ============================================================================
export const SEARCH = {
  maxWidth: 640,         // Max width for search box
  borderRadius: 12,
  inputPadding: {
    x: 16,
    y: 12,
  },
  backdropBlur: '6px',
  topOffset: 96,         // Distance from top (6rem = 96px)
} as const;

// ============================================================================
// COLOR PALETTE (YouTube-like, dynamic per theme)
// These are defaults; actual colors set via CSS variables
// ============================================================================
export const COLORS = {
  dark: {
    bg: '#0f0f0f',
    surface: '#181818',
    surface2: '#202020',
    surface3: '#272727',
    border: 'rgba(255, 255, 255, 0.08)',
    text: 'rgba(255, 255, 255, 0.9)',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    textDisabled: 'rgba(255, 255, 255, 0.4)',
    accent: '#3ea6ff',
    hover: 'rgba(255, 255, 255, 0.1)',
  },
  light: {
    bg: '#ffffff',
    surface: '#f9f9f9',
    surface2: '#f1f1f1',
    surface3: '#e9e9e9',
    border: 'rgba(0, 0, 0, 0.08)',
    text: 'rgba(0, 0, 0, 0.9)',
    textSecondary: 'rgba(0, 0, 0, 0.6)',
    textDisabled: 'rgba(0, 0, 0, 0.4)',
    accent: '#3ea6ff',
    hover: 'rgba(0, 0, 0, 0.08)',
  },
} as const;

// ============================================================================
// PLATFORM-SPECIFIC ADJUSTMENTS
// ============================================================================
export const PLATFORM = {
  // DPI scaling factors
  dpi: {
    100: 1,
    125: 1.25,
    150: 1.5,
    175: 1.75,
    200: 2,
  },
  // Safe area insets (for notches, taskbars)
  safeArea: {
    // These are set via CSS env() variables
    // insetTop: 'env(safe-area-inset-top, 0)',
    // insetRight: 'env(safe-area-inset-right, 0)',
    // insetBottom: 'env(safe-area-inset-bottom, 0)',
    // insetLeft: 'env(safe-area-inset-left, 0)',
  },
} as const;

export type Token = typeof SPACING | typeof FAB | typeof BUTTON | typeof ANIMATION;
