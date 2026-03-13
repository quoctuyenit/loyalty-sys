import { useState } from "react";
import { useLocation } from "wouter";
import { KeyRound, LogIn, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/MobileLayout";
import { setAuthenticated } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export function LoginPage() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [secretKey, setSecretKey] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!secretKey.trim()) {
            setError("Please enter your secret key.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ secretKey: secretKey.trim() }),
            });

            const data = await res.json();

            if (data.success) {
                setAuthenticated();
                toast({ title: "Welcome back!", description: "Logged in successfully." });
                setLocation("/pos");
            } else {
                setError(data.message || "Invalid secret key.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MobileLayout>
            {/* Header */}
            <div className="bg-primary px-6 pt-16 pb-12 text-primary-foreground rounded-b-3xl shadow-lg">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
                        <KeyRound className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold">Admin Login</h1>
                        <p className="text-primary-foreground/70 text-sm mt-0.5">Loyalty System</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-6 py-10 space-y-6">
                <div>
                    <label className="block text-sm font-bold mb-3 text-foreground">Secret Key</label>
                    <input
                        type="password"
                        value={secretKey}
                        onChange={(e) => { setSecretKey(e.target.value); setError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        placeholder="Enter your admin secret key"
                        className="w-full h-14 rounded-2xl bg-card border border-border/50 px-4 text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                        autoFocus
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                        <p className="text-sm text-destructive font-medium">{error}</p>
                    </div>
                )}

                <Button
                    onClick={handleLogin}
                    disabled={isLoading || !secretKey.trim()}
                    className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                    <LogIn className="w-5 h-5" />
                    {isLoading ? "Verifying..." : "Login"}
                </Button>
            </div>
        </MobileLayout>
    );
}
