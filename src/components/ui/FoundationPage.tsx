import type { ReactNode } from "react";

import styles from "./FoundationPage.module.css";

type FoundationPageProps = Readonly<{
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}>;

export function FoundationPage({
  eyebrow = "Foundation",
  title,
  description,
  children,
}: FoundationPageProps) {
  return (
    <section className={styles.rrFoundationPage} data-foundation-route>
      <div className={styles.rrFoundationInner}>
        <span className={styles.rrEyebrow}>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </div>
    </section>
  );
}
