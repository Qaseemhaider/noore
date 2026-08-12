"use client";

import { useState } from "react";
import Image from "next/image";

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
            className={`relative w-16 h-20 overflow-hidden rounded-sm border ${
              selectedImage === index ? "border-[var(--color-crimson)]" : "border-[var(--color-border)]"
            }`}
          >
            <Image
              src={image.src}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
      
      {/* Main Image */}
      <div className="aspect-[4/5] relative w-full overflow-hidden bg-[var(--color-surface-muted)] order-1 lg:order-2">
        <Image
          src={images[selectedImage].src}
          alt={images[selectedImage].alt}
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
