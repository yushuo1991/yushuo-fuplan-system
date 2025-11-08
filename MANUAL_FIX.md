# 手动修复指南

## 如果git push失败，请手动在Netlify中更新以下文件：

### 1. 更新 src/lib/supabaseClient.ts

将文件内容完全替换为：

```typescript
import { createClient } from '@supabase/supabase-js';

// 直接使用硬编码值，绕过Netlify环境变量问题
const SUPABASE_URL = 'https://wmwcnnjvdbicxiculumk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtd2Nubmp2ZGJpY3hpY3VsdW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzI4NDMsImV4cCI6MjA3MjYwODg0M30.uoQiSQbZwRdjZ3OOBysyaFeDn0qn31eR3ZM_PtmrHPg';

console.log('🚀 Supabase Client Initialized');
console.log('URL:', SUPABASE_URL);
console.log('Key loaded successfully');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 2. 更新 src/main.tsx

将调试代码替换为：

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

// 应用启动日志
console.log('🎯 宇硕复盘图鉴系统启动中...');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
```

## 手动更新步骤：

1. 登录 Netlify
2. 进入项目
3. 找到文件编辑功能或通过GitHub直接编辑
4. 更新上述两个文件
5. 触发重新部署

## 预期结果：

- ✅ 网站不再空白
- ✅ 控制台显示启动日志
- ✅ 登录功能正常工作
- ✅ 所有Supabase功能正常

这个版本完全绕过了环境变量问题，应该能立即解决所有问题！