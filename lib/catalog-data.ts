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
  sizes: string[];
  availableColors: string[];
  isNew: boolean;
  isFeatured: boolean;
};

export const products: Product[] = [
  {
    id: "haya",
    slug: "noore-e-haya-abaya",
    name: "Noore-e-Haya Abaya",
    category: "Abayas",
    price: 1290000,
    image: { src: "/images/home/product-brown-temporary.png", alt: "Chocolate brown Noore-e-Haya abaya" },
    sizes: ["S", "M", "L", "XL"],
    availableColors: ["Chocolate"],
    isNew: false,
    isFeatured: true,
  },
  {
    id: "luna",
    slug: "luna-abaya",
    name: "Luna Abaya",
    category: "Abayas",
    price: 1150000,
    image: { src: "/images/home/product-black-temporary.png", alt: "Black Luna abaya" },
    sizes: ["S", "M", "L"],
    availableColors: ["Black"],
    isNew: false,
    isFeatured: true,
  },
  {
    id: "dusk",
    slug: "dusk-embroidered-abaya",
    name: "Dusk Embroidered Abaya",
    category: "Abayas",
    price: 1390000,
    image: { src: "/images/home/product-black-temporary.png", alt: "Black embroidered Dusk abaya" },
    sizes: ["M", "L"],
    availableColors: ["Black"],
    isNew: false,
    isFeatured: true,
  },
  {
    id: "elegance",
    slug: "elegance-abaya",
    name: "Elegance Abaya",
    category: "Abayas",
    price: 1250000,
    image: { src: "/images/home/product-taupe-temporary.png", alt: "Taupe Elegance abaya" },
    sizes: ["S", "M", "L", "XL"],
    availableColors: ["Taupe"],
    isNew: false,
    isFeatured: true,
  },
  {
    id: "chiffon",
    slug: "chiffon-hijab",
    name: "Chiffon Hijab",
    category: "Hijabs",
    price: 185000,
    image: { src: "/images/home/product-rose-temporary.png", alt: "Dusty rose chiffon hijab" },
    sizes: ["One Size"],
    availableColors: ["Dusty Rose"],
    isNew: true,
    isFeatured: false,
  },
  {
    id: "chadar",
    slug: "noore-chadar",
    name: "Noore Chadar",
    category: "Chadars",
    price: 245000,
    image: { src: "/images/home/product-taupe-temporary.png", alt: "Taupe Noore chadar" },
    sizes: ["One Size"],
    availableColors: ["Taupe"],
    isNew: true,
    isFeatured: false,
  },
  {
    id: "jersey",
    slug: "premium-jersey-hijab",
    name: "Premium Jersey Hijab",
    category: "Hijabs",
    price: 195000,
    image: { src: "/images/home/product-black-temporary.png", alt: "Black premium jersey hijab" },
    sizes: ["One Size"],
    availableColors: ["Black"],
    isNew: true,
    isFeatured: false,
  },
  {
    id: "linen",
    slug: "linen-abaya",
    name: "Linen Abaya",
    category: "Abayas",
    price: 1190000,
    image: { src: "/images/home/product-brown-temporary.png", alt: "Brown linen abaya" },
    sizes: ["S", "M", "L"],
    availableColors: ["Brown"],
    isNew: true,
    isFeatured: false,
  },
];
