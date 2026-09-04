import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-stone-100 text-stone-900 shadow-sm hover:bg-stone-200 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white',
        primary:
          'bg-stone-900 text-stone-50 border border-stone-800 shadow-sm hover:bg-stone-800 dark:bg-stone-50 dark:text-stone-900 dark:border-stone-200 dark:hover:bg-stone-200',
        brand:
          'bg-amber-600 text-white shadow-sm hover:bg-amber-500 dark:bg-amber-500 dark:text-stone-950 dark:hover:bg-amber-400 font-bold',
        destructive:
          'bg-rose-600/90 text-white shadow-sm hover:bg-rose-600 dark:bg-rose-500/20 dark:text-rose-300 dark:border dark:border-rose-500/30 dark:hover:bg-rose-500/30',
        outline:
          'border border-stone-800 bg-stone-950/40 text-stone-200 hover:bg-stone-900 hover:text-stone-50 hover:border-stone-700',
        secondary:
          'bg-stone-900 text-stone-200 border border-stone-800/80 hover:bg-stone-800/90 hover:text-stone-100',
        ghost:
          'text-stone-300 hover:bg-stone-900 hover:text-stone-100',
        link:
          'text-stone-300 underline-offset-4 hover:underline hover:text-stone-100 p-0 h-auto',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-[11px]',
        lg: 'h-11 rounded-2xl px-6 text-sm',
        icon: 'h-9 w-9 rounded-xl',
        iconSm: 'h-7 w-7 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
