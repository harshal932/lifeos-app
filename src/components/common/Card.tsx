import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'subtle' | 'elevated' | 'flat';
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
    subtle: 'bg-secondary/30 text-foreground border border-border/40',
    elevated: 'bg-card text-card-foreground border border-border/70 shadow-elevated',
    flat: 'bg-card text-card-foreground border border-transparent',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 sm:p-5 transition-all duration-150 ${variantStyles[variant]} ${
        onClick
          ? 'cursor-pointer active:scale-[0.99] hover:border-border hover:bg-card/95'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
