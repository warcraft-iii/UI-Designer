import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { FrameType } from '../types';
import './ProjectTree.css';

export const ProjectTree: React.FC = () => {
  const { project, selectedFrameId, selectFrame, deleteFrame, updateFrame } = useProjectStore();
  
  // 管理展开/折叠状态
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(project.rootFrameIds));
  
  // 管理重命名状态
  const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  
  // 管理右键菜单
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; frameId: string } | null>(null);

  // 管理面板宽度调整
  const [width, setWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // 切换展开/折叠
  const toggleExpand = (frameId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(frameId)) {
        newSet.delete(frameId);
      } else {
        newSet.add(frameId);
      }
      return newSet;
    });
  };

  // 获取控件类型图标
  const getFrameIcon = (type: FrameType): string => {
    switch (type) {
      case FrameType.BACKDROP: return '🖼️';
      case FrameType.BUTTON: return '🔘';
      case FrameType.BROWSER_BUTTON: return '🔲';
      case FrameType.SCRIPT_DIALOG_BUTTON: return '📝';
      case FrameType.TEXT_FRAME: return '📄';
      case FrameType.CHECKBOX: return '☑️';
      case FrameType.HORIZONTAL_BAR: return '📊';
      case FrameType.TEXTAREA: return '📃';
      case FrameType.EDITBOX: return '✏️';
      case FrameType.SLIDER: return '🎚️';
      default: return '📦';
    }
  };

  // 右键菜单处理
  const handleContextMenu = (e: React.MouseEvent, frameId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, frameId });
  };

  // 开始重命名
  const startRename = (frameId: string) => {
    const frame = project.frames[frameId];
    if (frame) {
      setRenamingNodeId(frameId);
      setNewName(frame.name);
      setContextMenu(null);
    }
  };

  // 完成重命名
  const finishRename = () => {
    if (renamingNodeId && newName.trim()) {
      updateFrame(renamingNodeId, { name: newName.trim() });
    }
    setRenamingNodeId(null);
    setNewName('');
  };

  // 删除节点
  const handleDelete = (frameId: string) => {
    const frame = project.frames[frameId];
    if (!frame) return;
    
    const hasChildren = frame.children.length > 0;
    const confirmMsg = hasChildren 
      ? `确定要删除 "${frame.name}" 及其 ${frame.children.length} 个子控件吗？`
      : `确定要删除 "${frame.name}" 吗？`;
      
    if (confirm(confirmMsg)) {
      deleteFrame(frameId);
      setContextMenu(null);
    }
  };

  // 点击空白处关闭右键菜单
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // 键盘快捷键
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedFrameId) return;
      
      // F2 - 重命名
      if (e.key === 'F2') {
        e.preventDefault();
        startRename(selectedFrameId);
      }
      
      // Delete - 删除
      if (e.key === 'Delete') {
        e.preventDefault();
        handleDelete(selectedFrameId);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedFrameId]);

  // 处理宽度调整
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  React.useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 400) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const renderTreeNode = (frameId: string, level: number = 0): React.ReactElement => {
    const frame = project.frames[frameId];
    if (!frame) return <></>;

    const isSelected = frameId === selectedFrameId;
    const hasChildren = frame.children.length > 0;
    const isExpanded = expandedNodes.has(frameId);
    const isRenaming = renamingNodeId === frameId;

    return (
      <div key={frameId} className="tree-node">
        <div
          className={`tree-node-item ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${level * 20 + 10}px` }}
          onClick={() => selectFrame(frameId)}
          onDoubleClick={() => startRename(frameId)}
          onContextMenu={(e) => handleContextMenu(e, frameId)}
        >
          {hasChildren ? (
            <span 
              className={`tree-node-toggle ${isExpanded ? 'expanded' : ''}`}
              onClick={(e) => toggleExpand(frameId, e)}
            >
              ▶
            </span>
          ) : (
            <span className="tree-node-spacer"></span>
          )}
          
          <span className="tree-node-icon">{getFrameIcon(frame.type)}</span>
          
          {isRenaming ? (
            <input
              className="tree-node-rename-input"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={finishRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') finishRename();
                if (e.key === 'Escape') {
                  setRenamingNodeId(null);
                  setNewName('');
                }
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="tree-node-name">{frame.name}</span>
          )}
          
          {hasChildren && (
            <span className="tree-node-count">({frame.children.length})</span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="tree-node-children">
            {frame.children.map(childId => renderTreeNode(childId, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="project-tree" 
      ref={panelRef}
      style={{ width: `${width}px` }}
    >
      {/* 调整宽度的拖拽条 */}
      <div 
        className={`project-tree-resizer ${isResizing ? 'resizing' : ''}`}
        onMouseDown={handleMouseDown}
      />
      
      <div className="tree-header">
        <h3>项目树</h3>
        <button 
          className="tree-header-btn"
          onClick={() => {
            // TODO: 添加新控件
            console.log('Add frame');
          }}
          title="添加控件"
        >
          ➕
        </button>
      </div>
      
      <div className="tree-content">
        {project.rootFrameIds.length === 0 ? (
          <div className="tree-empty-state">
            <p>🎨 项目中还没有控件</p>
            <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
              点击画布或工具栏添加新控件
            </p>
          </div>
        ) : (
          <div className="tree-node">
            <div 
              className="tree-node-item root"
              onClick={() => selectFrame('')}
            >
              <span className="tree-node-icon">🏠</span>
              <span className="tree-node-name">
                {project.originMode === 'gameui' ? 'GameUI' : 
                 project.originMode === 'worldframe' ? 'WorldFrame' : 'ConsoleUI'}
              </span>
              <span className="tree-node-count">({project.rootFrameIds.length})</span>
            </div>
            
            <div className="tree-node-children">
              {project.rootFrameIds.map(frameId => renderTreeNode(frameId, 1))}
            </div>
          </div>
        )}
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <>
          <div 
            className="context-menu-overlay"
            onClick={() => setContextMenu(null)}
          />
          <div 
            className="context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div 
              className="context-menu-item"
              onClick={() => startRename(contextMenu.frameId)}
            >
              ✏️ 重命名
            </div>
            <div 
              className="context-menu-item"
              onClick={() => {
                // TODO: 添加子控件
                console.log('Add child to', contextMenu.frameId);
                setContextMenu(null);
              }}
            >
              ➕ 添加子控件
            </div>
            <div className="context-menu-divider" />
            <div 
              className="context-menu-item danger"
              onClick={() => handleDelete(contextMenu.frameId)}
            >
              🗑️ 删除
            </div>
          </div>
        </>
      )}
    </div>
  );
};
