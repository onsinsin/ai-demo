import { A2Button } from '../components/A2Button.tsx';
import { A2Input } from '../components/A2Input.tsx';
import { A2Form } from '../components/A2Form.tsx';

// 组件注册表：协议componentName → 实际组件
export const componentRegistry = {
  A2Button,
  A2Input,
  A2Form
};

// 全局事件池：存储事件处理函数
export const eventPool = {
  handleClick: () => alert('按钮点击！'),
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => console.log('输入值：', e.target.value),
  handleLogin: () => alert('登录按钮点击！')
};