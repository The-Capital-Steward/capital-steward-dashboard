"use client";
import React, { useState, useEffect, useRef } from "react";

const KEYFRAMES = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.1; }
  }
`;

// 50 static dots in an SVG — same setup as scatter map
export default function TestAnim2() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const dots = Array.from({ length: 50 }, (_, i) => ({
    cx: 20 + (i % 10) * 60,
    cy: 20 + Math.floor(i / 10) * 70,
    dur: [3883, 2400, 1483, 917][i % 4],
  }));

  return (
    <div style={{ padding: 40 }}>
      <style>{KEYFRAMES}</style>
      <p>50 dots inside a resizing SVG container. All should pulse.</p>
      <div ref={containerRef} style={{ width: "100%", height: 400, position: "relative", border: "1px solid #ccc" }}>
        <svg width={dims.width} height={dims.height} style={{ position: "absolute", inset: 0 }}>
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.cx} cy={d.cy} r={8}
              fill="#C0392B"
              style={{ animation: `pulse ${d.dur}ms ease-in-out infinite` }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
