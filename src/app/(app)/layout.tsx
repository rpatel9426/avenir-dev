import { BottomNav } from "@/components/app/bottom-nav";

// Authenticated app pages depend on the signed-in user (cookies) — they must be
// rendered per-request, never statically prerendered/cached as a demo snapshot.
export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md">
      {/* Content area — padded for the floating bottom nav. */}
      <div className="px-5 pb-28 pt-6">{children}</div>
      <BottomNav />
    </div>
  );
}
