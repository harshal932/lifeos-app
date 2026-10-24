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
    'inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none rounded-xl select-none';

  const variants = {
    primary:
      'bg-primary text-primary-foreground shadow-sm hover:brightness-105 active:brightness-95 shadow-primary/20',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90',
    outline:
      'border border-border/80 bg-card/60 hover:bg-secondary/60 hover:text-foreground text-foreground active:bg-secondary',
    danger:
      'bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/20 active:bg-destructive/30',
    success:
      'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/20 active:bg-emerald-500/30',
    ghost: 'hover:bg-secondary/60 text-foreground active:bg-secondary',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 h-8 gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2.5 h-10 gap-2',
    lg: 'text-base px-5 py-3 h-12 gap-2.5 font-bold rounded-2xl',
    icon: 'h-10 w-10 p-0 rounded-xl',
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
