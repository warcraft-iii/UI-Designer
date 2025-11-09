# 更新日志

## [0.1.2] - 2025-01-10

### 修复
- 修复 GitHub Actions 构建配置，确保正确生成 latest.json 更新文件
- 修复 Tauri 签名环境变量名称（Tauri v2 使用新的变量名）

### 改进
- 使用 Git Tag 作为版本号的唯一来源
- GitHub Actions 自动从 tag 提取版本号并更新所有配置文件
- AboutDialog 在生产环境使用 Tauri API 动态获取版本号

### 文档
- 添加详细的版本管理指南（docs/VERSION_MANAGEMENT.md）

## [0.1.1] - 2025-01-10

### 修复
- 修复拖拽过程中周期性卡顿的问题，优化为 60fps 流畅拖拽
- 修复 Model/Sprite 控件大小变化后 WebGL 显示区域未同步更新的问题
- 修复启动时 MPQ 档案重复加载的问题
- 修复版本号显示不一致的问题
- 修复自动更新器无法获取 latest.json 的问题

### 优化
- 移除 requestAnimationFrame 带来的额外开销
- 优化拖拽节流时间为 16ms（60fps）
- 优化 Model 控件投影矩阵更新逻辑
- 添加 isLoading 标志防止 MPQ 异步加载竞态条件

### 变更
- 统一所有配置文件版本号为 0.1.1
- AboutDialog 现在从 package.json 动态读取版本号
- GitHub Actions 工作流添加 includeUpdaterJson 选项

## [0.1.0] - 2025-01-09

### 新增
- 初始版本发布
- 可视化拖拽编辑功能
- 实时预览效果
- 丰富的 UI 模板
- 锚点系统支持
- 多层级组件管理
- FDF 格式导入导出
- MPQ 档案加载支持
- BLP 纹理加载
- MDX 模型渲染
- 自动更新检查（开发环境下跳过）
