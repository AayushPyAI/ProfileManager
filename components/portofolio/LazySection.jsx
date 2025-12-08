"use client";

import { useEffect, useRef, useState } from "react";

export default function LazySection({ children }) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // stop observing after visible
        }
      },
      {
        root: null,
        threshold: 0.12,        // triggers earlier for smoother load
        rootMargin: "150px 0px" // preload when near viewport
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      {visible ? children : null}
    </div>
  );
}
