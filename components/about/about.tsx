import Image from "next/image";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import {
  aboutClosing,
  aboutCraft,
  aboutHero,
  aboutPhilosophy,
  aboutStory,
  aboutValues,
} from "@/lib/about-data";
import styles from "./about.module.css";

function Eyebrow({ text, className = "" }: { text: string; className?: string }) {
  return <p className={`type-label ${styles.eyebrow} ${className}`}>{text}</p>;
}

function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className={styles.sectionTitle}>
      {children}
    </h2>
  );
}

function AboutHero() {
  const media = aboutHero.image;
  return (
    <section className={styles.hero} aria-labelledby="about-title">
      <Container className={styles.heroInner}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <Eyebrow text={aboutHero.eyebrow} className={styles.heroEyebrow} />
            <h1 id="about-title" className={styles.heroTitle}>
              <span className={styles.heroLine}>{aboutHero.titleA}</span>
              <span className={`${styles.heroLine} ${styles.heroAccent}`}>{aboutHero.titleB}</span>
            </h1>
            <p className={`${styles.heroLead} ${styles.heroLeadAnim}`}>{aboutHero.lead}</p>
          </div>
          <div className={`${styles.heroImageWrap} ${styles.heroImageAnim}`}>
            <Image
              src={media.src}
              alt={media.alt}
              width={media.width}
              height={media.height}
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 63.999rem) 100vw, 48vw"
              className={styles.heroImage}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

function Philosophy() {
  const media = aboutPhilosophy.image;
  return (
    <section className={styles.section} aria-labelledby="philosophy-title">
      <Container>
        <Reveal className={styles.sectionHeader}>
          <Eyebrow text={aboutPhilosophy.eyebrow} />
          <SectionTitle id="philosophy-title">{aboutPhilosophy.title}</SectionTitle>
        </Reveal>
        <div className={styles.split}>
          <div>
            <Reveal delay={80}>
              <p className={styles.principleLead}>{aboutPhilosophy.lead}</p>
            </Reveal>
            {aboutPhilosophy.principles.map((item, index) => (
              <Reveal key={item.title} delay={150 + index * 70} className={styles.principleRow}>
                <span className={styles.principleIndex}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className={styles.principleTitle}>{item.title}</h3>
                  <p className={styles.principleBody}>{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120} className={styles.imageFrame}>
            <div className={styles.mediaMask}>
              <Image src={media.src} alt={media.alt} fill sizes="(max-width: 63.999rem) 100vw, 50vw" className={styles.fillImage} />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function Story() {
  const media = aboutStory.image;
  return (
    <section className={`${styles.section} ${styles.story}`} aria-labelledby="story-title">
      <Container>
        <div className={styles.split}>
          <Reveal delay={100} className={styles.imageFrame}>
            <div className={styles.mediaMask}>
              <Image src={media.src} alt={media.alt} fill sizes="(max-width: 63.999rem) 100vw, 50vw" className={styles.fillImage} />
            </div>
          </Reveal>
          <div className={styles.storyText}>
            <Reveal delay={60}>
              <Eyebrow text={aboutStory.eyebrow} />
              <SectionTitle id="story-title">{aboutStory.title}</SectionTitle>
            </Reveal>
            <div className={styles.storyParagraphs}>
              {aboutStory.paragraphs.map((text, index) => (
                <Reveal key={index} delay={150 + index * 60}>
                  <p>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Craft() {
  const media = aboutCraft.image;
  return (
    <section className={styles.section} aria-labelledby="craft-title">
      <Container>
        <Reveal className={styles.sectionHeader}>
          <Eyebrow text={aboutCraft.eyebrow} />
          <SectionTitle id="craft-title">{aboutCraft.title}</SectionTitle>
        </Reveal>
        <div className={styles.split}>
          <Reveal delay={100} className={`${styles.imageFrame} ${styles.craftImageFrame}`}>
            <div className={styles.mediaMask}>
              <Image src={media.src} alt={media.alt} fill sizes="(max-width: 63.999rem) 100vw, 54vw" className={styles.fillImage} />
            </div>
          </Reveal>
          <div className={styles.craftItems}>
            {aboutCraft.items.map((item, index) => (
              <Reveal key={item.title} delay={150 + index * 80} className={styles.craftRow}>
                <span className={styles.principleIndex}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className={styles.craftTitle}>{item.title}</h3>
                  <p className={styles.principleBody}>{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Values() {
  return (
    <section className={styles.section} aria-labelledby="values-title">
      <Container>
        <Reveal className={styles.sectionHeader}>
          <Eyebrow text={aboutValues.eyebrow} />
          <SectionTitle id="values-title">{aboutValues.title}</SectionTitle>
        </Reveal>
        <div className={styles.valuesGrid}>
          {aboutValues.values.map((value, index) => (
            <Reveal key={value.title} delay={index * 90} className={styles.valuesCell}>
              <h3 className={styles.valuesTitle}>{value.title}</h3>
              <p className={styles.valuesBody}>{value.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Closing() {
  return (
    <section className={styles.closing} aria-labelledby="closing-title">
      <Container>
        <Reveal>
          <Eyebrow text={aboutClosing.eyebrow} className={styles.closingEyebrow} />
        </Reveal>
        <Reveal delay={90}>
          <h2 id="closing-title" className={styles.closingTitle}>
            <span className={styles.closingLine}>{aboutClosing.lineA}</span>
            <span className={`${styles.closingLine} ${styles.closingAccent}`}>{aboutClosing.lineB}</span>
          </h2>
        </Reveal>
        <Reveal delay={200} className={styles.closingCta}>
          <ButtonLink href={aboutClosing.href} variant="primary">
            {aboutClosing.cta}
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}

export function AboutPage() {
  return (
    <>
      <AboutHero />
      <Philosophy />
      <Story />
      <Craft />
      <Values />
      <Closing />
    </>
  );
}
