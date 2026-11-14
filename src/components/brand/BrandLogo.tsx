import Image from "next/image";
import Link from "next/link";

import styles from "./BrandLogo.module.css";

export function BrandLogo() {
  return (
    <Link className={styles.rrBrandLink} href="/" aria-label="Realrank home">
      <Image
        className={styles.rrBrandLogo}
        src="/brand/realrank-logo-horizontal.svg"
        alt="Realrank"
        width={188}
        height={47}
        priority
      />
    </Link>
  );
}
