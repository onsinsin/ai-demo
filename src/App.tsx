// @ts-nocheck
import { useState } from 'react';
import { generateA2UIProtocol } from './ai/service.ts';
import { validateAndFixProtocol } from './a2ui/validator.ts';
import { A2UIRenderer } from './renderer/Renderer.tsx';
import { A2UIProtocol } from './a2ui/types.ts';

// 默认协议
const defaultProtocol: A2UIProtocol = {
  version: '1.0.0',
  componentName: 'A2Button',
  props: { type: 'default' },
  children: ['默认按钮']
};

function App() {
  const [userInput, setUserInput] = useState('');
  const [protocol, setProtocol] = useState<A2UIProtocol>(defaultProtocol);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 生成协议并渲染
  const handleGenerate = async () => {
    if (!userInput) {
      setError('请输入需求描述');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // 1. 调用AI生成协议
      const rawProtocol = await generateA2UIProtocol(userInput);
      // 2. 校验并修正
      const fixedProtocol = validateAndFixProtocol(rawProtocol);
      // 3. 更新协议状态
      setProtocol(fixedProtocol);
    } catch (e) {
      setError('生成失败：' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>A2UI AI 生成 Demo（国内大模型版）</h1>
      
      {/* 输入区 */}
      <div style={{ marginBottom: '20px' }}>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="输入需求，例如：生成登录表单，包含账号输入框、密码输入框和primary类型的登录按钮"
          style={{ width: '100%', height: '100px', padding: '8px', fontSize: '14px' }}
        />
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          style={{ marginTop: '8px', padding: '8px 16px', backgroundColor: '#1677ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? '生成中...' : '生成界面'}
        </button>
        {error && <div style={{ color: 'red', marginTop: '8px' }}>{error}</div>}
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* 协议预览区 */}
        <div style={{ flex: 1, border: '1px solid #e5e5e5', padding: '16px', borderRadius: '4px' }}>
          <h3>A2UI协议预览</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {JSON.stringify(protocol, null, 2)}
          </pre>
        </div>

        {/* 渲染预览区 */}
        <div style={{ flex: 1, border: '1px solid #e5e5e5', padding: '16px', borderRadius: '4px' }}>
          <h3>界面预览</h3>
          <div style={{ marginTop: '16px' }}>
            <A2UIRenderer protocol={protocol} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;