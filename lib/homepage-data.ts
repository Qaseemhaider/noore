export type HomeImage = {
  src: string;
  alt: string;
  position?: string;
};

export type HomeProduct = {
  id: string;
  name: string;
  price: number;
  image: HomeImage;
};

export const homeHero = {
  image: {
    src: "/images/home/hero-temporary.png",
    mobileSrc: "/images/home/hero-mobile-temporary.webp",
    alt: "Woman wearing a flowing black abaya beneath warm sandstone arches",
    position: "center",
  },
  body: "Timeless designs for the modern woman.",
  href: "/shop",
};

export const homeWorlds = [
  { name: "Abayas", href: "/shop/abayas", image: { src: "/images/home/product-black-temporary.png", alt: "Black abaya", position: "50% 35%" } },
  { name: "Hijabs", href: "/shop/hijabs", image: { src: "/images/home/product-rose-temporary.png", alt: "Dusty rose hijab", position: "50% 25%" } },
  { name: "Chadars", href: "/shop/chadars", image: { src: "/images/home/product-taupe-temporary.png", alt: "Taupe modest garment", position: "50% 30%" } },
  { name: "Collections", href: "/shop", image: { src: "/images/home/product-brown-temporary.png", alt: "Chocolate brown abaya", position: "50% 30%" } },
] as const;

export const homeProducts: Record<string, HomeProduct> = {
  haya: { id: "haya", name: "Noore-e-Haya Abaya", price: 1290000, image: { src: "/images/home/product-brown-temporary.png", alt: "Chocolate brown Noore-e-Haya abaya" } },
  luna: { id: "luna", name: "Luna Abaya", price: 1150000, image: { src: "/images/home/product-black-temporary.png", alt: "Black Luna abaya" } },
  dusk: { id: "dusk", name: "Dusk Embroidered Abaya", price: 1390000, image: { src: "/images/home/product-black-temporary.png", alt: "Black embroidered Dusk abaya" } },
  elegance: { id: "elegance", name: "Elegance Abaya", price: 1250000, image: { src: "/images/home/product-taupe-temporary.png", alt: "Taupe Elegance abaya" } },
  chiffon: { id: "chiffon", name: "Chiffon Hijab", price: 185000, image: { src: "/images/home/product-rose-temporary.png", alt: "Dusty rose chiffon hijab" } },
  chadar: { id: "chadar", name: "Noore Chadar", price: 245000, image: { src: "/images/home/product-taupe-temporary.png", alt: "Taupe Noore chadar" } },
  jersey: { id: "jersey", name: "Premium Jersey Hijab", price: 195000, image: { src: "/images/home/product-black-temporary.png", alt: "Black premium jersey hijab" } },
  linen: { id: "linen", name: "Linen Abaya", price: 1190000, image: { src: "/images/home/product-brown-temporary.png", alt: "Brown linen abaya" } },
};

export const signatureProductIds = ["haya", "luna", "dusk", "elegance"];
export const newArrivalProductIds = ["chiffon", "chadar", "jersey", "linen"];

export const trustItems = [
  { icon: "delivery", title: "Free shipping", body: "On orders above PKR 10,000" },
  { icon: "returns", title: "Easy returns", body: "14 days return policy" },
  { icon: "payment", title: "Secure payment", body: "100% secure checkout" },
  { icon: "support", title: "Customer support", body: "We are here to help" },
] as const;

export const pressMarks = ["VOGUE", "GRAZIA", "BAZAAR", "elle", "COSMOPOLITAN"];
