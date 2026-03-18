import Ajv from 'ajv';
import { A2UISchema } from './schema.ts';
import { A2UIProtocol } from './types.ts';

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(A2UISchema);

// 校验并自动修正A2UI协议
export function validateAndFixProtocol(rawProtocol: any): A2UIProtocol {
  // 基础容错：确保是对象
  const protocol = typeof rawProtocol === 'object' && rawProtocol !== null 
    ? rawProtocol 
    : { version: '1.0.0', componentName: 'A2Button', props: {} };

  // 校验
  const valid = validate(protocol);
  
  // 自动修正
  if (!valid) {
    // 修正版本号
    protocol.version = protocol.version || '1.0.0';
    // 修正组件名（降级为默认）
    const validComponents = ['A2Button', 'A2Input', 'A2Form'];
    if (!validComponents.includes(protocol.componentName)) {
      protocol.componentName = 'A2Button';
    }
    // 确保props是对象
    protocol.props = typeof protocol.props === 'object' ? protocol.props : {};
    // 确保children是数组
    protocol.children = Array.isArray(protocol.children) ? protocol.children : [];
  }

  return protocol as A2UIProtocol;
}