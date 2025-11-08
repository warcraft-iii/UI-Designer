# MDX 3D 模型渲染 - 快速开始

## 5 分钟快速上手

### 1️⃣ 启动应用

```bash
bun tauri dev
```

### 2️⃣ 添加 MODEL 控件

1. 在画布中点击右键
2. 选择 `Create → Model`
3. 或在项目树中右键父节点 → `Add Child → Model`

### 3️⃣ 设置模型文件

在属性面板中找到 **MODEL 属性**：

- **backgroundArt**: 输入模型路径
  ```
  Units/Human/Peasant/Peasant.mdx
  ```

- **layerStyle**: 选择渲染模式
  - `NOSHADING` - 无阴影（推荐 3D 模型）
  - `IGNORETRACKEVENTS` - 忽略鼠标事件

### 4️⃣ 查看 3D 渲染

保存后，画布中自动显示旋转的 3D 模型！

## 常用模型路径

### UI 界面模型
```
UI/Glues/ScoreScreen/ScoreScreen-Background.mdx
UI/Glues/Loading/Loading-NightElf.mdx
UI/Glues/MainMenu/MainMenu-NightElf/MainMenu-NightElf.mdx
```

### 单位模型
```
Units/Human/Peasant/Peasant.mdx
Units/Human/Footman/Footman.mdx
Units/Orc/Peon/Peon.mdx
Units/Orc/Grunt/Grunt.mdx
Units/NightElf/Wisp/Wisp.mdx
Units/Undead/Acolyte/Acolyte.mdx
```

### 建筑模型
```
Buildings/Human/TownHall/TownHall.mdx
Buildings/Orc/GreatHall/GreatHall.mdx
Buildings/NightElf/TreeOfLife/TreeOfLife.mdx
Buildings/Undead/Necropolis/Necropolis.mdx
```

### 装饰模型
```
Doodads/Ashenvale/Trees/AshenTree/AshenTree.mdx
Doodads/Cityscape/Props/Crates/Crates0.mdx
```

## 测试解析器

打开浏览器控制台 (F12)：

```javascript
// 测试常见模型
testMdxParsing()

// 查看解析结果
// ✅ 解析成功
// - 顶点数: 1247
// - 法线数: 1247
// - 面数: 415
```

## 常见问题

### Q: 模型不显示？
**A**: 检查以下几点：
1. `backgroundArt` 路径是否正确
2. MPQ 档案是否存在
3. 控制台是否有错误信息

### Q: 显示红色线框？
**A**: 表示解析失败：
1. 打开控制台查看详细错误
2. 确认 MDX 文件未损坏
3. 尝试其他模型验证

### Q: 模型是灰色的？
**A**: 正常！当前版本：
- ✅ 支持几何体渲染
- ❌ 暂不支持纹理（开发中）

### Q: 模型太大/太小？
**A**: 自动缩放功能已启用：
- 调整控件的 `width` 和 `height` 属性
- 模型会自动适配尺寸

## 下一步

- 📖 阅读 [完整使用指南](./MDX_RENDERING_USAGE.md)
- 🏗️ 查看 [技术提案](./MDX_RENDERING_PROPOSAL.md)
- ✅ 查看 [实施报告](./MDX_IMPLEMENTATION_COMPLETE.md)

## 需要帮助？

1. 查看控制台错误信息
2. 运行 `testMdxParsing()` 验证功能
3. 检查 `docs/MDX_RENDERING_USAGE.md` 故障排查部分

---

**享受 3D 模型设计！** 🎮✨
