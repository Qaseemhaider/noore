import { products } from "@/lib/catalog-data";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductDetails } from "@/components/product/product-details";
import { CompleteTheLook } from "@/components/product/complete-the-look";
import { Reviews } from "@/components/product/reviews";
import { Reveal } from "@/components/motion/reveal";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-[var(--color-warm-ivory)]">
      <Container className="py-[var(--space-16)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(300px,450px)] gap-[var(--space-16)]">
          <Reveal distance={16}>
            <ProductGallery images={product.images} />
          </Reveal>
          <Reveal delay={90} distance={16}>
            <ProductDetails product={product} />
          </Reveal>
        </div>

        <div className="mt-[var(--space-24)] flex flex-col gap-[var(--space-24)]">
            <CompleteTheLook relatedProductIds={product.relatedProductIds} />
            <Reviews product={product} />
        </div>
      </Container>
    </div>
  );
}
