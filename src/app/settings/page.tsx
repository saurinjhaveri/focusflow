import { Suspense } from "react";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { PersonsSettings } from "@/components/settings/persons-settings";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageWrapper>
        <div className="mb-5">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your people and preferences</p>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <PersonsSettings />
          </Suspense>
        </div>
      </PageWrapper>
    </AppShell>
  );
}
