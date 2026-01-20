import { useTranslation } from 'react-i18next';
import { useSettings } from '../../state/settings';
import Icon from '../Icon';

interface Props {
  onHome: () => void;
  onBack: () => void;
  onForward: () => void;
  onSearch: () => void;
  onSettings: () => void;
  onRefresh: () => void;
  order?: Array<'home' | 'back' | 'forward' | 'search' | 'settings' | 'refresh'>;
  tooltips?: boolean;
  fabSize?: 's' | 'm' | 'l';
}

const sizeMap: Record<'s' | 'm' | 'l', { button: number; gap: number; padding: number }> = {
  s: { button: 40, gap: 1.5, padding: 2 },
  m: { button: 48, gap: 2, padding: 3 },
  l: { button: 56, gap: 2.5, padding: 4 }
};

const ActionPanel = ({ onHome, onBack, onForward, onSearch, onSettings, onRefresh, order, tooltips = true, fabSize = 'm' }: Props) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const sizeConfig = sizeMap[fabSize];
  const iconSet = settings?.ui?.iconSet ?? 'lucide';

  const buttonsMap: Record<string, { iconName: 'home' | 'back' | 'forward' | 'search' | 'settings' | 'refresh'; label: string; action: () => void }> = {
    home: { iconName: 'home', label: t('overlay.actions.home'), action: onHome },
    back: { iconName: 'back', label: t('overlay.actions.back'), action: onBack },
    forward: { iconName: 'forward', label: t('overlay.actions.forward'), action: onForward },
    search: { iconName: 'search', label: t('overlay.actions.search'), action: onSearch },
    settings: { iconName: 'settings', label: t('overlay.actions.settings'), action: onSettings },
    refresh: { iconName: 'refresh', label: t('overlay.actions.refresh'), action: onRefresh }
  };

  const orderApplied = order && order.length === 6 ? order : ['home', 'back', 'forward', 'refresh', 'search', 'settings'];
  const buttons = orderApplied.map((key) => buttonsMap[key]);

  return (
    <div 
      className="pointer-events-auto flex flex-col gap-2 rounded-2xl border shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200"
      style={{
        background: 'var(--yt-surface-2)',
        borderColor: 'var(--yt-border)',
        boxShadow: 'var(--yt-shadow)',
        padding: `${sizeConfig.padding}px`,
        gap: `${sizeConfig.gap}px`
      }}
    >
      {buttons.map((btn, idx) => {
        const iconSize = Math.round(sizeConfig.button * 0.42);
        return (
          <button
            key={idx}
            type="button"
            onClick={btn.action}
            className="group flex items-center justify-center rounded-xl transition-all duration-150 hover:scale-105 active:scale-95"
            style={{
              width: `${sizeConfig.button}px`,
              height: `${sizeConfig.button}px`,
              background: 'var(--yt-surface-3)',
              color: 'var(--yt-text)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--yt-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--yt-surface-3)';
            }}
            aria-label={btn.label}
            title={tooltips ? btn.label : undefined}
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
