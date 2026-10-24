import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
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
    'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl select-none';

  const variants = {
    primary: 'bg-primary text-primary-foreground shadow-sm hover:opacity-95',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-border bg-card/50 hover:bg-accent hover:text-accent-foreground text-foreground',
    danger: 'bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/20',
    ghost: 'hover:bg-accent/50 text-foreground',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
    md: 'text-sm px-4 py-2.5 h-10 gap-2',
    lg: 'text-base px-5 py-3 h-12 gap-2.5 font-semibold',
    icon: 'h-10 w-10 p-0',
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
