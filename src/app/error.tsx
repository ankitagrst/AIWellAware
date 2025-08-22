'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold md:text-3xl font-headline">
          Something went wrong!
        </h2>
        <p className="text-muted-foreground max-w-md">
          An unexpected error occurred. Please try again. If the problem persists, please contact support.
        </p>
        <Button onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </main>
  );
}
