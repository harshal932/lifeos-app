import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'subtle' | 'elevated';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-card text-card-foreground border border-border/70 shadow-subtle',
    glass: 'glass-panel text-card-foreground border border-border/60 shadow-subtle',
    subtle: 'bg-secondary/40 text-foreground border border-border/40',
    elevated: 'bg-card text-card-foreground border border-border/60 shadow-elevated'
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-200 ${variantStyles[variant]} ${
        onClick
          ? 'cursor-pointer active:scale-[0.985] hover:border-primary/40 hover:shadow-md'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
