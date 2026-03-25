"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KEYFRAMES = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.1; }
  }
`;

export default function TestAnim3() {
  const [show, setShow] = useState(true);

  return (
    <div style={{ padding: 40 }}>
      <style>{KEYFRAMES}</style>
      <p style={{ marginBottom: 16 }}>Framer Motion is imported. Does the red circle still pulse?</p>
      <svg width={200} height={200}>
        <circle
          cx={100} cy={100} r={30}
          fill="#C0392B"
          style={{ animation: "pulse 500ms ease-in-out infinite" }}
        />
      </svg>
      <p style={{ marginTop: 16, fontSize: 12, color: "#888" }}>
        framer-motion is imported above but not used on this element.
      </p>
      {/* Use AnimatePresence somewhere so the import isn't tree-shaken */}
      <AnimatePresence>
        {show && <motion.div key="x" style={{ opacity: 0 }} />}
      </AnimatePresence>
    </div>
  );
}
