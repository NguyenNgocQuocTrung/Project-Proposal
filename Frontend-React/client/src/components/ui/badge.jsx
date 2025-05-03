import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
  // You can add custom variants here
};

export function Badge({ 
  className, 
  variant = 'default', 
  ...props 
}) {
  // Check if className contains a background color class
  const hasCustomBgClass = className && /bg-\w+/.test(className);
  
  // If a custom background class is provided, don't apply the variant background
  const variantClass = hasCustomBgClass ? '' : badgeVariants[variant] || badgeVariants.default;
  
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantClass,
        className
      )}
      {...props}
    />
  );
}