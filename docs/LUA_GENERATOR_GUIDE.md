# 🔥 Lua 动态生成方案 (完整指南)

## 📋 方案概述

使用 Lua 代码动态生成 UI，而不是静态 FDF 文件。支持 War3 1.27 (DzAPI) 和 Reforged。

---

## 🎯 核心优势

| 特性 | FDF 方案 | **Lua 方案** (✅ 推荐) |
|------|---------|-------------------|
| **灵活性** | ❌ 静态，需重启 | ✅ 动态，运行时创建 |
| **调试** | ❌ 难以调试 | ✅ 可打印日志、错误处理 |
| **兼容性** | ⚠️ 版本差异大 | ✅ 统一API |
| **事件处理** | ❌ 不支持 | ✅ 支持事件、回调 |
| **动态交互** | ❌ 不支持 | ✅ 完全支持 |

---

## 🔧 DzAPI 正确调用方式

### **重要说明：War3 1.27 需要使用 require 方式**

```lua
-- ❌ 错误方式 (直接调用不存在)
local frame = DzCreateFrame(...)

-- ✅ 正确方式 (通过 require 加载模块)
local japi = require('jass.japi')
local frame = japi.DzCreateFrame(...)
```

---

## 📝 完整的 Lua 生成器实现

### **1. TypeScript Lua 代码生成器**

```typescript
// src/utils/luaGenerator.ts

import { Project, FrameData, FrameType } from '../types';

export class LuaUIGenerator {
  private project: Project;
  
  constructor(project: Project) {
    this.project = project;
  }
  
  /**
   * 生成完整的 Lua 代码
   */
  generate(): string {
    const lines: string[] = [];
    
    // 文件头
    lines.push(this.generateHeader());
    lines.push('');
    
    // API 兼容层
    lines.push(this.generateAPICompatLayer());
    lines.push('');
    
    // 常量定义
    lines.push(this.generateConstants());
    lines.push('');
    
    // Frame 存储
    lines.push('-- Frame 存储表');
    lines.push('local UI_Frames = {}');
    lines.push('local UI_FrameCounter = 0');
    lines.push('');
    
    // 辅助函数
    lines.push(this.generateHelperFunctions());
    lines.push('');
    
    // Frame 创建函数
    lines.push(this.generateCreateFramesFunction());
    lines.push('');
    
    // 清理函数
    lines.push(this.generateCleanupFunction());
    lines.push('');
    
    // 重载函数
    lines.push(this.generateReloadFunction());
    lines.push('');
    
    // 初始化函数
    lines.push(this.generateInitFunction());
    
    return lines.join('\n');
  }
  
  /**
   * 生成文件头
   */
  private generateHeader(): string {
    return `--===========================================================================
-- UI Designer - 自动生成的 Lua 代码
-- 生成时间: ${new Date().toLocaleString('zh-CN')}
-- 项目名称: ${this.project.libraryName || 'Untitled'}
-- Origin模式: ${this.project.originMode || 'gameui'}
-- 控件数量: ${Object.keys(this.project.frames).length} 个
--===========================================================================
-- ⚠️ 警告: 此文件由 UI Designer 自动生成，请勿手动修改！
--===========================================================================`;
  }
  
  /**
   * 生成 API 兼容层 (支持 DzAPI require 方式)
   */
  private generateAPICompatLayer(): string {
    return `--===========================================================================
-- API 兼容层 (War3 1.27 DzAPI / Reforged)
--===========================================================================
local API = {}

-- 尝试加载 DzAPI (War3 1.27 - 需要 require)
local japi_loaded, japi = pcall(require, 'jass.japi')

if japi_loaded and japi and japi.DzCreateFrame then
    -- War3 1.27 + DzAPI (通过 require 加载)
    print("|cff00ff00[UI Designer]|r 检测到 DzAPI (War3 1.27 + 11平台)")
    
    API.CreateFrame = function(frameType, name, parent, template, id)
        return japi.DzCreateFrame(frameType, parent or API.GetGameUI(), id or 0)
    end
    
    API.CreateSimpleFrame = function(frameType, parent, id)
        return japi.DzCreateSimpleFrame(frameType, parent or API.GetGameUI(), id or 0)
    end
    
    API.CreateFrameByType = function(frameType, name, parent, template, id)
        return japi.DzCreateFrameByTagName(frameType, name, parent or API.GetGameUI(), template or "", id or 0)
    end
    
    API.GetGameUI = function()
        return japi.DzGetGameUI()
    end
    
    API.SetPoint = function(frame, point, relativeFrame, relativePoint, x, y)
        return japi.DzFrameSetPoint(frame, point, relativeFrame, relativePoint, x, y)
    end
    
    API.SetAbsolutePoint = function(frame, point, x, y)
        return japi.DzFrameSetAbsolutePoint(frame, point, x, y)
    end
    
    API.SetSize = function(frame, w, h)
        return japi.DzFrameSetSize(frame, w, h)
    end
    
    API.SetTexture = function(frame, texture, flag)
        return japi.DzFrameSetTexture(frame, texture, flag or 0)
    end
    
    API.SetText = function(frame, text)
        return japi.DzFrameSetText(frame, text)
    end
    
    API.SetTextColor = function(frame, color)
        return japi.DzFrameSetTextColor(frame, color)
    end
    
    API.ShowFrame = function(frame, show)
        return japi.DzFrameShow(frame, show)
    end
    
    API.DestroyFrame = function(frame)
        return japi.DzDestroyFrame(frame)
    end
    
    API.SetAlpha = function(frame, alpha)
        return japi.DzFrameSetAlpha(frame, alpha)
    end
    
    API.SetParent = function(frame, parent)
        return japi.DzFrameSetParent(frame, parent)
    end
    
    API.SetVertexColor = function(frame, color)
        return japi.DzFrameSetVertexColor(frame, color)
    end
    
    API.SetScale = function(frame, scale)
        return japi.DzFrameSetScale(frame, scale)
    end
    
    API.LoadTOC = function(filename)
        return japi.DzLoadToc(filename)
    end
    
    API.GetColor = function(a, r, g, b)
        return japi.DzGetColor(a, r, g, b)
    end

elseif BlzCreateFrame then
    -- War3 Reforged (原生 API)
    print("|cff00ff00[UI Designer]|r 检测到 Reforged API (War3 1.31+)")
    
    API.CreateFrame = function(frameType, name, parent, template, id)
        return BlzCreateFrame(frameType, name, parent or API.GetGameUI(), template or "", id or 0)
    end
    
    API.CreateSimpleFrame = function(frameType, parent, id)
        return BlzCreateSimpleFrame(frameType, parent or API.GetGameUI(), id or 0)
    end
    
    API.CreateFrameByType = function(frameType, name, parent, template, id)
        return BlzCreateFrameByType(frameType, name, parent or API.GetGameUI(), template or "", id or 0)
    end
    
    API.GetGameUI = function()
        return BlzGetOriginFrame(ORIGIN_FRAME_GAME_UI, 0)
    end
    
    API.SetPoint = BlzFrameSetPoint
    API.SetAbsolutePoint = BlzFrameSetAbsPoint
    API.SetSize = BlzFrameSetSize
    API.SetTexture = BlzFrameSetTexture
    API.SetText = BlzFrameSetText
    API.SetTextColor = BlzFrameSetTextColor
    API.ShowFrame = BlzFrameSetVisible
    API.DestroyFrame = BlzDestroyFrame
    API.SetAlpha = BlzFrameSetAlpha
    API.SetParent = BlzFrameSetParent
    API.SetVertexColor = BlzFrameSetVertexColor
    API.SetScale = BlzFrameSetScale
    API.LoadTOC = BlzLoadTOCFile
    API.GetColor = function(a, r, g, b)
        return (a << 24) | (r << 16) | (g << 8) | b
    end
    
else
    -- 无 UI API 支持
    print("|cffff0000========================================|r")
    print("|cffff0000  错误: 未检测到 UI API 支持           |r")
    print("|cffffcc00  War3 1.27: 需要安装 11平台         |r")
    print("|cffffcc00  下载: https://www.11game.com/      |r")
    print("|cffffcc00  Reforged: 需要 1.31+ 版本          |r")
    print("|cffff0000========================================|r")
    error("UI API 不可用")
end`;
  }
  
  /**
   * 生成常量定义
   */
  private generateConstants(): string {
    return `--===========================================================================
-- 常量定义
--===========================================================================
local ANCHOR_TOPLEFT = 0
local ANCHOR_TOP = 1
local ANCHOR_TOPRIGHT = 2
local ANCHOR_LEFT = 3
local ANCHOR_CENTER = 4
local ANCHOR_RIGHT = 5
local ANCHOR_BOTTOMLEFT = 6
local ANCHOR_BOTTOM = 7
local ANCHOR_BOTTOMRIGHT = 8

-- 锚点映射
local ANCHOR_MAP = {
    TOPLEFT = ANCHOR_TOPLEFT,
    TOP = ANCHOR_TOP,
    TOPRIGHT = ANCHOR_TOPRIGHT,
    LEFT = ANCHOR_LEFT,
    CENTER = ANCHOR_CENTER,
    RIGHT = ANCHOR_RIGHT,
    BOTTOMLEFT = ANCHOR_BOTTOMLEFT,
    BOTTOM = ANCHOR_BOTTOM,
    BOTTOMRIGHT = ANCHOR_BOTTOMRIGHT
}`;
  }
  
  /**
   * 生成辅助函数
   */
  private generateHelperFunctions(): string {
    return `--===========================================================================
-- 辅助函数
--===========================================================================

-- 注册 Frame
local function RegisterFrame(frame, name, frameType)
    UI_FrameCounter = UI_FrameCounter + 1
    local frameData = {
        handle = frame,
        name = name,
        type = frameType,
        id = UI_FrameCounter
    }
    UI_Frames[name] = frameData
    table.insert(UI_Frames, frameData)
    return frame
end

-- 获取 Frame
local function GetFrame(name)
    local frameData = UI_Frames[name]
    return frameData and frameData.handle or nil
end

-- 获取锚点值
local function GetAnchor(anchorName)
    return ANCHOR_MAP[anchorName] or ANCHOR_CENTER
end

-- 解析颜色字符串 (#RRGGBB 或 #AARRGGBB)
local function ParseColor(colorStr)
    if not colorStr then return nil end
    
    colorStr = colorStr:gsub("#", "")
    local len = #colorStr
    
    if len == 6 then
        -- RGB
        local r = tonumber(colorStr:sub(1, 2), 16)
        local g = tonumber(colorStr:sub(3, 4), 16)
        local b = tonumber(colorStr:sub(5, 6), 16)
        return API.GetColor(255, r, g, b)
    elseif len == 8 then
        -- ARGB
        local a = tonumber(colorStr:sub(1, 2), 16)
        local r = tonumber(colorStr:sub(3, 4), 16)
        local g = tonumber(colorStr:sub(5, 6), 16)
        local b = tonumber(colorStr:sub(7, 8), 16)
        return API.GetColor(a, r, g, b)
    end
    
    return nil
end`;
  }
  
  /**
   * 生成创建 Frame 的函数
   */
  private generateCreateFramesFunction(): string {
    const lines: string[] = [];
    
    lines.push('--===========================================================================');
    lines.push('-- 创建所有 Frame');
    lines.push('--===========================================================================');
    lines.push('local function CreateAllFrames()');
    lines.push('    local gameUI = API.GetGameUI()');
    lines.push('');
    
    // 按根节点创建
    const rootFrames = this.project.rootFrameIds
      .map(id => this.project.frames[id])
      .filter(f => f);
    
    for (const frame of rootFrames) {
      lines.push(...this.generateFrameCode(frame, 1));
    }
    
    lines.push('');
    lines.push('    print(string.format("|cff00ff00[UI Designer]|r 创建完成: %d 个Frame", UI_FrameCounter))');
    lines.push('end');
    
    return lines.join('\n');
  }
  
  /**
   * 生成单个 Frame 的代码
   */
  private generateFrameCode(frame: FrameData, level: number): string[] {
    const lines: string[] = [];
    const indent = '    '.repeat(level);
    const frameName = this.escapeLuaString(frame.name);
    
    lines.push(`${indent}-- ${frame.name} (${frame.type})`);
    lines.push(`${indent}do`);
    
    // 确定父控件
    const parentRef = frame.parentId 
      ? `GetFrame("${this.escapeLuaString(this.project.frames[frame.parentId].name)}")`
      : 'gameUI';
    
    // 创建 Frame
    lines.push(`${indent}    local frame = API.CreateFrameByType("${this.getFrameTypeName(frame.type)}", "${frameName}", ${parentRef}, "", 0)`);
    lines.push(`${indent}    RegisterFrame(frame, "${frameName}", "${frame.type}")`);
    lines.push('');
    
    // 设置位置 (使用绝对坐标)
    lines.push(`${indent}    -- 位置和大小`);
    lines.push(`${indent}    API.SetAbsolutePoint(frame, GetAnchor("BOTTOMLEFT"), ${frame.x.toFixed(6)}, ${frame.y.toFixed(6)})`);
    lines.push(`${indent}    API.SetSize(frame, ${frame.width.toFixed(6)}, ${frame.height.toFixed(6)})`);
    lines.push('');
    
    // 设置纹理
    if (frame.texture) {
      lines.push(`${indent}    -- 纹理`);
      lines.push(`${indent}    API.SetTexture(frame, "${this.escapeLuaString(frame.texture)}", 0)`);
      lines.push('');
    }
    
    // 设置文本
    if (frame.text) {
      lines.push(`${indent}    -- 文本`);
      lines.push(`${indent}    API.SetText(frame, "${this.escapeLuaString(frame.text)}")`);
      
      // 文本颜色
      if (frame.textColor) {
        lines.push(`${indent}    local color = ParseColor("${frame.textColor}")`);
        lines.push(`${indent}    if color then API.SetTextColor(frame, color) end`);
      }
      lines.push('');
    }
    
    // 设置透明度
    if (frame.alpha !== undefined && frame.alpha !== 1) {
      const alphaValue = Math.round(frame.alpha * 255);
      lines.push(`${indent}    API.SetAlpha(frame, ${alphaValue})`);
      lines.push('');
    }
    
    // 设置可见性
    if (frame.visible === false) {
      lines.push(`${indent}    API.ShowFrame(frame, false)`);
      lines.push('');
    }
    
    // 递归创建子控件
    if (frame.children && frame.children.length > 0) {
      lines.push(`${indent}    -- 子控件`);
      for (const childId of frame.children) {
        const child = this.project.frames[childId];
        if (child) {
          lines.push(...this.generateFrameCode(child, level + 1));
        }
      }
    }
    
    lines.push(`${indent}end`);
    lines.push('');
    
    return lines;
  }
  
  /**
   * 获取 Frame 类型名称
   */
  private getFrameTypeName(type: FrameType): string {
    // 映射到实际的 Frame 类型名
    const typeMap: Record<string, string> = {
      [FrameType.BACKDROP]: 'BACKDROP',
      [FrameType.BUTTON]: 'BUTTON',
      [FrameType.TEXT_FRAME]: 'TEXT',
      [FrameType.FRAME]: 'FRAME',
      [FrameType.SLIDER]: 'SLIDER',
      // ... 更多映射
    };
    
    return typeMap[type] || 'FRAME';
  }
  
  /**
   * 生成清理函数
   */
  private generateCleanupFunction(): string {
    return `--===========================================================================
-- 清理所有 Frame
--===========================================================================
local function CleanupAllFrames()
    for i = #UI_Frames, 1, -1 do
        local frameData = UI_Frames[i]
        if frameData and frameData.handle then
            API.DestroyFrame(frameData.handle)
        end
        UI_Frames[i] = nil
    end
    
    -- 清空命名表
    for k in pairs(UI_Frames) do
        if type(k) == "string" then
            UI_Frames[k] = nil
        end
    end
    
    UI_FrameCounter = 0
    collectgarbage()
    print("|cff00ff00[UI Designer]|r 已清理所有 Frame")
end`;
  }
  
  /**
   * 生成重载函数
   */
  private generateReloadFunction(): string {
    return `--===========================================================================
-- 重载 UI
--===========================================================================
local function ReloadUI()
    local startTime = os.clock()
    
    -- 清理旧 UI
    CleanupAllFrames()
    
    -- 重新创建
    CreateAllFrames()
    
    local elapsed = (os.clock() - startTime) * 1000
    print(string.format("|cff00ff00[UI Designer]|r UI已重载 (%.1fms, %d个Frame)", elapsed, UI_FrameCounter))
end`;
  }
  
  /**
   * 生成初始化函数
   */
  private generateInitFunction(): string {
    return `--===========================================================================
-- 初始化 (由外部调用)
--===========================================================================
function InitUIDesigner()
    -- 注册重载命令
    local t = CreateTrigger()
    TriggerRegisterPlayerChatEvent(t, Player(0), "-reload", true)
    TriggerRegisterPlayerChatEvent(t, Player(0), "-rl", true)
    TriggerAddAction(t, ReloadUI)
    
    -- 首次创建
    CreateAllFrames()
    
    -- 显示欢迎信息
    print("|cff00ffff" .. string.rep("=", 60) .. "|r")
    print("|cffffcc00           UI Designer - 动态UI系统 v1.0              |r")
    print("|cff00ff00  命令: -reload 或 -rl  刷新UI                       |r")
    print("|cffaaaaaa  项目: ${this.project.libraryName || 'Untitled'}                                     |r")
    print("|cff00ffff" .. string.rep("=", 60) .. "|r")
end

-- 返回模块（可选）
return {
    Init = InitUIDesigner,
    Reload = ReloadUI,
    Cleanup = CleanupAllFrames,
    GetFrame = GetFrame
}`;
  }
  
  /**
   * 转义 Lua 字符串
   */
  private escapeLuaString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }
}

/**
 * 导出函数
 */
export function exportProjectToLua(project: Project): string {
  const generator = new LuaUIGenerator(project);
  return generator.generate();
}
```

---

## 🎮 框架地图触发器代码

```lua
-- 放在地图的初始化触发器中

function InitTrig_UIDesigner()
    -- 延迟加载，确保游戏环境已准备好
    TimerStart(CreateTimer(), 0.1, false, function()
        DestroyTimer(GetExpiredTimer())
        
        -- 尝试加载 UI Designer 生成的代码
        local success, result = pcall(function()
            -- 方式1: 使用 dofile (推荐)
            dofile("UI-Designer\\\\ui_generated.lua")
            InitUIDesigner()
            
            -- 方式2: 使用 require (需要配置路径)
            -- local ui = require('UI-Designer.ui_generated')
            -- ui.Init()
        end)
        
        if not success then
            print("|cffff0000[UI Designer]|r 加载失败:")
            print(tostring(result))
            print("|cffffcc00请检查文件: UI-Designer\\\\ui_generated.lua|r")
            print("|cffffcc00确保已启用热重载并生成了 Lua 文件|r")
        end
    end)
end
```

---

## 📊 生成示例

### **输入 (编辑器中的Frame)**
```typescript
{
  name: "MainPanel",
  type: FrameType.BACKDROP,
  x: 0.3,
  y: 0.2,
  width: 0.2,
  height: 0.15,
  texture: "UI\\Widgets\\EscMenu\\Human\\background.blp",
  alpha: 0.8
}
```

### **输出 (生成的Lua代码)**
```lua
-- MainPanel (BACKDROP)
do
    local frame = API.CreateFrameByType("BACKDROP", "MainPanel", gameUI, "", 0)
    RegisterFrame(frame, "MainPanel", "BACKDROP")
    
    -- 位置和大小
    API.SetAbsolutePoint(frame, GetAnchor("BOTTOMLEFT"), 0.300000, 0.200000)
    API.SetSize(frame, 0.200000, 0.150000)
    
    -- 纹理
    API.SetTexture(frame, "UI\\Widgets\\EscMenu\\Human\\background.blp", 0)
    
    API.SetAlpha(frame, 204)
end
```

---

## 🚀 使用流程

1. **编辑器中设计UI** → 自动生成 `ui_generated.lua`
2. **复制框架触发器** → 粘贴到地图触发器
3. **启动游戏测试** → UI自动加载
4. **修改UI** → 游戏中输入 `-reload` → 即时刷新

---

## ⚠️ 注意事项

### **War3 1.27 (DzAPI)**
- ✅ **必须** 使用 `require('jass.japi')` 方式
- ✅ 需要安装 **KKWE (凯凯我编)** - [下载地址](http://www.kkwai.com/)
- 📁 默认安装路径: `C:\Users\{用户名}\AppData\Local\KKWE\KKWE.exe`
- 🎮 启动器路径: `C:\Users\{用户名}\AppData\Local\KKWE\bin\YDWEConfig.exe`
- 🚀 启动参数: `-launchwar3 -loadfile "X:\path\to\map.w3x"`
- ✅ 支持完整的UI功能

### **War3 Reforged**
- ✅ 原生支持，无需额外配置
- ✅ 直接使用 `BlzXXX` 函数
- ⚠️ 部分旧API已废弃

### **性能考虑**
- 防抖 500ms 避免频繁导出
- 清理旧Frame释放内存
- 大型UI建议分批创建

---

## 🛠️ KKWE 启动器集成

### **检测 KKWE 安装**

```typescript
// src/utils/kkweDetector.ts

import { invoke } from '@tauri-apps/api/core';
import { exists, readTextFile } from '@tauri-apps/plugin-fs';
import path from 'path';

export interface KKWEInfo {
  installed: boolean;
  kkwePath?: string;
  launcherPath?: string;
  war3Path?: string;
}

/**
 * 检测 KKWE 安装
 */
export async function detectKKWE(): Promise<KKWEInfo> {
  const username = await invoke<string>('get_username'); // 需要在 Rust 端实现
  const kkweBasePath = `C:\\Users\\${username}\\AppData\\Local\\KKWE`;
  
  const kkwePath = path.join(kkweBasePath, 'KKWE.exe');
  const launcherPath = path.join(kkweBasePath, 'bin', 'YDWEConfig.exe');
  
  const kkweExists = await exists(kkwePath);
  const launcherExists = await exists(launcherPath);
  
  if (!kkweExists || !launcherExists) {
    return { installed: false };
  }
  
  // 尝试读取 KKWE 配置获取 War3 路径
  const configPath = path.join(kkweBasePath, 'plugin', 'warcraft3', 'config.ini');
  let war3Path: string | undefined;
  
  try {
    const configContent = await readTextFile(configPath);
    const match = configContent.match(/war3_path\s*=\s*"?([^"\r\n]+)"?/i);
    if (match) {
      war3Path = match[1];
    }
  } catch (e) {
    console.warn('无法读取 KKWE 配置:', e);
  }
  
  return {
    installed: true,
    kkwePath,
    launcherPath,
    war3Path
  };
}

/**
 * 使用 KKWE 启动地图
 */
export async function launchMapWithKKWE(mapPath: string, kkweInfo: KKWEInfo): Promise<void> {
  if (!kkweInfo.installed || !kkweInfo.launcherPath) {
    throw new Error('KKWE 未安装或启动器路径无效');
  }
  
  // 规范化路径
  const normalizedMapPath = mapPath.replace(/\//g, '\\');
  
  // 调用 Tauri 命令启动进程
  await invoke('launch_kkwe', {
    launcherPath: kkweInfo.launcherPath,
    mapPath: normalizedMapPath
  });
  
  console.log(`[KKWE] 启动地图: ${normalizedMapPath}`);
}
```

### **Rust 端实现 (Tauri)**

```rust
// src-tauri/src/lib.rs

use std::process::Command;
use tauri::AppHandle;

#[tauri::command]
fn get_username() -> Result<String, String> {
    std::env::var("USERNAME")
        .or_else(|_| std::env::var("USER"))
        .map_err(|e| format!("无法获取用户名: {}", e))
}

#[tauri::command]
fn launch_kkwe(launcher_path: String, map_path: String) -> Result<(), String> {
    let output = Command::new(&launcher_path)
        .args(&["-launchwar3", "-loadfile", &map_path])
        .spawn()
        .map_err(|e| format!("启动 KKWE 失败: {}", e))?;
    
    println!("[KKWE] 进程已启动: PID={}", output.id());
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_username,
            launch_kkwe
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### **UI 集成示例**

```typescript
// src/components/HotReloadPanel.tsx

import React, { useEffect, useState } from 'react';
import { detectKKWE, launchMapWithKKWE, type KKWEInfo } from '../utils/kkweDetector';

export const HotReloadPanel: React.FC = () => {
  const [kkweInfo, setKkweInfo] = useState<KKWEInfo>({ installed: false });
  const [testMapPath, setTestMapPath] = useState('D:\\War3Maps\\test.w3x');
  
  useEffect(() => {
    detectKKWE().then(setKkweInfo);
  }, []);
  
  const handleLaunchTest = async () => {
    try {
      await launchMapWithKKWE(testMapPath, kkweInfo);
      alert('War3 启动成功！');
    } catch (e) {
      alert(`启动失败: ${e}`);
    }
  };
  
  return (
    <div className="hot-reload-panel">
      <h3>🎮 War3 1.27 热重载</h3>
      
      <div className="kkwe-status">
        <strong>KKWE 状态:</strong>
        {kkweInfo.installed ? (
          <span style={{ color: 'green' }}>✅ 已安装</span>
        ) : (
          <span style={{ color: 'red' }}>
            ❌ 未安装 - 
            <a href="http://www.kkwai.com/" target="_blank">下载 KKWE</a>
          </span>
        )}
      </div>
      
      {kkweInfo.installed && (
        <>
          <div className="kkwe-paths">
            <div>📁 KKWE: {kkweInfo.kkwePath}</div>
            <div>🚀 启动器: {kkweInfo.launcherPath}</div>
            {kkweInfo.war3Path && <div>🎮 War3: {kkweInfo.war3Path}</div>}
          </div>
          
          <div className="test-launch">
            <label>
              测试地图路径:
              <input 
                type="text" 
                value={testMapPath}
                onChange={(e) => setTestMapPath(e.target.value)}
              />
            </label>
            <button onClick={handleLaunchTest}>
              🚀 启动测试
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

### **完整热重载流程**

```typescript
// src/utils/hotReloadExporter.ts

import { exportProjectToLua } from './luaGenerator';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { detectKKWE, launchMapWithKKWE } from './kkweDetector';
import type { Project } from '../types';

export interface HotReloadConfig {
  enabled: boolean;
  outputPath: string;        // 生成的 Lua 文件路径
  testMapPath: string;       // 测试地图路径
  autoLaunch: boolean;       // 导出后自动启动游戏
  debounceMs: number;        // 防抖延迟
}

export class HotReloadExporter {
  private config: HotReloadConfig;
  private debounceTimer: number | null = null;
  
  constructor(config: HotReloadConfig) {
    this.config = config;
  }
  
  /**
   * 导出项目为 Lua 文件
   */
  async export(project: Project): Promise<void> {
    if (!this.config.enabled) return;
    
    // 生成 Lua 代码
    const luaCode = exportProjectToLua(project);
    
    // 写入文件
    await writeTextFile(this.config.outputPath, luaCode);
    console.log(`[热重载] 已导出: ${this.config.outputPath}`);
    
    // 自动启动游戏 (War3 1.27)
    if (this.config.autoLaunch) {
      const kkweInfo = await detectKKWE();
      if (kkweInfo.installed) {
        await launchMapWithKKWE(this.config.testMapPath, kkweInfo);
        console.log('[热重载] 已启动 War3 测试');
      }
    }
  }
  
  /**
   * 带防抖的导出
   */
  exportDebounced(project: Project): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = window.setTimeout(() => {
      this.export(project).catch(console.error);
    }, this.config.debounceMs);
  }
}
```

---

## 🎯 相关文件

- `src/utils/luaGenerator.ts` - Lua代码生成器
- `src/utils/hotReloadExporter.ts` - 热重载导出器
- `src/utils/kkweDetector.ts` - KKWE 检测和启动
- `src-tauri/src/lib.rs` - Tauri Rust 后端
- `vendor/1.27/Scripts/japi_gui.j` - DzAPI 函数定义

---

## 📚 参考资源

- [KKWE 官网](http://www.kkwai.com/)
- [DzAPI 使用指南](vendor/1.27/Scripts/)
- [War3 Lua 环境文档](docs/)
- [Tauri 文档](https://tauri.app/)
