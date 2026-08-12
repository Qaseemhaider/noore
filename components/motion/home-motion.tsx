"use client";

import { useLayoutEffect } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function HomeMotion() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 47.999rem)");
    const announcement = document.querySelector("body > aside");
    const header = document.querySelector("body > header");
    const hero = document.querySelector<HTMLElement>("[data-home-hero]");
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-home-reveal]"));
    const newsletter = document.querySelector<HTMLElement>("footer > section");
    const cleanups: Array<() => void> = [];

    announcement?.setAttribute("data-home-shell", "announcement");
    header?.setAttribute("data-home-shell", "header");

    if (newsletter) {
      newsletter.dataset.homeReveal = "newsletter";
      newsletter.children.item(0)?.setAttribute("data-home-motion-part", "newsletter-image");
      newsletter.children.item(1)?.setAttribute("data-home-motion-part", "newsletter-copy");
      const form = newsletter.querySelector("form");
      form?.children.item(1)?.setAttribute("data-home-motion-part", "newsletter-input");
      form?.children.item(2)?.setAttribute("data-home-motion-part", "newsletter-button");
      sections.push(newsletter);
    }

    const motionItems = sections.map((section) => {
      const items = Array.from(section.querySelectorAll<HTMLElement>("[data-home-motion-item]"));
      items.forEach((item, index) => item.style.setProperty("--motion-index", String(index)));
      return { section, items };
    });

    const revealEverything = () => {
      root.dataset.homeMotion = "reduced";
      sections.forEach((section) => {
        section.dataset.homeVisible = "true";
        section.style.setProperty("--section-progress", "1");
        section.style.setProperty("--section-exit", "0");
      });
      motionItems.forEach(({ items }) => items.forEach((item) => {
        item.style.setProperty("--item-progress", "1");
        item.style.setProperty("--secondary-progress", "1");
        item.style.setProperty("--metadata-progress", "1");
      }));
      hero?.style.setProperty("--hero-progress", "0");
    };

    if (reducedQuery.matches) {
      revealEverything();
    } else {
      // The first-frame entrance is owned by SSR/CSS. Hydration only enables
      // the scroll-linked layer and below-fold progress choreography.
      root.dataset.homeMotion = "entered";
    }

    let scrollFrame = 0;
    const updateProgress = () => {
      scrollFrame = 0;
      const viewport = window.innerHeight;
      const mobile = mobileQuery.matches;
      const heroRect = hero?.getBoundingClientRect();
      const sectionSnapshots = motionItems.map((entry) => ({
        ...entry,
        rect: entry.section.getBoundingClientRect(),
      }));

      if (hero && heroRect) {
        const progress = clamp(-heroRect.top / Math.max(heroRect.height * 0.78, 1));
        hero.style.setProperty("--hero-progress", progress.toFixed(4));
        hero.style.setProperty("--hero-media-depth", `${(progress * (mobile ? 7 : 22)).toFixed(2)}px`);
      }

      sectionSnapshots.forEach(({ section, items, rect }) => {
        if (rect.bottom < -viewport * 0.25) {
          section.style.setProperty("--section-progress", "1");
          section.style.setProperty("--section-exit", "1");
          section.dataset.homeVisible = "true";
          items.forEach((item) => {
            item.style.setProperty("--item-progress", "1");
            item.style.setProperty("--secondary-progress", "1");
            item.style.setProperty("--metadata-progress", "1");
          });
          return;
        }
        if (rect.top > viewport * 1.25) return;

        const progress = clamp((viewport * 0.94 - rect.top) / Math.max(viewport * 0.72, 1));
        const exit = clamp((-rect.top - rect.height * 0.58) / Math.max(rect.height * 0.34, 1));
        section.style.setProperty("--section-progress", progress.toFixed(4));
        section.style.setProperty("--section-exit", exit.toFixed(4));
        section.dataset.homeVisible = progress > 0.015 ? "true" : "false";

        const cadence = mobile ? 0.105 : 0.075;
        const duration = mobile ? 0.42 : 0.48;
        items.forEach((item, index) => {
          const itemProgress = clamp((progress - index * cadence) / duration);
          item.style.setProperty("--item-progress", itemProgress.toFixed(4));
          item.style.setProperty("--secondary-progress", clamp((itemProgress - 0.34) / 0.6).toFixed(4));
          item.style.setProperty("--metadata-progress", clamp((itemProgress - 0.42) / 0.52).toFixed(4));
        });
      });
    };

    const requestProgress = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateProgress);
    };
    let progressListening = false;
    const startProgress = () => {
      if (progressListening) return;
      progressListening = true;
      updateProgress();
      window.addEventListener("scroll", requestProgress, { passive: true });
      window.addEventListener("resize", requestProgress, { passive: true });
    };
    const stopProgress = () => {
      if (!progressListening) return;
      progressListening = false;
      window.removeEventListener("scroll", requestProgress);
      window.removeEventListener("resize", requestProgress);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    };
    if (!reducedQuery.matches) startProgress();

    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        stopProgress();
        revealEverything();
      } else {
        root.dataset.homeMotion = "entered";
        startProgress();
      }
    };
    reducedQuery.addEventListener("change", onMotionPreferenceChange);
    cleanups.push(() => {
      reducedQuery.removeEventListener("change", onMotionPreferenceChange);
      stopProgress();
    });

    const shelves = Array.from(document.querySelectorAll<HTMLElement>("[data-home-shelf]"));
    shelves.forEach((shelf) => {
      const track = shelf.querySelector<HTMLElement>("[data-home-shelf-track]");
      const dots = Array.from(shelf.querySelectorAll<HTMLElement>("[data-home-shelf-dot]"));
      if (!track || !dots.length) return;
      let frame = 0;
      const updateShelf = () => {
        frame = 0;
        const cards = Array.from(track.children) as HTMLElement[];
        const scrollLeft = track.scrollLeft;
        const clientWidth = track.clientWidth;
        const maxScroll = Math.max(track.scrollWidth - clientWidth, 0);
        const cardMetrics = cards.map((card) => ({ card, left: card.offsetLeft - scrollLeft, width: card.offsetWidth }));
        const visibleDots = dots.filter((dot) => dot.offsetParent !== null);
        const activeIndex = maxScroll > 0 && visibleDots.length > 1
          ? Math.round((scrollLeft / maxScroll) * (visibleDots.length - 1))
          : 0;

        dots.forEach((dot) => { dot.dataset.active = "false"; });
        visibleDots.forEach((dot, index) => { dot.dataset.active = String(index === activeIndex); });
        cardMetrics.forEach(({ card, left, width }) => {
          card.dataset.shelfVisible = String(left < clientWidth && left + width > 0);
        });
      };
      const onShelfScroll = () => { if (!frame) frame = window.requestAnimationFrame(updateShelf); };
      updateShelf();
      track.addEventListener("scroll", onShelfScroll, { passive: true });
      cleanups.push(() => {
        track.removeEventListener("scroll", onShelfScroll);
        if (frame) window.cancelAnimationFrame(frame);
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      announcement?.removeAttribute("data-home-shell");
      header?.removeAttribute("data-home-shell");
      newsletter?.removeAttribute("data-home-reveal");
      newsletter?.removeAttribute("data-home-visible");
      newsletter?.style.removeProperty("--section-progress");
      newsletter?.style.removeProperty("--section-exit");
      newsletter?.querySelectorAll("[data-home-motion-part]").forEach((node) => node.removeAttribute("data-home-motion-part"));
      delete root.dataset.homeMotion;
    };
  }, []);

  return null;
}
