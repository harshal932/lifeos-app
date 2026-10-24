import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-card text-card-foreground rounded-2xl border border-border/80 shadow-subtle p-4 sm:p-5 transition-all ${
        onClick ? 'cursor-pointer active:scale-[0.99] hover:border-primary/40' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
