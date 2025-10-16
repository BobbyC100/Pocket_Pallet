"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Camera, ScanText, Rows3, Plus, Store } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "../services/api";

// If you already have strongly-typed Wine in your app, swap this out.
type Wine = {
  id: string | number;
  name: string;
  producer?: string | null;
  region?: string | null;
  image_url?: string | null;
};

// ---- Tiles ---------------------------------------------------------------
function ActionTile({
  href,
  title,
  subtitle,
  icon: Icon,
  testId,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: any;
  testId?: string;
}) {
  return (
    <Link href={href} data-testid={testId} className="group block">
      <Card className="h-full transition-colors hover:bg-accent/50">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="rounded-2xl bg-wine-100 text-wine-600 p-4 shrink-0">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl tracking-tight">{title}</CardTitle>
            <p className="text-sm text-gray-700 mt-1">{subtitle}</p>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

// ---- Recent Wines --------------------------------------------------------
function RecentlyAdded({ items }: { items: Wine[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold tracking-tight">Recently added</h3>
        <Link href="/wines" className="text-sm text-wine-600 hover:underline">
          View all
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.slice(0, 6).map((w) => (
          <Card key={w.id} className="overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                {w.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={w.image_url} alt={w.name} className="h-full w-full object-cover" />
                ) : (
                  <Rows3 className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{w.name}</p>
                <p className="text-sm text-gray-700 truncate">
                  {[w.producer, w.region].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---- Empty State ---------------------------------------------------------
function EmptyState() {
  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">No wines yet</h3>
            <p className="text-sm text-gray-700 mt-1">
              Add your first bottle by snapping a photo of the label or scanning a wine list.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/upload-wine">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add a wine
              </Button>
            </Link>
            <Link href="/scan">
              <Button variant="outline">
                <ScanText className="mr-2 h-4 w-4" /> Scan list
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---- Main Page -----------------------------------------------------------
export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [wines, setWines] = useState<Wine[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        // Using your existing API endpoint
        const res = await api.get("/api/v1/wines/my");
        const data = res.data;
        const items: Wine[] = Array.isArray(data) ? data : data.items ?? [];
        if (!cancelled) setWines(items);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load wines");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const hasWines = useMemo(() => (wines?.length ?? 0) > 0, [wines]);

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-wine-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-wine-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight">
              Pocket Pallet
            </Link>
            <p className="text-gray-700 mt-1">
              Everything you&apos;ve added via label photos or OCR lives here. Add tasting notes to teach Pocket Pallet your palate.
            </p>
          </div>
          <Link href="/admin/scraper" className="text-sm text-wine-600 hover:text-wine-700 hover:underline">
            Admin →
          </Link>
        </div>
      </header>

      {/* Primary actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Re-use existing routes/components */}
        <ActionTile
          href="/upload-wine" // existing single-label upload flow
          title="Add a Wine"
          subtitle="Upload a single label"
          icon={Camera}
          testId="tile-add-wine"
        />

        <ActionTile
          href="/scan" // existing OCR list scanner
          title="Scan Wine List"
          subtitle="OCR extract"
          icon={ScanText}
          testId="tile-scan"
        />

        <ActionTile
          href="/wines"
          title="Browse All"
          subtitle="View full collection"
          icon={Rows3}
          testId="tile-browse"
        />

        <ActionTile
          href="/merchants"
          title="Discover Merchants"
          subtitle="Explore wine shops & bistros"
          icon={Store}
          testId="tile-merchants"
        />
      </div>

      {/* Data states */}
      {wines === null && !error && (
        <Card className="mt-8">
          <CardContent className="p-6 text-sm text-gray-700">Loading your wines…</CardContent>
        </Card>
      )}

      {error && (
        <Card className="mt-8 border-red-300">
          <CardContent className="p-6 text-sm text-red-700">
            Couldn&apos;t load wines: {error}
          </CardContent>
        </Card>
      )}

      {wines && (hasWines ? <RecentlyAdded items={wines} /> : <EmptyState />)}
    </div>
  );
}
