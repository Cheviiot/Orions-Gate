import { useEffect, useState } from 'react';

const DiagnosticsLayer = () => {
  const [fabInfo, setFabInfo] = useState<any>(null);

  useEffect(() => {
    const checkFab = () => {
      const fab = document.querySelector('button[aria-label="Toggle quick panel"]');
      if (!fab) {
        setFabInfo({ exists: false });
        return;
      }

      const rect = fab.getBoundingClientRect();
      const styles = getComputedStyle(fab);
      const elementAtPoint = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);

      setFabInfo({
        exists: true,
        position: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
        zIndex: styles.zIndex,
        pointerEvents: styles.pointerEvents,
        isTop: elementAtPoint === fab || fab.contains(elementAtPoint),
        topElement: elementAtPoint?.tagName.toLowerCase()
      });
    };

    checkFab();
    const interval = setInterval(checkFab, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!fabInfo) return null;

  return (
    <div className="pointer-events-none absolute left-4 top-4 z-[2147483200] space-y-2">
      <div 
        className="rounded-xl border p-4 font-mono text-xs shadow-xl backdrop-blur"
        style={{
          background: 'var(--yt-surface)',
          borderColor: 'var(--yt-border)',
          color: 'var(--yt-text)'
        }}
      >
        <div className="mb-2 text-sm font-semibold" style={{ color: 'var(--yt-accent)' }}>
          Diagnostics (Ctrl+Shift+D)
        </div>
        {fabInfo.exists ? (
          <>
            <div>FAB: {fabInfo.position.w}×{fabInfo.position.h} @ {fabInfo.position.x},{fabInfo.position.y}</div>
            <div>z-index: {fabInfo.zIndex}</div>
            <div>pointer-events: {fabInfo.pointerEvents}</div>
            <div className={fabInfo.isTop ? 'text-green-400' : 'text-red-400'}>
              Top element: {fabInfo.isTop ? 'FAB ✓' : `${fabInfo.topElement} ✗`}
            </div>
          </>
        ) : (
          <div className="text-red-400">FAB not found!</div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticsLayer;
