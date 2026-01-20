import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../state/settings';
import Icon from '../Icon';

interface Props {
  onHome: () => void;
  onBack: () => void;
  onForward: () => void;
  onSearch: () => void;
  onSettings: () => void;
  order?: Array<'home' | 'back' | 'forward' | 'search' | 'settings'>;
  tooltips?: boolean;
  fabSize?: 's' | 'm' | 'l';
}

// Size map with spacing tokens (px)
const sizeMap: Record<'s' | 'm' | 'l', { button: number; gap: number; padding: number }> = {
  s: { button: 44, gap: 6, padding: 8 },     // Increased from 40→44 for a11y (min-size: 44x44)
  m: { button: 48, gap: 8, padding: 12 },    // Spacing tokens: gap=2*4px, padding=3*4px
  l: { button: 56, gap: 10, padding: 16 }    // Spacing tokens: gap=2.5*4px, padding=4*4px
};

const ActionPanel = ({ onHome, onBack, onForward, onSearch, onSettings, order, tooltips = true, fabSize = 'm' }: Props) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const sizeConfig = sizeMap[fabSize];
  const iconSet = settings?.ui?.iconSet ?? 'lucide';
  const [pressedButton, setPressedButton] = useState<number | null>(null);

  const buttonsMap: Record<string, { iconName: 'home' | 'back' | 'forward' | 'search' | 'settings'; label: string; action: () => void }> = {
    home: { iconName: 'home', label: t('overlay.actions.home'), action: onHome },
    back: { iconName: 'back', label: t('overlay.actions.back'), action: onBack },
    forward: { iconName: 'forward', label: t('overlay.actions.forward'), action: onForward },
    search: { iconName: 'search', label: t('overlay.actions.search'), action: onSearch },
    settings: { iconName: 'settings', label: t('overlay.actions.settings'), action: onSettings }
  };

  const orderApplied = order && order.length === 5 ? order : ['home', 'back', 'forward', 'search', 'settings'];
  const buttons = orderApplied.map((key) => buttonsMap[key]);

  return (
    <div 
      className="pointer-events-auto flex flex-col rounded-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4"
      style={{
        background: 'var(--yt-surface-2)',
        borderColor: 'var(--yt-border)',
        boxShadow: 'var(--yt-shadow)',
        padding: `${sizeConfig.padding}px`,
        gap: `${sizeConfig.gap}px`,
        transitionDuration: 'var(--ui-duration-slow)',
        transitionTimingFunction: 'var(--ui-easing-smooth)',
      }}
    >
      {buttons.map((btn, idx) => {
        const iconSize = Math.round(sizeConfig.button * 0.42);
        const isPressed = pressedButton === idx;
        
        return (
          <button
            key={idx}
            type="button"
            onClick={btn.action}
            onMouseDown={() => setPressedButton(idx)}
            onMouseUp={() => setPressedButton(null)}
            onMouseLeave={(e) => {
              setPressedButton(null);
              e.currentTarget.style.background = 'var(--yt-surface-3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            className="group flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--yt-accent)]"
            style={{
              width: `${sizeConfig.button}px`,
              height: `${sizeConfig.button}px`,
              borderRadius: 'var(--ui-radius-panel)',
              background: 'var(--yt-surface-3)',
              color: 'var(--yt-text)',
              border: '1px solid transparent',
              transform: isPressed ? 'scale(0.96)' : 'scale(1)',
              transition: `all var(--ui-duration-fast) var(--ui-easing-smooth)`,
              cursor: 'pointer',
              minWidth: '44px',
              minHeight: '44px',
            }}
            aria-label={btn.label}
            title={tooltips ? btn.label : undefined}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--yt-hover)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
            }}
          >
            <Icon
              name={btn.iconName}
              set={iconSet}
              size={iconSize}
            />
          </button>
        );
      })}
    </div>
  );
};

export default ActionPanel;
