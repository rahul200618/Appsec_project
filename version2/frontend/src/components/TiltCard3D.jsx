import { useRef, useState } from "react";

export default function TiltCard3D({ children, className = "" }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false });

  function handleMove(e) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Number((-py * 12).toFixed(2)),
      ry: Number((px * 14).toFixed(2)),
      active: true,
    });
  }

  function handleLeave() {
    setTilt({ rx: 0, ry: 0, active: false });
  }

  return (
    <div className="perspective-1200">
      <div
        ref={cardRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.active ? 1.015 : 1})`,
        }}
        className={`preserve-3d transition-transform duration-200 ease-out ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

