"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./DiscoveryHome.module.css";

export function StickyListingAction({ citySlug }: { citySlug: string }) {
  const [heroPassed, setHeroPassed] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const visible = heroPassed && !footerVisible;

  useEffect(() => {
    const hero = document.getElementById("rr-discovery-hero");
    const footer = document.querySelector("footer");

    if (!hero) return;

    const heroObserver = new IntersectionObserver(
      ([entry]) => setHeroPassed(!entry.isIntersecting && entry.boundingClientRect.bottom < 0),
      { threshold: 0 },
    );
    const footerObserver = footer
      ? new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), {
          threshold: 0.05,
        })
      : null;

    heroObserver.observe(hero);
    if (footer && footerObserver) footerObserver.observe(footer);

    return () => {
      heroObserver.disconnect();
      footerObserver?.disconnect();
    };
  }, []);

  return (
    <Link
      className={`${styles.rrFloatingAction} ${visible ? styles.rrFloatingActionVisible : ""}`}
      href={`/access?intent=list&city=${encodeURIComponent(citySlug)}`}
      data-testid="floating-list-entity"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      List your Entity
      <ArrowRight aria-hidden="true" size={16} />
    </Link>
  );
}
