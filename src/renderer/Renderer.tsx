import { FC } from 'react';
import { A2UIProtocol } from '../a2ui/types.ts';
import { componentRegistry, eventPool } from './registry.ts';

// 递归渲染A2UI协议为组件
export const A2UIRenderer: FC<{ protocol: A2UIProtocol }> = ({ protocol }) => {
  const { componentName, props, children, events, layout } = protocol;
  
  // 获取组件（降级处理）
  const Component = componentRegistry[componentName as keyof typeof componentRegistry];
  if (!Component) {
    return <div style={{ color: 'red' }}>未知组件：{componentName}</div>;
  }

  // 合并布局样式
  const mergedProps = {
    ...props,
    style: { ...layout, ...props.style }
  };

  // 绑定事件
  const eventHandlers = events?.reduce((acc, event) => {
    acc[event.name] = (e: any) => {
      // 调用全局事件池中的函数
      eventPool[event.handler as keyof typeof eventPool]?.(e);
    };
    return acc;
  }, {} as Record<string, any>) || {};

  // 递归渲染子组件
  const renderChildren = () => {
    if (!children || children.length === 0) return null;
    return children.map((child, index) => (
      <A2UIRenderer key={index} protocol={child} />
    ));
  };

  return (
    <Component {...mergedProps} {...eventHandlers}>
      {renderChildren()}
    </Component>
  );
};