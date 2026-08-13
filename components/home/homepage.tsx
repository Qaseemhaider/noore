import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@/components/icons";
import { HomeMotion } from "@/components/motion/home-motion";
import { ButtonLink } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import {
  homeHero,
  homeProducts,
  homeWorlds,
  newArrivalProductIds,
  pressMarks,
  signatureProductIds,
  trustItems,
  type HomeProduct,
} from "@/lib/homepage-data";
import styles from "./homepage.module.css";

function HomeHero() {
  return (
    <section className={styles.hero} aria-labelledby="home-title" data-home-hero>
      <div className={`${styles.heroMedia} ${styles.heroEntranceMedia}`} data-home-entrance>
        <picture>
          <source media="(max-width: 47.999rem)" srcSet={homeHero.image.mobileSrc} />
          <Image src={homeHero.image.src} alt={homeHero.image.alt} width={1536} height={1024} loading="eager" fetchPriority="high" sizes="100vw" className={styles.heroImage} />
        </picture>
      </div>
      <div className={styles.heroCopy}>
        <h1 id="home-title" className={styles.heroTitle}><span data-home-entrance className={`${styles.heroLine} ${styles.heroEntranceLine}`}>MODESTY.</span><span data-home-entrance className={`${styles.heroLine} ${styles.heroEntranceLine}`}>ELEGANCE.</span><span data-home-entrance className={`${styles.heroLine} ${styles.heroEntranceLine} ${styles.heroAccent}`}>YOU.</span></h1>
        <p data-home-entrance className={styles.heroEntranceCopy}>{homeHero.body}</p>
        <ButtonLink href={homeHero.href} variant="dark" className={`${styles.heroButton} ${styles.heroEntranceCta}`}>Shop now</ButtonLink>
      </div>
    </section>
  );
}

function CategoryWorlds() {
  return (
    <section id="worlds" className={styles.worlds} aria-labelledby="worlds-title" data-home-reveal="worlds">
      <h2 id="worlds-title" className={styles.motionReveal} data-home-motion-item>Explore our worlds</h2>
      <div className={styles.worldGrid}>
        {homeWorlds.map((world) => (
          <Link prefetch={false} href={world.href} className={`${styles.worldCard} ${styles.motionReveal}`} data-home-motion-item key={world.name}>
            <Image src={world.image.src} alt={world.image.alt} fill sizes="(max-width: 767px) 25vw, 25vw" style={{ objectPosition: world.image.position }} />
            <span className={styles.worldName}>{world.name}</span>
            <span className={styles.worldCta}>Shop now <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: HomeProduct }) {
  return (
    <article className={`${styles.productCard} ${styles.motionReveal}`} data-home-motion-item>
      <Link prefetch={false} href={`/product/${product.slug}`} className={styles.productImage}>
        <Image src={product.image.src} alt={product.image.alt} fill sizes="(max-width: 767px) 48vw, 25vw" />
      </Link>
      <button type="button" className={styles.wishlist} aria-label={`Add ${product.name} to wishlist`}><HeartIcon width={18} height={18} /></button>
      <h3>{product.name}</h3>
      <Price amount={product.price} />
    </article>
  );
}

function ProductShelf({ title, ids }: { title: string; ids: string[] }) {
  const isNewArrivals = title === "New Arrivals";

  return (
    <section className={`${styles.shelf} ${isNewArrivals ? styles.arrivalsShelf : ""}`} aria-labelledby={`${title.replaceAll(" ", "-").toLowerCase()}-title`} data-home-reveal={isNewArrivals ? "arrivals" : "signature"} data-home-shelf>
      <div className={`${styles.sectionHead} ${styles.motionReveal}`} data-home-motion-item>
        <div><h2 id={`${title.replaceAll(" ", "-").toLowerCase()}-title`}>{title}</h2>{title === "Signature Collection" && <p>Explore our most loved pieces.</p>}</div>
        <Link prefetch={false} href="/shop/all">View all</Link>
      </div>
      <div className={styles.productGrid} data-home-shelf-track>{ids.map((id) => <ProductCard product={homeProducts[id]} key={id} />)}</div>
      <div className={`${styles.dots} ${styles.motionReveal}`} data-home-motion-item aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <i data-home-shelf-dot key={index} />)}</div>
    </section>
  );
}

function TrustIcon({ type }: { type: string }) {
  if (type === "delivery") return <svg viewBox="0 0 32 32"><path d="M3 8h17v14H3zM20 13h5l4 5v4h-9zM8 26a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>;
  if (type === "returns") return <svg viewBox="0 0 32 32"><path d="M7 10V4m0 0H1m6 0-3 3a12 12 0 1 0 4-3M11 16l3 3 7-7" /></svg>;
  if (type === "payment") return <svg viewBox="0 0 32 32"><rect x="3" y="8" width="26" height="18" rx="2" /><path d="M3 13h26M8 21h5" /></svg>;
  return <svg viewBox="0 0 32 32"><path d="M6 17v-3a10 10 0 0 1 20 0v3M6 17H3v7h6v-7H6Zm20 0h3v7h-6v-7h3Zm0 7c0 3-2 4-6 4" /></svg>;
}

function TrustStrip() {
  return <section className={styles.trust} aria-label="Shopping benefits" data-home-reveal="trust">{trustItems.map((item) => <div className={`${styles.trustItem} ${styles.motionReveal}`} data-home-motion-item key={item.title}><TrustIcon type={item.icon} /><div><h2>{item.title}</h2><p>{item.body}</p></div></div>)}</section>;
}

function PressMarks() {
  return <section className={styles.press} aria-labelledby="press-title" data-home-reveal="press"><h2 id="press-title" className={styles.motionReveal} data-home-motion-item>As seen in</h2><div>{pressMarks.map((mark) => <span className={styles.motionReveal} data-home-motion-item key={mark}>{mark}</span>)}</div></section>;
}

export function Homepage() {
  return <><HomeMotion /><HomeHero /><CategoryWorlds /><ProductShelf title="Signature Collection" ids={signatureProductIds} /><TrustStrip /><ProductShelf title="New Arrivals" ids={newArrivalProductIds} /><PressMarks /></>;
}
