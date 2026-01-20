import React from 'react';
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
  Menu,
  X,
  RefreshCw,
  type LucideIcon
} from 'lucide-react';

type IconSet = 'lucide' | 'material';
type IconName = 'home' | 'back' | 'forward' | 'search' | 'settings' | 'refresh' | 'menu' | 'close';

interface IconProps {
  name: IconName;
  set?: IconSet;
  size?: number;
  className?: string;
}

// Lucide icon map
const lucideIcons: Record<IconName, LucideIcon> = {
  home: Home,
  back: ChevronLeft,
  forward: ChevronRight,
  search: Search,
  settings: Settings,
  refresh: RefreshCw,
  menu: Menu,
  close: X
};

// Fallback Unicode symbols
const fallbackSymbols: Record<IconName, string> = {
  home: '⌂',
  back: '←',
  forward: '→',
  search: '⌕',
  settings: '⚙',
  refresh: '⟳',
  menu: '☰',
  close: '✕'
};

// Material Symbols (using Unicode codepoints)
// Material Symbols Rounded: rounded version of Material Icons
const materialSymbolsCodepoints: Record<IconName, string> = {
  home: '\uE88A',      // home
  back: '\uE5C4',      // arrow_back
  forward: '\uE5C8',   // arrow_forward
  search: '\uE8B6',    // search
  settings: '\uEA90',  // settings
  refresh: '\uE5D5',   // refresh
  menu: '\uE5D2',      // menu
  close: '\uE5CD'      // close
};

export const Icon: React.FC<IconProps> = ({
  name,
  set = 'lucide',
  size = 20,
  className = ''
}) => {
  try {
    if (set === 'lucide') {
      const LucideIcon = lucideIcons[name];
      if (LucideIcon) {
        return (
          <LucideIcon
            size={size}
            className={className}
            strokeWidth={2}
            aria-hidden="true"
          />
        );
      }
    } else if (set === 'material') {
      // Material Symbols Rounded via system font
      // Fallback to Unicode codepoint if font not available
      return (
        <span
          style={{
            fontFamily: '"Material Symbols Rounded"',
            fontSize: `${size}px`,
            fontWeight: 'normal',
            fontStyle: 'normal',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            width: size,
            height: size
          }}
          className={className}
          aria-hidden="true"
        >
          {materialSymbolsCodepoints[name]}
        </span>
      );
    }
  } catch (error) {
    console.error(`Failed to render icon: ${name} (${set})`, error);
  }

  // Fallback to Unicode symbol
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${size * 0.8}px`,
        width: size,
        height: size
      }}
      className={className}
      aria-hidden="true"
    >
      {fallbackSymbols[name]}
    </span>
  );
};

export default Icon;
