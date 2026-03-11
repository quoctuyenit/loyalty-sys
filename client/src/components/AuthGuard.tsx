import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { isAuthenticated } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const [, setLocation] = useLocation();
    const [checked, setChecked] = useState(false);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        if (isAuthenticated()) {
            setAllowed(true);
        } else {
            setLocation("/login");
        }
        setChecked(true);
    }, []);

    if (!checked) return null;
    if (!allowed) return null;
    return <>{children}</>;
}
