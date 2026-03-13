import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Html5Qrcode } from "html5-qrcode";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, ScanLine, UserX, RefreshCw } from "lucide-react";

type ScanState = "starting" | "scanning" | "verifying" | "success" | "not_found" | "denied" | "error";

export function POSScanPage() {
    const [, setLocation] = useLocation();
    const [state, setState] = useState<ScanState>("starting");
    const [errorMsg, setErrorMsg] = useState("");
    const [scannedId, setScannedId] = useState("");
    const [flash, setFlash] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isProcessing = useRef(false);

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
            } catch (_) { }
            scannerRef.current = null;
        }
    };

    const startScanner = useCallback(async () => {
        isProcessing.current = false;
        setState("starting");
        setErrorMsg("");
        setScannedId("");
        setFlash(false);

        // Clean up any existing scanner first
        await stopScanner();

        try {
            const qr = new Html5Qrcode("qr-reader");
            scannerRef.current = qr;

            await qr.start(
                { facingMode: "environment" },
                { fps: 15, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
                async (decodedText) => {
                    if (isProcessing.current) return;
                    isProcessing.current = true;

                    const customerId = decodedText.trim();
                    if (!customerId) {
                        setErrorMsg("Invalid QR code. Try again.");
                        isProcessing.current = false;
                        return;
                    }

                    // Stop scanner and verify customer exists
                    setState("verifying");
                    setScannedId(customerId);
                    await stopScanner();

                    try {
                        const res = await fetch(`/api/customers/${customerId}`);

                        if (res.ok) {
                            // Customer found — flash green and navigate
                            setFlash(true);
                            setState("success");
                            setTimeout(() => setLocation(`/pos/customer/${customerId}`), 450);
                        } else if (res.status === 404) {
                            setState("not_found");
                        } else {
                            setState("error");
                            setErrorMsg("Something went wrong. Please try again.");
                        }
                    } catch {
                        setState("error");
                        setErrorMsg("Network error. Please try again.");
                    }
                },
                () => { }
            );

            setState("scanning");
        } catch (err: any) {
            const msg = String(err?.message || err || "");
            if (
                msg.toLowerCase().includes("permission") ||
                msg.toLowerCase().includes("denied") ||
                msg.toLowerCase().includes("notallowed")
            ) {
                setState("denied");
            } else {
                setState("error");
                setErrorMsg(msg || "Could not access camera.");
            }
        }
    }, []);

    useEffect(() => {
        startScanner();
        return () => { stopScanner(); };
    }, []);

    const handleCancel = async () => {
        await stopScanner();
        setLocation("/pos");
    };

    const handleScanAgain = () => {
        startScanner();
    };

    const isViewfinderVisible = state === "starting" || state === "scanning" || state === "verifying" || state === "success";

    return (
        <MobileLayout>
            {/* Header */}
            <div className="bg-primary px-6 pt-12 pb-6 text-primary-foreground rounded-b-3xl shadow-lg">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancel}
                        className="rounded-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-display font-bold">Scan Customer QR</h1>
                        <p className="text-primary-foreground/70 text-sm">Use the camera to find a customer</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8">

                {/* Camera permission denied */}
                {state === "denied" && (
                    <div className="w-full text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                            <Camera className="w-10 h-10 text-destructive" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground mb-2">Camera Access Required</h2>
                            <p className="text-muted-foreground">
                                Camera access is required to scan QR codes. Please allow camera access in your browser settings and try again.
                            </p>
                        </div>
                        <Button onClick={() => setLocation("/pos")} className="w-full h-14 rounded-2xl bg-primary text-white font-bold">
                            Back to Listing
                        </Button>
                    </div>
                )}

                {/* General error */}
                {state === "error" && (
                    <div className="w-full text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                            <Camera className="w-10 h-10 text-destructive" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground mb-2">Camera Error</h2>
                            <p className="text-muted-foreground text-sm">{errorMsg || "Could not start the camera."}</p>
                        </div>
                        <div className="flex flex-col gap-3 w-full">
                            <Button onClick={handleScanAgain} className="w-full h-14 rounded-2xl bg-primary text-white font-bold flex items-center gap-2">
                                <RefreshCw className="w-5 h-5" />
                                Try Again
                            </Button>
                            <Button variant="outline" onClick={() => setLocation("/pos")} className="w-full h-14 rounded-2xl font-bold">
                                Back to Listing
                            </Button>
                        </div>
                    </div>
                )}

                {/* Customer not found */}
                {state === "not_found" && (
                    <div className="w-full text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                            <UserX className="w-10 h-10 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground mb-2">Customer Not Found</h2>
                            <p className="text-muted-foreground text-sm mb-3">
                                No customer matches this QR code. It may be outdated or belong to a different system.
                            </p>
                            {scannedId && (
                                <div className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-2 w-full max-w-full overflow-hidden">
                                    <span className="text-xs text-muted-foreground flex-shrink-0">ID:</span>
                                    <span className="text-sm font-mono text-muted-foreground truncate">{scannedId}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-3 w-full">
                            <Button
                                onClick={handleScanAgain}
                                className="w-full h-14 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Scan Again
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setLocation("/pos")}
                                className="w-full h-14 rounded-2xl font-bold border-border/60"
                            >
                                Back to Listing
                            </Button>
                        </div>
                    </div>
                )}

                {/* Scanner viewfinder (hidden but mounted when needed for the DOM element) */}
                <div className={isViewfinderVisible ? "contents" : "hidden"}>
                    {/* Viewfinder */}
                    <div className="relative w-full max-w-[320px]">
                        {/* Flash overlay */}
                        <div
                            className={`absolute inset-0 z-20 rounded-3xl bg-green-400 transition-opacity duration-300 pointer-events-none ${flash ? "opacity-40" : "opacity-0"
                                }`}
                        />

                        {/* Border ring */}
                        <div
                            className={`absolute inset-0 z-10 rounded-3xl border-4 transition-colors duration-300 ${state === "success" ? "border-green-500" : state === "verifying" ? "border-accent" : "border-primary"
                                }`}
                        />

                        {/* Corner accents */}
                        <div className="absolute top-2 left-2 z-10 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                        <div className="absolute top-2 right-2 z-10 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                        <div className="absolute bottom-2 left-2 z-10 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                        <div className="absolute bottom-2 right-2 z-10 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />

                        {/* Scan line animation */}
                        {state === "scanning" && (
                            <div className="absolute inset-x-4 z-10 h-0.5 bg-primary/80 rounded animate-scan-line" />
                        )}

                        {/* Verifying overlay */}
                        {state === "verifying" && (
                            <div className="absolute inset-0 z-20 rounded-3xl bg-black/50 flex items-center justify-center">
                                <div className="text-center text-white space-y-2">
                                    <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                    <p className="text-sm font-semibold">Checking...</p>
                                </div>
                            </div>
                        )}

                        {/* QR reader element */}
                        <div id="qr-reader" className="w-full aspect-square rounded-3xl overflow-hidden bg-black" />
                    </div>

                    {/* Status text */}
                    <div className="text-center space-y-1">
                        {state === "starting" && (
                            <p className="text-muted-foreground text-base">Starting camera...</p>
                        )}
                        {state === "scanning" && (
                            <>
                                <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                                    <ScanLine className="w-5 h-5" />
                                    <span>Ready to scan</span>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    Point the camera at the customer's QR code
                                </p>
                                {errorMsg && (
                                    <p className="text-destructive text-sm font-medium mt-2">{errorMsg}</p>
                                )}
                            </>
                        )}
                        {state === "verifying" && (
                            <p className="text-accent font-semibold">Verifying customer...</p>
                        )}
                        {state === "success" && (
                            <p className="text-green-600 font-bold text-lg">Found! Opening customer...</p>
                        )}
                    </div>

                    {/* Cancel button */}
                    {(state === "starting" || state === "scanning") && (
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="w-full max-w-[320px] h-14 rounded-2xl font-bold text-lg border-border/60"
                        >
                            Cancel
                        </Button>
                    )}
                </div>

            </div>
        </MobileLayout>
    );
}
