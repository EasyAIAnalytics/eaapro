"use client";
import { useEffect, useRef } from "react";

export default function LoginBackground() {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!bgRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 100;
      const y = (e.clientY / innerHeight) * 100;
      bgRef.current.style.background = `radial-gradient(ellipse 60% 60% at ${x}% ${y}%, #3b82f6 0%, #1e40af 100%)`;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={bgRef} style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 60% 60% at 50% 50%, #3b82f6 0%, #1e40af 100%)', transition: 'background 0.3s' }} />
  );
} 