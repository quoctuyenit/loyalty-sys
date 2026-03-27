import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function GlobalLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Small delay to prevent flickering for very fast requests
    const timer = setTimeout(() => {
      setShow(isFetching > 0 || isMutating > 0);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isFetching, isMutating]);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-primary/20 overflow-hidden">
      <div className="h-full bg-primary animate-progress origin-left" />
    </div>
  );
}
