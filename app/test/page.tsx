"use client";

export default function TestAnim() {
  const keyframes = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.1; }
    }
  `;

  return (
    <div style={{ padding: 40, background: "#fff" }}>
      <style>{keyframes}</style>
      <p style={{ marginBottom: 20, fontSize: 14 }}>
        This circle should pulse (fade in and out). If it is static, CSS keyframe animation is not working in this environment.
      </p>
      <svg width={200} height={200}>
        <circle
          cx={100} cy={100} r={30}
          fill="#C0392B"
          style={{ animation: "pulse 1000ms ease-in-out infinite" }}
        />
      </svg>
      <p style={{ marginTop: 20, fontSize: 12, color: "#888" }}>
        Animation: pulse 1000ms ease-in-out infinite
      </p>
    </div>
  );
}
