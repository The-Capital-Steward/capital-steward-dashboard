import type { Metadata } from "next"
import Link from "next/link"
import styles from "./page.module.css"

export const metadata: Metadata = {
  title: "Methodology | The Capital Steward",
  description:
    "How OSMR converts operating history, enterprise value, and cross-anchor agreement into a transparent structural classification.",
}

const NAV_ITEMS = [
  { href: "/platform", label: "Platform" },
  { href: "/methodology", label: "Methodology" },
  { href: "/evidence", label: "Evidence" },
  { href: "/about", label: "About" },
]

const SECTION_ITEMS = [
  { href: "#universe", label: "Universe" },
  { href: "#enterprise-value", label: "Enterprise value" },
  { href: "#anchors", label: "Anchors" },
  { href: "#cascade", label: "Cascade" },
  { href: "#disagreement", label: "Disagreement" },
  { href: "#topology", label: "Tiers" },
  { href: "#exceptions", label: "Exceptions" },
  { href: "#integrity", label: "Integrity" },
]

const ANCHORS = [
  {
    name: "Revenue",
    question: "Can the company sell?",
    role: "Cascade + disagreement",
  },
  {
    name: "Gross Profit",
    question: "Do sales leave economic room after direct costs?",
    role: "Cascade + disagreement",
  },
  {
    name: "EBITDA",
    question: "What do operating earnings look like before capital consumption?",
    role: "Disagreement only",
  },
  {
    name: "EBIT",
    question: "What remains after charging for long-lived assets?",
    role: "Cascade + disagreement",
  },
  {
    name: "Net Income",
    question: "What remains after financing costs and taxes?",
    role: "Disagreement only",
  },
  {
    name: "Operating Cash Flow",
    question: "Is accounting performance becoming cash?",
    role: "Disagreement only",
  },
  {
    name: "Free Cash Flow",
    question: "Is cash left after reinvestment?",
    role: "Cascade + disagreement",
  },
]

const CASCADE_RUNGS = [
  {
    depth: "01",
    name: "Free Cash Flow",
    penalty: "0.000",
    description: "Deepest production rung and the penalty baseline.",
  },
  {
    depth: "02",
    name: "EBIT",
    penalty: "+0.282",
    description: "Positive cumulative operating income after depreciation.",
  },
  {
    depth: "03",
    name: "Gross Profit",
    penalty: "+1.339",
    description: "Sales exceed direct costs, but deeper operating proof is absent.",
  },
  {
    depth: "04",
    name: "Revenue",
    penalty: "+2.340",
    description: "The shallowest eligible operating proof in the cascade.",
  },
]

const DISAGREEMENT_LABELS = [
  "Tightly Agreeing",
  "Mildly Agreeing",
  "Moderate",
  "Mildly Disagreeing",
  "Strongly Disagreeing",
] as const

const CASCADE_LABELS = [
  "Very Low",
  "Low",
  "Moderate",
  "High",
  "Very High",
] as const

const SPECIAL_COHORTS = [
  {
    title: "Invalid EV",
    body:
      "One or more required enterprise-value inputs are missing or fail data-quality checks. The record is not treated as an economic signal.",
  },
  {
    title: "Negative-EV",
    body:
      "Constructed enterprise value is valid and less than or equal to zero. This is a distinct balance-sheet condition, not an ordinary map coordinate.",
  },
  {
    title: "Incomplete History",
    body:
      "No cascade anchor has the complete 28-quarter history required for a defensible classification.",
  },
  {
    title: "Cascade Truly-Non-Viable",
    body:
      "At least one cascade anchor has complete history, but none has a positive cumulative value over the trailing window.",
  },
  {
    title: "Cascade Eligible No-Disagreement",
    body:
      "A cascade score can be calculated, but fewer than four valid anchor ranks remain, so disagreement cannot be measured responsibly.",
  },
]

const EXCLUSIONS = [
  "Non-U.S. domicile",
  "Unknown domicile",
  "Non-USD or unresolved currency mismatch",
  "Market capitalization below $50 million",
  "20-day average dollar volume below $5 million",
  "Missing market capitalization or liquidity",
]

function Brand() {
  return (
    <Link href="/" className={styles.brand} aria-label="The Capital Steward home">
      <span className={styles.brandPrefix}>The Capital</span>
      <span className={styles.brandName}>Steward</span>
    </Link>
  )
}

function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string
  title: string
  copy?: string
}) {
  return (
    <header className={styles.sectionHeading}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      {copy ? <p className={styles.sectionLead}>{copy}</p> : null}
    </header>
  )
}

function tierForDistance(distance: number) {
  if (distance <= 1) return 1
  if (distance <= 4) return 2
  return 3
}

function tierCellClass(distance: number) {
  const tier = tierForDistance(distance)
  if (tier === 1) return styles.tier1Cell
  if (tier === 2) return styles.tier2Cell
  return styles.tier3Cell
}

function TopologyMatrix() {
  const rows = [...DISAGREEMENT_LABELS].reverse()

  return (
    <div className={styles.matrixFrame}>
      <div className={styles.matrix}>
        <div className={styles.yAxisTitle}>Anchor disagreement</div>

        <div className={styles.yLabels} aria-hidden="true">
          {rows.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className={styles.matrixBody}>
          <div
            className={styles.matrixCells}
            role="img"
            aria-label="Five by five OSMR topology showing distance from Moderate Cascade and Tightly Agreeing"
          >
            {rows.flatMap((disagreementLabel) => {
              const disagreementPosition =
                DISAGREEMENT_LABELS.indexOf(disagreementLabel) + 1

              return CASCADE_LABELS.map((cascadeLabel, cascadeIndex) => {
                const cascadePosition = cascadeIndex + 1
                const distance =
                  Math.abs(cascadePosition - 3) + (disagreementPosition - 1)
                const reference = distance === 0

                return (
                  <div
                    key={`${disagreementLabel}-${cascadeLabel}`}
                    className={`${styles.mapCell} ${tierCellClass(distance)} ${
                      reference ? styles.referenceCell : ""
                    }`}
                    title={`${cascadeLabel} cascade × ${disagreementLabel}: distance ${distance}, Tier ${tierForDistance(
                      distance,
                    )}`}
                  >
                    <span className={styles.mapDistance}>{distance}</span>
                    {reference ? (
                      <span className={styles.referenceLabel}>Reference</span>
                    ) : null}
                  </div>
                )
              })
            })}
          </div>

          <div className={styles.xLabels} aria-hidden="true">
            {CASCADE_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <p className={styles.xAxisTitle}>Cascade valuation</p>
        </div>
      </div>
    </div>
  )
}

export default function MethodologyPage() {
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
                  href === "/methodology" ? styles.navLinkActive : ""
                }`}
                aria-current={href === "/methodology" ? "page" : undefined}
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
          <p className={styles.eyebrow}>Operational Structural Mispricing Risk</p>
          <h1>How OSMR turns operating evidence into a structural map.</h1>
          <p className={styles.heroCopy}>
            OSMR compares the market value assigned to a company with the depth
            and consistency of the operating evidence beneath it. The result is
            a transparent classification of current structural conditions—not a
            price target or prediction.
          </p>

          <div className={styles.heroStats}>
            <div>
              <strong>2.0.0-rc1</strong>
              <span>Methodology version</span>
            </div>
            <div>
              <strong>28</strong>
              <span>Fiscal quarters</span>
            </div>
            <div>
              <strong>7</strong>
              <span>Operating anchors</span>
            </div>
            <div>
              <strong>5 × 5</strong>
              <span>Mainland topology</span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.sectionNavWrap}>
        <nav className={styles.sectionNav} aria-label="Methodology sections">
          {SECTION_ITEMS.map(({ href, label }) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
      </div>

      <section className={styles.introSection}>
        <div className={styles.readingWidth}>
          <p className={styles.intro}>
            Most valuation work asks whether a company looks cheap or expensive.
            OSMR asks a prior question: <strong>what has the business actually
            demonstrated strongly enough to support that valuation?</strong>
          </p>
          <p>
            The framework then asks whether seven different operating lenses tell
            a coherent story. A company belongs on the mainland map only when both
            dimensions can be measured responsibly.
          </p>
        </div>

        <div className={styles.threeQuestions}>
          <article>
            <span>01</span>
            <h3>What has been demonstrated?</h3>
            <p>
              The cascade finds the deepest positive operating anchor supported
              by a complete seven-year record.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>How stretched is valuation?</h3>
            <p>
              Enterprise value is compared with that cumulative operating anchor
              and ranked across the eligible universe.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Do the anchors agree?</h3>
            <p>
              Seven valuation ranks are compared. Wide dispersion signals that
              the company looks very different through different operating lenses.
            </p>
          </article>
        </div>
      </section>

      <section id="universe" className={styles.sectionAlt}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="01 · Launch universe"
            title="Eligibility is determined before any score is calculated."
            copy="The launch system is intentionally bounded. Records that cannot be compared consistently are retained as exclusions rather than forced into the ranked population."
          />

          <div className={styles.funnel}>
            <div>
              <span>Acquisition universe</span>
              <strong>U.S.-exchange listings</strong>
              <p>Test issues, funds, rights, warrants, units, debt and other non-common instruments are removed.</p>
            </div>
            <div>
              <span>Company scope</span>
              <strong>U.S.-domiciled operating companies</strong>
              <p>Common stocks only. ADRs, foreign issuers and unresolved domicile records are outside the launch universe.</p>
            </div>
            <div>
              <span>Currency rule</span>
              <strong>USD reporting</strong>
              <p>Non-USD and unresolved statement-currency mismatches fail closed.</p>
            </div>
            <div>
              <span>Tradability floors</span>
              <strong>$50M market cap · $5M ADV</strong>
              <p>Average daily dollar volume is measured over the trailing 20 trading days.</p>
            </div>
          </div>

          <div className={styles.ruleCallout}>
            <strong>Fail-closed rule</strong>
            <p>
              Missing market capitalization, liquidity, domicile, currency, or
              required enterprise-value inputs never receive a convenient
              assumption. The record remains visible with an explicit reason.
            </p>
          </div>
        </div>
      </section>

      <section id="enterprise-value" className={styles.section}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="02 · Enterprise value"
            title="The numerator is constructed consistently."
            copy="Vendor enterprise value is retained for quality assurance only. It is not the production numerator."
          />

          <div className={styles.formulaCard}>
            <p className={styles.formulaLabel}>Constructed enterprise value</p>
            <div className={styles.formula}>
              <span>Market cap</span>
              <b>+</b>
              <span>Total debt</span>
              <b>+</b>
              <span>Preferred stock</span>
              <b>+</b>
              <span>Minority interest</span>
              <b>−</b>
              <span>Cash &amp; equivalents</span>
            </div>
          </div>

          <div className={styles.twoColumnRules}>
            <article>
              <p className={styles.miniEyebrow}>Required · never imputed</p>
              <h3>Market cap, total debt, cash</h3>
              <p>
                If any required component is missing, enterprise value is invalid
                and the company cannot enter the mainland scoring population.
              </p>
            </article>
            <article>
              <p className={styles.miniEyebrow}>Zero-imputable</p>
              <h3>Preferred stock, minority interest</h3>
              <p>
                Missing values are treated as zero because data vendors commonly
                omit these line items when the economic value is zero.
              </p>
            </article>
          </div>

          <p className={styles.note}>
            A valid enterprise value of zero or less is not treated as a data
            error. It enters the Negative-EV special cohort.
          </p>
        </div>
      </section>

      <section id="anchors" className={styles.sectionAlt}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="03 · Operating anchors"
            title="Seven measures of operating reality."
            copy="Each anchor is the cumulative sum of 28 complete, point-in-time-eligible fiscal quarters. Partial windows are not used."
          />

          <div className={styles.anchorGrid}>
            {ANCHORS.map((anchor, index) => (
              <article key={anchor.name} className={styles.anchorCard}>
                <div className={styles.anchorNumber}>
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3>{anchor.name}</h3>
                <p>{anchor.question}</p>
                <span>{anchor.role}</span>
              </article>
            ))}
          </div>

          <div className={styles.derivedNote}>
            <strong>EBITDA is derived, not borrowed:</strong>
            <span> EBITDA = EBIT + depreciation and amortization.</span>
          </div>
        </div>
      </section>

      <section id="cascade" className={styles.section}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="04 · Axis one"
            title="Cascade valuation: how much valuation rests on how much proof?"
            copy="The company is assigned to the first complete cascade rung with a positive 28-quarter cumulative value."
          />

          <div className={styles.cascadeLayout}>
            <div className={styles.ladder}>
              {CASCADE_RUNGS.map((rung) => (
                <article key={rung.name} className={styles.ladderRung}>
                  <span className={styles.rungDepth}>{rung.depth}</span>
                  <div>
                    <h3>{rung.name}</h3>
                    <p>{rung.description}</p>
                  </div>
                  <div className={styles.penalty}>
                    <strong>{rung.penalty}</strong>
                    <span>log penalty</span>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.formulaPanel}>
              <p className={styles.formulaLabel}>Cascade score</p>
              <div className={styles.equation}>
                log
                <span className={styles.fraction}>
                  <span>Enterprise value</span>
                  <span>Cumulative assigned anchor</span>
                </span>
                + empirical penalty
              </div>
              <p>
                The shallower the company’s demonstrated operating foundation,
                the larger the empirical adjustment required to compare it with
                companies resting on deeper anchors.
              </p>
            </div>
          </div>

          <div className={styles.scaleBlock}>
            <div className={styles.scaleHeader}>
              <span>Lower valuation stretch</span>
              <span>Higher valuation stretch</span>
            </div>
            <div className={styles.fiveBand}>
              {CASCADE_LABELS.map((label) => (
                <div key={label}>{label}</div>
              ))}
            </div>
            <p>
              Scores are percentile-ranked across cascade-eligible companies on
              the scoring date and divided into five cross-sectional buckets.
            </p>
          </div>
        </div>
      </section>

      <section id="disagreement" className={styles.sectionAlt}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="05 · Axis two"
            title="Anchor disagreement: does the operating evidence tell one story?"
            copy="Every valid anchor produces its own valuation percentile. OSMR measures how widely those percentiles are dispersed within the company."
          />

          <div className={styles.disagreementFlow}>
            <div className={styles.rankChips}>
              {ANCHORS.map((anchor) => (
                <span key={anchor.name}>{anchor.name}</span>
              ))}
            </div>
            <div className={styles.flowArrow} aria-hidden="true">
              →
            </div>
            <div className={styles.stdCard}>
              <strong>Sample standard deviation</strong>
              <span>of valid anchor percentile ranks</span>
              <small>Minimum: 4 valid anchors · ddof = 1</small>
            </div>
          </div>

          <div className={styles.thresholdPanel}>
            <div className={styles.thresholdMarkers} aria-hidden="true">
              <span>20th</span>
              <span>40th</span>
              <span>60th</span>
              <span>80th</span>
            </div>
            <div className={styles.disagreementBand}>
              {DISAGREEMENT_LABELS.map((label) => (
                <div key={label}>{label}</div>
              ))}
            </div>
            <p>
              Option B uses the 20th, 40th, 60th and 80th percentiles of valid
              disagreement scores as the current cross-sectional boundaries.
              Higher disagreement means valuation looks increasingly different
              depending on which operating anchor is used.
            </p>
          </div>
        </div>
      </section>

      <section id="topology" className={styles.section}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="06 · Mainland topology"
            title="Two coordinates become a distance—not a blended score."
            copy="The reference region is Moderate Cascade × Tightly Agreeing. Every mainland company is classified by its Manhattan distance from that cell."
          />

          <div className={styles.distanceFormula}>
            <span>Distance</span>
            <strong>
              | Cascade position − 3 | + ( Disagreement position − 1 )
            </strong>
          </div>

          <TopologyMatrix />

          <div className={styles.tierCards}>
            <article className={styles.tier1Card}>
              <span>Distance 0–1</span>
              <h3>Tier 1 — Structurally Attractive</h3>
              <p>Near the reference region: moderate valuation and tight operating agreement.</p>
            </article>
            <article className={styles.tier2Card}>
              <span>Distance 2–4</span>
              <h3>Tier 2 — Mid-Range</h3>
              <p>One or both structural dimensions are meaningfully displaced.</p>
            </article>
            <article className={styles.tier3Card}>
              <span>Distance 5–6</span>
              <h3>Tier 3 — Structurally Fragile</h3>
              <p>Far from the reference region because valuation, disagreement, or both are extreme.</p>
            </article>
          </div>

          <div className={styles.ruleCallout}>
            <strong>There is no continuous composite in production.</strong>
            <p>
              OSMR v2 does not average the two axes, smooth the map, or add
              discretionary weights. “Structurally fragile” describes distance
              from the reference region; it is not an automatic sell signal or a
              general judgment about business quality.
            </p>
          </div>
        </div>
      </section>

      <section id="exceptions" className={styles.sectionAlt}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="07 · Exceptions"
            title="Companies that cannot be placed honestly remain off the mainland."
            copy="An exception is information. OSMR keeps analytically different conditions visible rather than forcing every company into the same geometry."
          />

          <div className={styles.cohortGrid}>
            {SPECIAL_COHORTS.map((cohort) => (
              <article key={cohort.title}>
                <h3>{cohort.title}</h3>
                <p>{cohort.body}</p>
              </article>
            ))}
          </div>

          <div className={styles.exclusionBlock}>
            <p className={styles.miniEyebrow}>Launch-universe exclusions</p>
            <div>
              {EXCLUSIONS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <p>
              These are eligibility or data-quality outcomes—not OSMR economic
              classifications.
            </p>
          </div>
        </div>
      </section>

      <section id="integrity" className={styles.section}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="08 · Research and production integrity"
            title="The methodology is locked before the final evidence is regenerated."
            copy="The production system separates methodology, calibration, live scoring, historical validation and public presentation."
          />

          <div className={styles.integrityGrid}>
            <article>
              <span>01</span>
              <h3>Point-in-time statements</h3>
              <p>
                Historical financials may enter the model only after their public
                filing or acceptance date—not at fiscal period end.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>One scoring engine</h3>
              <p>
                Live and historical classifications must use the same pure OSMR
                v2 scoring implementation.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Frozen calibration</h3>
              <p>
                Empirical cascade penalties are versioned and checksummed. Weekly
                production runs do not recalibrate them.
              </p>
            </article>
            <article>
              <span>04</span>
              <h3>Serialization only</h3>
              <p>
                Website exporters receive already-scored records. They may not
                recreate or alter methodology logic.
              </p>
            </article>
          </div>

          <div className={styles.validationStatus}>
            <div>
              <p className={styles.miniEyebrow}>Evidence status</p>
              <h3>Production-parity historical validation is being regenerated.</h3>
            </div>
            <p>
              Legacy return and Fama–French results are not presented as evidence
              for the current cascade × disagreement system. The Evidence page
              will publish the canonical v2 results only after point-in-time
              validation, calibration separation and claims review are complete.
            </p>
          </div>

          <div className={styles.boundaryGrid}>
            <article>
              <p className={styles.miniEyebrow}>OSMR does</p>
              <ul>
                <li>Describe current structural conditions</li>
                <li>Compare valuation with demonstrated operating output</li>
                <li>Expose disagreement, exceptions and exclusions</li>
                <li>Create a repeatable cross-sectional research map</li>
              </ul>
            </article>
            <article>
              <p className={styles.miniEyebrow}>OSMR does not</p>
              <ul>
                <li>Predict the next price move</li>
                <li>Produce a price target</li>
                <li>Replace company-specific fundamental research</li>
                <li>Provide personalized investment advice</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.close}>
        <div>
          <p className={styles.eyebrow}>From specification to application</p>
          <h2>Inspect the live classifications—or examine the evidence boundary.</h2>
          <p>
            The platform shows how the methodology classifies individual
            companies today. The Evidence page documents what has and has not yet
            been established historically.
          </p>
          <div className={styles.closeActions}>
            <Link href="/platform" className={styles.primaryButton}>
              Explore Platform
            </Link>
            <Link href="/evidence" className={styles.secondaryButton}>
              Review Evidence
            </Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>
          <strong>The Capital Steward</strong>
          <span>Operational Structural Mispricing Risk</span>
        </div>
        <p>For research and informational purposes only. Not investment advice.</p>
      </footer>
    </main>
  )
}
