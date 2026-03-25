"use client";
import React, { useState, useEffect } from "react";

// Test: does animation work on SVG circles when data is loaded async?
export default function TestAnim4() {
  const [points, setPoints] = useState<{cx: number; cy: number; dur: number}[]>([]);

  // Simulate async data load exactly like the dev page
  useEffect(() => {
    setTimeout(() => {
      setPoints([
        { cx: 100, cy: 100, dur: 917 },
        { cx: 200, cy: 100, dur: 1483 },
        { cx: 300, cy: 100, dur: 2400 },
        { cx: 400, cy: 100, dur: 3883 },
        { cx: 500, cy: 100, dur: 0 }, // static
      ]);
    }, 500); // 500ms delay like a real fetch
  }, []);

  const keyframes = `
    @keyframes p917  { 0%,100%{opacity:0.908} 50%{opacity:0.765} }
    @keyframes p1483 { 0%,100%{opacity:0.704} 50%{opacity:0.562} }
    @keyframes p2400 { 0%,100%{opacity:0.578} 50%{opacity:0.435} }
    @keyframes p3883 { 0%,100%{opacity:0.500} 50%{opacity:0.357} }
  `;

  return (
    <div style={{ padding: 40 }}>
      <style>{keyframes}</style>
      <p style={{ marginBottom: 16 }}>
        Data loads after 500ms delay. All circles should pulse after appearing.
        {points.length === 0 && " (loading...)"}
      </p>
      {points.length > 0 && (
        <svg width={600} height={200}>
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.cx} cy={pt.cy} r={20}
              fill="#C0392B"
              style={pt.dur > 0 ? {
                animation: `p${pt.dur} ${pt.dur}ms ease-in-out infinite`
              } : { opacity: 0.5 }}
            />
          ))}
        </svg>
      )}
    </div>
  );
}