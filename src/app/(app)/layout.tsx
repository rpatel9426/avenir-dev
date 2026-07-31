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
      {/* Gutter is 26. Bottom padding clears the word-tab bar. */}
      <div className="px-gutter pb-36 pt-6">{children}</div>
      <BottomNav />
    </div>
  );
}
