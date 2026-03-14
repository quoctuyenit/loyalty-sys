import { Switch, Route, Redirect, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthGuard } from "@/components/AuthGuard";

// Pages
import { POSHome } from "./pages/POSHome";
import { POSCustomerDetail } from "./pages/POSCustomerDetail";
import { POSScanPage } from "./pages/POSScanPage";
import { SharePage } from "./pages/SharePage";
import { LoginPage } from "./pages/LoginPage";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/pos" />
      </Route>
      <Route path="/login" component={LoginPage} />
      <Route path="/share/:id" component={SharePage} />
      <Route path="/pos">
        <AuthGuard><POSHome /></AuthGuard>
      </Route>
      <Route path="/pos/scan">
        <AuthGuard><POSScanPage /></AuthGuard>
      </Route>
      <Route path="/pos/customer/:id">
        {(params) => (
          <AuthGuard><POSCustomerDetail id={params.id || ""} /></AuthGuard>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <AppRoutes />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
