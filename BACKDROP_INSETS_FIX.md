# Backdrop Background Insets 修复报告

## 问题描述

用户反馈：在属性编辑器中修改 `backdropBackgroundInsets`（背景内边距）没有效果。

## 问题根源分析

经过详细分析，发现了**两个严重的 bug**：

### Bug 1: 属性编辑器标签顺序错误 ❌

**错误代码**（PropertiesPanel.tsx）：
```tsx
<VectorEditor
  label="背景内边距 (上, 右, 下, 左)"
  value={selectedFrame.backdropBackgroundInsets || [0, 0, 0, 0]}
  onChange={(value) => handleChange('backdropBackgroundInsets', value)}
  dimensions={4}
  labels={['上', '右', '下', '左']}  // ❌ 错误！
  step={0.001}
/>
```

**问题**：
- 标签显示顺序：`['上', '右', '下', '左']`
- 实际数组顺序：`[left, top, right, bottom]`（根据 WC3 FDF 规范）
- 导致用户在"上"输入框中输入的值实际修改了"左"边距！

**正确的标签顺序**应该是：`['左', '上', '右', '下']`

### Bug 2: Canvas 渲染坐标系转换错误 ❌

**错误代码**（Canvas.tsx）：
```tsx
top: frame.backdropBackgroundInsets 
  ? `${(frame.backdropBackgroundInsets[1] / 0.8) * (CANVAS_WIDTH - 2 * MARGIN)}px`
  : 0,
// ... 其他方向也都除以 0.8
```

**问题**：
- WC3 坐标系统中：
  - **横向**（左右）使用 **0.8** 作为参考宽度
  - **纵向**（上下）使用 **0.6** 作为参考高度
- 但代码中所有方向都在除以 0.8，导致上下边距的计算错误！

**正确的转换**应该是：
- **左边距/右边距**：除以 0.8（横向）
- **上边距/下边距**：除以 0.6（纵向）

## 修复方案

### 修复 1: 更正属性编辑器标签

**文件**：`src/components/PropertiesPanel.tsx`

```tsx
<VectorEditor
  label="背景内边距 (左, 上, 右, 下)"  // ✅ 修正标签顺序
  value={selectedFrame.backdropBackgroundInsets || [0, 0, 0, 0]}
  onChange={(value) => handleChange('backdropBackgroundInsets', value)}
  dimensions={4}
  labels={['左', '上', '右', '下']}  // ✅ 修正标签顺序
  step={0.001}
/>
```

### 修复 2: 更正坐标系转换

**文件**：`src/components/Canvas.tsx`

```tsx
{frame.backdropBackground && (
  <div
    style={{
      position: 'absolute',
      // backdropBackgroundInsets 格式: [left, top, right, bottom]
      // 左右使用横向比例 0.8，上下使用纵向比例 0.6
      left: frame.backdropBackgroundInsets 
        ? `${(frame.backdropBackgroundInsets[0] / 0.8) * (CANVAS_WIDTH - 2 * MARGIN)}px`
        : 0,
      top: frame.backdropBackgroundInsets 
        ? `${(frame.backdropBackgroundInsets[1] / 0.6) * CANVAS_HEIGHT}px`  // ✅ 改用 0.6
        : 0,
      right: frame.backdropBackgroundInsets 
        ? `${(frame.backdropBackgroundInsets[2] / 0.8) * (CANVAS_WIDTH - 2 * MARGIN)}px`
        : 0,
      bottom: frame.backdropBackgroundInsets 
        ? `${(frame.backdropBackgroundInsets[3] / 0.6) * CANVAS_HEIGHT}px`  // ✅ 改用 0.6
        : 0,
      // ... 其他样式
    }}
  />
)}
```

## 数据格式说明

### WC3 FDF 格式
```fdf
BackdropBackgroundInsets 0.01 0.02 0.01 0.02
//                       左   上   右   下
//                       [0]  [1]  [2]  [3]
```

### TypeScript 类型定义
```typescript
backdropBackgroundInsets?: [number, number, number, number]; // [left, top, right, bottom]
```

### 坐标系统
- **横向（X轴）**：范围 0.0 ~ 0.8，参考宽度 = 0.8
- **纵向（Y轴）**：范围 0.0 ~ 0.6，参考高度 = 0.6
- **内边距**：
  - 左/右边距 = WC3值 / 0.8 × 画布横向像素宽度
  - 上/下边距 = WC3值 / 0.6 × 画布纵向像素高度

## 测试验证

### 测试步骤

1. 创建一个 BACKDROP 类型的控件
2. 设置背景纹理（`backdropBackground`）
3. 设置背景内边距：
   - 左：0.01
   - 上：0.02
   - 右：0.01
   - 下：0.02
4. 观察画布上的渲染效果

### 预期结果

- 背景纹理应该从控件边缘向内收缩
- 左右收缩距离相同（0.01）
- 上下收缩距离相同（0.02）且大于左右
- 修改任意一个边距值，对应方向的效果应立即生效

### 示例代码

```typescript
const testFrame: FrameData = {
  id: 'test-backdrop',
  name: 'TestBackdrop',
  type: FrameType.BACKDROP,
  x: 0.1,
  y: 0.1,
  width: 0.2,
  height: 0.15,
  backdropBackground: 'UI\\Widgets\\EscMenu\\Human\\human-options-menu-background.blp',
  backdropBackgroundInsets: [0.01, 0.02, 0.01, 0.02], // [左, 上, 右, 下]
  // ...
};
```

## 影响范围

### 受影响的功能
1. ✅ 属性编辑器 - 背景内边距编辑
2. ✅ Canvas 渲染 - 背景纹理显示
3. ✅ FDF 导入导出 - 已正确处理，无需修改

### 不受影响的功能
- FDF 文件解析（`fdfTransformer.ts`）- 正确
- FDF 文件导出（`fdfExport.ts`）- 正确
- BackdropEdge 组件（边框渲染）- 独立逻辑

## 相关文件

- ✅ `src/components/PropertiesPanel.tsx` - 已修复标签
- ✅ `src/components/Canvas.tsx` - 已修复坐标转换
- ✅ `src/utils/fdfAst.ts` - 定义正确
- ✅ `src/utils/fdfTransformer.ts` - 解析正确
- ✅ `src/utils/fdfExport.ts` - 导出正确
- ✅ `docs/BACKDROP_EDGE_USAGE.md` - 文档正确

## 总结

这是一个典型的**接口不一致**问题：
1. 数据模型定义正确（FDF 解析/导出）
2. 渲染逻辑有误（坐标系转换错误）
3. UI 显示误导（标签顺序错误）

通过这次修复，确保了从**数据存储 → UI 显示 → Canvas 渲染**的完整一致性。

---

**修复时间**: 2025-11-08  
**修复版本**: v0.4.1  
**严重程度**: 高（影响核心功能）  
**测试状态**: ✅ 待验证
