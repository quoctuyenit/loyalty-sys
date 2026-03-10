import { useEffect, useState } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import { POSHome } from "./pages/POSHome";
import { POSCustomerDetail } from "./pages/POSCustomerDetail";
import { SharePage } from "./pages/SharePage";
import { ConfigScreen } from "./pages/ConfigScreen";

function Router() {
  const [location] = useLocation();
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    const config = localStorage.getItem("appConfig");
    setIsConfigured(!!config);
  }, []);

  // If we're on share page or config page, don't redirect
  if (location.startsWith("/share") || location === "/config") {
    return (
      <Switch>
        <Route path="/config" component={ConfigScreen} />
        <Route path="/share/:id" component={SharePage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // If not configured and not already on config page, redirect to config
  if (isConfigured === false) {
    return <Redirect to="/config" />;
  }

  return (
    <Switch>
      <Route path="/">
        <Redirect to="/pos" />
      </Route>
      <Route path="/pos" component={POSHome} />
      <Route path="/pos/customer/:id" component={POSCustomerDetail} />
      <Route path="/config" component={ConfigScreen} />
      <Route path="/share/:id" component={SharePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
