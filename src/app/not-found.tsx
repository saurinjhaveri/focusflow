import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
        <Zap className="h-7 w-7 text-white" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">Page not found</p>
        <p className="text-sm text-muted-foreground">
          This page doesn't exist or was moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Go to Today</Link>
      </Button>
    </div>
  );
}
