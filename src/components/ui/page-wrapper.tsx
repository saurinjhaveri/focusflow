import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn("mx-auto w-full max-w-2xl px-4 py-5 md:px-6 md:py-6", className)}>
      {children}
    </div>
  );
}
