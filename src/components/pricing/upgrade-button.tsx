"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setPlan } from "@/app/pricing/actions";
import type { Plan } from "@/lib/entitlements";

export function UpgradeButton({ target }: { target: Plan }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  const onClick = () => {
    startTransition(async () => {
      const res = await setPlan(target);
      setNote(res.message);
      if (res.ok) router.refresh();
    });
  };

  return (
    <div>
      <Button size="lg" className="w-full" onClick={onClick} disabled={pending}>
        {pending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        {target === "premium" ? "Upgrade to Premium" : "Switch to Free"}
      </Button>
      {note && <p className="mt-3 text-center text-sm text-muted-foreground">{note}</p>}
    </div>
  );
}
