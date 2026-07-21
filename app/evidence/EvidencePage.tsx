"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import styles from "./page.module.css"

type TierResult = {
  tier: string
  shortLabel: string
  completeOutcomes: number
  formationObservations: number
  medianEndpointReturn: number
  medianMaxLoss: number
  medianEndpointEfficiency: number
  medianRetention: number
  negativeEndpointRate: number
  drawdown40Rate: number
}

type DistanceResult = {
  distance: number
  completeOutcomes: number
  medianEndpointReturn: number
  medianMaxLoss: number
  medianEndpointEfficiency: number
  drawdown40Rate: number
}

type AxisResult = {
  bucket: string
  completeOutcomes: number
  medianEndpointReturn: number
  medianMaxLoss: number
  medianEndpointEfficiency: number
}

type CellResult = {
  cascadeBucket: string
  disagreementBucket: string
  completeOutcomes: number
  medianEndpointReturn: number
  medianMaxLoss: number
  medianEndpointEfficiency: number
}

type WindowResult = {
  quarters: number
  tiers: Array<{
    tier: string
    formationObservations: number
    medianEndpointReturn: number
    medianMaxLoss: number
    medianEndpointEfficiency: number
    medianRetention: number
  }>
}

type PeriodResult = {
  period: string
  tiers: Array<{
    tier: string
    completeOutcomes: number
    medianEndpointReturn: number
    medianMaxLoss: number
    medianEndpointEfficiency: number
  }>
}

type SpecialCohortResult = {
  cohort: string
  formationObservations: number
  completeOutcomes: number
  medianEndpointReturn: number | null
  medianMaxLoss: number | null
  medianEndpointEfficiency: number | null
}

type EvidenceData = {
  schemaVersion: string
  methodologyVersion: string
  researchStatus: string
  sample: {
    panelRows: number
    uniqueSymbols: number
    formationMonths: number
    formationWindowStart: string
    formationWindowEnd: string
    completeOutcomeFormationStart: string
    completeOutcomeFormationEnd: string
    completeOutcomeMonths: number
    completeMainlandOutcomes: number
    primaryTrailingQuarters: number
    forwardHorizonMonths: number
    minimumMarketCap: number
    minimumAdv20d: number
    observationUnit: string
    summaryStatistic: string
    overlappingObservations: boolean
  }
  definitions: {
    endpointReturn: string
    maxLoss: string
    endpointEfficiency: string
    retention: string
  }
  tierResults: TierResult[]
  distanceResults: DistanceResult[]
  cascadeResults: AxisResult[]
  disagreementResults: AxisResult[]
  cellResults: CellResult[]
  windowRobustness: WindowResult[]
  periodRobustness: PeriodResult[]
  specialCohortResults: SpecialCohortResult[]
}

const NAV_ITEMS = [
  { href: "/platform", label: "Platform" },
  { href: "/methodology", label: "Methodology" },
  { href: "/evidence", label: "Evidence" },
  { href: "/about", label: "About" },
]

const CASCADE_LABELS = ["Very Low", "Low", "Moderate", "High", "Very High"]
const DISAGREEMENT_LABELS = [
  "Strongly Disagreeing",
  "Mildly Disagreeing",
  "Moderate",
  "Mildly Agreeing",
  "Tightly Agreeing",
]

function Brand() {
  return (
    <Link href="/" className={styles.brand} aria-label="The Capital Steward home">
      <span className={styles.brandPrefix}>The Capital</span>
      <span className={styles.brandName}>Steward</span>
    </Link>
  )
}

function pct(value: number | null | undefined, digits = 1) {
  if (value == null || !Number.isFinite(value)) return "—"
  return `${(value * 100).toFixed(digits)}%`
}

function multiple(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—"
  return `${value.toFixed(2)}×`
}

function number(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—"
  return new Intl.NumberFormat("en-US").format(value)
}

function tierClass(tier: string) {
  if (tier.startsWith("Tier 1")) return styles.tier1
  if (tier.startsWith("Tier 2")) return styles.tier2
  return styles.tier3
}

function heatColor(value: number, min: number, max: number) {
  const normalized = max === min ? 0.5 : (value - min) / (max - min)
  const hue = 12 + normalized * 126
  const saturation = 32 + normalized * 10
  const lightness = 86 - normalized * 20
  return `hsl(${hue} ${saturation}% ${lightness}%)`
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
      {copy ? <p>{copy}</p> : null}
    </header>
  )
}

export default function EvidencePage() {
  const [data, setData] = useState<EvidenceData | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    fetch("/data/osmr_v2_research_evidence.json")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<EvidenceData>
      })
      .then((payload) => {
        if (!cancelled) setData(payload)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Research evidence could not be loaded.",
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const efficiencyRange = useMemo(() => {
    if (!data?.cellResults.length) return { min: 0, max: 1 }
    const values = data.cellResults.map((cell) => cell.medianEndpointEfficiency)
    return { min: Math.min(...values), max: Math.max(...values) }
  }, [data])

  const cellMap = useMemo(() => {
    const map = new Map<string, CellResult>()
    for (const cell of data?.cellResults ?? []) {
      map.set(`${cell.cascadeBucket}|${cell.disagreementBucket}`, cell)
    }
    return map
  }, [data])

  if (!data && !error) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>
          <span />
          <p>Loading the research evidence…</p>
        </div>
      </main>
    )
  }

  if (!data || error) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>
          <h1>Evidence data unavailable</h1>
          <p>{error || "The research artifact could not be loaded."}</p>
        </div>
      </main>
    )
  }

  const tier1 = data.tierResults[0]
  const tier3 = data.tierResults[2]
  const referenceCell = data.cellResults.find(
    (cell) =>
      cell.cascadeBucket === "Moderate" &&
      cell.disagreementBucket === "Tightly Agreeing",
  )

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
                  href === "/evidence" ? styles.navLinkActive : ""
                }`}
                aria-current={href === "/evidence" ? "page" : undefined}
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
          <p className={styles.eyebrow}>OSMR v2 historical research</p>
          <h1>The map separated long-run payoff from path risk.</h1>
          <p className={styles.heroCopy}>
            Across {number(data.sample.completeMainlandOutcomes)} complete
            seven-year mainland outcomes, companies nearest the OSMR reference
            region produced stronger median endpoint returns with materially
            shallower losses along the way.
          </p>

          <div className={styles.heroStats}>
            <article>
              <strong>{pct(tier1.medianEndpointReturn)}</strong>
              <span>Tier 1 median 84-month return</span>
            </article>
            <article>
              <strong>{pct(tier1.medianMaxLoss)}</strong>
              <span>Tier 1 median maximum loss</span>
            </article>
            <article>
              <strong>{multiple(tier1.medianEndpointEfficiency)}</strong>
              <span>Tier 1 return-to-loss efficiency</span>
            </article>
            <article>
              <strong>{pct(referenceCell?.medianEndpointReturn)}</strong>
              <span>Reference-cell median return</span>
            </article>
          </div>

          <p className={styles.heroNote}>
            Primary specification: 28-quarter operating window · 84-month forward
            horizon · monthly formation observations · median statistics
          </p>
        </div>
      </section>

      <section className={styles.tierSection}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="01 · Tier separation"
            title="Tier 1 improved the payoff without requiring the deeper drawdown."
            copy="The strongest distinction was in the path. Tier 1’s median maximum loss was less than half the magnitude of Tier 3’s, while its median endpoint return was substantially higher."
          />

          <div className={styles.tierComparison}>
            <div className={styles.tierHeader}>
              <span>Classification</span>
              <span>Median endpoint return</span>
              <span>Median maximum loss</span>
              <span>Efficiency</span>
            </div>

            {data.tierResults.map((tier) => (
              <article key={tier.tier} className={tierClass(tier.tier)}>
                <div className={styles.tierIdentity}>
                  <span>{tier.shortLabel}</span>
                  <strong>{tier.tier.replace(`${tier.shortLabel} — `, "")}</strong>
                  <small>{number(tier.completeOutcomes)} complete outcomes</small>
                </div>

                <div className={styles.barMetric}>
                  <strong>{pct(tier.medianEndpointReturn)}</strong>
                  <div className={styles.barTrack}>
                    <span
                      className={styles.returnBar}
                      style={{
                        width: `${Math.max(
                          4,
                          (tier.medianEndpointReturn / 1.1) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className={styles.barMetric}>
                  <strong>{pct(tier.medianMaxLoss)}</strong>
                  <div className={styles.barTrack}>
                    <span
                      className={styles.lossBar}
                      style={{
                        width: `${Math.max(
                          4,
                          (Math.abs(tier.medianMaxLoss) / 0.45) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className={styles.metricStack}>
                  <strong>{multiple(tier.medianEndpointEfficiency)}</strong>
                  <span>{pct(tier.medianRetention)} payoff retention</span>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.findingGrid}>
            <article>
              <span>Return spread</span>
              <strong>
                {pct(tier1.medianEndpointReturn - tier3.medianEndpointReturn)}
              </strong>
              <p>Tier 1 minus Tier 3 in median 84-month endpoint return.</p>
            </article>
            <article>
              <span>Drawdown gap</span>
              <strong>
                {pct(
                  Math.abs(tier3.medianMaxLoss) -
                    Math.abs(tier1.medianMaxLoss),
                )}
              </strong>
              <p>Reduction in the magnitude of the median maximum loss.</p>
            </article>
            <article>
              <span>Deep-drawdown frequency</span>
              <strong>
                {pct(tier1.drawdown40Rate)} vs {pct(tier3.drawdown40Rate)}
              </strong>
              <p>Share of outcomes experiencing a loss of 40% or more.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.mapSection}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="02 · The two-axis topology"
            title="The reference cell was the strongest payoff-to-loss region."
            copy="Each cell below shows median endpoint efficiency: endpoint return divided by the absolute value of the worst loss experienced during the forward window."
          />

          <div className={styles.heatmapFrame}>
            <div className={styles.heatmap}>
              <div className={styles.yTitle}>Anchor disagreement</div>
              <div className={styles.yLabels}>
                {DISAGREEMENT_LABELS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>

              <div className={styles.heatmapBody}>
                <div className={styles.heatmapCells}>
                  {DISAGREEMENT_LABELS.flatMap((disagreement) =>
                    CASCADE_LABELS.map((cascade) => {
                      const cell = cellMap.get(`${cascade}|${disagreement}`)
                      const reference =
                        cascade === "Moderate" &&
                        disagreement === "Tightly Agreeing"

                      return (
                        <article
                          key={`${cascade}-${disagreement}`}
                          className={`${styles.heatCell} ${
                            reference ? styles.referenceCell : ""
                          }`}
                          style={{
                            background: cell
                              ? heatColor(
                                  cell.medianEndpointEfficiency,
                                  efficiencyRange.min,
                                  efficiencyRange.max,
                                )
                              : undefined,
                          }}
                          title={
                            cell
                              ? `${cascade} × ${disagreement}: ${multiple(
                                  cell.medianEndpointEfficiency,
                                )} efficiency; ${pct(
                                  cell.medianEndpointReturn,
                                )} endpoint return; ${pct(
                                  cell.medianMaxLoss,
                                )} maximum loss`
                              : undefined
                          }
                        >
                          <strong>
                            {cell
                              ? multiple(cell.medianEndpointEfficiency)
                              : "—"}
                          </strong>
                          {reference ? <span>Reference</span> : null}
                        </article>
                      )
                    }),
                  )}
                </div>

                <div className={styles.xLabels}>
                  {CASCADE_LABELS.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <p className={styles.xTitle}>Cascade valuation</p>
              </div>
            </div>
          </div>

          {referenceCell ? (
            <div className={styles.referenceSummary}>
              <div>
                <p className={styles.miniEyebrow}>Moderate × Tightly Agreeing</p>
                <h3>The production reference region</h3>
              </div>
              <dl>
                <div>
                  <dt>Median endpoint return</dt>
                  <dd>{pct(referenceCell.medianEndpointReturn)}</dd>
                </div>
                <div>
                  <dt>Median maximum loss</dt>
                  <dd>{pct(referenceCell.medianMaxLoss)}</dd>
                </div>
                <div>
                  <dt>Endpoint efficiency</dt>
                  <dd>{multiple(referenceCell.medianEndpointEfficiency)}</dd>
                </div>
                <div>
                  <dt>Complete outcomes</dt>
                  <dd>{number(referenceCell.completeOutcomes)}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.distanceSection}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="03 · Distance from the reference region"
            title="Moving away from the center made the path materially harsher."
            copy="Returns were highest at distances zero and one. Beyond that, payoff compressed while the typical maximum loss roughly doubled."
          />

          <div className={styles.distanceChart}>
            <div className={styles.distanceHeader}>
              <span>Distance</span>
              <span>Median return</span>
              <span>Median max loss</span>
              <span>Efficiency</span>
              <span>40% loss frequency</span>
            </div>
            {data.distanceResults.map((row) => (
              <article key={row.distance}>
                <strong className={styles.distanceNumber}>{row.distance}</strong>
                <div className={styles.distanceBar}>
                  <span>{pct(row.medianEndpointReturn)}</span>
                  <i
                    style={{
                      width: `${Math.max(
                        4,
                        (row.medianEndpointReturn / 1.1) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <div className={styles.distanceBar}>
                  <span>{pct(row.medianMaxLoss)}</span>
                  <i
                    className={styles.lossDistance}
                    style={{
                      width: `${Math.max(
                        4,
                        (Math.abs(row.medianMaxLoss) / 0.45) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <strong>{multiple(row.medianEndpointEfficiency)}</strong>
                <strong>{pct(row.drawdown40Rate)}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.axisSection}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="04 · What each axis contributed"
            title="Valuation stretch and financial disagreement carried different information."
            copy="Cascade valuation was most favorable around the moderate region. Disagreement primarily separated the quality of the path: strongly conflicting anchors were associated with substantially deeper losses."
          />

          <div className={styles.axisGrid}>
            <article>
              <p className={styles.miniEyebrow}>Cascade valuation</p>
              <h3>Moderate valuation produced the strongest median efficiency.</h3>
              <div className={styles.axisRows}>
                {data.cascadeResults.map((row) => (
                  <div key={row.bucket}>
                    <span>{row.bucket}</span>
                    <strong>{multiple(row.medianEndpointEfficiency)}</strong>
                    <small>
                      {pct(row.medianEndpointReturn)} return ·{" "}
                      {pct(row.medianMaxLoss)} max loss
                    </small>
                  </div>
                ))}
              </div>
            </article>

            <article>
              <p className={styles.miniEyebrow}>Anchor disagreement</p>
              <h3>Strong disagreement carried the deepest median loss.</h3>
              <div className={styles.axisRows}>
                {data.disagreementResults.map((row) => (
                  <div key={row.bucket}>
                    <span>{row.bucket}</span>
                    <strong>{multiple(row.medianEndpointEfficiency)}</strong>
                    <small>
                      {pct(row.medianEndpointReturn)} return ·{" "}
                      {pct(row.medianMaxLoss)} max loss
                    </small>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.robustnessSection}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="05 · Robustness"
            title="The tier pattern persisted across operating windows and later subperiods."
            copy="The production methodology uses 28 quarters. The same broad ordering appeared when the operating window was shortened to 4, 8, or 16 quarters."
          />

          <div className={styles.windowTable}>
            <div className={styles.windowHeader}>
              <span>Operating window</span>
              <span>Tier 1 return</span>
              <span>Tier 3 return</span>
              <span>Tier 1 max loss</span>
              <span>Tier 3 max loss</span>
            </div>
            {data.windowRobustness.map((window) => {
              const first = window.tiers.find((tier) =>
                tier.tier.startsWith("Tier 1"),
              )
              const third = window.tiers.find((tier) =>
                tier.tier.startsWith("Tier 3"),
              )
              return (
                <div key={window.quarters}>
                  <strong>{window.quarters} quarters</strong>
                  <span>{pct(first?.medianEndpointReturn)}</span>
                  <span>{pct(third?.medianEndpointReturn)}</span>
                  <span>{pct(first?.medianMaxLoss)}</span>
                  <span>{pct(third?.medianMaxLoss)}</span>
                </div>
              )
            })}
          </div>

          <div className={styles.periodGrid}>
            {data.periodRobustness.map((period) => {
              const first = period.tiers.find((tier) =>
                tier.tier.startsWith("Tier 1"),
              )
              const third = period.tiers.find((tier) =>
                tier.tier.startsWith("Tier 3"),
              )
              return (
                <article key={period.period}>
                  <p className={styles.miniEyebrow}>
                    Formation period {period.period}
                  </p>
                  <h3>{pct(first?.medianEndpointReturn)} vs {pct(third?.medianEndpointReturn)}</h3>
                  <p>
                    Tier 1 versus Tier 3 median endpoint return. Median maximum
                    loss was {pct(first?.medianMaxLoss)} versus{" "}
                    {pct(third?.medianMaxLoss)}.
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className={styles.islandSection}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="06 · Why special cohorts remain separate"
            title="The islands are analytically different—not merely worse versions of the mainland."
            copy="Some cohorts lack enough information for both axes. Others reflect balance-sheet or operating conditions that behave differently from ordinary positive-EV mainland companies."
          />

          <div className={styles.islandGrid}>
            {data.specialCohortResults.map((cohort) => (
              <article key={cohort.cohort}>
                <p className={styles.miniEyebrow}>{cohort.cohort}</p>
                <dl>
                  <div>
                    <dt>Complete outcomes</dt>
                    <dd>{number(cohort.completeOutcomes)}</dd>
                  </div>
                  <div>
                    <dt>Median return</dt>
                    <dd>{pct(cohort.medianEndpointReturn)}</dd>
                  </div>
                  <div>
                    <dt>Median max loss</dt>
                    <dd>{pct(cohort.medianMaxLoss)}</dd>
                  </div>
                  <div>
                    <dt>Efficiency</dt>
                    <dd>{multiple(cohort.medianEndpointEfficiency)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <p className={styles.islandNote}>
            Incomplete History and Negative-EV illustrate why an island label is
            not a bearish judgment. Cascade Truly-Non-Viable and Cascade Eligible
            No-Disagreement, by contrast, showed distinctly weak historical path
            characteristics in the complete-outcome sample.
          </p>
        </div>
      </section>

      <section className={styles.designSection}>
        <div className={styles.contentWidth}>
          <SectionHeading
            eyebrow="07 · Research design"
            title="How to read these results."
          />

          <div className={styles.designGrid}>
            <article>
              <span>{number(data.sample.panelRows)}</span>
              <h3>Monthly panel observations</h3>
              <p>
                Drawn from {number(data.sample.uniqueSymbols)} symbols across{" "}
                {number(data.sample.formationMonths)} formation months.
              </p>
            </article>
            <article>
              <span>{number(data.sample.completeMainlandOutcomes)}</span>
              <h3>Complete mainland outcomes</h3>
              <p>
                Formation dates with a full {data.sample.forwardHorizonMonths}
                -month forward window ran through{" "}
                {data.sample.completeOutcomeFormationEnd}.
              </p>
            </article>
            <article>
              <span>{data.sample.primaryTrailingQuarters}Q</span>
              <h3>Primary operating window</h3>
              <p>
                Cumulative operating anchors required complete history across the
                full seven-year trailing window.
              </p>
            </article>
            <article>
              <span>Median</span>
              <h3>Primary summary statistic</h3>
              <p>
                Medians reduce the influence of extreme individual outcomes in a
                long-horizon equity sample.
              </p>
            </article>
          </div>

          <div className={styles.definitionGrid}>
            <article>
              <strong>Endpoint return</strong>
              <p>{data.definitions.endpointReturn}</p>
            </article>
            <article>
              <strong>Maximum loss</strong>
              <p>{data.definitions.maxLoss}</p>
            </article>
            <article>
              <strong>Endpoint efficiency</strong>
              <p>{data.definitions.endpointEfficiency}</p>
            </article>
            <article>
              <strong>Retention</strong>
              <p>{data.definitions.retention}</p>
            </article>
          </div>

          <p className={styles.disclosure}>
            Historical research results use overlapping monthly company formation
            observations and should not be read as independent trades or a
            realizable portfolio record. They describe the cross-sectional
            behavior that supported the methodology’s design. Transaction costs,
            taxes, and individualized portfolio constraints are not modeled.
          </p>
        </div>
      </section>

      <section className={styles.close}>
        <div>
          <p className={styles.eyebrow}>From evidence to application</p>
          <h2>See where individual companies sit in the current map.</h2>
          <p>
            The platform applies the same cascade, disagreement and distance
            structure to the latest eligible U.S. operating-company universe.
          </p>
          <div className={styles.closeActions}>
            <Link href="/platform" className={styles.primaryButton}>
              Explore Platform
            </Link>
            <Link href="/methodology" className={styles.secondaryButton}>
              Read Methodology
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
