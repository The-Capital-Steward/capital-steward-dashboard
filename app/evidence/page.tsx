import type { Metadata } from "next"
import EvidencePage from "./EvidencePage"

export const metadata: Metadata = {
  title: "Evidence | The Capital Steward",
  description:
    "Historical payoff, drawdown, topology, and robustness evidence supporting the OSMR v2 framework.",
}

export default function Page() {
  return <EvidencePage />
}
