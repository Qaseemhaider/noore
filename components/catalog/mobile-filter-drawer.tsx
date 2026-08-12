'use client';
import { useState } from 'react';
import { FilterPanel } from './filter-panel';

export function MobileFilterDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="lg:hidden mb-6">
            <button 
                onClick={() => setIsOpen(true)}
                className="type-navigation border border-[var(--color-line)] px-4 py-2"
                aria-haspopup="dialog"
            >
                Filters & Sort
            </button>
            {isOpen && (
                <div className="fixed inset-0 bg-[var(--canvas)] z-50 p-6 overflow-y-auto">
                    <div className="flex justify-between mb-8">
                        <h2 className="type-h2">Filters</h2>
                        <button onClick={() => setIsOpen(false)} className="type-navigation">Close</button>
                    </div>
                    <FilterPanel />
                </div>
            )}
        </div>
    );
}
