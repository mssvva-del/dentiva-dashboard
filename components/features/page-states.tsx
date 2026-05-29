"use client";

import { Loader2, AlertCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/constants";

export function LoadingState({ label = COPY.loading }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground"
    >
      <Loader2 className="h-6 w-6 animate-spin text-teal" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
      <div>
        <p className="font-medium text-foreground">{COPY.errorTitle}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {COPY.errorBody}
        </p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {COPY.retry}
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
      <Inbox className="h-7 w-7" aria-hidden />
      <p className="max-w-sm text-sm">{message}</p>
    </div>
  );
}
