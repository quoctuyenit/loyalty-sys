import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { MobileLayout } from "@/components/MobileLayout";
import { RewardProgress } from "@/components/RewardProgress";
import { useCustomer } from "@/hooks/use-customers";
import { useConfig, computeExpiryDate, formatExpiryDate } from "@/hooks/use-config";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { QrCode, RefreshCw, CalendarClock } from "lucide-react";
import { REDEEM_COST } from "@shared/constants";
import { checkAuth } from "@/lib/auth";

export function SharePage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const init = async () => {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isFacebook = ua.indexOf("FBAN") > -1 || ua.indexOf("FBAV") > -1;
      const isInstagram = ua.indexOf("Instagram") > -1;
      const isZalo = ua.indexOf("Zalo") > -1;
      const isMessenger = ua.indexOf("Messenger") > -1;

      if (isFacebook || isInstagram || isZalo || isMessenger) {
        if (/android/i.test(ua)) {
          const url = `intent://${window.location.host}${window.location.pathname}${window.location.search}#Intent;scheme=https;end`;
          window.location.replace(url);
          return;
        }
      }

      const isAuthed = await checkAuth();
      if (isAuthed && id) {
        setLocation(`/pos/customer/${id}`);
      } else {
        setIsRedirecting(false);
      }
    };
    init();
  }, [id, setLocation]);

  const { data: customer, isLoading, isFetching, refetch, error } = useCustomer(id || "");
  const { data: config } = useConfig();

  const expiryDate = computeExpiryDate(
    customer?.firstPointAt,
    config?.pointsExpiryMonths ?? 12
  );

  if (isRedirecting || isLoading) {
    return (
      <MobileLayout>
        <div className="p-8 space-y-8 pt-24">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-48 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </MobileLayout>
    );
  }

  if (error || !customer) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
            <QrCode className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold font-display text-foreground">Account Not Found</h1>
          <p className="text-muted-foreground">This loyalty pass seems to be invalid or has been removed.</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Decorative Header Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-primary rounded-b-[40px] -z-10" />

      {/* Refresh button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-black/70 hover:text-black"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="px-6 pt-16 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Welcome Text */}
        <div className="text-black">
          <p className="text-black/70 font-medium uppercase tracking-widest text-sm mb-2">
            Loyalty Pass
          </p>
          <h1 className="text-4xl font-display font-bold leading-tight">
            Hi, {customer.name.split(' ')[0]}!
          </h1>
        </div>

        {/* Main Progress */}
        <div className="mt-8">
          <RewardProgress points={customer.points} target={REDEEM_COST} showGiftAnimation={true} />
        </div>

        {/* Expiry Date */}
        {expiryDate && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <CalendarClock className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Points expire on</p>
              <p className="text-sm font-bold text-amber-900">{formatExpiryDate(expiryDate)}</p>
            </div>
          </div>
        )}

        {/* QR Code Pass */}
        <div className="bg-card rounded-3xl p-8 shadow-xl border border-border/50 flex flex-col items-center relative overflow-hidden mt-8">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

          <h3 className="font-display font-bold text-xl text-foreground mb-6">Your Pass</h3>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 mb-6">
            <QRCode
              value={customer.id}
              size={200}
              fgColor="hsl(220 20% 15%)"
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>

          <div className="w-full border-t border-dashed border-border/60 pt-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
            <p className="font-mono font-bold text-lg tracking-wide text-foreground mt-1">
              {customer.phone}
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
