import { BottomNav } from "@/components/app/bottom-nav";

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
