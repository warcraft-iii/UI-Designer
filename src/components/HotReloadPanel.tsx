// 热重载面板组件 - 控制 War3 1.27 热重载功能

import React, { useEffect, useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { detectKKWE, launchMapWithKKWE, type KKWEInfo } from '../utils/kkweDetector';
import { getHotReloadExporter, DEFAULT_HOT_RELOAD_CONFIG, type HotReloadConfig } from '../utils/hotReloadExporter';
import './HotReloadPanel.css';

export const HotReloadPanel: React.FC = () => {
  const [kkweInfo, setKkweInfo] = useState<KKWEInfo>({ installed: false });
  const [config, setConfig] = useState<HotReloadConfig>(DEFAULT_HOT_RELOAD_CONFIG);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  
  // 初始化：检测 KKWE
  useEffect(() => {
    checkKKWE();
    
    // 从本地存储加载配置
    const savedConfig = localStorage.getItem('hotReloadConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        getHotReloadExporter(parsed);
      } catch (e) {
        console.error('加载热重载配置失败:', e);
      }
    }
  }, []);
  
  // 检测 KKWE
  const checkKKWE = async () => {
    setIsChecking(true);
    try {
      const info = await detectKKWE();
      setKkweInfo(info);
      if (info.installed) {
        showMessage('success', 'KKWE 已安装');
      } else {
        showMessage('error', 'KKWE 未安装，请下载安装');
      }
    } catch (error) {
      console.error('检测 KKWE 失败:', error);
      showMessage('error', `检测失败: ${error}`);
    } finally {
      setIsChecking(false);
    }
  };
  
  // 显示消息
  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };
  
  // 更新配置
  const updateConfig = (updates: Partial<HotReloadConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    getHotReloadExporter(newConfig);
    
    // 保存到本地存储
    localStorage.setItem('hotReloadConfig', JSON.stringify(newConfig));
  };
  
  // 选择输出路径
  const selectOutputPath = async () => {
    const selected = await open({
      title: '选择 Lua 输出文件',
      filters: [{
        name: 'Lua',
        extensions: ['lua']
      }],
      defaultPath: config.outputPath
    });
    
    if (selected && typeof selected === 'string') {
      updateConfig({ outputPath: selected });
    }
  };
  
  // 选择测试地图
  const selectTestMap = async () => {
    const selected = await open({
      title: '选择测试地图',
      filters: [{
        name: 'War3 Map',
        extensions: ['w3x', 'w3m']
      }],
      defaultPath: config.testMapPath
    });
    
    if (selected && typeof selected === 'string') {
      updateConfig({ testMapPath: selected });
    }
  };
  
  // 启动测试
  const handleLaunchTest = async () => {
    if (!kkweInfo.installed) {
      showMessage('error', 'KKWE 未安装');
      return;
    }
    
    try {
      showMessage('info', '正在启动 War3...');
      await launchMapWithKKWE(config.testMapPath, kkweInfo);
      showMessage('success', 'War3 启动成功！');
    } catch (error) {
      console.error('启动失败:', error);
      showMessage('error', `启动失败: ${error}`);
    }
  };
  
  return (
    <div className="hot-reload-panel">
      <div className="panel-header">
        <h3>🔥 热重载配置 (War3 1.27)</h3>
        <button 
          className="btn-refresh" 
          onClick={checkKKWE}
          disabled={isChecking}
        >
          {isChecking ? '检测中...' : '🔄 重新检测'}
        </button>
      </div>
      
      {/* 消息提示 */}
      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}
      
      {/* KKWE 状态 */}
      <div className="kkwe-status">
        <div className="status-item">
          <strong>KKWE 状态:</strong>
          <span className={kkweInfo.installed ? 'status-ok' : 'status-error'}>
            {kkweInfo.installed ? '✅ 已安装' : '❌ 未安装'}
          </span>
        </div>
        
        {!kkweInfo.installed && (
          <div className="download-hint">
            <a href="http://www.kkwai.com/" target="_blank" rel="noopener noreferrer">
              📥 下载 KKWE (凯凯我编)
            </a>
          </div>
        )}
        
        {kkweInfo.installed && (
          <div className="kkwe-paths">
            <div className="path-item">
              <small>📁 KKWE: {kkweInfo.kkwePath}</small>
            </div>
            <div className="path-item">
              <small>🚀 启动器: {kkweInfo.launcherPath}</small>
            </div>
            {kkweInfo.war3Path && (
              <div className="path-item">
                <small>🎮 War3: {kkweInfo.war3Path}</small>
              </div>
            )}
          </div>
        )}
      </div>
      
      <hr />
      
      {/* 热重载开关 */}
      <div className="config-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => updateConfig({ enabled: e.target.checked })}
          />
          <span>启用热重载 (自动导出 Lua)</span>
        </label>
      </div>
      
      {/* 输出路径 */}
      <div className="config-section">
        <label>
          <strong>Lua 输出路径:</strong>
          <div className="input-with-button">
            <input
              type="text"
              value={config.outputPath}
              onChange={(e) => updateConfig({ outputPath: e.target.value })}
              placeholder="D:\War3Maps\UI-Designer\ui_generated.lua"
            />
            <button onClick={selectOutputPath}>浏览...</button>
          </div>
        </label>
      </div>
      
      {/* 测试地图路径 */}
      <div className="config-section">
        <label>
          <strong>测试地图路径:</strong>
          <div className="input-with-button">
            <input
              type="text"
              value={config.testMapPath}
              onChange={(e) => updateConfig({ testMapPath: e.target.value })}
              placeholder="D:\War3Maps\test.w3x"
            />
            <button onClick={selectTestMap}>浏览...</button>
          </div>
        </label>
      </div>
      
      {/* 自动启动 */}
      <div className="config-section">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.autoLaunch}
            onChange={(e) => updateConfig({ autoLaunch: e.target.checked })}
          />
          <span>导出后自动启动游戏</span>
        </label>
      </div>
      
      {/* 防抖延迟 */}
      <div className="config-section">
        <label>
          <strong>防抖延迟 (ms):</strong>
          <input
            type="number"
            value={config.debounceMs}
            onChange={(e) => updateConfig({ debounceMs: parseInt(e.target.value) || 500 })}
            min="0"
            max="5000"
            step="100"
          />
        </label>
      </div>
      
      <hr />
      
      {/* 手动启动测试 */}
      <div className="test-launch">
        <button
          className="btn-launch"
          onClick={handleLaunchTest}
          disabled={!kkweInfo.installed}
        >
          🚀 启动测试地图
        </button>
      </div>
      
      {/* 使用提示 */}
      <div className="usage-hint">
        <h4>💡 使用说明:</h4>
        <ol>
          <li>确保已安装 KKWE (凯凯我编)</li>
          <li>设置 Lua 输出路径 (建议: War3安装目录/Maps/UI-Designer/)</li>
          <li>设置测试地图路径</li>
          <li>启用热重载后，编辑器会自动导出 Lua 文件</li>
          <li>在地图触发器中添加初始化代码 (参考文档)</li>
          <li>游戏内输入 <code>-reload</code> 或 <code>-rl</code> 刷新 UI</li>
        </ol>
      </div>
    </div>
  );
};
