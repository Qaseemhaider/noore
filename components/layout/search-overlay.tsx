'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/lib/search-context';
import { CloseIcon, SearchIcon } from '@/components/icons';

export function SearchOverlay() {
  const { isOpen, setIsOpen } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-drawer)] flex items-start justify-center pt-20 bg-[var(--color-soft-cream)]/90 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl px-4" onClick={(e) => e.stopPropagation()}>
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
