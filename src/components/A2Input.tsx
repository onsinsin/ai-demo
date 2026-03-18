import React, { FC, InputHTMLAttributes } from 'react';

interface A2InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'password';
  size?: 'sm' | 'md' | 'lg';
}

export const A2Input: FC<A2InputProps> = ({ 
  type = 'text', 
  size = 'md', 
  ...props 
}) => {
  const baseStyles = {
    padding: size === 'sm' ? '4px 8px' : size === 'lg' ? '12px 16px' : '8px 12px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    fontSize: size === 'sm' ? '12px' : size === 'lg' ? '16px' : '14px',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  return <input type={type} style={{ ...baseStyles, ...props.style }} {...props} />;
};