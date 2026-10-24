import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  className = '',
}) => {
  const variants = {
    primary: 'bg-primary/15 text-primary border border-primary/20',
    secondary: 'bg-secondary text-secondary-foreground border border-border/60',
    success: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/20',
    destructive: 'bg-destructive/15 text-destructive border border-destructive/20',
    outline: 'border border-border text-muted-foreground',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
