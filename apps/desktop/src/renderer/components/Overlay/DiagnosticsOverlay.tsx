import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HitInfo {
  tag: string;
  id?: string;
  classes?: string;
  zIndex?: string;
  bounds?: { x: number; y: number; w: number; h: number };
}

type Props = {
  active: boolean;
};

const DiagnosticsOverlay = ({ active }: Props) => {
  const [hit, setHit] = useState<HitInfo | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!active) {
      setHit(null);
      return;
    }

    const handler = (event: MouseEvent) => {
      const el = document.elementFromPoint(event.clientX, event.clientY);
      if (!el) {
        setHit(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      const styles = getComputedStyle(el);
      setHit({
        tag: el.tagName.toLowerCase(),
        id: el.id || undefined,
        classes: el.className?.toString() || undefined,
        zIndex: styles.zIndex && styles.zIndex !== 'auto' ? styles.zIndex : undefined,
        bounds: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) }
      });
    };

    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [active]);

  const highlightStyle = useMemo(() => {
    if (!hit?.bounds) return { display: 'none' } as const;
    const { x, y, w, h } = hit.bounds;
    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${w}px`,
      height: `${h}px`,
      display: 'block'
    } as const;
  }, [hit]);

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[2147483100]">
      <div
        className="absolute border-2 border-cyan-400/80 bg-cyan-500/10"
        style={highlightStyle}
      />
      <div className="absolute left-4 bottom-4 max-w-md rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-xs text-slate-100 shadow-xl backdrop-blur">
        <div className="font-semibold text-sm text-cyan-100">{t('overlay.diagnostics.title')}</div>
        {hit ? (
          <div className="space-y-1 mt-1">
            <div className="text-slate-200">{hit.tag}{hit.id ? `#${hit.id}` : ''}</div>
            {hit.classes && <div className="text-slate-400 truncate">.{hit.classes}</div>}
            {hit.zIndex && <div className="text-slate-300">{t('overlay.diagnostics.z', { value: hit.zIndex })}</div>}
            {hit.bounds && (
              <div className="text-slate-400">{t('overlay.diagnostics.size', { w: hit.bounds.w, h: hit.bounds.h, x: hit.bounds.x, y: hit.bounds.y })}</div>
            )}
          </div>
        ) : (
          <div className="text-slate-500">{t('overlay.diagnostics.hint')}</div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticsOverlay;
