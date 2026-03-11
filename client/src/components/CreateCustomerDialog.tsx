import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCustomer } from "@/hooks/use-customers";
import { v4 as uuidv4 } from "uuid";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPhone?: string;
  onSuccess?: (id: string) => void;
}

export function CreateCustomerDialog({ open, onOpenChange, initialPhone = "", onSuccess }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(initialPhone);

  const createMutation = useCreateCustomer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newId = uuidv4();
    createMutation.mutate(
      { id: newId, name, phone, points: 0 },
      {
        onSuccess: (data) => {
          onOpenChange(false);
          setName("");
          setPhone("");
          onSuccess?.(data.id);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">New Customer</DialogTitle>
          <DialogDescription>
            Register a new customer for the loyalty program.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-muted-foreground">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-14 rounded-xl text-lg px-4 bg-secondary/50 border-transparent focus:border-primary focus:bg-background transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 rounded-xl text-lg px-4 bg-secondary/50 border-transparent focus:border-primary focus:bg-background transition-colors"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
            disabled={createMutation.isPending || !name || !phone}
          >
            {createMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
