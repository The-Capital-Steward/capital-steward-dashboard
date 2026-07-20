import Link from "next/link"
import styles from "./page.module.css"

const NAV_ITEMS = [
  { href: "/platform", label: "Platform" },
  { href: "/methodology", label: "Methodology" },
  { href: "/evidence", label: "Evidence" },
  { href: "/about", label: "About" },
]

const MEASURES = [
  {
    number: "01",
    title: "Operating Foundation",
    body:
      "OSMR identifies the deepest level of operating performance a company has sustained over time, then compares its valuation with that demonstrated foundation.",
  },
  {
    number: "02",
    title: "Financial Agreement",
    body:
      "OSMR measures whether several financial anchors point toward a similar valuation conclusion or diverge sharply from one another.",
  },
]

const STEPS = [
  {
    label: "Identify",
    title: "Find the operating foundation",
    body:
      "The framework moves from free cash flow through revenue to locate the deepest financial anchor the company has sustained.",
  },
  {
    label: "Compare",
    title: "Measure cross-anchor agreement",
    body:
      "Multiple financial anchors are compared to determine whether the valuation picture is coherent or unusually assumption-dependent.",
  },
  {
    label: "Classify",
    title: "Combine the two dimensions",
    body:
      "The result is a structural classification—not a price target, prediction, or individualized investment recommendation.",
  },
]

const CLASSIFICATIONS = [
  {
    tone: "constructive",
    title: "Structurally Attractive",
    body:
      "A stronger demonstrated operating foundation paired with relatively coherent financial signals.",
  },
  {
    tone: "neutral",
    title: "Mid-Range",
    body:
      "A mixed structural profile that does not sit at either edge of the framework.",
  },
  {
    tone: "risk",
    title: "Structurally Fragile",
    body:
      "A shallower operating foundation, greater valuation stretch, or unusually conflicting financial signals.",
  },
]

function Brand() {
  return (
    <Link href="/" className={styles.brand} aria-label="The Capital Steward home">
      <span className={styles.brandPrefix}>The Capital</span>
      <span className={styles.brandName}>Steward</span>
    </Link>
  )
}

export default function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav} aria-label="Primary navigation">
          <Brand />

          <div className={styles.navLinks}>
            {NAV_ITEMS.map(({ href, label }) => (
              <Link key={href} href={href} className={styles.navLink}>
                {label}
              </Link>
            ))}
          </div>

          <Link href="/platform" className={styles.navCta}>
            Explore Platform
          </Link>
        </nav>
      </header>

      <div className={styles.statusBar}>
        <span className={styles.statusDot} aria-hidden="true" />
        <span>Free public research platform</span>
        <span className={styles.statusSeparator} aria-hidden="true">·</span>
        <span>No account required</span>
      </div>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Operating Structure &amp; Market Risk</p>

          <h1 className={styles.heroTitle}>
            Markets value <em>stories.</em>
            <br />
            We value <span>structure.</span>
          </h1>

          <p className={styles.heroCopy}>
            OSMR examines how far a company&apos;s valuation extends beyond the
            operating results it has sustained—and whether its financial anchors
            tell a consistent story.
          </p>

          <p className={styles.heroSupport}>
            Explore structural classifications across U.S. operating companies.
          </p>

          <div className={styles.heroActions}>
            <Link href="/platform" className={styles.primaryButton}>
              Explore the Platform
            </Link>
            <Link href="/methodology" className={styles.secondaryButton}>
              Read the Methodology
            </Link>
          </div>

          <p className={styles.heroNote}>
            Research and informational purposes only. Not investment advice.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="what-osmr-measures">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>What OSMR measures</p>
          <h2 id="what-osmr-measures" className={styles.sectionTitle}>
            Two questions beneath every valuation.
          </h2>
          <p className={styles.sectionCopy}>
            The framework separates operating evidence from market narrative, then
            asks whether the company&apos;s financial signals agree with one another.
          </p>
        </div>

        <div className={styles.measureGrid}>
          {MEASURES.map(({ number, title, body }) => (
            <article key={title} className={styles.measureCard}>
              <span className={styles.cardNumber}>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.softSection}`} aria-labelledby="how-it-works">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>How it works</p>
          <h2 id="how-it-works" className={styles.sectionTitle}>
            A transparent three-step classification.
          </h2>
        </div>

        <div className={styles.stepGrid}>
          {STEPS.map(({ label, title, body }) => (
            <article key={label} className={styles.stepCard}>
              <span className={styles.stepLabel}>{label}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="classification-meaning">
        <div className={styles.sectionIntro}>
          <p className={styles.sectionLabel}>How to read the result</p>
          <h2 id="classification-meaning" className={styles.sectionTitle}>
            A structural map—not a recommendation engine.
          </h2>
          <p className={styles.sectionCopy}>
            The classification describes the relationship between valuation and
            demonstrated operating support. It does not tell you what a stock will do next.
          </p>
        </div>

        <div className={styles.classificationGrid}>
          {CLASSIFICATIONS.map(({ tone, title, body }) => (
            <article
              key={title}
              className={`${styles.classificationCard} ${styles[tone]}`}
            >
              <span className={styles.classificationMarker} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.methodologySection}>
        <div className={styles.methodologyInner}>
          <div>
            <p className={styles.sectionLabel}>Methodology first</p>
            <h2 className={styles.methodologyTitle}>
              Every classification should be inspectable.
            </h2>
          </div>

          <div className={styles.methodologyCopy}>
            <p>
              The methodology page documents the research universe, operating-anchor
              cascade, financial-agreement measure, eligibility rules, special cases,
              update schedule, and limitations.
            </p>
            <Link href="/methodology" className={styles.textLink}>
              Examine the methodology <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={styles.finalCtaInner}>
          <p className={styles.sectionLabel}>The Capital Steward</p>
          <h2>Look beneath the market narrative.</h2>
          <p>
            Compare valuation with the operating structure that actually supports it.
          </p>
          <Link href="/platform" className={styles.primaryButton}>
            Explore the Platform
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <Brand />
        <p>
          © 2026 The Capital Steward, LLC. For informational purposes only.
          Not investment advice.
        </p>
        <div className={styles.footerLinks}>
          <Link href="/methodology">Methodology</Link>
          <Link href="/about">About</Link>
        </div>
      </footer>
    </main>
  )
}