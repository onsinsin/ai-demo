import React, { FC, ButtonHTMLAttributes } from 'react';

interface A2ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  type?: 'primary' | 'default' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const A2Button: FC<A2ButtonProps> = ({ 
  type = 'default', 
  size = 'md', 
  children, 
  ...props 
}) => {
  // 基础样式
  const baseStyles = {
    padding: size === 'sm' ? '4px 8px' : size === 'lg' ? '12px 24px' : '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: size === 'sm' ? '12px' : size === 'lg' ? '16px' : '14px',
    backgroundColor: type === 'primary' ? '#1677ff' : type === 'danger' ? '#ff4d4f' : '#f5f5f5',
    color: type === 'primary' || type === 'danger' ? '#fff' : '#000',
  };

  return (
    <button style={{ ...baseStyles, ...props.style }} {...props}>
      {children}
    </button>
  );
};