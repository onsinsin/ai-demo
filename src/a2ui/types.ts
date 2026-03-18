// A2UI协议核心类型
export interface A2UIEvent {
  name: string;       // 事件名（如onClick）
  handler: string;    // 事件处理函数名
}

export interface A2UIProtocol {
  version: string;                // 协议版本
  componentName: string;          // 组件名
  props: Record<string, any>;     // 组件属性
  children?: A2UIProtocol[];      // 子组件（递归）
  events?: A2UIEvent[];           // 事件
  layout?: Record<string, any>;   // 布局样式
}

// 支持的A2UI组件列表
export type A2UIComponentName = 'A2Button' | 'A2Input' | 'A2Form';