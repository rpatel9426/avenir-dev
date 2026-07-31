"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, MailCheck } from "lucide-react";
import { signUp, type AuthResult } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DemoNotice } from "@/components/auth/demo-notice";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending && <Loader2 className="animate-spin" />}
      {pending ? "Creating account…" : "Create account"}
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState<AuthResult, FormData>(signUp, {});

  if (state.checkEmail) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-accent-wash text-accent">
          <MailCheck className="size-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
          We&apos;ve sent you a confirmation link. Open it and Avenir will pick
          up right where you left off.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          Already confirmed?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Start your first run
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Create a free account — no card, no wearable needed.
        </p>
      </div>

      <DemoNotice />

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">First name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="given-name"
            placeholder="Alex"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
        </div>

        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already running with us?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
