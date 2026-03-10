import { useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Plus, Minus, QrCode, Share, CheckCircle2, Edit3 } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { RewardProgress } from "@/components/RewardProgress";
import { Button } from "@/components/ui/button";
import { useCustomer, useUpdateCustomer } from "@/hooks/use-customers";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

export function POSCustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading } = useCustomer(id || "");
  const updateMutation = useUpdateCustomer();
  const { toast } = useToast();
  
  const [showQR, setShowQR] = useState(false);
  const [customPoints, setCustomPoints] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState(customer?.name || "");
  const [editPhone, setEditPhone] = useState(customer?.phone || "");

  if (isLoading || !customer) {
    return (
      <MobileLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="w-10 h-10 rounded-full mb-8" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-48 w-full rounded-3xl" />
        </div>
      </MobileLayout>
    );
  }

  const handleAddPoints = (amount: number) => {
    updateMutation.mutate({ 
      id: customer.id, 
      points: customer.points + amount 
    });
    setCustomPoints("");
  };

  const handleRedeem = () => {
    if (customer.points < 100) return;
    
    // Confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2e7d32', '#ff9800', '#ffffff']
    });

    updateMutation.mutate({ 
      id: customer.id, 
      points: customer.points - 100 
    }, {
      onSuccess: () => {
        toast({
          title: "Reward Redeemed!",
          description: "100 points have been deducted.",
        });
      }
    });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/share/${customer.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Share link copied to clipboard.",
    });
  };

  const handleEditSave = () => {
    if (!editName.trim() || !editPhone.trim()) {
      toast({
        title: "Error",
        description: "Name and phone cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate(
      { 
        id: customer.id, 
        name: editName,
        phone: editPhone
      },
      {
        onSuccess: () => {
          toast({
            title: "Customer Updated!",
            description: "Customer details have been saved.",
          });
          setShowEditDialog(false);
        }
      }
    );
  };

  return (
    <MobileLayout>
      {/* Top Nav */}
      <div className="flex items-center justify-between p-4 sticky top-0 bg-background/80 backdrop-blur-md z-20">
        <Link href="/pos">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleShare} className="h-12 w-12 rounded-full text-primary hover:bg-primary/10">
            <Share className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowQR(true)} className="h-12 w-12 rounded-full text-primary hover:bg-primary/10">
            <QrCode className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="px-6 pb-24 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Customer Info */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">{customer.name}</h1>
            <p className="text-lg text-muted-foreground mt-1">{customer.phone}</p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => {
              setEditName(customer.name);
              setEditPhone(customer.phone);
              setShowEditDialog(true);
            }}
            className="rounded-full border-border/50 shadow-sm"
          >
            <Edit3 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Progress Card */}
        <RewardProgress points={customer.points} target={100} />

        {/* Action Grid */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg px-1">Quick Add Points</h3>
          <div className="grid grid-cols-3 gap-3">
            {[1, 5, 10].map((pts) => (
              <Button 
                key={pts}
                onClick={() => handleAddPoints(pts)}
                disabled={updateMutation.isPending}
                className="h-16 rounded-2xl bg-secondary hover:bg-primary/10 text-primary font-display font-bold text-xl border border-transparent hover:border-primary/20 transition-all"
                variant="secondary"
              >
                +{pts}
              </Button>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <input 
              type="number" 
              placeholder="Custom" 
              value={customPoints}
              onChange={(e) => setCustomPoints(e.target.value)}
              className="flex-1 h-14 rounded-2xl bg-card border border-border/50 px-4 text-lg font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-center"
            />
            <Button 
              onClick={() => handleAddPoints(Number(customPoints))}
              disabled={!customPoints || isNaN(Number(customPoints)) || updateMutation.isPending}
              className="h-14 px-8 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Redeem Button (Sticky at bottom typically, but inline here for flow) */}
        <div className="pt-6">
          <Button
            onClick={handleRedeem}
            disabled={customer.points < 100 || updateMutation.isPending}
            className={`w-full h-16 rounded-2xl text-xl font-bold font-display shadow-xl transition-all duration-300 ${
              customer.points >= 100 
                ? "bg-gradient-to-r from-accent to-orange-400 text-white hover:scale-[1.02] shadow-accent/30" 
                : "bg-secondary text-muted-foreground shadow-none"
            }`}
          >
            {customer.points >= 100 ? (
              <>
                <CheckCircle2 className="w-6 h-6 mr-2" />
                Redeem Reward (-100 pts)
              </>
            ) : (
              "Not enough points to redeem"
            )}
          </Button>
        </div>
      </div>

      {/* QR Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-[360px] rounded-3xl p-8 flex flex-col items-center">
          <DialogHeader className="mb-4 w-full text-center">
            <DialogTitle className="font-display text-2xl mx-auto">Customer QR</DialogTitle>
          </DialogHeader>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border w-full aspect-square flex items-center justify-center">
            <QRCode 
              value={customer.id} 
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          </div>
          <p className="mt-6 text-center text-muted-foreground font-medium">
            Scan this code at the POS to pull up {customer.name.split(' ')[0]}'s account.
          </p>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[360px] rounded-3xl p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-2xl">Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2 text-foreground">Name</label>
              <input 
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full h-12 rounded-2xl bg-card border border-border/50 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-foreground">Phone</label>
              <input 
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full h-12 rounded-2xl bg-card border border-border/50 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={updateMutation.isPending}
                className="flex-1 h-12 rounded-2xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                disabled={updateMutation.isPending}
                className="flex-1 h-12 rounded-2xl bg-primary text-white font-bold"
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}
