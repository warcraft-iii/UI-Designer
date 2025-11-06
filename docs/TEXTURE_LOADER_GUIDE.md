# 纹理加载系统使用文档

## 概述

`TextureLoader` 是一个统一的纹理加载接口，整合了 BLP 解码器和 MPQ 管理器，支持多种纹理来源。

## 功能特性

- ✅ **多源支持** - 本地文件、WC3 资源、Data URL、HTTP URL
- ✅ **自动识别** - 智能检测纹理类型
- ✅ **BLP 解码** - 自动解码 BLP 格式
- ✅ **智能缓存** - LRU 缓存策略，提升性能
- ✅ **预加载** - 批量预加载纹理
- ✅ **类型安全** - 完整的 TypeScript 类型

## 基础用法

### 1. 导入模块

```typescript
import { textureLoader, loadTexture } from '@/utils/textureLoader';
```

### 2. 加载纹理

```typescript
// 快捷方式
const url = await loadTexture('UI\\Widgets\\EscMenu\\Human\\button-background.blp');

// 使用实例
const url2 = await textureLoader.loadTexture('C:\\Textures\\icon.png');

// 在 React 中使用
<img src={url} alt="Texture" />
```

### 3. 支持的路径格式

```typescript
// 1. WC3 资源路径 (从 MPQ 档案)
await loadTexture('UI\\Widgets\\Console\\Human\\CommandButton-Up.blp');
await loadTexture('Textures/Black32.blp'); // 也支持正斜杠

// 2. 本地文件路径
await loadTexture('C:\\Users\\YourName\\Pictures\\texture.blp');
await loadTexture('D:\\Projects\\Assets\\icon.png');

// 3. Data URL
await loadTexture('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE...');

// 4. HTTP(S) URL
await loadTexture('https://example.com/textures/image.png');
```

## 高级功能

### 预加载纹理

批量加载纹理以提升性能：

```typescript
import { preloadTextures } from '@/utils/textureLoader';

const textures = [
  'UI\\Widgets\\EscMenu\\Human\\button-background.blp',
  'UI\\Widgets\\Console\\Human\\CommandButton-Up.blp',
  'Textures\\Black32.blp',
];

const results = await preloadTextures(textures);

// results 是 Map<string, string>
results.forEach((url, path) => {
  console.log(`${path} -> ${url}`);
});
```

### 获取纹理信息

```typescript
const info = await textureLoader.getTextureInfo('UI\\Widgets\\EscMenu\\Human\\button.blp');

console.log(info);
// {
//   path: 'UI\\Widgets\\EscMenu\\Human\\button.blp',
//   type: 'wc3',
//   url: 'data:image/png;base64,...',
//   cached: true
// }
```

### 检查纹理是否存在

```typescript
import { hasTexture } from '@/utils/textureLoader';

if (await hasTexture('UI\\Widgets\\Console\\Human\\CommandButton-Up.blp')) {
  console.log('纹理存在');
}
```

### 纹理类型检测

```typescript
import { TextureType } from '@/utils/textureLoader';

const type = textureLoader.getTextureType('UI\\Widgets\\EscMenu\\Human\\button.blp');

switch (type) {
  case TextureType.WC3_PATH:
    console.log('WC3 资源');
    break;
  case TextureType.LOCAL_FILE:
    console.log('本地文件');
    break;
  case TextureType.DATA_URL:
    console.log('Data URL');
    break;
  case TextureType.HTTP_URL:
    console.log('HTTP URL');
    break;
}
```

## 缓存管理

### 查看缓存状态

```typescript
const status = textureLoader.getCacheStatus();

console.log(`缓存数量: ${status.size}/${status.maxSize}`);

status.entries.forEach(entry => {
  console.log(`${entry.path}:`);
  console.log(`  类型: ${entry.type}`);
  console.log(`  访问次数: ${entry.accessCount}`);
  console.log(`  缓存时间: ${(entry.age / 1000).toFixed(1)}s`);
});
```

### 配置缓存选项

```typescript
textureLoader.setCacheOptions({
  maxSize: 200,              // 最大缓存数量
  maxAge: 60 * 60 * 1000,    // 缓存过期时间 (1小时)
});
```

### 清空缓存

```typescript
// 清空所有缓存
textureLoader.clearCache();

// 移除特定纹理
textureLoader.removeFromCache('UI\\Widgets\\EscMenu\\Human\\button.blp');
```

### 强制重新加载

```typescript
// 忽略缓存，强制重新加载
const url = await textureLoader.loadTexture('path/to/texture.blp', true);
```

## React 集成

### 纹理预览组件

```typescript
import React, { useState, useEffect } from 'react';
import { loadTexture } from '@/utils/textureLoader';

interface TexturePreviewProps {
  path: string;
}

export const TexturePreview: React.FC<TexturePreviewProps> = ({ path }) => {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    if (!path) {
      setUrl('');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    
    loadTexture(path)
      .then(url => {
        setUrl(url);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [path]);
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!url) return null;
  
  return (
    <img 
      src={url} 
      alt={path}
      style={{ maxWidth: '256px', imageRendering: 'pixelated' }}
    />
  );
};
```

### 纹理选择器

```typescript
import React, { useState } from 'react';
import { mpqManager } from '@/utils/mpqManager';
import { TexturePreview } from './TexturePreview';

export const TextureSelector: React.FC<{
  value: string;
  onChange: (path: string) => void;
}> = ({ value, onChange }) => {
  const [showBrowser, setShowBrowser] = useState(false);
  const [blpFiles, setBlpFiles] = useState<string[]>([]);
  
  const handleBrowse = () => {
    // 加载 BLP 文件列表
    const files = mpqManager.getUIBLPFiles();
    setBlpFiles(files.map(f => f.fileName));
    setShowBrowser(true);
  };
  
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="纹理路径..."
      />
      <button onClick={handleBrowse}>浏览 WC3 纹理</button>
      
      {value && <TexturePreview path={value} />}
      
      {showBrowser && (
        <div className="texture-browser">
          <h3>选择纹理</h3>
          <div className="texture-list">
            {blpFiles.map(file => (
              <div
                key={file}
                onClick={() => {
                  onChange(file);
                  setShowBrowser(false);
                }}
                className="texture-item"
              >
                <TexturePreview path={file} />
                <span>{file.split('\\').pop()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### 纹理网格预览

```typescript
import React, { useState, useEffect } from 'react';
import { mpqManager } from '@/utils/mpqManager';
import { preloadTextures } from '@/utils/textureLoader';

export const TextureGrid: React.FC = () => {
  const [textures, setTextures] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadTextures = async () => {
      // 获取所有 UI BLP 文件
      const files = mpqManager.getUIBLPFiles();
      const paths = files.slice(0, 50).map(f => f.fileName); // 限制数量
      
      // 预加载
      const results = await preloadTextures(paths);
      setTextures(results);
      setLoading(false);
    };
    
    loadTextures();
  }, []);
  
  if (loading) return <div>加载中...</div>;
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
      {Array.from(textures.entries()).map(([path, url]) => (
        <div key={path} title={path}>
          <img src={url} alt={path} style={{ width: '100%' }} />
        </div>
      ))}
    </div>
  );
};
```

## 完整示例

### 在 PropertiesPanel 中使用

```typescript
import React from 'react';
import { TexturePreview } from '@/components/TexturePreview';
import { textureLoader } from '@/utils/textureLoader';

export const PropertiesPanel: React.FC = () => {
  const [frame, setFrame] = useState<FrameData>({ /* ... */ });
  
  const handleTextureChange = async (newPath: string) => {
    // 验证纹理是否存在
    const exists = await textureLoader.hasTexture(newPath);
    
    if (!exists) {
      alert('纹理不存在');
      return;
    }
    
    // 更新 Frame 数据
    setFrame(prev => ({
      ...prev,
      diskTexture: newPath,
    }));
  };
  
  return (
    <div>
      <label>纹理路径</label>
      <input
        type="text"
        value={frame.diskTexture || ''}
        onChange={e => handleTextureChange(e.target.value)}
      />
      
      {frame.diskTexture && (
        <TexturePreview path={frame.diskTexture} />
      )}
    </div>
  );
};
```

### Canvas 集成

```typescript
import React, { useEffect, useState } from 'react';
import { loadTexture } from '@/utils/textureLoader';

export const CanvasFrame: React.FC<{ frame: FrameData }> = ({ frame }) => {
  const [backgroundURL, setBackgroundURL] = useState<string>('');
  
  useEffect(() => {
    if (frame.diskTexture || frame.wc3Texture) {
      const path = frame.diskTexture || frame.wc3Texture;
      
      loadTexture(path!)
        .then(url => setBackgroundURL(url))
        .catch(err => console.error('加载纹理失败:', err));
    }
  }, [frame.diskTexture, frame.wc3Texture]);
  
  return (
    <div
      style={{
        width: frame.width,
        height: frame.height,
        backgroundImage: backgroundURL ? `url(${backgroundURL})` : undefined,
        backgroundSize: 'cover',
      }}
    >
      {frame.text}
    </div>
  );
};
```

## 性能优化

### 1. 使用预加载

对于已知的纹理列表，使用预加载可以大幅提升性能：

```typescript
// 在应用启动时预加载常用纹理
const commonTextures = [
  'UI\\Widgets\\EscMenu\\Human\\button-background.blp',
  'UI\\Widgets\\Console\\Human\\CommandButton-Up.blp',
  // ...
];

await preloadTextures(commonTextures);
```

### 2. 调整缓存大小

根据应用需求调整缓存：

```typescript
// 大型项目 - 增加缓存
textureLoader.setCacheOptions({ maxSize: 500 });

// 内存受限 - 减少缓存
textureLoader.setCacheOptions({ maxSize: 50 });
```

### 3. 懒加载

只在需要时加载纹理：

```typescript
const LazyTexture: React.FC<{ path: string }> = ({ path }) => {
  const [visible, setVisible] = useState(false);
  
  // 使用 IntersectionObserver 检测可见性
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
      }
    });
    
    // ... 观察逻辑
  }, []);
  
  return visible ? <TexturePreview path={path} /> : <div>占位符</div>;
};
```

### 4. 性能基准

```typescript
// 测试代码
const iterations = 1000;
const path = 'UI\\Widgets\\EscMenu\\Human\\button.blp';

// 首次加载
const start1 = performance.now();
await loadTexture(path);
console.log(`首次: ${performance.now() - start1}ms`);

// 缓存加载
const start2 = performance.now();
await loadTexture(path);
console.log(`缓存: ${performance.now() - start2}ms`);
```

**预期性能**:
- Data URL 首次: ~0.01ms
- Data URL 缓存: ~0.0002ms (50x 加速)
- BLP 解码: ~2-5ms (取决于尺寸)
- BLP 缓存: ~0.0002ms

## 错误处理

```typescript
try {
  const url = await loadTexture('path/to/texture.blp');
  // 使用纹理
} catch (error) {
  if (error.message.includes('纹理路径不能为空')) {
    console.error('路径为空');
  } else if (error.message.includes('不支持的纹理路径')) {
    console.error('路径格式错误');
  } else if (error.message.includes('WC3 纹理未找到')) {
    console.error('MPQ 中找不到纹理');
  } else if (error.message.includes('读取本地文件失败')) {
    console.error('本地文件不存在或无权限');
  } else {
    console.error('未知错误:', error);
  }
}
```

## 调试技巧

### 1. 查看缓存状态

```typescript
console.log(textureLoader.getCacheStatus());
```

### 2. 监控加载

```typescript
const originalLoad = textureLoader.loadTexture.bind(textureLoader);

textureLoader.loadTexture = async (path: string, force?: boolean) => {
  console.log('[纹理加载]', path);
  const start = performance.now();
  
  try {
    const result = await originalLoad(path, force);
    console.log('[纹理加载完成]', path, `${performance.now() - start}ms`);
    return result;
  } catch (error) {
    console.error('[纹理加载失败]', path, error);
    throw error;
  }
};
```

## 测试

运行测试套件：

```bash
npx tsx tests/texture-loader.test.ts
```

测试覆盖：
- ✅ 纹理类型识别
- ✅ Data URL 加载
- ✅ 缓存功能
- ✅ 预加载
- ✅ 存在性检查
- ✅ WC3 纹理加载 (需要 MPQ)
- ✅ 性能基准测试

## 技术参考

- [BLP 解码器文档](./BLP_DECODER_GUIDE.md)
- [MPQ 管理器文档](./MPQ_MANAGER_GUIDE.md)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Blob URLs](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)

## 许可证

MIT License
