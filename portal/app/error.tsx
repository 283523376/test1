"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl py-16">
      <Alert tone="error">
        <p className="font-semibold">Something went wrong loading this page.</p>
        <p className="mt-1 text-sm">{error.message}</p>
      </Alert>
      <Button variant="secondary" onClick={reset} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
