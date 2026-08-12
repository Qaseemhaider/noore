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
  description: string;
  fabric: string;
  care: string;
  shippingInfo: string;
  reviews: { count: number; rating: number };
  relatedProductIds: string[];
};

export const products: Product[] = [
  {
    id: "haya",
    slug: "noore-e-haya-abaya",
    name: "Noore-e-Haya Abaya",
    category: "Abayas",
    price: 1290000,
    image: { src: "/images/home/product-brown-temporary.png", alt: "Chocolate brown Noore-e-Haya abaya" },
    images: [{ src: "/images/home/product-brown-temporary.png", alt: "Chocolate brown Noore-e-Haya abaya" }],
    sizes: ["S", "M", "L", "XL"],
    availableColors: ["Chocolate"],
    isNew: false,
    isFeatured: true,
    description: "Elegant chocolate brown abaya with subtle embroidery details.",
    fabric: "Premium Crepe",
    care: "Dry clean recommended.",
    shippingInfo: "Free shipping on orders over 10,000 PKR.",
    reviews: { count: 12, rating: 4.8 },
    relatedProductIds: ["luna", "dusk"],
  },
  {
    id: "luna",
    slug: "luna-abaya",
    name: "Luna Abaya",
    category: "Abayas",
    price: 1150000,
    image: { src: "/images/home/product-black-temporary.png", alt: "Black Luna abaya" },
    images: [{ src: "/images/home/product-black-temporary.png", alt: "Black Luna abaya" }],
    sizes: ["S", "M", "L"],
    availableColors: ["Black"],
    isNew: false,
    isFeatured: true,
    description: "Classic black abaya with a modern cut.",
    fabric: "Nidha",
    care: "Hand wash cold.",
    shippingInfo: "Free shipping on orders over 10,000 PKR.",
    reviews: { count: 8, rating: 4.5 },
    relatedProductIds: ["haya", "dusk"],
  },
  {
    id: "dusk",
    slug: "dusk-embroidered-abaya",
    name: "Dusk Embroidered Abaya",
    category: "Abayas",
    price: 1390000,
    image: { src: "/images/home/product-black-temporary.png", alt: "Black embroidered Dusk abaya" },
    images: [{ src: "/images/home/product-black-temporary.png", alt: "Black embroidered Dusk abaya" }],
    sizes: ["M", "L"],
    availableColors: ["Black"],
    isNew: false,
    isFeatured: true,
    description: "Sophisticated black abaya featuring intricate embroidery.",
    fabric: "Georgette",
    care: "Dry clean only.",
    shippingInfo: "Free shipping on orders over 10,000 PKR.",
    reviews: { count: 5, rating: 5.0 },
    relatedProductIds: ["haya", "luna"],
  },
  {
    id: "elegance",
    slug: "elegance-abaya",
    name: "Elegance Abaya",
    category: "Abayas",
    price: 1250000,
    image: { src: "/images/home/product-taupe-temporary.png", alt: "Taupe Elegance abaya" },
    images: [{ src: "/images/home/product-taupe-temporary.png", alt: "Taupe Elegance abaya" }],
    sizes: ["S", "M", "L", "XL"],
    availableColors: ["Taupe"],
    isNew: false,
    isFeatured: true,
    description: "Minimalist taupe abaya for a timeless look.",
    fabric: "Crepe",
    care: "Dry clean recommended.",
    shippingInfo: "Free shipping on orders over 10,000 PKR.",
    reviews: { count: 15, rating: 4.7 },
    relatedProductIds: ["haya", "luna"],
  },
  {
    id: "chiffon",
    slug: "chiffon-hijab",
    name: "Chiffon Hijab",
    category: "Hijabs",
    price: 185000,
    image: { src: "/images/home/product-rose-temporary.png", alt: "Dusty rose chiffon hijab" },
    images: [{ src: "/images/home/product-rose-temporary.png", alt: "Dusty rose chiffon hijab" }],
    sizes: ["One Size"],
    availableColors: ["Dusty Rose"],
    isNew: true,
    isFeatured: false,
    description: "Lightweight and elegant dusty rose chiffon hijab.",
    fabric: "Chiffon",
    care: "Hand wash cold.",
    shippingInfo: "Free shipping on orders over 10,000 PKR.",
    reviews: { count: 20, rating: 4.9 },
    relatedProductIds: ["chadar", "jersey"],
  },
  {
    id: "chadar",
    slug: "noore-chadar",
    name: "Noore Chadar",
    category: "Chadars",
    price: 245000,
    image: { src: "/images/home/product-taupe-temporary.png", alt: "Taupe Noore chadar" },
    images: [{ src: "/images/home/product-taupe-temporary.png", alt: "Taupe Noore chadar" }],
    sizes: ["One Size"],
    availableColors: ["Taupe"],
    isNew: true,
    isFeatured: false,
    description: "Soft and versatile taupe chadar.",
    fabric: "Cotton Blend",
    care: "Machine wash cold.",
    shippingInfo: "Free shipping on orders over 10,000 PKR.",
    reviews: { count: 10, rating: 4.6 },
    relatedProductIds: ["chiffon", "jersey"],
  },
  {
    id: "jersey",
    slug: "premium-jersey-hijab",
    name: "Premium Jersey Hijab",
    category: "Hijabs",
    price: 195000,
    image: { src: "/images/home/product-black-temporary.png", alt: "Black premium jersey hijab" },
    images: [{ src: "/images/home/product-black-temporary.png", alt: "Black premium jersey hijab" }],
    sizes: ["One Size"],
    availableColors: ["Black"],
    isNew: true,
    isFeatured: false,
    description: "Comfortable and breathable black jersey hijab.",
    fabric: "Jersey",
    care: "Machine wash cold.",
    shippingInfo: "Free shipping on orders over 10,000 PKR.",
    reviews: { count: 25, rating: 4.8 },
    relatedProductIds: ["chiffon", "chadar"],
  },
  {
    id: "linen",
    slug: "linen-abaya",
    name: "Linen Abaya",
    category: "Abayas",
    price: 1190000,
    image: { src: "/images/home/product-brown-temporary.png", alt: "Brown linen abaya" },
    images: [{ src: "/images/home/product-brown-temporary.png", alt: "Brown linen abaya" }],
    sizes: ["S", "M", "L"],
    availableColors: ["Brown"],
    isNew: true,
    isFeatured: false,
    description: "Breathable linen abaya perfect for warmer days.",
    fabric: "Linen",
    care: "Hand wash cold.",
    shippingInfo: "Free shipping on orders over 10,000 PKR.",
    reviews: { count: 7, rating: 4.4 },
    relatedProductIds: ["haya", "luna"],
  },
];
