export type ProductImage = {
  src: string;
  alt: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "Abayas" | "Hijabs" | "Chadars";
  price: number;
  image: ProductImage;
  images: ProductImage[];
  sizes: string[];
  availableColors: string[];
  isNew: boolean;
  isFeatured: boolean;
  isSignature: boolean;
  isActive: boolean;
  description: string;
  fabric: string;
  care: string;
  shippingInfo: string;
  reviews: { count: number; rating: number };
  relatedProductIds: string[];
};
