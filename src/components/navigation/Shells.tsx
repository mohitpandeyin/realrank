import {
  BarChart3,
  ChevronDown,
  CircleUserRound,
  HelpCircle,
  Home,
  MapPin,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/brand/BrandLogo";

import styles from "./Shells.module.css";

type ShellProps = Readonly<{ children: ReactNode }>;

export function PublicShell({ children, home = false }: ShellProps & { home?: boolean }) {
  return (
    <div className={styles.rrAppShell}>
      <header className={home ? styles.rrHomeHeader : styles.rrStickyHeader}>
        <nav className={styles.rrHeaderInner} aria-label="Public navigation">
          <BrandLogo />
          <div className={styles.rrHeaderActions}>
            {home ? <Link href="#realrank-index">Categories</Link> : null}
            <Link href="/how-it-works">How it works</Link>
            {home ? (
              <>
                <Link href="/access">Login</Link>
                <Link
                  className={styles.rrCityLink}
                  href="#realrank-index"
                  aria-label="Current city: Indore"
                >
                  <MapPin aria-hidden="true" size={17} />
                  <span>Indore</span>
                  <ChevronDown aria-hidden="true" size={15} />
                </Link>
              </>
            ) : (
              <Link className={styles.rrHelpLink} href="/help">
                <HelpCircle aria-hidden="true" size={18} />
                <span>Help</span>
              </Link>
            )}
          </div>
        </nav>
      </header>
      <main className={styles.rrMain}>{children}</main>
      <footer className={styles.rrFooter}>
        <div className={styles.rrFooterInner}>
          <span>© 2026 Realrank</span>
          <nav aria-label="Legal">
            <Link href="/ranking-policy">Ranking Policy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function TransactionShell({ children }: ShellProps) {
  return (
    <div className={styles.rrAppShell}>
      <header className={styles.rrStickyHeader}>
        <nav className={styles.rrHeaderInner} aria-label="Transaction navigation">
          <BrandLogo />
          <Link className={styles.rrIconLink} href="/help" aria-label="Get help">
            <HelpCircle aria-hidden="true" size={20} />
          </Link>
        </nav>
      </header>
      <main className={styles.rrFocusedMain}>{children}</main>
    </div>
  );
}

const ownerItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/manage", label: "Profile", icon: UserRound },
  { href: "/manage#realrank-index", label: "Position", icon: MapPin },
  { href: "/manage/insights", label: "Insights", icon: BarChart3 },
  { href: "/manage?panel=account", label: "Account", icon: CircleUserRound },
] as const;

export function OwnerShell({ children }: ShellProps) {
  return (
    <div className={styles.rrOwnerShell}>
      <header className={styles.rrStickyHeader}>
        <nav className={styles.rrHeaderInner} aria-label="Owner header">
          <BrandLogo />
          <Link className={styles.rrHelpLink} href="/help?context=owner">
            <HelpCircle aria-hidden="true" size={18} />
            <span>Help</span>
          </Link>
        </nav>
      </header>
      <main className={styles.rrOwnerMain}>{children}</main>
      <nav className={styles.rrOwnerNavigation} aria-label="Owner navigation">
        {ownerItems.map(({ href, label, icon: Icon }) => (
          <Link href={href} key={label}>
            <Icon aria-hidden="true" size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function AdminShell({ children }: ShellProps) {
  return (
    <div className={styles.rrAppShell}>
      <header className={styles.rrStickyHeader}>
        <nav className={styles.rrHeaderInner} aria-label="Admin navigation">
          <BrandLogo />
          <span className={styles.rrInternalLabel}>Internal operations</span>
        </nav>
      </header>
      <main className={styles.rrAdminMain}>{children}</main>
    </div>
  );
}
