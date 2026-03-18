import { A2UIProtocol } from '../a2ui/types.ts';

// ==============================================
// 国内大模型：豆包 AI (Doubao) - 2026最新接口
// 申请地址：https://www.volcengine.com/ark
// 文档参考：https://www.volcengine.com/docs/82379/1263279
// ==============================================
export async function generateA2UIProtocol(prompt: string): Promise<A2UIProtocol> {
  // 1. 替换为你的豆包API Key（火山方舟控制台获取）
  const API_KEY = 'd389855f-7f14-4f78-be00-99d6180ad128';
  // 2. 最新接口地址（重点：completions 带 s）
  const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

  // 系统提示词：强制输出标准A2UI协议JSON
  const systemPrompt = `
你是一个严格的A2UI协议生成器，仅输出符合以下规则的JSON数据，不包含任何多余文本、解释、注释：
1. 必须包含字段：version（固定为"1.0.0"）、componentName、props
2. componentName 仅允许取值：A2Button / A2Input / A2Form
3. 支持children字段（子组件数组，递归结构）
4. 支持events字段（事件数组，包含name和handler）
5. 支持layout字段（布局样式对象）
6. 输出的JSON必须可以直接被JSON.parse解析

示例格式：
{
  "version": "1.0.0",
  "componentName": "A2Form",
  "props": {
    "layout": "vertical",
    "labelWidth": "100px"
  },
  "children": [
    {
      "componentName": "A2Input",
      "props": {
        "type": "text",
        "placeholder": "请输入账号"
      },
      "events": [
        {
          "name": "onChange",
          "handler": "handleInputChange"
        }
      ]
    },
    {
      "componentName": "A2Button",
      "props": {
        "type": "primary",
        "size": "md"
      },
      "events": [
        {
          "name": "onClick",
          "handler": "handleLogin"
        }
      ],
      "children": ["登录"]
    }
  ],
  "layout": {
    "width": "400px",
    "margin": "50px auto"
  }
}
`;

  try {
    // 调用最新豆包API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`, // 认证方式不变
      },
      body: JSON.stringify({
        model: 'doubao-seed-2-0-pro-260215', // 最新模型名称（替换旧的doubao-1.5-pro）
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1, // 低随机性，保证输出稳定
        max_tokens: 2000,
        stream: false // 关闭流式输出，直接返回完整结果
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`API请求失败：${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 清洗输出（移除可能的多余文本，只保留JSON）
    const jsonMatch = content.trim().match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI返回非标准JSON格式：' + content);
    }

    // 解析JSON并返回
    return JSON.parse(jsonMatch[0]) as A2UIProtocol;
  } catch (error) {
    console.error('生成A2UI协议失败：', error);
    // 返回默认协议（降级处理）
    return {
      version: '1.0.0',
      componentName: 'A2Button',
      props: { type: 'primary', size: 'md' },
      children: ['默认按钮'],
      events: [{ name: 'onClick', handler: 'handleClick' }]
    };
  }
}