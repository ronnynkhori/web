import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Skeleton } from "@/components/admin/ui/skeleton";

function ShellFallback() {
  return (
    <div className="flex min-h-svh">
      <div className="hidden w-64 shrink-0 bg-sidebar md:block" />
      <div className="flex flex-1 flex-col">
        <div className="h-14 border-b md:h-16" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pt-5 md:px-8 md:pt-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 h-[var(--tabbar-h)] bg-sidebar md:hidden" />
    </div>
  );
}

export default function ConsoleLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
