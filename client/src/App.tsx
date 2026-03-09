import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import { POSHome } from "./pages/POSHome";
import { POSCustomerDetail } from "./pages/POSCustomerDetail";
import { SharePage } from "./pages/SharePage";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/pos" />
      </Route>
      <Route path="/pos" component={POSHome} />
      <Route path="/pos/customer/:id" component={POSCustomerDetail} />
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
