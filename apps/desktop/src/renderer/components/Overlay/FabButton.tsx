import clsx from 'clsx';
import { forwardRef, useState } from 'react';
import { useSettings } from '../../state/settings';
import Icon from '../Icon';

type Size = 's' | 'm' | 'l';
type Shape = 'circle' | 'rounded';

interface Props {
  active: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  size?: Size;
  shape?: Shape;
  opacity?: number;
  tooltips?: boolean;
  disabled?: boolean;
}

const sizeMap: Record<Size, number> = { s: 52, m: 60, l: 68 };
const iconSizeMap: Record<Size, number> = { s: 24, m: 28, l: 32 };

const FabButton = forwardRef<HTMLButtonElement, Props>(
  ({ active, onClick, onMouseEnter, size = 'm', shape = 'circle', opacity = 1, tooltips = true, disabled = false }, ref) => {
    const { settings } = useSettings();
    const [isPressed, setIsPressed] = useState(false);
    const dimension = sizeMap[size];
    const iconSize = iconSizeMap[size];
    const iconSet = settings?.ui?.iconSet ?? 'lucide';

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        disabled={disabled}
        className={clsx(
          'pointer-events-auto flex items-center justify-center',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--yt-accent)]',
          'transition-all',
          !disabled && 'hover:brightness-110'
        )}
        style={{
          width: dimension,
          height: dimension,
          borderRadius: shape === 'circle' ? '9999px' : '16px',
          background: active ? 'var(--yt-accent)' : 'var(--yt-surface-2)',
          color: active ? '#fff' : 'var(--yt-text)',
          border: `1px solid ${active ? 'transparent' : 'var(--yt-border)'}`,
          boxShadow: isPressed ? 'var(--ui-shadow-fab-active)' : (active ? 'var(--ui-shadow-fab-hover)' : 'var(--ui-shadow-fab)'),
          transform: isPressed ? 'scale(0.95)' : 'scale(1)',
          opacity: disabled ? 0.4 : opacity,
          transitionDuration: 'var(--ui-duration-base)',
          transitionTimingFunction: 'var(--ui-easing-smooth)',
          cursor: disabled ? 'not-allowed' : 'pointer',
        } as any}
        aria-label="Toggle quick panel"
        aria-disabled={disabled}
        title={tooltips ? 'Menu' : undefined}
      >
        <Icon
          name={active ? 'close' : 'menu'}
          set={iconSet}
          size={iconSize}
        />
      </button>
    );
  }
);

FabButton.displayName = 'FabButton';

export default FabButton;
