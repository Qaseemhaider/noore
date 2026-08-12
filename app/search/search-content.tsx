'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { products } from "@/lib/catalog-data";
import { ProductGrid } from "@/components/catalog/product-grid";
import { SearchIcon } from "@/components/icons";

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  const filteredProducts = query
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${query}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSearch} className="mb-8 flex items-center border-b border-[var(--color-obsidian)] pb-2">
        <SearchIcon className="size-6 text-[var(--color-obsidian)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="text"
          placeholder="Search for products..."
          autoFocus={false}
          className="w-full bg-transparent p-4 text-xl outline-none placeholder:text-[var(--color-obsidian)]/50 noore-search-focus"
        />
      </form>
      
      {!query ? (
        <h1 className="text-2xl font-bold mb-6">Search</h1>
      ) : (
        <h1 className="text-2xl font-bold mb-6">Search Results for &quot;{query}&quot;</h1>
      )}
      
      {query && filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} />
      ) : query ? (
        <div className="text-center py-12">
          <p className="text-lg text-[var(--color-obsidian)] mb-6">No products found matching your search.</p>
          <a href="/shop" className="inline-block bg-[var(--color-obsidian)] px-6 py-3 text-white">Continue Shopping</a>
        </div>
      ) : (
         <p className="text-lg text-[var(--color-obsidian)]">Enter a search term to find products.</p>
      )}
    </div>
  );
}
