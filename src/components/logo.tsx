import { cn } from '@/lib/utils';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('w-6 h-6', props.className)}
      {...props}
    >
      <title>WellAware AI Logo</title>
      <path d="M8.5 18c2.8-2.8 4.2-6.3 3.5-9.5-1.4 3.2-4.1 6-7 8.8" />
      <path d="M15.5 18c-2.8-2.8-4.2-6.3-3.5-9.5 1.4 3.2 4.1 6 7 8.8" />
      <path d="M12 15.5V6" />
      <path d="M2 17s2.5-3 5-3 5 3 5 3" />
      <path d="M12 17s2.5-3 5-3 5 3 5 3" />
      <path d="M12 21a9 9 0 0 0-9-9" />
      <path d="M12 21a9 9 0 0 1 9-9" />
    </svg>
  );
}
