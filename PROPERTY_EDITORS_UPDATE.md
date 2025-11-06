# 属性面板UI/UX优化 - 可视化属性编辑器

## 更新概述

优化属性面板的用户体验,将基础HTML输入控件替换为专业的可视化编辑器组件,提供更直观、美观的属性编辑体验。

## 已完成工作

### 1. 组件库创建 ✅

**文件**: `src/components/PropertyEditors.tsx` (450行)

创建了8个可复用的可视化属性编辑器组件:

#### 1) ColorPicker - RGBA颜色选择器
- **功能**: 可视化颜色选择 + Alpha透明度滑块
- **特性**:
  - 🎨 原生颜色选择器 (支持十六进制输入)
  - 🔲 颜色预览框 (带棋盘背景显示透明度)
  - 🎚️ Alpha滑块 (0-100% 百分比显示)
  - 🔄 自动HEX/RGBA转换
- **适用**: fontColor, fontHighlightColor, editTextColor等所有RGBA属性

#### 2) Select - 单选下拉菜单
- **功能**: 枚举值单选
- **特性**:
  - 📋 下拉选项列表
  - 🔍 占位符提示
  - ✖️ 可清除选项(allowClear)
- **适用**: alphaMode, highlightAlphaMode, horAlign, verAlign等枚举属性

#### 3) MultiSelect - 多选下拉菜单
- **功能**: 多值属性选择
- **特性**:
  - ☑️ 复选框列表
  - 👆 点击外部自动关闭
  - 🏷️ 已选项标签显示
  - 📊 选中计数提示
- **适用**: fontFlags (BOLD, ITALIC, UNDERLINE, STRIKEOUT)

#### 4) Slider - 视觉化滑块
- **功能**: 数值范围选择
- **特性**:
  - 📏 渐变进度轨道
  - 🎯 拖拽式数值调整
  - 🔢 可选数字输入框
  - 📐 单位显示 (%, px, etc.)
  - 🎚️ 自定义min/max/step
- **适用**: alpha (0-1), fontSize (8-72)等范围数值

#### 5) Switch - 开关切换
- **功能**: 布尔值切换
- **特性**:
  - 🎭 视觉化开/关状态
  - 🎬 滑块动画效果
  - 🚫 禁用状态支持
- **适用**: visible, locked, checked, multiline等布尔属性

#### 6) FilePath - 文件路径输入
- **功能**: 路径输入 + 自动补全
- **特性**:
  - 💡 建议列表 (最多显示10条)
  - 🔎 模糊匹配过滤
  - 🖥️ 等宽字体显示
  - 📂 常用路径预设
- **适用**: diskTexture, wc3Texture, font, backdropBackground等路径属性

#### 7) VectorEditor - 向量编辑器
- **功能**: 多维数值数组编辑
- **特性**:
  - 📐 支持2D/3D/4D向量
  - 🏷️ 自定义维度标签 (X, Y, Z, W)
  - 📊 网格布局
  - 🔢 min/max约束
- **适用**: texCoord(4D), fontShadowOffset(2D), buttonPushedTextOffset(2D)等

#### 8) TextArea - 多行文本
- **功能**: 多行文本编辑
- **特性**:
  - 📝 可调整高度
  - 🖥️ 等宽字体
  - 📏 自定义行数
  - ↕️ 垂直调整大小
- **适用**: listBoxItems, 长文本内容等

---

### 2. 样式文件创建 ✅

**文件**: `src/components/PropertyEditors.css` (500行)

完整的CSS样式定义,包括:
- ✅ 暗色主题配色 (#2a2a2a背景, #4a9eff强调色)
- ✅ 悬停/焦点状态
- ✅ 动画效果 (Switch滑块, 下拉菜单展开)
- ✅ 自定义滚动条样式
- ✅ 响应式布局支持
- ✅ 无障碍友好设计

---

### 3. PropertiesPanel集成 ✅ (部分完成)

**文件**: `src/components/PropertiesPanel.tsx` (1852行)

已成功替换的控件:

| 原控件类型 | 新组件 | 属性名称 | 状态 |
|-----------|-------|---------|-----|
| `<input type="range">` | `<Slider>` | alpha | ✅ 完成 |
| `<input type="checkbox">` | `<Switch>` | visible, locked | ✅ 完成 |
| `<select>` | `<Select>` | alphaMode | ✅ 完成 |
| `<input type="text">` | `<FilePath>` | font | ✅ 完成 |
| `<input type="number">` | `<Slider>` | fontSize | ✅ 完成 |
| `<input type="text">` (逗号分隔) | `<MultiSelect>` | fontFlags | ✅ 完成 |
| 4x `<input type="number">` (RGBA) | `<ColorPicker>` | editTextColor | ✅ 完成 |

---

## 待完成工作

### 3.1 继续替换RGBA颜色输入 (约15处)

需要替换为`<ColorPicker>`的属性:

```tsx
// 文本颜色 (约6处)
fontColor → ColorPicker
fontHighlightColor → ColorPicker
fontDisabledColor → ColorPicker
fontShadowColor → ColorPicker

// EDITBOX颜色 (约3处)
editCursorColor → ColorPicker
editBorderColor → ColorPicker

// BUTTON状态颜色 (约3处)
buttonNormalColor → ColorPicker
buttonPushedColor → ColorPicker
buttonDisabledColor → ColorPicker

// LISTBOX颜色 (约3处)
listboxItemColor → ColorPicker
listboxSelectedColor → ColorPicker
listboxHighlightColor → ColorPicker
```

**替换模式示例**:
```tsx
// 原代码 (约20行)
<div className="form-group">
  <label>高亮颜色 (RGBA)</label>
  <div className="form-row">
    <input type="number" placeholder="R" value={frame.color?.[0]} onChange={...} />
    <input type="number" placeholder="G" value={frame.color?.[1]} onChange={...} />
    <input type="number" placeholder="B" value={frame.color?.[2]} onChange={...} />
    <input type="number" placeholder="A" value={frame.color?.[3]} onChange={...} />
  </div>
</div>

// 新代码 (3行)
<ColorPicker
  label="高亮颜色 (RGBA)"
  value={frame.color || [1, 1, 1, 1]}
  onChange={(value) => handleChange('color', value)}
/>
```

### 3.2 替换向量输入 (约8处)

需要替换为`<VectorEditor>`的属性:

```tsx
// 纹理坐标 (4D)
texCoord → VectorEditor (minU, minV, maxU, maxV)

// 文本偏移 (2D)
fontShadowOffset → VectorEditor (X, Y)
buttonPushedTextOffset → VectorEditor (X, Y)

// BACKDROP 9-slice (4D)
backdropBackgroundInsets → VectorEditor (top, right, bottom, left)
backdropTileCenter → VectorEditor (4D)

// SLIDER范围 (2D)
sliderMinValue → VectorEditor (min, max)
sliderStepSize → VectorEditor (step, precision)
```

**替换模式示例**:
```tsx
// 原代码 (约40行)
<div className="form-group">
  <label>纹理坐标 (UVs: minU, minV, maxU, maxV)</label>
  <div className="form-row">
    <input type="number" placeholder="minU" value={frame.texCoord?.[0]} onChange={...} />
    <input type="number" placeholder="minV" value={frame.texCoord?.[1]} onChange={...} />
    <input type="number" placeholder="maxU" value={frame.texCoord?.[2]} onChange={...} />
    <input type="number" placeholder="maxV" value={frame.texCoord?.[3]} onChange={...} />
  </div>
</div>

// 新代码 (7行)
<VectorEditor
  label="纹理坐标 (UVs)"
  value={frame.texCoord || [0, 0, 1, 1]}
  onChange={(value) => handleChange('texCoord', value)}
  dimensions={4}
  labels={['minU', 'minV', 'maxU', 'maxV']}
  step={0.01}
/>
```

### 3.3 替换其他文件路径输入 (约10处)

```tsx
diskTexture → FilePath (建议: UI/Widgets/...)
wc3Texture → FilePath (建议: ReplaceableTextures/...)
textureFile → FilePath
backdropBackground → FilePath
backdropEdgeFile → FilePath
backdropCornerFile → FilePath
buttonNormalTexture → FilePath
buttonPushedTexture → FilePath
buttonDisabledTexture → FilePath
```

### 3.4 替换其他枚举选择 (约5处)

```tsx
highlightAlphaMode → Select (BLEND/ALPHAKEY/ADD/MOD)
horAlign → Select (left/center/right)
verAlign → Select (top/center/bottom)
buttonType → Select (NORMAL/PUSH/RADIO/CHECKBOX)
scrollbarStyle → Select (VERTICAL/HORIZONTAL)
```

### 3.5 替换其他布尔值 (约10处)

```tsx
decorateFileNames → Switch
checked → Switch (CHECKBOX控件)
multiline → Switch (EDITBOX控件)
autotrack → Switch
readonly → Switch
password → Switch
sliderLayoutHorizontal → Switch
sliderLayoutVertical → Switch
```

---

## 效果对比

### 优化前 (基础HTML控件)
```
❌ RGBA颜色: 4个数字输入框 (0-1) - 不直观
❌ alphaMode: 纯文本输入 - 容易输错
❌ fontFlags: 逗号分隔文本 - 难以理解
❌ visible/locked: 基础复选框 - 不现代
❌ 文件路径: 纯文本输入 - 无提示
❌ 无视觉反馈
```

### 优化后 (可视化组件)
```
✅ RGBA颜色: 颜色选择器 + 预览框 + Alpha滑块 - 直观可视化
✅ alphaMode: 下拉菜单 4个选项 - 无输入错误
✅ fontFlags: 多选复选框菜单 - 清晰明了
✅ visible/locked: 现代开关切换 - 专业美观
✅ 文件路径: 自动补全建议 - 效率提升
✅ 实时视觉反馈
```

---

## 预估工作量

| 任务 | 已完成 | 待完成 | 总计 |
|-----|-------|-------|-----|
| 组件库开发 | ✅ 8/8 | - | 8 |
| CSS样式 | ✅ 100% | - | ~500行 |
| ColorPicker替换 | ✅ 1处 | 🔲 ~14处 | 15处 |
| VectorEditor替换 | 🔲 0处 | 🔲 ~8处 | 8处 |
| FilePath替换 | ✅ 1处 | 🔲 ~9处 | 10处 |
| Select替换 | ✅ 1处 | 🔲 ~4处 | 5处 |
| Switch替换 | ✅ 2处 | 🔲 ~8处 | 10处 |
| MultiSelect替换 | ✅ 1处 | 🔲 0处 | 1处 |
| Slider替换 | ✅ 2处 | 🔲 ~3处 | 5处 |
| **总进度** | **✅ 基础设施 + 8处示例** | **🔲 ~46处替换** | **~62项工作** |

当前进度: **~26%** (基础设施完成 + 关键示例验证)

---

## 技术细节

### 组件接口规范

所有编辑器组件共享基础接口:
```typescript
interface BaseEditorProps {
  label?: string;          // 标签文本
  tooltip?: string;        // 提示信息
  disabled?: boolean;      // 禁用状态
  className?: string;      // 自定义类名
}
```

### 颜色格式转换

ColorPicker内置HEX/RGBA转换:
```typescript
// RGBA [0.5, 0.8, 1, 1] ⇄ HEX #80ccff
toHex(rgba: number[]): string
fromHex(hex: string): number[]
```

### 样式变量

主题配色:
```css
--bg-color: #2a2a2a;        /* 背景色 */
--border-color: #444;        /* 边框色 */
--accent-color: #4a9eff;     /* 强调色 */
--text-color: #fff;          /* 文本色 */
--text-muted: #999;          /* 次要文本 */
--disabled-opacity: 0.5;     /* 禁用透明度 */
```

---

## 下一步计划

1. **批量替换RGBA颜色输入** (最高优先级)
   - 预计减少代码量: ~300行 → ~45行
   - 用户体验提升: ⭐⭐⭐⭐⭐

2. **批量替换向量输入** (高优先级)
   - 预计减少代码量: ~200行 → ~56行
   - 用户体验提升: ⭐⭐⭐⭐

3. **替换所有文件路径输入** (中优先级)
   - 添加WC3常用路径建议
   - 用户体验提升: ⭐⭐⭐⭐

4. **替换剩余枚举和布尔值** (中优先级)
   - 完善所有控件的视觉编辑体验

5. **集成测试** (必需)
   - 测试所有29种控件类型
   - 验证所有属性值的正确读写

6. **性能优化** (可选)
   - 大型项目下的渲染性能
   - 防抖处理频繁更新

7. **文档更新** (必需)
   - 用户指南更新
   - API文档

---

## 代码质量

### 已通过的质量检查

- ✅ TypeScript类型检查 (无类型错误)
- ✅ React Hooks规范
- ✅ CSS命名规范 (BEM)
- ✅ 可访问性 (ARIA labels)
- ✅ 浏览器兼容性 (Webkit前缀)

### 待修复的警告

- ⚠️ PropertyEditors.css: 需要添加标准`appearance`属性 (2处)
  ```css
  /* Line 84, 241 */
  -webkit-appearance: none;
  appearance: none; /* 添加这一行 */
  ```

---

## 致谢

感谢用户提出的UX优化建议,这将显著提升WC3 UI Designer的专业度和易用性!

---

**更新时间**: 2024年
**状态**: 🚧 进行中 (基础设施完成,示例验证通过)
**版本**: v0.5-alpha
