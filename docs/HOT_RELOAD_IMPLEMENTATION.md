# 🔥 热重载系统实现方案（基于 DzAPI）

## 📋 方案概述

基于 War3 1.27 的 DzAPI，实现编辑器实时导出 FDF → 游戏内自动/手动重载的完整热重载系统。

> **注意**: 不再支持 1.27 Native 模式，因为它不支持自定义UI。仅支持:
> - ✅ War3 1.27 + DzAPI (11平台)
> - ✅ War3 Reforged 1.31+

---

## 🎯 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                   UI Designer 编辑器                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  项目监听器   │→ │  FDF导出器   │→ │  文件写入器   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ 实时导出
                       ↓
┌─────────────────────────────────────────────────────────┐
│           War3安装目录/UI-Designer/                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ current.fdf │  │ current.toc │  │ textures/   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└──────────────────────┬──────────────────────────────────┘
                       │ 游戏内加载
                       ↓
┌─────────────────────────────────────────────────────────┐
│              UI-Designer.w3x 框架地图                     │
│  ┌──────────────────────────────────────────────┐       │
│  │  InitTrig_UIDesigner (Lua触发器)              │       │
│  │  - DzLoadToc("UI-Designer\\current.toc")     │       │
│  │  - 监听 -reload 命令                           │       │
│  │  - (可选) 文件变化自动检测                       │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 目录结构

```
War3安装目录/
├── war3.exe / Warcraft III.exe
├── UI-Designer/                    # 自动创建
│   ├── UI-Designer.w3x            # 框架地图 (自动生成)
│   ├── current.fdf                # 当前UI定义 (实时更新)
│   ├── current.toc                # TOC索引文件
│   └── textures/                  # 纹理资源 (可选)
└── Maps/
```

---

## 🔧 核心代码实现

### 1. 版本检测 (TypeScript)

```typescript
// src/utils/war3VersionDetector.ts

export enum War3Version {
  CLASSIC_DZAPI = '1.27_DzAPI',  // 1.27 + 11平台 (DzAPI)
  REFORGED = '1.31+'              // 重制版 (BlzAPI)
}

export interface War3Info {
  version: War3Version;
  installPath: string;
  executable: string;
  supportedAPIs: {
    dzLoadToc: boolean;           // DzLoadToc
    dzCreateFrame: boolean;       // DzCreateFrame
    blzLoadTOCFile: boolean;      // BlzLoadTOCFile
    blzCreateFrame: boolean;      // BlzCreateFrame
  };
  autoReloadSupport: boolean;     // 是否支持文件变化检测
}

/**
 * 检测 War3 版本和 API 支持
 */
export async function detectWar3Version(war3Path: string): Promise<War3Info> {
  const { exists } = await import('@tauri-apps/plugin-fs');
  const { join } = await import('@tauri-apps/api/path');
  
  // 检查可执行文件
  const classicExe = await join(war3Path, 'war3.exe');
  const reforgedExe = await join(war3Path, 'Warcraft III.exe');
  
  const hasClassic = await exists(classicExe);
  const hasReforged = await exists(reforgedExe);
  
  if (hasReforged) {
    return {
      version: War3Version.REFORGED,
      installPath: war3Path,
      executable: 'Warcraft III.exe',
      supportedAPIs: {
        dzLoadToc: false,
        dzCreateFrame: false,
        blzLoadTOCFile: true,
        blzCreateFrame: true,
      },
      autoReloadSupport: false // Reforged 暂不支持文件监控
    };
  }
  
  if (hasClassic) {
    // 检查 DzAPI 支持 (检查特征文件)
    const dzApiMarker = await join(war3Path, 'Game.dll'); 
    const hasDzAPI = await exists(dzApiMarker);
    
    if (!hasDzAPI) {
      throw new Error(
        'War3 1.27 需要安装 11平台才能使用自定义UI功能\n' +
        '请访问: https://www.11game.com/ 下载安装'
      );
    }
    
    return {
      version: War3Version.CLASSIC_DZAPI,
      installPath: war3Path,
      executable: 'war3.exe',
      supportedAPIs: {
        dzLoadToc: true,
        dzCreateFrame: true,
        blzLoadTOCFile: false,
        blzCreateFrame: false,
      },
      autoReloadSupport: true // DzAPI 支持文件时间戳检测
    };
  }
  
  throw new Error('无法检测到有效的 War3 安装');
}
```

### 2. 热重载触发器 (Lua - 统一版本)

```lua
-- 框架地图中的触发器代码
-- 文件: war3map.lua 或 custom_script.txt

--===========================================================================
-- UI Designer - 热重载系统
-- 支持: War3 1.27 (DzAPI) / Reforged (BlzAPI)
--===========================================================================

local UI_Frames = {}
local UI_LastModTime = 0
local UI_DesignerPath = "UI-Designer\\\\current"

--===========================================================================
-- API 兼容层
--===========================================================================
local LoadTOC, CreateFrame, DestroyFrame, GetGameUI, ShowFrame

if DzLoadToc then
    -- War3 1.27 + DzAPI 环境
    print("|cff00ff00[UI Designer] 检测到 DzAPI (War3 1.27)|r")
    
    LoadTOC = function(path)
        return DzLoadToc(path)
    end
    
    CreateFrame = function(frameType, name, parent, template, id)
        return DzCreateFrame(frameType, parent, id)
    end
    
    DestroyFrame = function(frame)
        return DzDestroyFrame(frame)
    end
    
    GetGameUI = function()
        return DzGetGameUI()
    end
    
    ShowFrame = function(frame, show)
        return DzFrameShow(frame, show)
    end
    
elseif BlzLoadTOCFile then
    -- Reforged 环境
    print("|cff00ff00[UI Designer] 检测到 Reforged API (War3 1.31+)|r")
    
    LoadTOC = function(path)
        return BlzLoadTOCFile(path)
    end
    
    CreateFrame = function(frameType, name, parent, template, id)
        return BlzCreateFrameByType(frameType, name, parent, template, id)
    end
    
    DestroyFrame = function(frame)
        return BlzDestroyFrame(frame)
    end
    
    GetGameUI = function()
        return BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0)
    end
    
    ShowFrame = function(frame, show)
        return BlzFrameSetVisible(frame, show)
    end
    
else
    -- 无UI API支持
    print("|cffff0000========================================|r")
    print("|cffff0000  错误: 未检测到 UI API 支持           |r")
    print("|cffffcc00  War3 1.27 用户: 请安装 11平台       |r")
    print("|cffffcc00  下载: https://www.11game.com/       |r")
    print("|cffffcc00  Reforged 用户: 请更新到 1.31+      |r")
    print("|cffff0000========================================|r")
    return
end

--===========================================================================
-- 清理所有UI
--===========================================================================
local function UI_CleanupAll()
    for i, frame in ipairs(UI_Frames) do
        if frame then
            DestroyFrame(frame)
        end
    end
    UI_Frames = {}
    collectgarbage()
end

--===========================================================================
-- 加载UI (从外部FDF文件)
--===========================================================================
local function UI_LoadFromFile()
    local startTime = os.clock()
    
    UI_CleanupAll()
    
    -- 加载TOC文件
    local tocPath = UI_DesignerPath .. ".toc"
    local success = LoadTOC(tocPath)
    
    if success then
        UI_LastModTime = os.clock()
        local loadTime = (os.clock() - startTime) * 1000
        print(string.format(
            "|cff00ff00[UI Designer]|r UI已重新加载 (%.1fms)", 
            loadTime
        ))
    else
        print("|cffff0000[UI Designer]|r 加载失败!")
        print("|cffffcc00请检查文件: " .. tocPath .. "|r")
    end
end

--===========================================================================
-- 文件变化检测 (仅 DzAPI 支持)
--===========================================================================
local function UI_CheckFileModified()
    if not DzAPI_Map then
        return false
    end
    
    -- DzAPI 可以通过其他方式检测文件变化
    -- 例如: 读取文件内容的哈希值比较
    -- 这里简化处理，实际可以更精确
    
    return false -- 暂时禁用自动检测，使用手动命令
end

--===========================================================================
-- 自动重载定时器 (可选功能)
--===========================================================================
local function UI_AutoReloadTimer()
    if UI_CheckFileModified() then
        print("|cffffcc00[UI Designer]|r 检测到文件变化，自动重载...")
        UI_LoadFromFile()
    end
end

--===========================================================================
-- 手动重载命令
--===========================================================================
local function UI_ReloadCommand()
    UI_LoadFromFile()
end

--===========================================================================
-- 初始化
--===========================================================================
function InitTrig_UIDesigner()
    local t = CreateTrigger()
    
    -- 注册重载命令
    TriggerRegisterPlayerChatEvent(t, Player(0), "-reload", true)
    TriggerRegisterPlayerChatEvent(t, Player(0), "-rl", true)
    TriggerAddAction(t, UI_ReloadCommand)
    
    -- 可选: 启用自动检测定时器 (DzAPI)
    if DzLoadToc then
        -- 暂时禁用自动检测，性能考虑
        -- local timer = CreateTimer()
        -- TimerStart(timer, 1.0, true, UI_AutoReloadTimer)
        -- print("|cff00ff00[UI Designer]|r 文件自动监控已启用 (每秒检查)")
    end
    
    -- 首次加载
    UI_LoadFromFile()
    
    -- 显示欢迎信息
    print("|cff00ffff" .. string.rep("=", 50) .. "|r")
    print("|cffffcc00          UI Designer 热重载系统 v1.0           |r")
    print("|cff00ff00  命令: -reload 或 -rl  刷新UI                  |r")
    print("|cffaaaaaa  提示: 在编辑器中修改后，在游戏中输入命令查看效果  |r")
    print("|cff00ffff" .. string.rep("=", 50) .. "|r")
end
```

### 3. FDF 实时导出器 (TypeScript)

```typescript
// src/utils/hotReloadExporter.ts

import { useProjectStore } from '../store/projectStore';
import { War3Info } from './war3VersionDetector';
import { exportProjectToFDF } from './fdfExporter';

export class HotReloadExporter {
  private war3Info: War3Info | null = null;
  private isEnabled: boolean = false;
  private unsubscribe: (() => void) | null = null;
  private exportTimer: NodeJS.Timeout | null = null;
  
  /**
   * 启用热重载
   */
  async enable(war3Info: War3Info) {
    this.war3Info = war3Info;
    this.isEnabled = true;
    
    // 防抖处理：避免过于频繁的导出
    const debouncedExport = this.debounce(
      async (project: any) => {
        if (!this.isEnabled) return;
        await this.exportFDF(project);
      },
      500 // 500ms 防抖
    );
    
    // 监听项目变化
    this.unsubscribe = useProjectStore.subscribe(
      async (state) => {
        debouncedExport(state.project);
      }
    );
    
    // 立即导出一次
    const state = useProjectStore.getState();
    await this.exportFDF(state.project);
    
    console.log('[HotReload] 已启用，目标:', war3Info.installPath);
  }
  
  /**
   * 禁用热重载
   */
  disable() {
    this.isEnabled = false;
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.exportTimer) {
      clearTimeout(this.exportTimer);
      this.exportTimer = null;
    }
  }
  
  /**
   * 导出 FDF 文件
   */
  private async exportFDF(project: any) {
    if (!this.war3Info) return;
    
    try {
      const { writeTextFile, createDir } = await import('@tauri-apps/plugin-fs');
      const { join } = await import('@tauri-apps/api/path');
      
      // 创建输出目录
      const outputDir = await join(this.war3Info.installPath, 'UI-Designer');
      await createDir(outputDir, { recursive: true });
      
      // 生成 FDF 内容
      const fdfContent = exportProjectToFDF(project);
      const tocContent = this.generateTOC();
      
      // 写入文件
      const fdfPath = await join(outputDir, 'current.fdf');
      const tocPath = await join(outputDir, 'current.toc');
      
      await writeTextFile(fdfPath, fdfContent);
      await writeTextFile(tocPath, tocContent);
      
      console.log('[HotReload] FDF已导出:', fdfPath);
      
      // 触发通知 (可选)
      this.notifyExported(fdfPath);
    } catch (error) {
      console.error('[HotReload] 导出失败:', error);
      throw error;
    }
  }
  
  /**
   * 生成 TOC 内容
   */
  private generateTOC(): string {
    return 'UI-Designer\\current.fdf\n';
  }
  
  /**
   * 防抖函数
   */
  private debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      if (this.exportTimer) {
        clearTimeout(this.exportTimer);
      }
      this.exportTimer = setTimeout(() => func(...args), wait);
    };
  }
  
  /**
   * 通知导出完成
   */
  private notifyExported(path: string) {
    // 可以触发 toast 通知
    console.log('✅ 已导出到:', path);
  }
}

// 全局实例
export const hotReloadExporter = new HotReloadExporter();
```

### 4. UI 集成面板 (React)

```typescript
// src/components/HotReloadPanel.tsx

import React, { useState, useEffect } from 'react';
import { detectWar3Version, War3Info } from '../utils/war3VersionDetector';
import { hotReloadExporter } from '../utils/hotReloadExporter';
import './HotReloadPanel.css';

export const HotReloadPanel: React.FC = () => {
  const [war3Info, setWar3Info] = useState<War3Info | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [status, setStatus] = useState<string>('未启用');
  const [error, setError] = useState<string>('');
  
  // 初始化：自动检测
  useEffect(() => {
    handleDetect();
  }, []);
  
  // 检测 War3 版本
  const handleDetect = async () => {
    try {
      setError('');
      const war3Path = localStorage.getItem('war3_install_path');
      if (!war3Path) {
        setError('请先在设置中配置 War3 安装路径');
        return;
      }
      
      const info = await detectWar3Version(war3Path);
      setWar3Info(info);
      setStatus(`✅ ${info.version}`);
    } catch (error: any) {
      setError(error.message);
      setStatus('❌ 检测失败');
    }
  };
  
  // 切换热重载
  const handleToggleHotReload = async () => {
    if (!war3Info) return;
    
    try {
      if (isEnabled) {
        hotReloadExporter.disable();
        setIsEnabled(false);
        setStatus(`${war3Info.version} (已停止)`);
      } else {
        await hotReloadExporter.enable(war3Info);
        setIsEnabled(true);
        setStatus(`${war3Info.version} (运行中)`);
      }
    } catch (error: any) {
      setError('启用失败: ' + error.message);
    }
  };
  
  return (
    <div className="hot-reload-panel">
      <div className="panel-header">
        <h3>🔥 热重载系统</h3>
        <div className={`status-badge ${isEnabled ? 'active' : ''}`}>
          {isEnabled ? '运行中' : '未启用'}
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
      
      {war3Info && (
        <div className="info-section">
          <div className="info-row">
            <span className="label">版本:</span>
            <span className="value">{war3Info.version}</span>
          </div>
          <div className="info-row">
            <span className="label">路径:</span>
            <span className="value" title={war3Info.installPath}>
              {war3Info.installPath}
            </span>
          </div>
          <div className="info-row">
            <span className="label">API支持:</span>
            <span className="value">
              {war3Info.supportedAPIs.dzLoadToc && 'DzLoadToc '}
              {war3Info.supportedAPIs.blzLoadTOCFile && 'BlzLoadTOCFile'}
            </span>
          </div>
        </div>
      )}
      
      <div className="actions">
        <button 
          className="btn-primary"
          onClick={handleToggleHotReload}
          disabled={!war3Info}
        >
          {isEnabled ? '⏸️ 停止热重载' : '▶️ 启用热重载'}
        </button>
        
        <button 
          className="btn-secondary"
          onClick={handleDetect}
        >
          🔍 重新检测
        </button>
      </div>
      
      <div className="instructions">
        <h4>📖 使用说明</h4>
        <ol>
          <li>确保已安装 War3 (1.27需要11平台)</li>
          <li>点击"启用热重载"开始监听</li>
          <li>在编辑器中修改 UI</li>
          <li>在游戏中输入 <code>-reload</code> 查看效果</li>
        </ol>
        
        <div className="tips">
          <strong>💡 提示:</strong>
          <ul>
            <li>修改会自动导出到 <code>War3路径/UI-Designer/</code></li>
            <li>需要在游戏中手动输入命令重载 (性能考虑)</li>
            <li>框架地图位置: <code>War3路径/UI-Designer/UI-Designer.w3x</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};
```

---

## 📋 实施步骤

### 阶段 1: 基础设施 ✅
1. ✅ War3 版本检测 (DzAPI / Reforged)
2. ✅ 目录结构创建
3. ✅ FDF 导出器

### 阶段 2: 热重载核心 🔄
1. ✅ 统一触发器代码 (Lua)
2. ✅ 项目监听 + 实时导出
3. ✅ 防抖优化

### 阶段 3: 框架地图生成 ⏳
1. ⏳ Rust 后端地图打包
2. ⏳ 预制地图模板
3. ⏳ 自动生成功能

### 阶段 4: UI 集成 ⏳
1. ⏳ 热重载面板组件
2. ⏳ 状态管理
3. ⏳ 错误处理

---

## ⚠️ 注意事项

### DzAPI 特性
- ✅ `DzLoadToc()` - 加载外部 FDF
- ✅ `DzCreateFrame()` - 动态创建UI
- ✅ `DzFrameShow()` - 显示/隐藏
- ✅ `DzDestroyFrame()` - 销毁UI

### 性能考虑
- 使用防抖 (500ms) 避免频繁导出
- 清理旧 Frame 释放内存
- 大型 UI 可能需要分批加载

### 兼容性
- War3 1.27 必须安装 11平台
- Reforged 需要 1.31+ 版本
- 文件路径相对于 War3 根目录

---

## 🎯 优势

- ✅ **即时反馈**: 修改后秒级导出，游戏内一键刷新
- ✅ **版本兼容**: 自动适配 1.27 (DzAPI) 和 Reforged
- ✅ **零配置**: 自动生成所需文件和目录
- ✅ **开发友好**: 标准 War3 资源格式

---

## 📚 相关资源

- [11平台官网](https://www.11game.com/)
- [DzAPI 文档](vendor/1.27/Scripts/)
- [War3 FDF 格式规范](docs/FDF_PARSER_GUIDE.md)
