import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { checkAuth } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const [, setLocation] = useLocation();
    const [checked, setChecked] = useState(false);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const verify = async () => {
            const isAuthed = await checkAuth();
            if (isAuthed) {
                setAllowed(true);
            } else {
                setLocation("/login");
            }
            setChecked(true);
        };
        verify();
    }, [setLocation]);

    if (!checked) return null;
    if (!allowed) return null;
    return <>{children}</>;
}

