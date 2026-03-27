import { useQuery } from "@tanstack/react-query";

interface AppConfig {
    pointsExpiryMonths: number;
}

export function useConfig() {
    return useQuery<AppConfig>({
        queryKey: ["app-config"],
        queryFn: async () => {
            const res = await fetch("/api/config");
            if (!res.ok) throw new Error("Failed to load config");
            return res.json();
        },
        staleTime: Infinity,
    });
}

export function computeExpiryDate(firstPointAt: number | null | undefined, months: number): Date | null {
    if (!firstPointAt) return null;
    const d = new Date(firstPointAt * 1000);
    d.setMonth(d.getMonth() + months);
    d.setHours(23, 59, 59, 999);
    return d;
}

export function formatExpiryDate(date: Date | null): string {
    if (!date) return "";
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
