"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./product-gallery.module.css";

interface ProductGalleryProps {
  images: { src: string; alt: string }[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="flex flex-col lg:flex-row gap-[var(--space-4)]">
      {/* Thumbnail rail */}
      <div className="flex lg:flex-col gap-[var(--space-2)] order-2 lg:order-1">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            aria-label={`View image ${index + 1}`}
            aria-pressed={selectedImage === index}
            className={`relative w-16 h-20 overflow-hidden border transition-colors ${
              selectedImage === index ? "border-[var(--color-crimson)]" : "border-[var(--color-border)] hover:border-[var(--color-crimson)]"
            }`}
          >
            <Image
              src={image.src}
              alt={`Thumbnail ${index + 1}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="aspect-[4/5] relative w-full overflow-hidden bg-[var(--color-surface-muted)] order-1 lg:order-2">
        <div key={selectedImage} className={`absolute inset-0 ${styles.imageFade}`}>
          <Image
            src={images[selectedImage].src}
            alt={images[selectedImage].alt}
            fill
            sizes="(max-width: 63.999rem) 100vw, 60vw"
            className="object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
    </div>
  );
}
