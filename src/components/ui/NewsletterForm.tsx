"use client";

import { useActionState } from "react";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/lib/actions/newsletter";

export function NewsletterForm() {
  const [state, action, isPending] = useActionState(subscribeNewsletter, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="relative group/input">
        <Mail
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-blue-500 transition-colors"
          size={16}
          aria-hidden="true"
        />
        <Input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          className="h-12 pl-12 bg-background/50 border-border/10 focus:border-blue-500/50 transition-all shadow-sm rounded-xl font-bold"
        />
      </div>

      {state && (
        <p className={`text-xs font-bold px-1 ${state.success ? "text-emerald-500" : "text-red-500"}`}>
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60"
      >
        {isPending ? "Subscribing..." : <> Subscribe <Send size={14} aria-hidden="true" /> </>}
      </Button>
    </form>
  );
}
