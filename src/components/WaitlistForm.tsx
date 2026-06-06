import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlist } from "@/lib/waitlist.functions";

const emailSchema = z.string().trim().email("Please enter a valid email").max(255);

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const submit = useServerFn(joinWaitlist);

  const mutation = useMutation({
    mutationFn: (value: string) => submit({ data: { email: value } }),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setClientError(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    mutation.mutate(parsed.data);
  };

  if (mutation.isSuccess) {
    return (
      <div className="rounded-md border border-border bg-card p-4">
        <p className="font-display text-sm uppercase tracking-[0.25em] text-primary">
          You're on the list
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          We'll be in touch as the doors to Ikigaro open.
        </p>
      </div>
    );
  }

  const errorMessage =
    clientError ?? (mutation.isError ? "Something went wrong. Please try again." : null);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row" noValidate>
      <Input
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@domain.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={mutation.isPending}
        aria-label="Email address"
        aria-invalid={!!errorMessage}
        className="h-11 flex-1"
      />
      <Button
        type="submit"
        disabled={mutation.isPending}
        className="h-11 px-6 font-display tracking-wide"
      >
        {mutation.isPending ? "Joining…" : "Join waitlist"}
      </Button>
      {errorMessage && (
        <p className="text-xs text-destructive sm:basis-full" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
