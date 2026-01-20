import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from '../icons/index.tsx';

interface Props {
  onClose: () => void;
  onSearch: (query: string) => void;
}

const SearchOverlay = ({ onClose, onSearch }: Props) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      onClose();
    }
  };

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2147483100] flex items-start justify-center pt-24" onClick={handleBackdropClick}>
      <div className="absolute inset-0" style={{ background: 'var(--overlay-backdrop)', backdropFilter: 'blur(6px)' }} />
      <div
        className="pointer-events-auto w-full max-w-2xl rounded-2xl border p-6 shadow-2xl animate-in slide-in-from-top-4 duration-200"
        style={{
          background: 'var(--yt-surface)',
          borderColor: 'var(--yt-border)',
          boxShadow: 'var(--yt-shadow)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'var(--yt-surface-2)', border: '2px solid var(--yt-border)' }}>
          <Search className="h-6 w-6 text-[var(--yt-text-secondary)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('overlay.search.placeholder')}
            className="flex-1 text-lg outline-none"
            style={{
              background: 'transparent',
              color: 'var(--yt-text)',
              caretColor: 'var(--yt-accent)'
            }}
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition-colors"
            style={{
              background: 'var(--yt-surface-3)',
              color: 'var(--yt-text-secondary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--yt-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--yt-surface-3)';
            }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </form>
        <p className="mt-4 text-sm" style={{ color: 'var(--yt-text-secondary)' }}>
          {t('overlay.search.hint')}
        </p>
      </div>
    </div>
  );
};

export default SearchOverlay;
