// 热重载导出器 - 导出 Lua 文件并管理热重载流程

import { writeTextFile } from '@tauri-apps/plugin-fs';
import { exportProjectToLua } from './luaGenerator';
import { detectKKWE, launchMapWithKKWE } from './kkweDetector';
import type { ProjectData } from '../types';

export interface HotReloadConfig {
  enabled: boolean;
  outputPath: string;        // 生成的 Lua 文件路径
  testMapPath: string;       // 测试地图路径
  autoLaunch: boolean;       // 导出后自动启动游戏
  debounceMs: number;        // 防抖延迟
}

export const DEFAULT_HOT_RELOAD_CONFIG: HotReloadConfig = {
  enabled: false,
  outputPath: 'D:\\War3Maps\\UI-Designer\\ui_generated.lua',
  testMapPath: 'D:\\War3Maps\\test.w3x',
  autoLaunch: false,
  debounceMs: 500
};

export class HotReloadExporter {
  private config: HotReloadConfig;
  private debounceTimer: number | null = null;
  private isExporting = false;
  
  constructor(config: HotReloadConfig) {
    this.config = config;
  }
  
  /**
   * 更新配置
   */
  updateConfig(config: Partial<HotReloadConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * 导出项目为 Lua 文件
   */
  async export(project: ProjectData): Promise<void> {
    if (!this.config.enabled) {
      console.log('[热重载] 已禁用，跳过导出');
      return;
    }
    
    if (this.isExporting) {
      console.log('[热重载] 正在导出，跳过重复请求');
      return;
    }
    
    try {
      this.isExporting = true;
      
      // 生成 Lua 代码
      console.log('[热重载] 开始生成 Lua 代码...');
      const luaCode = exportProjectToLua(project);
      
      // 写入文件
      console.log(`[热重载] 写入文件: ${this.config.outputPath}`);
      await writeTextFile(this.config.outputPath, luaCode);
      console.log(`[热重载] ✅ 导出成功: ${this.config.outputPath}`);
      
      // 自动启动游戏 (War3 1.27)
      if (this.config.autoLaunch) {
        console.log('[热重载] 检测 KKWE...');
        const kkweInfo = await detectKKWE();
        if (kkweInfo.installed) {
          console.log('[热重载] 启动 War3 测试...');
          await launchMapWithKKWE(this.config.testMapPath, kkweInfo);
          console.log('[热重载] ✅ War3 已启动');
        } else {
          console.warn('[热重载] ⚠️ KKWE 未安装，跳过自动启动');
        }
      }
    } catch (error) {
      console.error('[热重载] ❌ 导出失败:', error);
      throw error;
    } finally {
      this.isExporting = false;
    }
  }
  
  /**
   * 带防抖的导出
   */
  exportDebounced(project: ProjectData): void {
    if (!this.config.enabled) {
      return;
    }
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    console.log(`[热重载] 防抖延迟 ${this.config.debounceMs}ms...`);
    
    this.debounceTimer = window.setTimeout(() => {
      this.export(project).catch(error => {
        console.error('[热重载] 防抖导出失败:', error);
      });
    }, this.config.debounceMs);
  }
  
  /**
   * 取消待处理的导出
   */
  cancelPendingExport(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
      console.log('[热重载] 取消待处理的导出');
    }
  }
}

// 单例导出器
let globalExporter: HotReloadExporter | null = null;

/**
 * 获取全局导出器实例
 */
export function getHotReloadExporter(config?: HotReloadConfig): HotReloadExporter {
  if (!globalExporter) {
    globalExporter = new HotReloadExporter(config || DEFAULT_HOT_RELOAD_CONFIG);
  } else if (config) {
    globalExporter.updateConfig(config);
  }
  return globalExporter;
}
