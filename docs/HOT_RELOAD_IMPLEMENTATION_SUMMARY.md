# 🎉 热重载系统实现完成！

## ✅ 已实现的模块

### 1️⃣ **Lua 代码生成器** (`src/utils/luaGenerator.ts`)
- ✅ 完整的 `LuaUIGenerator` 类
- ✅ API 兼容层 (支持 DzAPI require 模式和 Reforged)
- ✅ Frame 创建、属性设置、层级关系
- ✅ 文本、纹理、透明度、可见性等属性
- ✅ 自动生成重载和清理函数
- ✅ 游戏内 `-reload` 命令支持

### 2️⃣ **KKWE 检测器** (`src/utils/kkweDetector.ts`)
- ✅ 自动检测 KKWE 安装路径
- ✅ 验证启动器和主程序存在性
- ✅ 启动 War3 地图的接口

### 3️⃣ **热重载导出器** (`src/utils/hotReloadExporter.ts`)
- ✅ `HotReloadExporter` 类
- ✅ 配置管理 (输出路径、测试地图、自动启动等)
- ✅ 防抖导出 (默认 500ms)
- ✅ 单例模式全局导出器
- ✅ 自动触发 KKWE 启动

### 4️⃣ **Tauri Rust 后端** (`src-tauri/src/lib.rs`)
- ✅ `get_username` - 获取当前用户名
- ✅ `launch_kkwe` - 启动 KKWE 加载地图
- ✅ 正确的命令行参数: `-launchwar3 -loadfile`

### 5️⃣ **热重载 UI 面板** (`src/components/HotReloadPanel.tsx`)
- ✅ KKWE 状态检测和显示
- ✅ 热重载开关
- ✅ 输出路径和测试地图选择
- ✅ 自动启动游戏选项
- ✅ 防抖延迟配置
- ✅ 手动启动测试按钮
- ✅ 完整的使用说明

### 6️⃣ **主应用集成** (`src/App.tsx` + `src/components/MenuBar.tsx`)
- ✅ 热重载面板状态管理
- ✅ 视图菜单中添加 "热重载面板" (快捷键 Ctrl+5)
- ✅ 面板显示/隐藏逻辑

### 7️⃣ **Store 集成** (`src/store/projectStore.ts`)
- ✅ 自动导入热重载导出器
- ✅ `updateFrame` 时自动触发防抖导出
- ✅ 实时同步编辑器更改到 Lua 文件

---

## 🚀 使用流程

### **第一步：配置**
1. 打开编辑器
2. 视图菜单 → 热重载面板 (或按 `Ctrl+5`)
3. 检测 KKWE 状态 (未安装则下载: http://www.kkwai.com/)
4. 设置 Lua 输出路径 (建议: `D:\War3Maps\UI-Designer\ui_generated.lua`)
5. 设置测试地图路径 (例如: `D:\War3Maps\test.w3x`)
6. 启用热重载开关

### **第二步：地图触发器初始化**
在地图的初始化触发器中添加以下代码：

```lua
function InitTrig_UIDesigner()
    -- 延迟加载，确保游戏环境已准备好
    TimerStart(CreateTimer(), 0.1, false, function()
        DestroyTimer(GetExpiredTimer())
        
        -- 加载 UI Designer 生成的代码
        local success, result = pcall(function()
            dofile("UI-Designer\\ui_generated.lua")
            InitUIDesigner()
        end)
        
        if not success then
            print("|cffff0000[UI Designer]|r 加载失败:")
            print(tostring(result))
        end
    end)
end
```

### **第三步：开始设计**
1. 在编辑器中设计 UI 控件
2. 每次修改会自动导出 Lua 文件 (有 500ms 防抖)
3. 点击"启动测试地图"或手动启动 War3
4. 游戏内输入 `-reload` 或 `-rl` 刷新 UI

---

## 📋 生成的 Lua 文件结构

```lua
-- 1. 文件头 (项目信息)
-- 2. API 兼容层 (DzAPI/Reforged 自动检测)
-- 3. 常量定义 (锚点映射)
-- 4. Frame 存储表
-- 5. 辅助函数 (RegisterFrame, GetFrame, ParseColor等)
-- 6. CreateAllFrames() - 创建所有控件
-- 7. CleanupAllFrames() - 清理函数
-- 8. ReloadUI() - 重载函数
-- 9. InitUIDesigner() - 初始化函数 (注册 -reload 命令)
```

---

## 🎯 关键特性

### **1. API 兼容性**
```lua
-- War3 1.27 (KKWE)
local japi = require('jass.japi')
japi.DzCreateFrame(...)

-- War3 Reforged
BlzCreateFrame(...)
```

### **2. 防抖导出**
- 默认 500ms 防抖，避免频繁导出
- 可在热重载面板中调整 (0-5000ms)

### **3. 自动启动**
- 启用后，导出 Lua 时自动启动 War3
- 使用 KKWE 启动器: `YDWEConfig.exe -launchwar3 -loadfile {mapPath}`

### **4. 实时同步**
- 编辑器中修改控件属性 → 自动导出 Lua
- 游戏内输入 `-reload` → 立即刷新 UI

---

## 📂 文件映射

### **KKWE 路径结构**
```
C:\Users\{用户名}\AppData\Local\KKWE\
├── KKWE.exe                   # 主程序
└── bin\
    └── YDWEConfig.exe         # 启动器
```

### **War3 地图结构**
```
War3安装目录\Maps\
└── UI-Designer\
    └── ui_generated.lua       # 生成的 Lua 文件
```

### **测试地图触发器**
```
test.w3x
└── 触发器
    └── InitTrig_UIDesigner    # 初始化触发器
```

---

## 🛠️ 配置选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| **启用热重载** | 是否自动导出 Lua | `false` |
| **Lua 输出路径** | 生成的 Lua 文件位置 | `D:\War3Maps\UI-Designer\ui_generated.lua` |
| **测试地图路径** | War3 地图文件 | `D:\War3Maps\test.w3x` |
| **自动启动游戏** | 导出后自动启动 War3 | `false` |
| **防抖延迟** | 导出防抖时间 (ms) | `500` |

---

## ⚠️ 注意事项

1. **KKWE 必需**: War3 1.27 需要安装 KKWE 才能使用 DzAPI
2. **路径格式**: Windows 路径使用反斜杠 `\` 或 `\\`
3. **地图触发器**: 必须在地图中添加初始化触发器
4. **编码问题**: Lua 文件使用 UTF-8 编码
5. **性能考虑**: 大型 UI (100+ 控件) 建议关闭自动启动

---

## 🐛 故障排查

### **问题1: KKWE 检测失败**
- 检查 KKWE 是否正确安装
- 默认路径: `C:\Users\{用户名}\AppData\Local\KKWE`
- 重新安装 KKWE 或手动指定路径

### **问题2: War3 无法启动**
- 检查测试地图路径是否正确
- 确认 KKWE 启动器存在: `KKWE\bin\YDWEConfig.exe`
- 查看控制台错误信息

### **问题3: 游戏内 UI 不显示**
- 检查 Lua 文件是否正确生成
- 确认地图触发器已正确添加
- 游戏内输入 `-reload` 手动刷新

### **问题4: -reload 命令无效**
- 检查初始化触发器是否正确执行
- 确认 `InitUIDesigner()` 函数被调用
- 检查 Lua 文件中的命令注册代码

---

## 📚 相关文档

- [完整实现指南](docs/LUA_GENERATOR_GUIDE.md)
- [KKWE 官网](http://www.kkwai.com/)
- [DzAPI 函数参考](vendor/1.27/Scripts/japi_gui.j)

---

## 🎊 完成状态

✅ 所有 7 个模块已完成  
✅ 无编译错误  
✅ 完整功能测试通过  
✅ 文档齐全  

**准备好开始使用了！** 🚀
