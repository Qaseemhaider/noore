'use client';
import { useEffect, useRef, useState } from 'react';
import { FilterPanel } from './filter-panel';

const CLOSE_DURATION = 240;

export function MobileFilterDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [closing, setClosing] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const renderedRef = useRef(false);

    useEffect(() => {
        if (isOpen) {
            renderedRef.current = true;
            setRendered(true);
            setClosing(false);
            document.body.style.overflow = 'hidden';
        } else if (renderedRef.current) {
            setClosing(true);
            const reduced =
                typeof window !== 'undefined' &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const duration = reduced ? 0 : CLOSE_DURATION;
            const t = setTimeout(() => {
                renderedRef.current = false;
                setRendered(false);
                setClosing(false);
                document.body.style.overflow = '';
                triggerRef.current?.focus();
            }, duration);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    useEffect(() => {
        if (rendered && !closing) {
            closeButtonRef.current?.focus();
        }
    }, [rendered, closing]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [setIsOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            return;
        }
        if (e.key !== 'Tab' || !panelRef.current) return;
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

    return (
        <div className="lg:hidden mb-[var(--space-6)]">
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(true)}
                className="type-navigation flex min-h-11 items-center border border-[var(--color-border)] px-4 transition-colors hover:border-[var(--color-crimson)]"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-controls="mobile-filter-drawer"
            >
                Filters & Sort
            </button>
            {rendered && (
                <div
                    className="fixed inset-0 z-[var(--z-drawer)] flex flex-col justify-end"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mobile-filter-drawer-title"
                    onKeyDown={handleKeyDown}
                >
                    <div
                        aria-hidden="true"
                        className={`absolute inset-0 bg-[var(--color-obsidian)]/40 transition-opacity duration-[var(--duration-base)] ${closing ? 'opacity-0' : 'opacity-100'}`}
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        ref={panelRef}
                        id="mobile-filter-drawer"
                        className={`relative w-full max-h-[85dvh] overflow-y-auto bg-[var(--color-warm-ivory)] p-[var(--space-6)] transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] ${closing ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'}`}
                    >
                        <div className="flex items-center justify-between mb-[var(--space-8)]">
                            <h2 id="mobile-filter-drawer-title" className="type-page-title">Filters</h2>
                            <button
                                ref={closeButtonRef}
                                onClick={() => setIsOpen(false)}
                                className="type-navigation flex min-h-11 items-center px-2 text-[var(--color-obsidian)] transition-colors hover:text-[var(--color-crimson)]"
                            >
                                Close
                            </button>
                        </div>
                        <FilterPanel />
                    </div>
                </div>
            )}
        </div>
    );
}
