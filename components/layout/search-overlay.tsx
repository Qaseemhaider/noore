'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/lib/search-context';
import { CloseIcon, SearchIcon } from '@/components/icons';

export function SearchOverlay() {
  const { isOpen, setIsOpen } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    if (isOpen) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';
      const id = requestAnimationFrame(() => setEntering(true));
      inputRef.current?.focus();
      return () => cancelAnimationFrame(id);
    }
    document.body.style.overflow = '';
    setEntering(false);
    restoreFocusRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [setIsOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusables = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[var(--z-drawer)] flex items-start justify-center pt-20 bg-[var(--color-soft-cream)]/90 backdrop-blur-sm transition-opacity duration-[var(--duration-base)] ${entering ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-dialog-title"
      onKeyDown={handleKeyDown}
    >
      <h2 id="search-dialog-title" className="sr-only">
        Search
      </h2>
      <div className={`relative w-full max-w-2xl px-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out)] ${entering ? 'translate-y-0' : '-translate-y-2'}`} onClick={(e) => e.stopPropagation()}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const q = formData.get('q');
            setIsOpen(false);
            router.push(`/search?q=${q}`);
          }}
          className="relative flex items-center h-[52px] border-b border-[var(--color-obsidian)] focus-within:border-[var(--color-crimson)] transition-colors"
        >
          <SearchIcon className="size-6 text-[var(--color-obsidian)] shrink-0" />
          <input
            ref={inputRef}
            name="q"
            type="text"
            placeholder="Search for products..."
            className="w-full h-full bg-transparent px-4 text-xl outline-none placeholder:text-[var(--color-obsidian)]/50 noore-search-focus"
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close search"
            className="p-2 hover:text-[var(--color-crimson)] shrink-0"
          >
            <CloseIcon />
          </button>
        </form>
      </div>
      <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
    </div>
  );
}
