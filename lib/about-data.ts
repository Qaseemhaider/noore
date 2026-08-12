export type AboutMedia = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export const aboutHero = {
  eyebrow: "About Noore",
  titleA: "Modesty,",
  titleB: "Refined.",
  lead:
    "NOORE is a meeting point between modesty, elegance and contemporary design — a considered wardrobe for the modern woman, made to be lived in.",
  image: {
    src: "/images/home/hero-temporary.png",
    alt: "Woman wearing a flowing black abaya beneath warm sandstone arches",
    width: 1536,
    height: 1024,
  } satisfies AboutMedia,
} as const;

export const aboutPhilosophy = {
  eyebrow: "Our Philosophy",
  title: "Modesty without compromise.",
  lead:
    "Modesty is not a limitation at NOORE. It is the foundation every design begins from, and the reason each piece feels complete.",
  principles: [
    {
      title: "Modesty without compromise",
      body: "Full coverage and full presence. Nothing withheld, and nothing overstated.",
    },
    {
      title: "Thoughtful elegance",
      body: "Elegance found in proportion, fabric and finish — never in excess.",
    },
    {
      title: "Confidence",
      body: "Clothing that lets a woman move through the world entirely as herself.",
    },
    {
      title: "Timeless design",
      body: "Pieces designed beyond seasons, made to be worn for years.",
    },
  ],
  image: {
    src: "/images/home/product-taupe-temporary.png",
    alt: "Taupe modest garment in soft editorial light",
  } satisfies AboutMedia,
} as const;

export const aboutStory = {
  eyebrow: "The Noore Story",
  title: "Designed in balance.",
  paragraphs: [
    "Every NOORE piece begins as a study in balance — between coverage and movement, between refinement and ease.",
    "We design for the way a woman actually lives: an abaya that moves with the body, a hijab that holds through the day, silhouettes that carry from morning to evening.",
    "Modest fashion should never ask a woman to choose between dressing according to her values and dressing beautifully. Our work is to make that choice unnecessary.",
    "The result is a wardrobe that feels contemporary without chasing trend, and expressive without excess.",
  ],
  image: {
    src: "/images/home/product-rose-temporary.png",
    alt: "Dusty rose hijab draped in soft editorial light",
  } satisfies AboutMedia,
} as const;

export const aboutCraft = {
  eyebrow: "Craft & Detail",
  title: "Considered in every stitch.",
  items: [
    {
      title: "Thoughtful Silhouettes",
      body: "Clean lines and considered proportion, cut for ease and refinement.",
    },
    {
      title: "Fabric & Movement",
      body: "Materials chosen to drape, breathe and move naturally through the day.",
    },
    {
      title: "Finishing & Detail",
      body: "Every piece finished with care — quiet details you notice over time.",
    },
  ],
  image: {
    src: "/images/home/newsletter-temporary.png",
    alt: "Ivory ceramic vessels with dried botanicals",
  } satisfies AboutMedia,
} as const;

export const aboutValues = {
  eyebrow: "Our Values",
  title: "What we stand for.",
  values: [
    { title: "Modesty", body: "Rooted in values, expressed in design." },
    { title: "Elegance", body: "Restraint, proportion and poise." },
    { title: "Quality", body: "Made carefully, made to last." },
    { title: "Timelessness", body: "Beyond seasons and trends." },
  ],
} as const;

export const aboutClosing = {
  eyebrow: "Noore",
  lineA: "Designed to be worn.",
  lineB: "Created to be remembered.",
  cta: "Shop the collection",
  href: "/shop",
} as const;
