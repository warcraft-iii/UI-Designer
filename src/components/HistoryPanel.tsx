import React from 'react';
import { useCommandStore } from '../store/commandStore';
import './HistoryPanel.css';

export const HistoryPanel: React.FC = () => {
  const { undoStack, redoStack, undo, redo } = useCommandStore();

  // 获取命令的显示名称
  const getCommandName = (command: any): string => {
    const className = command.constructor.name;
    
    // 命令名称映射
    const nameMap: Record<string, string> = {
      'CreateFrameCommand': '创建控件',
      'RemoveFrameCommand': '删除控件',
      'UpdateFrameCommand': '更新属性',
      'MoveFrameCommand': '移动控件',
      'ChangeParentCommand': '改变父级',
      'CopyFrameCommand': '复制',
      'PasteFrameCommand': '粘贴',
      'AlignCommand': '对齐',
      'DistributeCommand': '分布',
      'EqualSpacingCommand': '等间距',
      'UnifySizeCommand': '统一大小',
      'ZIndexCommand': '层级调整',
      'AlignToCanvasCommand': '画布对齐',
      'DuplicateCommand': '重复',
      'DuplicateFrameCommand': '复制控件',
      'CreateTableArrayCommand': '表格阵列',
      'CreateCircleArrayCommand': '圆形阵列',
    };

    return nameMap[className] || className;
  };

  // 获取命令的详细信息
  const getCommandDetails = (command: any): string => {
    // 尝试获取命令的详细信息
    if (command.frame?.name) {
      return command.frame.name;
    }
    if (command.frameId) {
      return `ID: ${command.frameId.substring(0, 8)}...`;
    }
    return '';
  };

  // 跳转到历史状态
  const goToHistoryState = (index: number) => {
    const currentIndex = undoStack.length - 1;
    
    if (index < currentIndex) {
      // 需要撤销
      const steps = currentIndex - index;
      for (let i = 0; i < steps; i++) {
        undo();
      }
    } else if (index > currentIndex) {
      // 需要重做
      const steps = index - currentIndex;
      for (let i = 0; i < steps; i++) {
        redo();
      }
    }
  };

  // 当前历史索引（-1表示初始状态）
  const currentIndex = undoStack.length - 1;
  
  // 合并撤销栈和重做栈为完整历史记录
  const fullHistory = [...undoStack, ...redoStack.slice().reverse()];

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>历史记录</h3>
      </div>
      
      <div className="history-list">
        {/* 初始状态 */}
        <div 
          className={`history-item ${currentIndex === -1 ? 'current' : ''}`}
          onClick={() => goToHistoryState(-1)}
        >
          <div className="history-item-icon">📄</div>
          <div className="history-item-content">
            <div className="history-item-name">初始状态</div>
          </div>
        </div>

        {/* 历史记录列表 */}
        {fullHistory.map((command, index) => {
          const isCurrent = index === currentIndex;
          const isPast = index <= currentIndex;
          
          return (
            <div
              key={index}
              className={`history-item ${isCurrent ? 'current' : ''} ${isPast ? 'past' : 'future'}`}
              onClick={() => goToHistoryState(index)}
            >
              <div className="history-item-icon">
                {isCurrent ? '▶️' : isPast ? '✅' : '⏺️'}
              </div>
              <div className="history-item-content">
                <div className="history-item-name">{getCommandName(command)}</div>
                {getCommandDetails(command) && (
                  <div className="history-item-details">{getCommandDetails(command)}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="history-footer">
        <div className="history-stats">
          共 {fullHistory.length} 个操作
        </div>
      </div>
    </div>
  );
};
