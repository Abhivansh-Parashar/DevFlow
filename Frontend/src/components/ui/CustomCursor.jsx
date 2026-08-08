import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function CustomCursor() {
  const theme = useAppStore((s) => s.theme);
  const [ripples, setRipples] = useState([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Check touch capability
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasTouch = window.matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(hasTouch);
    }
  }, []);

  // Listen for click events to generate shockwave ripples
  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseDown = (e) => {
      const newRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev.slice(-5), newRipple]);
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isTouchDevice]);

  // Remove ripple after animation finishes
  const handleRippleEnd = (id) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  if (isTouchDevice) return null;

  const isDark = theme === 'dark' || document.documentElement.classList.contains('dark');

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden"
      aria-hidden="true"
    >
      {/* Click Ripple Shockwaves */}
      {ripples.map((r) => (
        <span
          key={r.id}
          onAnimationEnd={() => handleRippleEnd(r.id)}
          style={{ left: r.x, top: r.y }}
          className={`absolute -ml-5 -mt-5 h-10 w-10 rounded-full border-2 pointer-events-none animate-df-cursor-ripple ${
            isDark
              ? 'border-[#00c2a8] bg-[#00c2a8]/20 shadow-[0_0_15px_#00c2a8]'
              : 'border-[#0d9488] bg-[#0d9488]/20 shadow-[0_0_12px_rgba(13,148,136,0.4)]'
          }`}
        />
      ))}
    </div>
  );
}
