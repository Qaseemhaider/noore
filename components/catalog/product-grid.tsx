import { Price } from "@/components/ui/price";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/catalog-data";
import { WishlistButton } from "@/components/product/wishlist-button";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group flex flex-col relative">
      <div className="absolute top-[var(--space-2)] right-[var(--space-2)] z-10">
        <WishlistButton productId={product.id} />
      </div>
      <Link href={`/product/${product.slug}`} className="block overflow-hidden bg-[var(--color-surface-muted)] mb-[var(--space-4)]">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          width={400}
          height={500}
          className="aspect-[4/5] object-cover transition-transform duration-[var(--duration-base)] group-hover:scale-105"
        />
      </Link>
      <Link href={`/product/${product.slug}`} className="font-sans text-[var(--text-body)] mb-[var(--space-1)]">
        {product.name}
      </Link>
      <div className="text-[var(--text-price)] text-[var(--color-obsidian)]">
        <Price amount={product.price} />
      </div>
    </div>
  );
}

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-[var(--space-6)] gap-y-[var(--space-8)]">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
