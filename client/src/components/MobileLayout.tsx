import { ReactNode } from "react";

export function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mobile-container">
      {children}
    </div>
  );
}
