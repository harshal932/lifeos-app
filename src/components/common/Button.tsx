import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold transition-all duration-120 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-lg select-none';

  const variants = {
    primary:
      'bg-primary text-primary-foreground shadow-subtle hover:bg-primary/90 active:bg-primary/95',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50',
    outline:
      'border border-border/80 bg-card hover:bg-secondary/50 hover:text-foreground text-foreground shadow-subtle',
    danger:
      'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/25',
    success:
      'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/25',
    ghost: 'hover:bg-secondary/60 text-muted-foreground hover:text-foreground',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 h-8 gap-1.5',
    md: 'text-xs sm:text-sm px-3.5 py-2 h-9 sm:h-10 gap-2',
    lg: 'text-sm sm:text-base px-4 py-2.5 h-11 gap-2.5 font-bold',
    icon: 'h-9 w-9 p-0',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
