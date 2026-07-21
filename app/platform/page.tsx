'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import styles from './page.module.css'

const DATA_BASE = process.env.NEXT_PUBLIC_DATA_BASE ?? ''
const PAGE_SIZE = 40

const CASCADE_BUCKETS = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'] as const
const DISAGREEMENT_BUCKETS = [
  'Tightly Agreeing',
  'Mildly Agreeing',
  'Moderate',
  'Mildly Disagreeing',
  'Strongly Disagreeing',
] as const

const TIERS = [
  'Tier 1 — Structurally Attractive',
  'Tier 2 — Mid-Range',
  'Tier 3 — Structurally Fragile',
] as const

const ISLAND_DESCRIPTIONS: Record<string, string> = {
  'Incomplete History':
    'Not enough quarterly history is available to calculate the complete trailing framework.',
  'Cascade Eligible No-Disagreement':
    'A cascade anchor could be assigned, but too few operating anchors were valid to measure disagreement responsibly.',
  'Cascade Truly-Non-Viable':
    'None of the cascade anchors produced a positive cumulative operating value over the trailing window.',
  'Negative-EV':
    'Cash and equivalents exceed market capitalization plus debt and other claims, producing a non-positive constructed enterprise value. This is treated as a separate balance-sheet condition, not an ordinary map coordinate.',
  'Invalid EV':
    'Required enterprise-value inputs are missing or failed data-quality checks.',
}

const EXCLUSION_LABELS: Record<string, string> = {
  NON_US_DOMICILE: 'Non-U.S. domicile',
  MISSING_DOMICILE: 'Missing or ambiguous domicile',
  INELIGIBLE_CURRENCY: 'Non-USD or unresolved reporting currency',
  BELOW_MARKET_CAP_FLOOR: 'Below the $50 million market-cap floor',
  BELOW_LIQUIDITY_FLOOR: 'Below the $5 million average daily dollar-volume floor',
  MISSING_MARKET_CAP: 'Missing market capitalization',
  MISSING_LIQUIDITY: 'Missing liquidity history',
  MISSING_FUNDAMENTALS: 'Fundamentals unavailable',
  INVALID_EV: 'Invalid enterprise value',
}

type RawRecord = Record<string, unknown>
type Region = 'mainland' | 'island' | 'excluded'
type Tier = (typeof TIERS)[number]
type CascadeBucket = (typeof CASCADE_BUCKETS)[number]
type DisagreementBucket = (typeof DISAGREEMENT_BUCKETS)[number]
type RegionFilter = 'eligible' | 'mainland' | 'island' | 'excluded' | 'all'
type SortMode = 'risk' | 'marketCap' | 'ticker'

interface CompanyRecord {
  raw: RawRecord
  symbol: string
  companyName: string
  sector: string
  industry: string
  exchange: string
  country: string
  reportedCurrency: string
  region: Region
  eligibilityStatus: string
  exclusionReason: string
  islandType: string
  tier: Tier | ''
  cascadeAnchor: string
  cascadeAnchorValue: number | null
  cascadeScore: number | null
  cascadePercentile: number | null
  cascadeBucket: CascadeBucket | ''
  validAnchorCount: number | null
  disagreementScore: number | null
  disagreementBucket: DisagreementBucket | ''
  distance: number | null
  marketCap: number | null
  enterpriseValue: number | null
  totalDebt: number | null
  preferredStock: number | null
  minorityInterest: number | null
  cashAndEquivalents: number | null
  advDollar20d: number | null
  lastClose: number | null
  methodologyVersion: string
  asOfDate: string
}

interface FrameworkSummary {
  methodologyVersion?: string
  asOfDate?: string
  counts?: {
    total?: number
    eligible?: number
    mainland?: number
    island?: number
    excluded?: number
  }
}

interface SystemStats {
  methodologyVersion?: string
  asOfDate?: string
  companiesScored?: number
  mainlandCompanies?: number
  islandCompanies?: number
  structurallyFragile?: number
  excludedCandidates?: number
  publicValidationStatus?: string
}

interface PayoffStatus {
  methodologyVersion?: string
  status?: string
  categories?: unknown[]
}

interface HoverState {
  company: CompanyRecord
  x: number
  y: number
}

function pick(raw: RawRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = raw[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return null
}

function asString(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function normalizeAnchor(value: unknown): string {
  const raw = asString(value)
  const key = raw.toLowerCase().replace(/[\s-]+/g, '_')
  const labels: Record<string, string> = {
    free_cash_flow: 'Free Cash Flow',
    fcf: 'Free Cash Flow',
    ebit: 'EBIT',
    gross_profit: 'Gross Profit',
    gp: 'Gross Profit',
    revenue: 'Revenue',
  }
  return labels[key] ?? raw
}

function normalizeTier(value: unknown): Tier | '' {
  const raw = asString(value)
  return TIERS.includes(raw as Tier) ? (raw as Tier) : ''
}

function normalizeCascadeBucket(value: unknown): CascadeBucket | '' {
  const raw = asString(value)
  return CASCADE_BUCKETS.includes(raw as CascadeBucket) ? (raw as CascadeBucket) : ''
}

function normalizeDisagreementBucket(value: unknown): DisagreementBucket | '' {
  const raw = asString(value)
  return DISAGREEMENT_BUCKETS.includes(raw as DisagreementBucket)
    ? (raw as DisagreementBucket)
    : ''
}

function normalizeCompany(raw: RawRecord): CompanyRecord | null {
  const symbol = asString(pick(raw, 'symbol', 'id')).toUpperCase()
  if (!symbol) return null

  const eligibilityStatus = asString(
    pick(raw, 'eligibility_status', 'eligibilityStatus'),
  ).toLowerCase()
  const islandType = asString(
    pick(raw, 'island_type', 'islandType', 'specialCohort', 'special_cohort'),
  )
  const explicitRegion = asString(
    pick(raw, 'classification_region', 'classificationRegion', 'region_type', 'regionType'),
  ).toLowerCase()

  let region: Region
  if (explicitRegion === 'mainland' || explicitRegion === 'island' || explicitRegion === 'excluded') {
    region = explicitRegion
  } else if (eligibilityStatus === 'excluded') {
    region = 'excluded'
  } else if (islandType) {
    region = 'island'
  } else {
    region = 'mainland'
  }

  const evComponents =
    raw.evComponents && typeof raw.evComponents === 'object'
      ? (raw.evComponents as RawRecord)
      : {}

  return {
    raw,
    symbol,
    companyName: asString(pick(raw, 'company_name', 'companyName', 'name')) || symbol,
    sector: asString(pick(raw, 'sector')) || 'Unclassified',
    industry: asString(pick(raw, 'industry')),
    exchange: asString(pick(raw, 'exchange')),
    country: asString(pick(raw, 'country')),
    reportedCurrency: asString(pick(raw, 'reported_currency', 'reportedCurrency')),
    region,
    eligibilityStatus: eligibilityStatus || (region === 'excluded' ? 'excluded' : 'eligible'),
    exclusionReason: asString(pick(raw, 'exclusion_reason', 'exclusionReason')),
    islandType,
    tier: normalizeTier(pick(raw, 'tier')),
    cascadeAnchor: normalizeAnchor(pick(raw, 'cascade_anchor', 'cascadeAnchor')),
    cascadeAnchorValue: asNumber(
      pick(raw, 'cascade_anchor_value', 'cascadeAnchorValue'),
    ),
    cascadeScore: asNumber(pick(raw, 'cascade_score', 'cascadeScore')),
    cascadePercentile: asNumber(
      pick(raw, 'cascade_percentile', 'cascadePercentile'),
    ),
    cascadeBucket: normalizeCascadeBucket(
      pick(raw, 'cascade_bucket', 'cascadeBucket'),
    ),
    validAnchorCount: asNumber(
      pick(raw, 'valid_anchor_count', 'validAnchorCount', 'n_valid_anchors', 'nValidAnchors'),
    ),
    disagreementScore: asNumber(
      pick(raw, 'disagreement_score', 'disagreementScore', 'disagreement_std', 'disagreementStd'),
    ),
    disagreementBucket: normalizeDisagreementBucket(
      pick(raw, 'disagreement_bucket', 'disagreementBucket'),
    ),
    distance: asNumber(pick(raw, 'distance', 'distance_from_peak', 'distanceFromPeak')),
    marketCap: asNumber(pick(raw, 'market_cap', 'marketCap')),
    enterpriseValue: asNumber(pick(raw, 'enterprise_value', 'enterpriseValue', 'ev')),
    totalDebt: asNumber(
      pick(raw, 'total_debt', 'totalDebt') ?? pick(evComponents, 'totalDebt', 'total_debt'),
    ),
    preferredStock: asNumber(
      pick(raw, 'preferred_stock', 'preferredStock') ?? pick(evComponents, 'preferredStock', 'preferred_stock'),
    ),
    minorityInterest: asNumber(
      pick(raw, 'minority_interest', 'minorityInterest') ?? pick(evComponents, 'minorityInterest', 'minority_interest'),
    ),
    cashAndEquivalents: asNumber(
      pick(raw, 'cash_and_equivalents', 'cashAndEquivalents') ??
        pick(evComponents, 'cashAndEquivalents', 'cash_and_equivalents'),
    ),
    advDollar20d: asNumber(pick(raw, 'adv_dollar_20d', 'advDollar20d')),
    lastClose: asNumber(pick(raw, 'last_close', 'lastClose', 'price')),
    methodologyVersion: asString(
      pick(raw, 'methodology_version', 'methodologyVersion'),
    ),
    asOfDate: asString(pick(raw, 'as_of_date', 'asOfDate')),
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function formatInteger(value: number | null | undefined): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.round(value).toLocaleString('en-US')
    : '—'
}

function formatMoney(value: number | null | undefined, compact = true): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  if (!compact) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }
  const abs = Math.abs(value)
  const sign = value < 0 ? '−' : ''
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`
  return `${sign}$${abs.toFixed(0)}`
}

function ordinal(value: number): string {
  const remainder100 = value % 100
  if (remainder100 >= 11 && remainder100 <= 13) return `${value}th`
  const remainder10 = value % 10
  if (remainder10 === 1) return `${value}st`
  if (remainder10 === 2) return `${value}nd`
  if (remainder10 === 3) return `${value}rd`
  return `${value}th`
}

function formatPercentile(value: number | null): string {
  if (value === null) return '—'
  const normalized = value <= 1 ? value : value / 100
  return `${ordinal(Math.round(clamp01(normalized) * 100))} pct.`
}

function formatScore(value: number | null, digits = 3): string {
  return value === null ? '—' : value.toFixed(digits)
}

function tierClass(tier: Tier | ''): string {
  if (tier.startsWith('Tier 1')) return styles.tier1
  if (tier.startsWith('Tier 2')) return styles.tier2
  if (tier.startsWith('Tier 3')) return styles.tier3
  return styles.neutralBadge
}

function tierShort(tier: Tier | ''): string {
  if (tier.startsWith('Tier 1')) return 'Tier 1'
  if (tier.startsWith('Tier 2')) return 'Tier 2'
  if (tier.startsWith('Tier 3')) return 'Tier 3'
  return '—'
}

function classificationLabel(company: CompanyRecord): string {
  if (company.region === 'mainland') return company.tier || 'Mainland'
  if (company.region === 'island') return company.islandType || 'Special cohort'
  return 'Excluded from scoring'
}

function companyInterpretation(company: CompanyRecord): string {
  if (company.region === 'excluded') {
    return 'This security remains visible for auditability, but it is outside the scored launch universe because it failed one or more eligibility checks.'
  }
  if (company.region === 'island') {
    return (
      ISLAND_DESCRIPTIONS[company.islandType] ??
      'This company cannot be placed responsibly on both mainland axes, so OSMR keeps it in a separate analytical cohort.'
    )
  }
  if (company.tier.startsWith('Tier 1')) {
    return 'This company sits close to the OSMR reference region: its operating anchors agree relatively closely and its cascade valuation is not displaced toward the structural extremes.'
  }
  if (company.tier.startsWith('Tier 3')) {
    return 'This company sits far from the OSMR reference region because valuation, operating-anchor disagreement, or both are elevated. This is a structural condition, not a short-term price prediction.'
  }
  return 'This company occupies the broad middle of the OSMR map. One or both structural dimensions are displaced from the reference region, but not enough to place it in the most fragile tier.'
}

function exclusionReasons(reason: string): string[] {
  if (!reason) return []
  return reason
    .split('|')
    .map((code) => code.trim())
    .filter(Boolean)
    .map((code) => EXCLUSION_LABELS[code] ?? code.replaceAll('_', ' ').toLowerCase())
}

function anchorHistory(raw: RawRecord, prefixes: string[]): Array<number | null> {
  const values: Array<number | null> = []
  for (let quarter = 28; quarter >= 1; quarter -= 1) {
    let found: number | null = null
    for (const prefix of prefixes) {
      const value = asNumber(raw[`${prefix}${quarter}`])
      if (value !== null) {
        found = value
        break
      }
    }
    values.push(found)
  }
  return values
}

interface AnchorRankDetail {
  key: string
  label: string
  rank: number
  cumulative: number | null
}

function anchorRankDetails(raw: RawRecord): AnchorRankDetail[] {
  const anchors = raw.anchors
  if (!anchors || typeof anchors !== 'object') return []

  const details: AnchorRankDetail[] = []
  for (const [key, value] of Object.entries(anchors as RawRecord)) {
    if (!value || typeof value !== 'object') continue
    const record = value as RawRecord
    const rankRaw = asNumber(pick(record, 'valuationRank', 'valuation_rank'))
    const complete = record.complete === undefined ? rankRaw !== null : Boolean(record.complete)
    if (!complete || rankRaw === null) continue
    details.push({
      key,
      label: asString(pick(record, 'label')) || normalizeAnchor(key),
      rank: clamp01(rankRaw <= 1 ? rankRaw : rankRaw / 100),
      cumulative: asNumber(pick(record, 'cumulative')),
    })
  }
  return details.sort((a, b) => a.rank - b.rank)
}

function classificationDriver(company: CompanyRecord): string {
  const cascadePosition = CASCADE_BUCKETS.indexOf(company.cascadeBucket as CascadeBucket) + 1
  const disagreementPosition = DISAGREEMENT_BUCKETS.indexOf(
    company.disagreementBucket as DisagreementBucket,
  ) + 1
  if (cascadePosition <= 0 || disagreementPosition <= 0) return 'Insufficient axis data'
  const cascadeDisplacement = Math.abs(cascadePosition - 3)
  const disagreementDisplacement = disagreementPosition - 1
  if (disagreementDisplacement > cascadeDisplacement) return 'Anchor disagreement'
  if (cascadeDisplacement > disagreementDisplacement) return 'Cascade valuation'
  return 'Both structural dimensions'
}

function Sparkline({ values }: { values: Array<number | null> }) {
  const W = 280
  const H = 72
  const PAD = 5
  const numeric = values.filter((value): value is number => value !== null)
  if (numeric.length < 2) return <div className={styles.noHistory}>History unavailable</div>

  const min = Math.min(...numeric, 0)
  const max = Math.max(...numeric, 0)
  const range = max - min || 1
  const x = (index: number) => PAD + (index / Math.max(1, values.length - 1)) * (W - PAD * 2)
  const y = (value: number) => PAD + ((max - value) / range) * (H - PAD * 2)
  const points = values
    .map((value, index) => (value === null ? null : `${x(index)},${y(value)}`))
    .filter(Boolean)
    .join(' ')
  const zeroY = y(0)

  return (
    <svg className={styles.sparkline} viewBox={`0 0 ${W} ${H}`} role="img">
      <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} className={styles.sparkZero} />
      <polyline points={points} className={styles.sparkPath} />
    </svg>
  )
}

function hashSymbol(symbol: string): number {
  let hash = 2166136261
  for (let index = 0; index < symbol.length; index += 1) {
    hash ^= symbol.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) / 4294967295
}

function lowerBound(sorted: number[], value: number): number {
  let low = 0
  let high = sorted.length
  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    if (sorted[middle] < value) low = middle + 1
    else high = middle
  }
  return low
}

function bucketCenter<T extends readonly string[]>(value: string, order: T): number {
  const index = order.indexOf(value as T[number])
  return index >= 0 ? (index + 0.5) / order.length : 0.5
}

function pointRadius(marketCap: number | null, minCap: number, maxCap: number): number {
  if (marketCap === null || minCap <= 0 || maxCap <= minCap) return 3
  const value = Math.max(minCap, Math.min(maxCap, marketCap))
  const scaled = (Math.log(value) - Math.log(minCap)) / (Math.log(maxCap) - Math.log(minCap))
  return 2.2 + clamp01(scaled) * 3.8
}

function MarketMap({
  companies,
  selectedSymbol,
  onSelect,
}: {
  companies: CompanyRecord[]
  selectedSymbol: string
  onSelect: (company: CompanyRecord) => void
}) {
  const [hover, setHover] = useState<HoverState | null>(null)
  const mainland = useMemo(
    () => companies.filter((company) => company.region === 'mainland'),
    [companies],
  )
  const disagreementScores = useMemo(
    () =>
      mainland
        .map((company) => company.disagreementScore)
        .filter((value): value is number => value !== null)
        .sort((a, b) => a - b),
    [mainland],
  )
  const caps = useMemo(
    () =>
      mainland
        .map((company) => company.marketCap)
        .filter((value): value is number => value !== null && value > 0)
        .sort((a, b) => a - b),
    [mainland],
  )

  const minCap = caps[Math.floor(caps.length * 0.05)] ?? 50_000_000
  const maxCap = caps[Math.floor(caps.length * 0.95)] ?? 2_000_000_000_000

  const W = 1000
  const H = 620
  const LEFT = 172
  const TOP = 42
  const PLOT_W = 752
  const PLOT_H = 500

  const plotted = mainland.map((company) => {
    const cascadePct =
      company.cascadePercentile !== null
        ? clamp01(company.cascadePercentile <= 1 ? company.cascadePercentile : company.cascadePercentile / 100)
        : bucketCenter(company.cascadeBucket, CASCADE_BUCKETS)
    const disagreementPct =
      company.disagreementScore !== null && disagreementScores.length > 1
        ? lowerBound(disagreementScores, company.disagreementScore) /
          (disagreementScores.length - 1)
        : bucketCenter(company.disagreementBucket, DISAGREEMENT_BUCKETS)
    const hash = hashSymbol(company.symbol)
    const jitterX = (hash - 0.5) * 5
    const jitterY = (((hash * 997) % 1) - 0.5) * 5
    return {
      company,
      cx: LEFT + cascadePct * PLOT_W + jitterX,
      cy: TOP + (1 - disagreementPct) * PLOT_H + jitterY,
      radius: pointRadius(company.marketCap, minCap, maxCap),
    }
  })

  function updateHover(event: React.MouseEvent<SVGCircleElement>, company: CompanyRecord) {
    const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect()
    if (!bounds) return
    setHover({
      company,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    })
  }

  return (
    <div className={styles.mapFrame}>
      <div className={styles.mapHeadingRow}>
        <div>
          <p className={styles.eyebrow}>Mainland structural map</p>
          <h2>Where valuation and operating evidence diverge</h2>
        </div>
        <div className={styles.mapCount}>{formatInteger(mainland.length)} {mainland.length === 1 ? 'company' : 'companies'} shown</div>
      </div>

      <div className={styles.mapCanvas}>
        <svg className={styles.mapSvg} viewBox={`0 0 ${W} ${H}`} aria-label="OSMR structural map">
          <rect x={LEFT} y={TOP} width={PLOT_W} height={PLOT_H} className={styles.plotBackground} />

          {Array.from({ length: 6 }, (_, index) => {
            const x = LEFT + (index / 5) * PLOT_W
            const y = TOP + (index / 5) * PLOT_H
            return (
              <g key={index}>
                <line x1={x} y1={TOP} x2={x} y2={TOP + PLOT_H} className={styles.gridLine} />
                <line x1={LEFT} y1={y} x2={LEFT + PLOT_W} y2={y} className={styles.gridLine} />
              </g>
            )
          })}

          <rect
            x={LEFT + PLOT_W * 0.4}
            y={TOP + PLOT_H * 0.8}
            width={PLOT_W * 0.2}
            height={PLOT_H * 0.2}
            className={styles.referenceCell}
          />
          <text
            x={LEFT + PLOT_W * 0.5}
            y={TOP + PLOT_H * 0.8 + 18}
            textAnchor="middle"
            className={styles.referenceLabel}
          >
            REFERENCE REGION
          </text>

          {CASCADE_BUCKETS.map((bucket, index) => (
            <text
              key={bucket}
              x={LEFT + ((index + 0.5) / 5) * PLOT_W}
              y={TOP + PLOT_H + 28}
              textAnchor="middle"
              className={styles.axisTick}
            >
              {bucket}
            </text>
          ))}

          {DISAGREEMENT_BUCKETS.map((bucket, index) => (
            <text
              key={bucket}
              x={LEFT - 14}
              y={TOP + PLOT_H - ((index + 0.5) / 5) * PLOT_H}
              textAnchor="end"
              dominantBaseline="middle"
              className={styles.axisTick}
            >
              {bucket}
            </text>
          ))}

          <text
            x={LEFT + PLOT_W / 2}
            y={H - 12}
            textAnchor="middle"
            className={styles.axisTitle}
          >
            CASCADE VALUATION — LOWER TO HIGHER
          </text>
          <text
            x={20}
            y={TOP + PLOT_H / 2}
            textAnchor="middle"
            className={styles.axisTitle}
            transform={`rotate(-90 20 ${TOP + PLOT_H / 2})`}
          >
            ANCHOR DISAGREEMENT — LOWER TO HIGHER
          </text>

          {plotted.map(({ company, cx, cy, radius }) => {
            const selected = company.symbol === selectedSymbol
            return (
              <g key={company.symbol}>
                {selected && (
                  <circle cx={cx} cy={cy} r={radius + 4} className={styles.selectedRing} />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  className={`${styles.mapPoint} ${tierClass(company.tier)}`}
                  tabIndex={0}
                  aria-label={`${company.symbol}, ${company.companyName}, ${company.tier}`}
                  onMouseEnter={(event) => updateHover(event, company)}
                  onMouseMove={(event) => updateHover(event, company)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover({ company, x: cx, y: cy })}
                  onBlur={() => setHover(null)}
                  onClick={() => onSelect(company)}
                />
              </g>
            )
          })}
        </svg>

        {hover && (
          <div
            className={styles.mapTooltip}
            style={{
              left: `${Math.min(hover.x + 14, 760)}px`,
              top: `${Math.max(hover.y - 24, 10)}px`,
            }}
          >
            <strong>{hover.company.symbol}</strong>
            <span>{hover.company.companyName}</span>
            <small>{classificationLabel(hover.company)}</small>
            <small>
              {hover.company.cascadeBucket || '—'} cascade ·{' '}
              {hover.company.disagreementBucket || '—'}
            </small>
          </div>
        )}
      </div>

      <div className={styles.legendRow}>
        <span><i className={`${styles.legendDot} ${styles.tier1}`} />Tier 1 — near the reference region</span>
        <span><i className={`${styles.legendDot} ${styles.tier2}`} />Tier 2 — mid-range displacement</span>
        <span><i className={`${styles.legendDot} ${styles.tier3}`} />Tier 3 — structurally fragile</span>
        <span className={styles.legendNote}>Dot size reflects market capitalization.</span>
      </div>
    </div>
  )
}

function CompanyDetail({
  company,
  saved,
  onToggleSaved,
  onClose,
}: {
  company: CompanyRecord
  saved: boolean
  onToggleSaved: () => void
  onClose: () => void
}) {
  const { isSignedIn } = useUser()
  const histories = [
    { label: 'Revenue', values: anchorHistory(company.raw, ['rev_q', 'revenue_q']) },
    { label: 'Gross profit', values: anchorHistory(company.raw, ['gp_q', 'gross_profit_q']) },
    { label: 'EBIT', values: anchorHistory(company.raw, ['ebit_q']) },
    { label: 'Free cash flow', values: anchorHistory(company.raw, ['fcf_q', 'free_cash_flow_q']) },
  ]
  const reasons = exclusionReasons(company.exclusionReason)
  const anchorRanks = anchorRankDetails(company.raw)
  const cheapestAnchor = anchorRanks[0] ?? null
  const richestAnchor = anchorRanks[anchorRanks.length - 1] ?? null
  const rankSpread =
    cheapestAnchor && richestAnchor ? (richestAnchor.rank - cheapestAnchor.rank) * 100 : null

  return (
    <aside className={styles.detailPanel} aria-label={`${company.symbol} details`}>
      <div className={styles.detailTopRow}>
        <div>
          <p className={styles.eyebrow}>Company detail</p>
          <div className={styles.companyTitleLine}>
            <h2>{company.symbol}</h2>
            <span className={`${styles.badge} ${tierClass(company.tier)}`}>
              {company.region === 'mainland' ? tierShort(company.tier) : company.region}
            </span>
          </div>
          <p className={styles.companyName}>{company.companyName}</p>
          <p className={styles.companyMeta}>
            {[company.exchange, company.sector, company.industry].filter(Boolean).join(' · ')}
          </p>
        </div>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close company detail">×</button>
      </div>

      <div className={styles.detailActions}>
        {isSignedIn ? (
          <button className={styles.primaryButton} onClick={onToggleSaved}>
            {saved ? 'Remove from saved' : 'Save company'}
          </button>
        ) : (
          <SignInButton mode="modal">
            <button className={styles.primaryButton}>Sign in to save</button>
          </SignInButton>
        )}
      </div>

      <section className={styles.interpretationBox}>
        <h3>{classificationLabel(company)}</h3>
        <p>{companyInterpretation(company)}</p>
      </section>

      {reasons.length > 0 && (
        <section className={styles.detailSection}>
          <h3>Why this company is excluded</h3>
          <ul className={styles.reasonList}>
            {reasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        </section>
      )}

      <section className={styles.detailSection}>
        <h3>OSMR classification</h3>
        <dl className={styles.detailGrid}>
          <div><dt>Region</dt><dd>{company.region}</dd></div>
          <div><dt>Special cohort</dt><dd>{company.islandType || '—'}</dd></div>
          <div><dt>Cascade anchor</dt><dd>{company.cascadeAnchor || '—'}</dd></div>
          <div><dt>Anchor value</dt><dd>{formatMoney(company.cascadeAnchorValue)}</dd></div>
          <div><dt>Cascade position</dt><dd>{company.cascadeBucket || '—'}</dd></div>
          <div><dt>Cascade percentile</dt><dd>{formatPercentile(company.cascadePercentile)}</dd></div>
          <div><dt>Anchor agreement</dt><dd>{company.disagreementBucket || '—'}</dd></div>
          <div><dt>Disagreement score</dt><dd>{formatScore(company.disagreementScore)}</dd></div>
          <div><dt>Valid anchors</dt><dd>{formatInteger(company.validAnchorCount)}</dd></div>
          <div><dt>Distance</dt><dd>{formatInteger(company.distance)}</dd></div>
        </dl>
      </section>

      {company.region === 'mainland' && anchorRanks.length >= 2 && (
        <section className={styles.detailSection}>
          <h3>Why this classification?</h3>
          <div className={styles.driverSummary}>
            <div><span>Primary driver</span><strong>{classificationDriver(company)}</strong></div>
            <div><span>Lowest valuation rank</span><strong>{cheapestAnchor?.label} · {formatPercentile(cheapestAnchor?.rank ?? null)}</strong></div>
            <div><span>Highest valuation rank</span><strong>{richestAnchor?.label} · {formatPercentile(richestAnchor?.rank ?? null)}</strong></div>
            <div><span>Anchor-rank spread</span><strong>{rankSpread === null ? '—' : `${rankSpread.toFixed(0)} percentage points`}</strong></div>
          </div>
          <div className={styles.anchorRankList}>
            {anchorRanks.map((anchor) => (
              <div className={styles.anchorRankRow} key={anchor.key}>
                <div className={styles.anchorRankLabel}>
                  <span>{anchor.label}</span>
                  <strong>{formatPercentile(anchor.rank)}</strong>
                </div>
                <div className={styles.anchorRankTrack}>
                  <span style={{ width: `${Math.max(1.5, anchor.rank * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className={styles.rankNote}>
            These ranks show how the company’s valuation looks through each valid operating anchor. A wide spread means the anchors imply materially different valuation assessments.
          </p>
        </section>
      )}

      <section className={styles.detailSection}>
        <h3>Market and enterprise value</h3>
        <dl className={styles.detailGrid}>
          <div><dt>Last close</dt><dd>{company.lastClose === null ? '—' : `$${company.lastClose.toFixed(2)}`}</dd></div>
          <div><dt>Market cap</dt><dd>{formatMoney(company.marketCap)}</dd></div>
          <div><dt>Enterprise value</dt><dd>{formatMoney(company.enterpriseValue)}</dd></div>
          <div><dt>20-day dollar volume</dt><dd>{formatMoney(company.advDollar20d)}</dd></div>
          <div><dt>Total debt</dt><dd>{formatMoney(company.totalDebt)}</dd></div>
          <div><dt>Cash & equivalents</dt><dd>{formatMoney(company.cashAndEquivalents)}</dd></div>
          <div><dt>Preferred stock</dt><dd>{formatMoney(company.preferredStock)}</dd></div>
          <div><dt>Minority interest</dt><dd>{formatMoney(company.minorityInterest)}</dd></div>
        </dl>
      </section>

      {histories.some(({ values }) => values.some((value) => value !== null)) && (
        <section className={styles.detailSection}>
          <div className={styles.sectionTitleRow}>
            <h3>Quarterly operating history</h3>
            <span>Oldest → newest · up to 28 quarters</span>
          </div>
          <div className={styles.historyGrid}>
            {histories.map(({ label, values }) => {
              const latest = [...values].reverse().find((value) => value !== null) ?? null
              return (
                <div className={styles.historyCard} key={label}>
                  <div className={styles.historyHeader}>
                    <span>{label}</span>
                    <strong>{formatMoney(latest)}</strong>
                  </div>
                  <Sparkline values={values} />
                </div>
              )
            })}
          </div>
        </section>
      )}

      <p className={styles.detailFootnote}>
        OSMR describes current structural conditions. It is not a price target or a prediction of future returns.
      </p>
    </aside>
  )
}

export default function PlatformPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [companies, setCompanies] = useState<CompanyRecord[]>([])
  const [framework, setFramework] = useState<FrameworkSummary | null>(null)
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [payoff, setPayoff] = useState<PayoffStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('eligible')
  const [tierFilter, setTierFilter] = useState('all')
  const [anchorFilter, setAnchorFilter] = useState('all')
  const [cascadeFilter, setCascadeFilter] = useState('all')
  const [disagreementFilter, setDisagreementFilter] = useState('all')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [sortMode, setSortMode] = useState<SortMode>('risk')
  const [savedOnly, setSavedOnly] = useState(false)
  const [savedSymbols, setSavedSymbols] = useState<Set<string>>(new Set())
  const [selectedCompany, setSelectedCompany] = useState<CompanyRecord | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false

    async function loadPlatform() {
      setLoading(true)
      setError('')
      try {
        const [snapshotResponse, frameworkResponse, statsResponse, payoffResponse] =
          await Promise.all([
            fetch(`${DATA_BASE}/data/osmr_snapshot.json`),
            fetch(`${DATA_BASE}/data/osmr_framework_summary.json`),
            fetch(`${DATA_BASE}/data/key_system_stats.json`),
            fetch(`${DATA_BASE}/data/osmr_payoff_terrain.json`),
          ])

        if (!snapshotResponse.ok) throw new Error('The OSMR snapshot could not be loaded.')

        const rawSnapshot = (await snapshotResponse.json()) as RawRecord[]
        const normalized = rawSnapshot
          .map(normalizeCompany)
          .filter((company): company is CompanyRecord => company !== null)

        const nextFramework = frameworkResponse.ok
          ? ((await frameworkResponse.json()) as FrameworkSummary)
          : null
        const nextStats = statsResponse.ok
          ? ((await statsResponse.json()) as SystemStats)
          : null
        const nextPayoff = payoffResponse.ok
          ? ((await payoffResponse.json()) as PayoffStatus)
          : null

        if (!cancelled) {
          setCompanies(normalized)
          setFramework(nextFramework)
          setStats(nextStats)
          setPayoff(nextPayoff)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'The platform could not be loaded.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPlatform()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) {
      setSavedSymbols(new Set())
      setSavedOnly(false)
      return
    }
    const key = `tcs-osmr-saved:${user.id}`
    try {
      const parsed = JSON.parse(localStorage.getItem(key) ?? '[]') as string[]
      setSavedSymbols(new Set(parsed))
    } catch {
      setSavedSymbols(new Set())
    }
  }, [isLoaded, isSignedIn, user?.id])

  const sectors = useMemo(
    () =>
      Array.from(new Set(companies.map((company) => company.sector).filter(Boolean))).sort(),
    [companies],
  )
  const anchors = useMemo(
    () =>
      Array.from(new Set(companies.map((company) => company.cascadeAnchor).filter(Boolean))).sort(),
    [companies],
  )

  const counts = useMemo(() => {
    const eligible = companies.filter((company) => company.region !== 'excluded').length
    const mainland = companies.filter((company) => company.region === 'mainland').length
    const island = companies.filter((company) => company.region === 'island').length
    const excluded = companies.filter((company) => company.region === 'excluded').length
    const fragile = companies.filter(
      (company) => company.region === 'mainland' && company.tier.startsWith('Tier 3'),
    ).length
    return {
      total: framework?.counts?.total ?? companies.length,
      eligible: framework?.counts?.eligible ?? stats?.companiesScored ?? eligible,
      mainland: framework?.counts?.mainland ?? stats?.mainlandCompanies ?? mainland,
      island: framework?.counts?.island ?? stats?.islandCompanies ?? island,
      excluded: framework?.counts?.excluded ?? stats?.excludedCandidates ?? excluded,
      fragile: stats?.structurallyFragile ?? fragile,
    }
  }, [companies, framework, stats])

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = companies.filter((company) => {
      if (regionFilter === 'eligible' && company.region === 'excluded') return false
      if (regionFilter !== 'eligible' && regionFilter !== 'all' && company.region !== regionFilter) return false
      if (tierFilter !== 'all' && company.tier !== tierFilter) return false
      if (anchorFilter !== 'all' && company.cascadeAnchor !== anchorFilter) return false
      if (cascadeFilter !== 'all' && company.cascadeBucket !== cascadeFilter) return false
      if (disagreementFilter !== 'all' && company.disagreementBucket !== disagreementFilter) return false
      if (sectorFilter !== 'all' && company.sector !== sectorFilter) return false
      if (savedOnly && !savedSymbols.has(company.symbol)) return false
      if (
        query &&
        !company.symbol.toLowerCase().includes(query) &&
        !company.companyName.toLowerCase().includes(query)
      ) return false
      return true
    })

    return filtered.sort((a, b) => {
      if (sortMode === 'ticker') return a.symbol.localeCompare(b.symbol)
      if (sortMode === 'marketCap') return (b.marketCap ?? -Infinity) - (a.marketCap ?? -Infinity)
      const regionRank: Record<Region, number> = { mainland: 0, island: 1, excluded: 2 }
      if (regionRank[a.region] !== regionRank[b.region]) return regionRank[a.region] - regionRank[b.region]
      return (b.distance ?? -1) - (a.distance ?? -1) || a.symbol.localeCompare(b.symbol)
    })
  }, [
    companies,
    search,
    regionFilter,
    tierFilter,
    anchorFilter,
    cascadeFilter,
    disagreementFilter,
    sectorFilter,
    savedOnly,
    savedSymbols,
    sortMode,
  ])

  useEffect(() => {
    setPage(1)
  }, [
    search,
    regionFilter,
    tierFilter,
    anchorFilter,
    cascadeFilter,
    disagreementFilter,
    sectorFilter,
    savedOnly,
    sortMode,
  ])

  const pageCount = Math.max(1, Math.ceil(filteredCompanies.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visibleRows = filteredCompanies.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const islandCounts = useMemo(() => {
    const countsByType = new Map<string, number>()
    for (const company of companies) {
      if (company.region !== 'island') continue
      const key = company.islandType || 'Other special cohort'
      countsByType.set(key, (countsByType.get(key) ?? 0) + 1)
    }
    return Array.from(countsByType.entries()).sort((a, b) => b[1] - a[1])
  }, [companies])

  const asOfDate = stats?.asOfDate || framework?.asOfDate || companies[0]?.asOfDate || '—'
  const methodologyVersion =
    stats?.methodologyVersion ||
    framework?.methodologyVersion ||
    companies[0]?.methodologyVersion ||
    '—'
  const validationPending =
    stats?.publicValidationStatus !== 'available' ||
    payoff?.status === 'validation_not_yet_published' ||
    !payoff?.categories?.length

  function toggleSaved(symbol: string) {
    if (!isSignedIn || !user?.id) return
    const next = new Set(savedSymbols)
    if (next.has(symbol)) next.delete(symbol)
    else next.add(symbol)
    setSavedSymbols(next)
    localStorage.setItem(`tcs-osmr-saved:${user.id}`, JSON.stringify(Array.from(next)))
  }

  function resetFilters() {
    setSearch('')
    setRegionFilter('eligible')
    setTierFilter('all')
    setAnchorFilter('all')
    setCascadeFilter('all')
    setDisagreementFilter('all')
    setSectorFilter('all')
    setSavedOnly(false)
    setSortMode('risk')
  }

  if (loading || !isLoaded) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.loadingMark} />
          <p>Loading the OSMR universe…</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className={styles.page}>
        <div className={styles.errorState}>
          <h1>Platform data unavailable</h1>
          <p>{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label="The Capital Steward home">
            <span>The Capital</span>
            <strong>Steward</strong>
          </Link>
          <nav className={styles.nav} aria-label="Platform navigation">
            <Link href="/platform" className={styles.activeNav}>Platform</Link>
            <Link href="/methodology">Methodology</Link>
            <Link href="/evidence">Evidence</Link>
            <Link href="/about">About</Link>
          </nav>
          <div className={styles.accountArea}>
            {isSignedIn ? (
              <>
                <span className={styles.savedCount}>{savedSymbols.size} saved</span>
                <UserButton />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className={styles.signInButton}>Sign in</button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Operational Structural Mispricing Risk</p>
          <h1>A structural map of the U.S. equity market.</h1>
          <p>
            OSMR compares the market value assigned to a company with the operating evidence supporting that value. The map shows where valuation sits, how closely operating anchors agree, and which companies cannot be placed responsibly on both dimensions.
          </p>
        </div>
        <div className={styles.heroMeta}>
          <div><span>As of</span><strong>{asOfDate}</strong></div>
          <div><span>Methodology</span><strong>{methodologyVersion}</strong></div>
          <div><span>Coverage</span><strong>U.S. · USD · Liquid</strong></div>
        </div>
      </section>

      <section className={styles.orientation} aria-label="How to read OSMR">
        <article>
          <span>01</span>
          <h2>Cascade valuation</h2>
          <p>Measures how expensive the company is relative to the deepest positive operating anchor it can support.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Anchor disagreement</h2>
          <p>Measures how strongly the company’s operating signals disagree with one another. Greater disagreement means less structural coherence.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Distance and tier</h2>
          <p>Combines both dimensions by measuring distance from Moderate Cascade × Tightly Agreeing—the framework’s reference region.</p>
        </article>
        <article>
          <span>04</span>
          <h2>Special cohorts</h2>
          <p>Companies that cannot be placed honestly on both axes remain visible as islands rather than being forced into the mainland map.</p>
        </article>
      </section>

      <section className={styles.summaryGrid} aria-label="Current universe summary">
        <article><span>Score-eligible</span><strong>{formatInteger(counts.eligible)}</strong><small>Mainland plus special cohorts</small></article>
        <article><span>Mainland</span><strong>{formatInteger(counts.mainland)}</strong><small>Companies located on both axes</small></article>
        <article><span>Special cohorts</span><strong>{formatInteger(counts.island)}</strong><small>Visible outside the mainland map</small></article>
        <article className={styles.fragileCard}><span>Structurally fragile</span><strong>{formatInteger(counts.fragile)}</strong><small>Tier 3 mainland companies</small></article>
      </section>

      {validationPending && (
        <section className={styles.validationBanner}>
          <div>
            <strong>Historical cohort evidence is being regenerated under OSMR v2.</strong>
            <p>Current classifications are available. V2 payoff statistics are not yet published, so the platform does not display legacy return claims.</p>
          </div>
          <Link href="/methodology">Review methodology</Link>
        </section>
      )}

      <section className={styles.mapAndDetail}>
        <MarketMap
          companies={filteredCompanies}
          selectedSymbol={selectedCompany?.symbol ?? ''}
          onSelect={setSelectedCompany}
        />
        {selectedCompany && (
          <CompanyDetail
            company={selectedCompany}
            saved={savedSymbols.has(selectedCompany.symbol)}
            onToggleSaved={() => toggleSaved(selectedCompany.symbol)}
            onClose={() => setSelectedCompany(null)}
          />
        )}
      </section>

      <section className={styles.islandsSection}>
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.eyebrow}>Special cohorts</p>
            <h2>Companies the mainland map cannot describe honestly</h2>
          </div>
          <p>These are analytical exceptions, not automatically favorable or unfavorable classifications.</p>
        </div>
        <div className={styles.islandGrid}>
          {islandCounts.map(([type, count]) => (
            <button
              key={type}
              className={styles.islandCard}
              onClick={() => {
                setRegionFilter('island')
                setSearch('')
                setTierFilter('all')
                setAnchorFilter('all')
                setCascadeFilter('all')
                setDisagreementFilter('all')
                setSectorFilter('all')
                const match = companies.find((company) => company.islandType === type)
                if (match) setSelectedCompany(match)
                document.getElementById('company-explorer')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <span>{formatInteger(count)}</span>
              <strong>{type}</strong>
              <p>{ISLAND_DESCRIPTIONS[type] ?? 'A company outside the ordinary two-axis map.'}</p>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.explorer} id="company-explorer">
        <div className={styles.sectionIntro}>
          <div>
            <p className={styles.eyebrow}>Company explorer</p>
            <h2>Search, filter, and inspect the full candidate universe</h2>
          </div>
          <p>
            Browsing is public. Sign in only when you want to save companies. Excluded candidates remain visible with their reasons.
          </p>
        </div>

        <div className={styles.filterPanel}>
          <label className={styles.searchField}>
            <span>Company or ticker</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search AAPL or Apple"
            />
          </label>

          <label><span>Universe view</span><select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value as RegionFilter)}><option value="eligible">Score-eligible</option><option value="mainland">Mainland only</option><option value="island">Special cohorts</option><option value="excluded">Excluded candidates</option><option value="all">All candidates</option></select></label>
          <label><span>Tier</span><select value={tierFilter} onChange={(event) => setTierFilter(event.target.value)}><option value="all">All tiers</option>{TIERS.map((tier) => <option key={tier} value={tier}>{tierShort(tier)}</option>)}</select></label>
          <label><span>Cascade anchor</span><select value={anchorFilter} onChange={(event) => setAnchorFilter(event.target.value)}><option value="all">All anchors</option>{anchors.map((anchor) => <option key={anchor} value={anchor}>{anchor}</option>)}</select></label>
          <label><span>Cascade position</span><select value={cascadeFilter} onChange={(event) => setCascadeFilter(event.target.value)}><option value="all">All positions</option>{CASCADE_BUCKETS.map((bucket) => <option key={bucket} value={bucket}>{bucket}</option>)}</select></label>
          <label><span>Anchor agreement</span><select value={disagreementFilter} onChange={(event) => setDisagreementFilter(event.target.value)}><option value="all">All agreement levels</option>{DISAGREEMENT_BUCKETS.map((bucket) => <option key={bucket} value={bucket}>{bucket}</option>)}</select></label>
          <label><span>Sector</span><select value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)}><option value="all">All sectors</option>{sectors.map((sector) => <option key={sector} value={sector}>{sector}</option>)}</select></label>
          <label><span>Sort</span><select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}><option value="risk">Structural concern</option><option value="marketCap">Market cap</option><option value="ticker">Ticker</option></select></label>

          <div className={styles.filterActions}>
            {isSignedIn ? (
              <label className={styles.savedToggle}>
                <input type="checkbox" checked={savedOnly} onChange={(event) => setSavedOnly(event.target.checked)} />
                Saved only
              </label>
            ) : (
              <SignInButton mode="modal"><button className={styles.textButton}>Sign in to use saved companies</button></SignInButton>
            )}
            <button className={styles.textButton} onClick={resetFilters}>Reset filters</button>
          </div>
        </div>

        <div className={styles.resultsBar}>
          <span><strong>{formatInteger(filteredCompanies.length)}</strong> matching companies</span>
          <span>{formatInteger(counts.total)} candidates evaluated · {formatInteger(counts.excluded)} excluded</span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.companyTable}>
            <thead>
              <tr>
                <th>Company</th>
                <th>Classification</th>
                <th>Anchor</th>
                <th>Cascade</th>
                <th>Agreement</th>
                <th>Market cap</th>
                <th>Liquidity</th>
                <th aria-label="Save" />
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((company) => (
                <tr key={company.symbol} onClick={() => setSelectedCompany(company)}>
                  <td>
                    <strong>{company.symbol}</strong>
                    <span>{company.companyName}</span>
                    <small>{company.sector}</small>
                  </td>
                  <td><span className={`${styles.badge} ${tierClass(company.tier)}`}>{classificationLabel(company)}</span></td>
                  <td>{company.cascadeAnchor || '—'}</td>
                  <td><strong>{company.cascadeBucket || '—'}</strong><small>{formatPercentile(company.cascadePercentile)}</small></td>
                  <td><strong>{company.disagreementBucket || '—'}</strong><small>{formatScore(company.disagreementScore)}</small></td>
                  <td>{formatMoney(company.marketCap)}</td>
                  <td>{formatMoney(company.advDollar20d)}</td>
                  <td>
                    {isSignedIn ? (
                      <button
                        className={`${styles.saveButton} ${savedSymbols.has(company.symbol) ? styles.saved : ''}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleSaved(company.symbol)
                        }}
                        aria-label={`${savedSymbols.has(company.symbol) ? 'Remove' : 'Save'} ${company.symbol}`}
                      >
                        {savedSymbols.has(company.symbol) ? 'Saved' : 'Save'}
                      </button>
                    ) : (
                      <SignInButton mode="modal">
                        <button className={styles.saveButton} onClick={(event) => event.stopPropagation()}>Save</button>
                      </SignInButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <button disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <span>Page {currentPage} of {pageCount}</span>
          <button disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</button>
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
