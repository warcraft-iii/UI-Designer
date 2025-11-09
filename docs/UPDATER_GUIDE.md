# GitHub Release 自动更新配置指南

本项目已集成 Tauri 自动更新功能，支持从 GitHub Release 自动检查和安装更新。

## 📋 功能特性

- ✅ 自动检查更新（启动后 3 秒自动检查）
- ✅ 手动检查更新（菜单：帮助 → 检查更新）
- ✅ 下载进度显示
- ✅ 一键安装更新
- ✅ 自动重启应用

---

## 🔐 生成签名密钥

更新功能需要使用非对称加密来确保安全性。首先需要生成密钥对：

### 1. 生成密钥对

```bash
# 安装 Tauri CLI（如果还没安装）
cargo install tauri-cli --version "^2.0.0"

# 生成密钥对
tauri signer generate -w ~/.tauri/myapp.key
```

这会生成两个文件：
- **私钥**: `~/.tauri/myapp.key` - 用于签名，保密！
- **公钥**: 会显示在终端 - 复制到配置文件

### 2. 配置公钥

将生成的**公钥**复制到 `src-tauri/tauri.conf.json`：

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://github.com/dulingzhi/UI-Designer/releases/latest/download/latest.json"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"  // 👈 替换为你的公钥
    }
  }
}
```

**⚠️ 重要**：
- 公钥可以公开，写在代码里
- 私钥必须保密，不要提交到 Git！

---

## 🚀 发布新版本流程

### 步骤 1: 更新版本号

修改以下文件中的版本号：

**package.json**:
```json
{
  "version": "0.2.0"
}
```

**src-tauri/tauri.conf.json**:
```json
{
  "version": "0.2.0"
}
```

**src-tauri/Cargo.toml**:
```toml
[package]
version = "0.2.0"
```

### 步骤 2: 构建发布版本

```bash
# 构建所有平台的安装包
bun tauri build

# 构建成功后，安装包位于：
# - Windows: src-tauri/target/release/bundle/nsis/*.exe
# - macOS: src-tauri/target/release/bundle/dmg/*.dmg
# - Linux: src-tauri/target/release/bundle/appimage/*.AppImage
```

### 步骤 3: 签名更新文件

使用私钥对更新文件进行签名：

```bash
# 签名 Windows 更新
tauri signer sign \
  -k ~/.tauri/myapp.key \
  -f src-tauri/target/release/bundle/nsis/*.nsis.zip

# 签名 macOS 更新（如果有）
tauri signer sign \
  -k ~/.tauri/myapp.key \
  -f src-tauri/target/release/bundle/macos/*.app.tar.gz

# 签名 Linux 更新（如果有）
tauri signer sign \
  -k ~/.tauri/myapp.key \
  -f src-tauri/target/release/bundle/appimage/*.AppImage.tar.gz
```

这会生成 `.sig` 签名文件，与安装包放在一起。

### 步骤 4: 创建 latest.json

在项目根目录创建 `latest.json` 文件：

```json
{
  "version": "0.2.0",
  "notes": "新版本更新内容：\n- 添加了自动更新功能\n- 修复了若干 Bug\n- 性能优化",
  "pub_date": "2025-11-09T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "从 .sig 文件复制签名内容",
      "url": "https://github.com/dulingzhi/UI-Designer/releases/download/v0.2.0/wc3-ui-designer_0.2.0_x64-setup.nsis.zip"
    },
    "darwin-x86_64": {
      "signature": "从 .sig 文件复制签名内容",
      "url": "https://github.com/dulingzhi/UI-Designer/releases/download/v0.2.0/wc3-ui-designer_0.2.0_x64.app.tar.gz"
    },
    "darwin-aarch64": {
      "signature": "从 .sig 文件复制签名内容",
      "url": "https://github.com/dulingzhi/UI-Designer/releases/download/v0.2.0/wc3-ui-designer_0.2.0_aarch64.app.tar.gz"
    },
    "linux-x86_64": {
      "signature": "从 .sig 文件复制签名内容",
      "url": "https://github.com/dulingzhi/UI-Designer/releases/download/v0.2.0/wc3-ui-designer_0.2.0_amd64.AppImage.tar.gz"
    }
  }
}
```

**获取签名内容**：
```bash
# 读取签名文件内容
cat src-tauri/target/release/bundle/nsis/*.nsis.zip.sig
```

### 步骤 5: 创建 GitHub Release

1. 访问仓库的 Releases 页面
2. 点击 "Create a new release"
3. 填写信息：
   - **Tag**: `v0.2.0`
   - **Title**: `v0.2.0 - 更新说明`
   - **Description**: 详细的更新日志
4. 上传文件：
   - 所有安装包（.exe, .dmg, .AppImage 等）
   - 所有签名文件（.sig）
   - `latest.json` 文件
5. 点击 "Publish release"

### 步骤 6: 验证更新

发布后，旧版本的应用会：
1. 启动后 3 秒自动检查更新
2. 发现新版本后弹窗提示
3. 用户确认后下载并安装
4. 安装完成后重启应用

---

## 🔧 配置说明

### tauri.conf.json 配置项

```json
{
  "plugins": {
    "updater": {
      "active": true,                    // 启用更新器
      "endpoints": [                      // 更新信息 URL
        "https://github.com/dulingzhi/UI-Designer/releases/latest/download/latest.json"
      ],
      "dialog": true,                     // 使用系统对话框
      "pubkey": "YOUR_PUBLIC_KEY"         // 公钥
    }
  }
}
```

### UpdateChecker 组件配置

在 `src/App.tsx` 中：

```tsx
<UpdateChecker 
  checkOnMount={true}           // 启动时自动检查（延迟 3 秒）
  onUpdateAvailable={(ver) => {  // 发现更新时的回调
    console.log('新版本:', ver);
  }}
/>
```

---

## 🎯 自动化发布（GitHub Actions）

创建 `.github/workflows/release.yml` 实现自动化：

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    strategy:
      matrix:
        platform: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20
          
      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          
      - name: Install dependencies
        run: bun install
        
      - name: Build
        run: bun tauri build
        env:
          TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
          TAURI_KEY_PASSWORD: ${{ secrets.TAURI_KEY_PASSWORD }}
        
      - name: Upload Release Assets
        uses: softprops/action-gh-release@v1
        with:
          files: src-tauri/target/release/bundle/**/*
```

**配置 GitHub Secrets**：
1. 进入仓库 Settings → Secrets
2. 添加 `TAURI_PRIVATE_KEY`（私钥内容）
3. 添加 `TAURI_KEY_PASSWORD`（私钥密码，如果有）

---

## 📝 更新日志格式

在 `latest.json` 的 `notes` 字段使用 Markdown 格式：

```json
{
  "notes": "## 新功能\n- 自动更新功能\n- FDF 导入优化\n\n## Bug 修复\n- 修复了坐标计算错误\n- 优化了性能\n\n## 其他\n- 更新了文档"
}
```

---

## 🔍 调试更新功能

### 本地测试

1. 修改 `tauri.conf.json`，使用测试 URL：
```json
"endpoints": [
  "http://localhost:8000/latest.json"
]
```

2. 启动本地服务器：
```bash
# 在 latest.json 所在目录
python -m http.server 8000
```

3. 运行应用测试更新

### 查看日志

更新器会输出详细日志到控制台：
```bash
bun tauri dev
# 查看控制台输出
```

---

## ⚠️ 注意事项

1. **私钥安全**
   - 私钥文件不要提交到 Git
   - 使用 GitHub Secrets 存储
   - 定期更换密钥

2. **版本号规范**
   - 使用语义化版本（SemVer）
   - 格式：`major.minor.patch`
   - 示例：`1.0.0`, `1.1.0`, `2.0.0`

3. **签名文件**
   - 每个安装包都需要对应的 `.sig` 文件
   - 签名和安装包必须一起上传
   - URL 要正确指向 GitHub Release

4. **latest.json**
   - 必须放在 Release 的 Assets 中
   - 文件名必须是 `latest.json`
   - URL 要使用 `releases/latest/download/`

5. **测试流程**
   - 发布前在本地充分测试
   - 使用测试 Tag（如 `v0.2.0-beta`）
   - 确认签名验证正常

---

## 📚 参考资料

- [Tauri 更新器文档](https://v2.tauri.app/plugin/updater/)
- [签名工具文档](https://v2.tauri.app/reference/cli/#signer)
- [GitHub Release API](https://docs.github.com/en/rest/releases)

---

## 🆘 常见问题

### Q: 提示"签名验证失败"
A: 检查公钥是否正确配置，签名文件是否完整

### Q: 无法下载更新
A: 检查 URL 是否正确，Release 是否已发布

### Q: 更新后无法启动
A: 检查版本号是否正确递增，安装包是否完整

### Q: 如何跳过某个版本
A: 用户可以在更新提示中选择"取消"

---

**祝发布顺利！** 🎉
