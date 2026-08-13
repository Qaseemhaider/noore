import { SectionHeading } from "@/components/ui/section-heading";
import { ProductCard } from "@/components/catalog/product-grid";
import type { Product } from "@/lib/catalog-data";

interface CompleteTheLookProps {
  relatedProducts: Product[];
}

export function CompleteTheLook({ relatedProducts }: CompleteTheLookProps) {
  if (relatedProducts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-[var(--space-12)]">
      <section>
        <SectionHeading title="Complete the Look" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-[var(--space-6)] mt-[var(--space-8)]">
          {relatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <aside className="hidden lg:block border-l border-[var(--color-border)] pl-[var(--space-8)]">
        <h3 className="type-navigation mb-[var(--space-6)] uppercase">Service</h3>
        <div className="flex flex-col gap-[var(--space-6)]">
           {[
             { title: "DELIVERY", desc: "Delivery within 15 days" },
             { title: "EASY RETURNS", desc: "Simple and straightforward returns" },
             { title: "SECURE PAYMENT", desc: "Protected checkout experience" },
             { title: "CUSTOMER SUPPORT", desc: "Help when you need it" },
           ].map((item) => (
             <div key={item.title}>
               <h4 className="font-sans text-[var(--text-label)] font-bold">{item.title}</h4>
               <p className="text-[var(--text-meta)] text-[var(--color-muted)]">{item.desc}</p>
             </div>
           ))}
        </div>
      </aside>
    </div>
  );
}
