// KKWE 检测器 - 检测 KKWE 安装并提供启动功能

import { invoke } from '@tauri-apps/api/core';
import { exists } from '@tauri-apps/plugin-fs';
import { mpqManager } from './mpqManager';

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
  try {
    // 获取用户名
    const username = await invoke<string>('get_username');
    const kkweBasePath = `C:\\Users\\${username}\\AppData\\Local\\KKWE`;
    
    const kkwePath = `${kkweBasePath}\\KKWE.exe`;
    const launcherPath = `${kkweBasePath}\\bin\\YDWEConfig.exe`;
    
    // 检查文件是否存在
    const kkweExists = await exists(kkwePath);
    const launcherExists = await exists(launcherPath);
    
    if (!kkweExists || !launcherExists) {
      return { installed: false };
    }
    
    // 从 MPQManager 获取 War3 路径
    const war3Path = mpqManager.getWar3Path();
    
    return {
      installed: true,
      kkwePath,
      launcherPath,
      war3Path: war3Path || undefined
    };
  } catch (error) {
    console.error('[KKWE] 检测失败:', error);
    return { installed: false };
  }
}

/**
 * 使用 KKWE 启动地图
 * @param mapPath 地图文件的绝对路径
 * @param kkweInfo KKWE 信息对象
 * @returns 返回启动的进程ID
 */
export async function launchMapWithKKWE(
  mapPath: string, 
  kkweInfo: KKWEInfo
): Promise<number> {
  if (!kkweInfo.installed || !kkweInfo.launcherPath) {
    throw new Error('KKWE 未安装或启动器路径无效');
  }
  
  // 规范化路径（统一使用反斜杠）
  const normalizedMapPath = mapPath.replace(/\//g, '\\');
  
  // 调用 Tauri 命令启动进程，返回进程ID
  const pid = await invoke<number>('launch_kkwe', {
    launcherPath: kkweInfo.launcherPath,
    mapPath: normalizedMapPath
  });
  
  console.log(`[KKWE] 启动地图: ${normalizedMapPath}, PID=${pid}`);
  return pid;
}

/**
 * 检查进程是否正在运行
 */
export async function isProcessRunning(pid: number): Promise<boolean> {
  try {
    return await invoke<boolean>('is_process_running', { pid });
  } catch (error) {
    console.error('[进程管理] 检查进程失败:', error);
    return false;
  }
}

/**
 * 结束指定进程
 */
export async function killProcess(pid: number): Promise<void> {
  try {
    await invoke('kill_process', { pid });
    console.log(`[进程管理] 已结束进程: PID=${pid}`);
  } catch (error) {
    console.error('[进程管理] 结束进程失败:', error);
    throw error;
  }
}

/**
 * 使用管理员权限结束指定进程（会弹出UAC提示）
 */
export async function killProcessElevated(pid: number): Promise<void> {
  try {
    await invoke('kill_process_elevated', { pid });
    console.log(`[进程管理] 已通过管理员权限结束进程: PID=${pid}`);
  } catch (error) {
    console.error('[进程管理] 管理员权限结束进程失败:', error);
    throw error;
  }
}

/**
 * 检查War3.exe是否正在运行
 */
export async function isWar3Running(): Promise<boolean> {
  try {
    return await invoke<boolean>('is_war3_running');
  } catch (error) {
    console.error('[War3检查] 检查War3运行状态失败:', error);
    return false;
  }
}

/**
 * 结束所有War3.exe进程
 */
export async function killWar3Processes(): Promise<void> {
  try {
    await invoke('kill_war3_processes');
    console.log('[进程管理] 已结束所有War3进程');
  } catch (error) {
    console.error('[进程管理] 结束War3进程失败:', error);
    throw error;
  }
}
