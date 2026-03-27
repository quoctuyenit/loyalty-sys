import { storage } from "./storage.js";
import { log } from "./index.js";

function getExpiryMonths(): number {
    return Math.max(1, parseInt(process.env.POINTS_EXPIRY_MONTHS || "12", 10) || 12);
}

export function computeExpiryDate(firstPointAt: number, months: number): Date {
    const d = new Date(firstPointAt * 1000);
    d.setMonth(d.getMonth() + months);
    d.setHours(23, 59, 59, 999);
    return d;
}

export function getExpiryMonthsConfig(): number {
    return getExpiryMonths();
}

export async function runExpiry() {
    log("Running points expiry check (Vercel Cron)...", "cron");
    const months = getExpiryMonths();
    const now = new Date();
    const withPoints = await storage.getCustomersWithPoints();

    let expired = 0;
    try {
        for (const customer of withPoints) {
            if (!customer.firstPointAt) continue;
            const expiry = computeExpiryDate(customer.firstPointAt, months);
            if (now >= expiry) {
                await storage.expireCustomer(customer.id);
                expired++;
            }
        }

        if (expired > 0) {
            log(`Expiry cron: cleared ${expired} customer(s) with expired points.`, "cron");
        } else {
            log("Expiry cron: No customers to clear today.", "cron");
        }
    } catch (err) {
        log(`Expiry cron error: ${err}`, "cron");
        throw err;
    }
    
    return { success: true, expired };
}
