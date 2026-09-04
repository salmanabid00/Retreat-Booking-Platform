import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-stone-100 text-stone-900 shadow hover:bg-stone-100/80 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700',
        secondary:
          'border-stone-800/80 bg-stone-900/90 text-stone-300 hover:bg-stone-800',
        outline:
          'border-stone-700/80 text-stone-300 bg-transparent',
        success:
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium',
        warning:
          'border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium',
        destructive:
          'border-rose-500/30 bg-rose-500/10 text-rose-400 font-medium',
        neutral:
          'border-stone-700/60 bg-stone-800/60 text-stone-300 font-medium',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
