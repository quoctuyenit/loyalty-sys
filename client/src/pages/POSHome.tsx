import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Search, UserPlus, ChevronRight, User, LogOut, ScanLine, Loader2 } from "lucide-react";
import { MobileLayout } from "@/components/MobileLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useInfiniteCustomers } from "@/hooks/use-customers";
import { CreateCustomerDialog } from "@/components/CreateCustomerDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { logout } from "@/lib/auth";

export function POSHome() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [, setLocation] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteCustomers(search);

  const customers = data?.pages.flat() ?? [];

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const tryLoadMore = useCallback(() => {
    if (loadingRef.current || !hasNextPage || isFetchingNextPage) return;
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 120) {
      loadingRef.current = true;
      fetchNextPage().finally(() => { loadingRef.current = false; });
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let debounce: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(debounce);
      debounce = setTimeout(tryLoadMore, 80);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); clearTimeout(debounce); };
  }, [tryLoadMore]);

  return (
    <MobileLayout>
      {/* Header */}
      <div className="px-6 pt-12 pb-6 text-primary-foreground rounded-b-3xl shadow-lg relative z-10 bg-[#9fb6cd] shrink-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Kavoon', cursive" }}>Herty System</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="rounded-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-primary/60" />
            </div>
            <Input
              type="text"
              placeholder="Search phone ..."
              className="h-14 w-full pl-12 pr-4 rounded-2xl bg-white text-foreground text-lg placeholder:text-muted-foreground shadow-inner border-0 focus-visible:ring-2 focus-visible:ring-white/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setLocation("/pos/scan")}
            className="h-14 px-4 rounded-2xl bg-white/20 hover:bg-white/30 active:bg-white/40 border border-white/30 flex items-center gap-2 text-primary-foreground font-semibold transition-colors flex-shrink-0"
          >
            <ScanLine className="w-5 h-5" />
            <span className="text-sm font-bold">Scan</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div ref={scrollRef} className="flex-1 px-4 py-6 space-y-6 overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center px-2">
          <h2 className="font-bold text-lg text-foreground">List customers</h2>
          <Button
            variant="ghost"
            className="text-primary font-semibold hover:bg-primary/10 rounded-xl"
            onClick={() => setIsCreateOpen(true)}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            New
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-4 flex items-center gap-4 border border-border/50">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))
          ) : customers.length === 0 ? (
            <div className="text-center py-12 px-4 bg-card rounded-3xl border border-dashed border-border">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">No customers found</h3>
              <p className="text-muted-foreground mb-6">
                {search ? `Could not find anyone matching "${search}"` : "Add your first customer to get started."}
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="h-12 rounded-xl px-6 bg-primary text-white shadow-lg shadow-primary/20"
              >
                Create New Customer
              </Button>
            </div>
          ) : (
            <>
              {customers.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/pos/customer/${customer.id}`}
                  className="block tap-highlight-transparent"
                >
                  <div className="bg-card hover:bg-secondary/50 transition-colors p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-border/50 group">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-lg leading-tight">{customer.name}</h3>
                      <p className="text-muted-foreground text-sm">{customer.phone}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="font-display font-bold text-lg text-[#f57c7c]">{customer.points}</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">pts</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}

              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </div>
              )}

              {!hasNextPage && customers.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-4">
                  {customers.length} customer{customers.length !== 1 ? "s" : ""} total
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <CreateCustomerDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        initialPhone={search}
        onSuccess={(id) => setLocation(`/pos/customer/${id}`)}
      />
    </MobileLayout>
  );
}
