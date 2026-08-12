export type NavigationItem = {
  label: string;
  href: string;
};

export const shopNavigation: NavigationItem[] = [
  { label: "View All", href: "/shop/all" },
  { label: "Abayas", href: "/shop/abayas" },
  { label: "Hijabs", href: "/shop/hijabs" },
  { label: "Chadars", href: "/shop/chadars" },
];

export const primaryNavigation: NavigationItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "Abayas", href: "/shop/abayas" },
  { label: "Hijabs", href: "/shop/hijabs" },
  { label: "Chadars", href: "/shop/chadars" },
  { label: "About", href: "/about" },
];

export const supportNavigation: NavigationItem[] = [
  { label: "Contact Us", href: "/contact" },
  { label: "Shipping & Delivery", href: "/shipping-delivery" },
  { label: "Returns & Exchanges", href: "/returns-exchanges" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Track Order", href: "/track-order" },
  { label: "FAQ", href: "/faq" },
];

export const footerGroups = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop/all" },
      ...shopNavigation.slice(1),
    ],
  },
  {
    title: "Customer Care",
    links: supportNavigation.slice(0, 5),
  },
  {
    title: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Sustainability", href: "/sustainability" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "+92 300 1234567", href: "tel:+923001234567" },
      { label: "hello@noore.com", href: "mailto:hello@noore.com" },
      { label: "Lahore, Pakistan", href: "/contact" },
    ],
  },
] satisfies Array<{ title: string; links: NavigationItem[] }>;

export const socialNavigation: NavigationItem[] = [
  { label: "Instagram", href: "#instagram" },
  { label: "Facebook", href: "#facebook" },
  { label: "TikTok", href: "#tiktok" },
  { label: "Pinterest", href: "#pinterest" },
];
