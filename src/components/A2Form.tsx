import React, { FC, ReactNode } from 'react';

interface A2FormProps {
  layout?: 'horizontal' | 'vertical';
  labelWidth?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

export const A2Form: FC<A2FormProps> = ({ 
  layout = 'vertical', 
  labelWidth = '80px', 
  children, 
  style 
}) => {
  const baseStyles = {
    display: 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    gap: layout === 'vertical' ? '16px' : '8px',
    width: '100%',
    ...style
  };

  // 处理表单项样式
  const formItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%'
  };

  // 递归处理子元素，添加表单项样式
  const renderFormItems = (children: ReactNode) => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return (
          <div style={formItemStyles}>
            {layout === 'horizontal' && (
              <label style={{ width: labelWidth, textAlign: 'right' }}>
                {child.props.label || ''}
              </label>
            )}
            <div style={{ flex: 1 }}>{child}</div>
          </div>
        );
      }
      return child;
    });
  };

  return (
    <div style={baseStyles}>
      {renderFormItems(children)}
    </div>
  );
};