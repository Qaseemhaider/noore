'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { searchProductsAction } from "@/lib/catalog/actions";
import type { Product } from "@/lib/catalog-data";
import { ProductGrid } from "@/components/catalog/product-grid";
import { SearchIcon } from "@/components/icons";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

type SearchStatus = 'idle' | 'loading' | 'ready' | 'error';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      setStatus('idle');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    const timer = setTimeout(() => {
      searchProductsAction(term)
        .then((products) => {
          if (cancelled) return;
          setResults(products);
          setStatus('ready');
        })
        .catch(() => {
          if (!cancelled) setStatus('error');
        });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${query}`);
  };

  return (
    <Container className="py-[var(--space-12)]">
      <form onSubmit={handleSearch} className="mb-[var(--space-8)] flex items-center border-b border-[var(--color-obsidian)] pb-2">
        <SearchIcon className="size-6 text-[var(--color-obsidian)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search for products..."
          autoFocus={false}
          aria-busy={status === 'loading'}
          className="w-full bg-transparent p-4 text-xl outline-none placeholder:text-[var(--color-obsidian)]/50 noore-search-focus"
        />
      </form>
      
      {!query ? (
        <h1 className="type-page-title mb-[var(--space-6)]">Search</h1>
      ) : (
        <h1 className="type-page-title mb-[var(--space-6)]">Search Results for &quot;{query}&quot;</h1>
      )}
      
      {status === 'error' ? (
        <div className="text-center py-[var(--space-12)]">
          <p className="text-lg text-[var(--color-obsidian)] mb-[var(--space-6)]">Something went wrong. Please try again.</p>
          <ButtonLink href="/shop" variant="dark">Continue Shopping</ButtonLink>
        </div>
      ) : query && results.length > 0 ? (
        <ProductGrid products={results} />
      ) : query && status === 'ready' ? (
        <div className="text-center py-[var(--space-12)]">
          <p className="text-lg text-[var(--color-obsidian)] mb-[var(--space-6)]">No products found matching your search.</p>
          <ButtonLink href="/shop" variant="dark">Continue Shopping</ButtonLink>
        </div>
      ) : query ? null : (
         <p className="text-lg text-[var(--color-obsidian)]">Enter a search term to find products.</p>
      )}
    </Container>
  );
}
