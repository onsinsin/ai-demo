import { JSONSchemaType } from 'ajv';
import { A2UIProtocol } from './types.ts';

// A2UI协议JSON Schema（用于校验）
export const A2UISchema: JSONSchemaType<A2UIProtocol> = {
  type: 'object',
  required: ['version', 'componentName', 'props'],
  properties: {
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+$'
    },
    componentName: {
      type: 'string',
      enum: ['A2Button', 'A2Input', 'A2Form']
    },
    props: {
      type: 'object'
    },
    children: {
      type: 'array',
      items: { $ref: '#' },
      nullable: true
    },
    events: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'handler'],
        properties: {
          name: { type: 'string' },
          handler: { type: 'string' }
        }
      },
      nullable: true
    },
    layout: {
      type: 'object',
      nullable: true
    }
  }
};