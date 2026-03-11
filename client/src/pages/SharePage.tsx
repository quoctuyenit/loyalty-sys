import { useParams } from "wouter";
import { MobileLayout } from "@/components/MobileLayout";
import { RewardProgress } from "@/components/RewardProgress";
import { useCustomer } from "@/hooks/use-customers";
import { Skeleton } from "@/components/ui/skeleton";
import QRCode from "react-qr-code";
import { QrCode } from "lucide-react";

export function SharePage() {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading, error } = useCustomer(id || "");

  if (isLoading) {
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
          <RewardProgress points={customer.points} target={100} showGiftAnimation={true} />
        </div>

        {/* QR Code Pass */}
        <div className="bg-card rounded-3xl p-8 shadow-xl border border-border/50 flex flex-col items-center relative overflow-hidden mt-8">
          {/* Subtle decoration */}
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
