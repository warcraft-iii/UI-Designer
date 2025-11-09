import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';

interface UpdateCheckerProps {
  onUpdateAvailable?: (version: string) => void;
  checkOnMount?: boolean;
}

export function UpdateChecker({ onUpdateAvailable, checkOnMount = false }: UpdateCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const checkForUpdates = async (showNoUpdateMessage = false) => {
    if (checking || downloading) return;
    
    setChecking(true);
    try {
      const update = await check();
      
      if (update?.available) {
        const version = update.version;
        onUpdateAvailable?.(version);
        
        const yes = await ask(
          `发现新版本 ${version}，是否立即更新？\n\n更新内容：\n${update.body || '无更新说明'}`,
          {
            title: '发现新版本',
            kind: 'info',
          }
        );

        if (yes) {
          setDownloading(true);
          
          // 下载并安装更新
          await update.downloadAndInstall((event: any) => {
            switch (event.event) {
              case 'Started':
                setDownloadProgress(0);
                console.log('开始下载更新...');
                break;
              case 'Progress':
                const progress = Math.round((event.data.downloaded / event.data.contentLength) * 100);
                setDownloadProgress(progress);
                console.log(`下载进度: ${progress}%`);
                break;
              case 'Finished':
                setDownloadProgress(100);
                console.log('下载完成');
                break;
            }
          });

          // 安装完成，提示重启
          const shouldRelaunch = await ask(
            '更新已下载完成，是否立即重启应用？',
            {
              title: '更新完成',
              kind: 'info',
            }
          );

          if (shouldRelaunch) {
            await relaunch();
          }
        }
      } else if (showNoUpdateMessage) {
        await message('当前已是最新版本', {
          title: '检查更新',
          kind: 'info',
        });
      }
    } catch (error) {
      console.error('检查更新失败:', error);
      if (showNoUpdateMessage) {
        await message(`检查更新失败: ${error}`, {
          title: '错误',
          kind: 'error',
        });
      }
    } finally {
      setChecking(false);
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  useEffect(() => {
    if (checkOnMount) {
      // 延迟 3 秒后自动检查更新
      const timer = setTimeout(() => {
        checkForUpdates(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [checkOnMount]);

  // 暴露 checkForUpdates 方法给父组件
  useEffect(() => {
    (window as any).checkForUpdates = () => checkForUpdates(true);
  }, []);

  if (!downloading) return null;

  return (
    <div className="update-progress-overlay">
      <div className="update-progress-dialog">
        <h3>正在下载更新</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${downloadProgress}%` }}
          />
        </div>
        <p>{downloadProgress}%</p>
      </div>
      <style>{`
        .update-progress-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        
        .update-progress-dialog {
          background: #2d2d30;
          border: 1px solid #3e3e42;
          border-radius: 8px;
          padding: 24px;
          min-width: 400px;
          color: #cccccc;
        }
        
        .update-progress-dialog h3 {
          margin: 0 0 16px 0;
          color: #ffffff;
          font-size: 16px;
          font-weight: 500;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #3e3e42;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        
        .progress-fill {
          height: 100%;
          background: #007acc;
          transition: width 0.3s ease;
        }
        
        .update-progress-dialog p {
          margin: 0;
          text-align: center;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

export default UpdateChecker;
