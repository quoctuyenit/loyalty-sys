import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AppConfig {
  apiUrl: string;
  secretKey: string;
}

export function ConfigScreen() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [apiUrl, setApiUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("appConfig");
    if (saved) {
      try {
        const config: AppConfig = JSON.parse(saved);
        setApiUrl(config.apiUrl || "");
        setSecretKey(config.secretKey || "");
      } catch (err) {
        console.error("Failed to load config:", err);
      }
    }
  }, []);

  const handleSave = () => {
    if (!apiUrl.trim() || !secretKey.trim()) {
      toast({
        title: "Validation Error",
        description: "API URL and Secret Key cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const config: AppConfig = {
        apiUrl: apiUrl.trim(),
        secretKey: secretKey.trim(),
      };
      localStorage.setItem("appConfig", JSON.stringify(config));
      toast({
        title: "Configuration Saved",
        description: "Your settings have been saved successfully.",
      });
      setTimeout(() => {
        setLocation("/pos");
      }, 500);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all configuration? This cannot be undone.")) {
      localStorage.removeItem("appConfig");
      setApiUrl("");
      setSecretKey("");
      toast({
        title: "Configuration Reset",
        description: "Your settings have been cleared.",
      });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="bg-primary px-6 pt-12 pb-6 text-primary-foreground rounded-b-3xl shadow-lg relative z-10 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation("/pos")}
          className="text-primary-foreground hover:bg-primary-foreground/20 rounded-full h-12 w-12"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-display font-bold flex-1">Configuration</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 space-y-6 overflow-y-auto">
        {/* Info Box */}
        <div className="bg-secondary/30 border border-secondary rounded-2xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Configure your API endpoint and secret key. These settings are stored locally on your device.
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* API URL */}
          <div>
            <label className="block text-sm font-bold mb-3 text-foreground">API URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://example.com/api"
              className="w-full h-14 rounded-2xl bg-card border border-border/50 px-4 text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>

          {/* Secret Key */}
          <div>
            <label className="block text-sm font-bold mb-3 text-foreground">Secret Key</label>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter your secret key"
              className="w-full h-14 rounded-2xl bg-card border border-border/50 px-4 text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-6">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
            className="flex-1 h-14 rounded-2xl font-bold border-destructive text-destructive hover:bg-destructive/5"
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !apiUrl.trim() || !secretKey.trim()}
            className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
