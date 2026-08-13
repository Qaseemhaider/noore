import { products } from "./catalog-data";

export type HomeImage = {
  src: string;
  alt: string;
  position?: string;
};

export type HomeProduct = {
  slug: string;
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

const homepageProductIds = ["haya", "luna", "dusk", "elegance", "chiffon", "chadar", "jersey", "linen"] as const;

const catalogProductById = new Map(products.map((product) => [product.id, product]));

export const homeProducts: Record<string, HomeProduct> = Object.fromEntries(
  homepageProductIds.map((id) => {
    const product = catalogProductById.get(id);
    if (!product) {
      throw new Error(`Homepage product "${id}" is not in catalog-data`);
    }
    return [
      id,
      { slug: product.slug, name: product.name, price: product.price, image: { src: product.image.src, alt: product.image.alt } },
    ];
  }),
);

export const signatureProductIds = ["haya", "luna", "dusk", "elegance"];
export const newArrivalProductIds = ["chiffon", "chadar", "jersey", "linen"];

export const trustItems = [
  { icon: "delivery", title: "Free shipping", body: "On orders above PKR 10,000" },
  { icon: "returns", title: "Easy returns", body: "14 days return policy" },
  { icon: "payment", title: "Secure payment", body: "100% secure checkout" },
  { icon: "support", title: "Customer support", body: "We are here to help" },
] as const;

export const pressMarks = ["VOGUE", "GRAZIA", "BAZAAR", "elle", "COSMOPOLITAN"];
