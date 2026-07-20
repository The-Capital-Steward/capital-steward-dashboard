import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "About | The Capital Steward",
  description:
    "Learn why The Capital Steward exists, who created it, and the research principles that govern OSMR.",
}

const NAV_ITEMS = [
  { href: "/platform", label: "Platform" },
  { href: "/methodology", label: "Methodology" },
  { href: "/evidence", label: "Evidence" },
  { href: "/about", label: "About" },
]

const PRINCIPLES = [
  {
    number: "01",
    title: "Evidence before narrative",
    body:
      "Begin with demonstrated operating results before evaluating the expectations embedded in valuation.",
  },
  {
    number: "02",
    title: "Reproducibility",
    body:
      "Public claims should trace back to a documented methodology, versioned data, and repeatable calculations.",
  },
  {
    number: "03",
    title: "Limitations in the main text",
    body:
      "Material weaknesses, exclusions, and uncertainty should be visible where conclusions are presented—not buried in fine print.",
  },
  {
    number: "04",
    title: "No prediction language",
    body:
      "OSMR describes current structural conditions. It does not claim to know what a security will do next.",
  },
]

const PROJECT_IS = [
  "An independently developed research project",
  "A public structural-analysis platform",
  "A documented and versioned methodology",
  "Designed for research and informational use",
]

const PROJECT_IS_NOT = [
  "Personalized investment advice",
  "A stock-picking or trading service",
  "A price-target model",
  "A guarantee of future outcomes",
  "Affiliated with the companies it classifies",
]

function Brand() {
  return (
    <Link href="/" className={styles.brand} aria-label="The Capital Steward home">
      <span className={styles.brandPrefix}>The Capital</span>
      <span className={styles.brandName}>Steward</span>
    </Link>
  )
}

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav} aria-label="Primary navigation">
          <Brand />

          <div className={styles.navLinks}>
            {NAV_ITEMS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${
                  href === "/about" ? styles.navLinkActive : ""
                }`}
                aria-current={href === "/about" ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </div>

          <Link href="/platform" className={styles.navCta}>
            Explore Platform
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>About The Capital Steward</p>
          <h1>Research built to look beneath the market narrative.</h1>
          <p className={styles.heroCopy}>
            The Capital Steward is an independent public research project examining
            the structural relationship between market valuation and demonstrated
            operating performance.
          </p>
          <p className={styles.creatorLine}>
            Created, researched, and developed by <strong>Anthony Summers</strong>.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="why-it-exists">
        <div className={styles.twoColumn}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>Why it exists</p>
            <h2 id="why-it-exists">
              Start with what a company has already demonstrated.
            </h2>
          </div>

          <div className={styles.prose}>
            <p>
              Traditional valuation often begins with assumptions about what a
              company may become. The Capital Steward begins one step earlier: how
              much operating support already exists beneath the valuation investors
              are being asked to accept?
            </p>
            <p>
              That question led to OSMR—Operating Structure &amp; Market Risk—a
              framework designed to compare market valuation with a company&apos;s
              sustained operating foundation and the degree to which its financial
              anchors agree with one another.
            </p>
            <p>
              All research is shaped by incentives, assumptions, and presentation
              choices. This project is built to make those choices unusually visible:
              the methodology is documented, the limitations are stated plainly, and
              classifications are intended to be inspected rather than merely
              accepted.
            </p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.softSection}`} aria-labelledby="creator">
        <div className={styles.creatorGrid}>
          <aside className={styles.identityCard} aria-label="About Anthony Summers">
              <div className={styles.creatorPhotoFrame}>
                <Image
                  src="/images/anthony-summers-about.jpeg"
                  alt="Anthony Summers presenting investment research"
                  fill
                  sizes="(max-width: 900px) 100vw, 360px"
                  className={styles.creatorPhoto}
                />
              </div>

              <div className={styles.identityDetails}>
                <p className={styles.identityLabel}>
                  Founder · Researcher · Developer
                </p>

                <h2 id="creator">Anthony Summers</h2>

                <p className={styles.identityNote}>
                  Independent creator of The Capital Steward and the OSMR framework.
                </p>
              </div>
            </aside>

          <div className={styles.creatorCopy}>
            <p className={styles.sectionLabel}>The creator</p>
            <h2>Built as both research and public infrastructure.</h2>
            <p>
              Anthony Summers is an investment researcher, systematic-strategy
              developer, and financial writer with more than a decade of experience
              across equities, fixed income, options, quantitative research, and
              investment editorial strategy.
            </p>
            <p>
              He designed the OSMR methodology, built its research and data pipeline,
              and developed The Capital Steward as a public interface for the
              resulting work.
            </p>
            <p>
              The project grew from a recurring problem in investment research:
              valuation models can become highly precise about assumptions that
              remain fundamentally uncertain. OSMR approaches the problem from the
              opposite direction, beginning with what a company has already
              demonstrated operationally.
            </p>
            <p className={styles.employerNote}>
              The Capital Steward is independently developed and does not represent
              the views of Anthony&apos;s employer or any other organization.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="research-principles">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>Research principles</p>
          <h2 id="research-principles">Standards that remain stable as the model evolves.</h2>
          <p>
            Methodologies can improve. The obligations governing how the work is
            presented should not drift with them.
          </p>
        </div>

        <div className={styles.principleGrid}>
          {PRINCIPLES.map(({ number, title, body }) => (
            <article key={number} className={styles.principleCard}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.stewardshipSection} aria-labelledby="stewardship">
        <div className={styles.stewardshipInner}>
          <p className={styles.sectionLabel}>The name</p>
          <h2 id="stewardship">Stewardship is about conformity to reality.</h2>
          <p>
            Stewardship means careful management of something entrusted to you. For
            an investor, that is capital. For a researcher, it is evidence, judgment,
            and the trust of the people using the work.
          </p>
          <p>
            The name reflects the standard the project is meant to serve: describe
            the evidence honestly, distinguish measurement from interpretation, and
            revise the framework when better evidence requires it.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="boundaries">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>Independence and boundaries</p>
          <h2 id="boundaries">What the project is—and what it is not.</h2>
        </div>

        <div className={styles.boundaryGrid}>
          <article className={`${styles.boundaryCard} ${styles.constructiveCard}`}>
            <p className={styles.boundaryLabel}>The Capital Steward is</p>
            <ul>
              {PROJECT_IS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className={`${styles.boundaryCard} ${styles.riskCard}`}>
            <p className={styles.boundaryLabel}>The Capital Steward is not</p>
            <ul>
              {PROJECT_IS_NOT.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <p className={styles.dataNote}>
          Financial data may be delayed, incomplete, or revised. Classifications are
          analytical outputs, not recommendations, and historical results do not
          guarantee future outcomes.
        </p>
      </section>

      <section className={styles.finalCta}>
        <div className={styles.finalCtaInner}>
          <p className={styles.sectionLabel}>Examine the work directly</p>
          <h2>Use the platform. Inspect the methodology.</h2>
          <p>
            Explore the current classifications or read how the framework is
            constructed, applied, and limited.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/platform" className={styles.primaryButton}>
              Explore the Platform
            </Link>
            <Link href="/methodology" className={styles.secondaryButton}>
              Read the Methodology
            </Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <Brand />
        <p>
          © 2026 The Capital Steward, LLC. For informational purposes only. Not
          investment advice.
        </p>
        <div className={styles.footerLinks}>
          <Link href="/methodology">Methodology</Link>
          <Link href="/about">About</Link>
        </div>
      </footer>
    </main>
  )
}