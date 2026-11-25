import { useEffect, useRef } from "react";

// Pure Canvas 3D engine: renders an interactive rotating 3D octahedron/vault cube
// and orbiting security nodes with zero external WebGL dependencies and full CSP compliance.
export default function Ledger3DScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let rafId = 0;

    // Pointer target angles for smooth 3D camera parallax
    let targetYaw = 0.45;
    let targetPitch = 0.3;
    let yaw = 0.45;
    let pitch = 0.3;

    // 3D vertices of nested cubes + octahedron vault crystal
    const outerCube = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
    ];
    const outerEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const innerOct = [
      [0, -1.15, 0], [0, 1.15, 0],
      [-0.85, 0, 0], [0.85, 0, 0],
      [0, 0, -0.85], [0, 0, 0.85],
    ];
    const octEdges = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 4], [4, 3], [3, 5], [5, 2],
    ];

    const particles = Array.from({ length: 42 }, (_, i) => {
      const theta = (i / 42) * Math.PI * 2;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 42);
      const r = 1.65 + (i % 3) * 0.28;
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi),
        z: r * Math.sin(phi) * Math.sin(theta),
        size: (i % 3) + 1.5,
        accent: i % 5 === 0,
      };
    });

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function project([x, y, z], rx, ry, scale) {
      // Rotate Y
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotate X
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const fov = 4.2;
      const depth = fov / (fov + z2 + 1.6);
      return {
        x: width * 0.5 + x1 * scale * depth,
        y: height * 0.5 + y2 * scale * depth,
        z: z2,
        depth,
      };
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
      const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
      targetYaw = nx * 1.4;
      targetPitch = ny * 1.0;
    }

    let autoAngle = 0;
    function draw() {
      ctx.clearRect(0, 0, width, height);
      if (!reducedMotion) {
        autoAngle += 0.0055;
      }
      yaw += (targetYaw + autoAngle - yaw) * 0.05;
      pitch += (targetPitch - pitch) * 0.05;

      const scale = Math.min(width, height) * 0.34;

      // Ambient orbital rings
      ctx.strokeStyle = "rgba(20, 184, 166, 0.14)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(width * 0.5, height * 0.5, scale * 1.45, scale * 0.52, yaw * 0.2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(245, 158, 11, 0.14)";
      ctx.beginPath();
      ctx.ellipse(width * 0.5, height * 0.5, scale * 1.32, scale * 0.45, -yaw * 0.25 + 0.8, 0, Math.PI * 2);
      ctx.stroke();

      // Orbiting 3D security particles
      const projectedParticles = particles
        .map((p) => ({
          ...project([p.x, p.y, p.z], pitch * 0.6, yaw * 0.85, scale),
          size: p.size,
          accent: p.accent,
        }))
        .sort((a, b) => b.z - a.z);

      for (const pt of projectedParticles) {
        const alpha = Math.max(0.15, Math.min(0.9, pt.depth * 0.85));
        ctx.fillStyle = pt.accent
          ? `rgba(245, 158, 11, ${alpha})`
          : `rgba(45, 212, 191, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * pt.depth, 0, Math.PI * 2);
        ctx.fill();
      }

      // Outer glass cube wireframe
      const cubePts = outerCube.map((v) => project(v, pitch, yaw, scale));
      ctx.lineWidth = 1.4;
      for (const [a, b] of outerEdges) {
        const p1 = cubePts[a];
        const p2 = cubePts[b];
        const avgDepth = (p1.depth + p2.depth) * 0.5;
        ctx.strokeStyle = `rgba(45, 212, 191, ${Math.max(0.18, avgDepth * 0.55)})`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Inner glowing saffron octahedron vault
      const octPts = innerOct.map((v) => project(v, -pitch * 0.8, -yaw * 1.15, scale * 0.88));
      ctx.lineWidth = 1.8;
      for (const [a, b] of octEdges) {
        const p1 = octPts[a];
        const p2 = octPts[b];
        ctx.strokeStyle = "rgba(245, 158, 11, 0.72)";
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Highlight cube vertices
      for (const p of cubePts) {
        ctx.fillStyle = "rgba(248, 250, 252, 0.85)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * p.depth, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(draw);
      }
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none h-full w-full"
    />
  );
}

