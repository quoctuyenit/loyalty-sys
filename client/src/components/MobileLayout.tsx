import { ReactNode, useRef, useState, useEffect } from "react";

const PULL_THRESHOLD = 64;

export function MobileLayout({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const pullYRef = useRef(0);
  const [pullY, setPullY] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const getScrollTop = (target: EventTarget | null): number => {
      let node = target as HTMLElement | null;
      while (node && node !== el) {
        if (node.scrollTop > 0) return node.scrollTop;
        node = node.parentElement;
      }
      return 0;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (getScrollTop(e.target) === 0) {
        startYRef.current = e.touches[0].clientY;
        pullingRef.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current) return;
      const dy = e.touches[0].clientY - startYRef.current;
      if (dy > 0) {
        const clamped = Math.min(dy * 0.5, PULL_THRESHOLD);
        pullYRef.current = clamped;
        setPullY(clamped);
      } else {
        pullingRef.current = false;
        pullYRef.current = 0;
        setPullY(0);
      }
    };

    const onTouchEnd = () => {
      if (pullingRef.current && pullYRef.current >= PULL_THRESHOLD * 0.9) {
        window.location.reload();
        return;
      }
      pullingRef.current = false;
      pullYRef.current = 0;
      setPullY(0);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const isReady = pullY >= PULL_THRESHOLD * 0.9;

  return (
    <div ref={containerRef} className="mobile-container">
      {pullY > 0 && (
        <div
          className="absolute left-0 right-0 flex items-center justify-center z-50 pointer-events-none"
          style={{ top: 0, height: `${pullY}px`, opacity: Math.min(pullY / PULL_THRESHOLD, 1) }}
        >
          <span className="text-xs font-semibold text-muted-foreground">
            {isReady ? "Release to refresh" : "Pull to refresh"}
          </span>
        </div>
      )}
      <div
        className="flex flex-col flex-1"
        style={{
          transform: pullY > 0 ? `translateY(${pullY}px)` : "none",
          transition: pullY === 0 ? "transform 0.25s ease" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
