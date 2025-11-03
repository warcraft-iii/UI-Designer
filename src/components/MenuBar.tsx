import React, { useState, useRef, useEffect } from 'react';
import './MenuBar.css';
import { AboutDialog } from './AboutDialog';

interface MenuBarProps {
  currentFilePath: string | null;
  setCurrentFilePath: (path: string | null) => void;
  onNewFile?: () => void;
  onSave?: () => void;
  onSaveAs?: () => void;
}

interface MenuItem {
  label?: string;
  shortcut?: string;
  action?: () => void;
  separator?: boolean;
  disabled?: boolean;
  submenu?: MenuItem[];
}

export const MenuBar: React.FC<MenuBarProps> = ({
  currentFilePath,
  setCurrentFilePath,
  onNewFile,
  onSave,
  onSaveAs
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // 加载最近打开的文件
  useEffect(() => {
    const loadRecentFiles = async () => {
      try {
        const stored = localStorage.getItem('recentFiles');
        if (stored) {
          setRecentFiles(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load recent files:', error);
      }
    };
    loadRecentFiles();
  }, []);

  // 添加到最近文件列表
  const addToRecentFiles = (filePath: string) => {
    const updatedRecent = [
      filePath,
      ...recentFiles.filter(f => f !== filePath)
    ].slice(0, 10); // 保留最近10个
    setRecentFiles(updatedRecent);
    localStorage.setItem('recentFiles', JSON.stringify(updatedRecent));
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenu]);

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (action?: () => void) => {
    if (action) {
      action();
    }
    setActiveMenu(null);
  };

  const handleOpenRecent = (filePath: string) => {
    setCurrentFilePath(filePath);
    addToRecentFiles(filePath);
    setActiveMenu(null);
  };

  const handleClearRecent = () => {
    setRecentFiles([]);
    localStorage.removeItem('recentFiles');
    setActiveMenu(null);
  };

  // 菜单定义
  const menus: Record<string, MenuItem[]> = {
    file: [
      {
        label: '新建',
        shortcut: 'Ctrl+N',
        action: () => {
          onNewFile?.();
          setCurrentFilePath(null);
        }
      },
      {
        label: '打开',
        shortcut: 'Ctrl+O',
        action: () => {
          // TODO: 实现文件打开对话框
          console.log('Open file dialog');
        }
      },
      {
        label: '最近打开',
        submenu: recentFiles.length > 0 ? [
          ...recentFiles.map(filePath => ({
            label: filePath.split(/[\\/]/).pop() || filePath,
            action: () => handleOpenRecent(filePath)
          })),
          { separator: true },
          {
            label: '清空列表',
            action: handleClearRecent
          }
        ] : [
          { label: '无最近文件', disabled: true }
        ]
      },
      { separator: true },
      {
        label: '保存',
        shortcut: 'Ctrl+S',
        action: onSave,
        disabled: !currentFilePath
      },
      {
        label: '另存为',
        shortcut: 'Ctrl+Shift+S',
        action: onSaveAs
      },
      { separator: true },
      {
        label: '导出',
        submenu: [
          { label: '导出为 FDF', action: () => console.log('Export FDF') },
          { label: '导出为 PNG', action: () => console.log('Export PNG') },
          { label: '导出为 JSON', action: () => console.log('Export JSON') }
        ]
      },
      { separator: true },
      {
        label: '退出',
        shortcut: 'Alt+F4',
        action: () => window.close()
      }
    ],
    edit: [
      {
        label: '撤销',
        shortcut: 'Ctrl+Z',
        action: () => console.log('Undo')
      },
      {
        label: '重做',
        shortcut: 'Ctrl+Y',
        action: () => console.log('Redo')
      },
      { separator: true },
      {
        label: '剪切',
        shortcut: 'Ctrl+X',
        action: () => console.log('Cut')
      },
      {
        label: '复制',
        shortcut: 'Ctrl+C',
        action: () => console.log('Copy')
      },
      {
        label: '粘贴',
        shortcut: 'Ctrl+V',
        action: () => console.log('Paste')
      },
      {
        label: '删除',
        shortcut: 'Delete',
        action: () => console.log('Delete')
      },
      { separator: true },
      {
        label: '全选',
        shortcut: 'Ctrl+A',
        action: () => console.log('Select All')
      }
    ],
    view: [
      {
        label: '缩放',
        submenu: [
          { label: '放大', shortcut: 'Ctrl++', action: () => console.log('Zoom in') },
          { label: '缩小', shortcut: 'Ctrl+-', action: () => console.log('Zoom out') },
          { label: '重置缩放', shortcut: 'Ctrl+0', action: () => console.log('Reset zoom') },
          { separator: true },
          { label: '适应窗口', shortcut: 'Ctrl+9', action: () => console.log('Fit window') }
        ]
      },
      { separator: true },
      {
        label: '显示网格',
        action: () => console.log('Toggle grid')
      },
      {
        label: '显示标尺',
        action: () => console.log('Toggle ruler')
      },
      {
        label: '显示参考线',
        action: () => console.log('Toggle guides')
      },
      { separator: true },
      {
        label: '项目树',
        shortcut: 'Ctrl+1',
        action: () => console.log('Toggle project tree')
      },
      {
        label: '属性面板',
        shortcut: 'Ctrl+2',
        action: () => console.log('Toggle properties')
      },
      {
        label: '模板面板',
        shortcut: 'Ctrl+3',
        action: () => console.log('Toggle templates')
      }
    ],
    tools: [
      {
        label: '选择工具',
        shortcut: 'V',
        action: () => console.log('Select tool')
      },
      {
        label: '手形工具',
        shortcut: 'H',
        action: () => console.log('Hand tool')
      },
      { separator: true },
      {
        label: '对齐',
        submenu: [
          { label: '左对齐', action: () => console.log('Align left') },
          { label: '居中对齐', action: () => console.log('Align center') },
          { label: '右对齐', action: () => console.log('Align right') },
          { separator: true },
          { label: '顶部对齐', action: () => console.log('Align top') },
          { label: '垂直居中', action: () => console.log('Align middle') },
          { label: '底部对齐', action: () => console.log('Align bottom') }
        ]
      },
      {
        label: '分布',
        submenu: [
          { label: '水平分布', action: () => console.log('Distribute horizontal') },
          { label: '垂直分布', action: () => console.log('Distribute vertical') }
        ]
      },
      { separator: true },
      {
        label: '首选项',
        shortcut: 'Ctrl+,',
        action: () => console.log('Preferences')
      }
    ],
    help: [
      {
        label: '文档',
        shortcut: 'F1',
        action: () => window.open('https://github.com/warcraft-iii/UI-Designer', '_blank')
      },
      {
        label: '快捷键',
        shortcut: 'Ctrl+/',
        action: () => console.log('Shortcuts')
      },
      { separator: true },
      {
        label: '检查更新',
        action: () => console.log('Check updates')
      },
      { separator: true },
      {
        label: '关于',
        action: () => setShowAbout(true)
      }
    ]
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.separator) {
      return <div key={index} className="menu-separator" />;
    }

    return (
      <div
        key={index}
        className={`menu-item ${item.disabled ? 'disabled' : ''} ${item.submenu ? 'has-submenu' : ''}`}
        onClick={() => !item.disabled && handleMenuItemClick(item.action)}
      >
        <span className="menu-item-label">{item.label}</span>
        {item.shortcut && <span className="menu-item-shortcut">{item.shortcut}</span>}
        {item.submenu && <span className="menu-item-arrow">▶</span>}
        {item.submenu && (
          <div className="submenu">
            {item.submenu.map((subItem, subIndex) => renderMenuItem(subItem, subIndex))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="menu-bar" ref={menuBarRef}>
        <div
          className={`menu-bar-item ${activeMenu === 'file' ? 'active' : ''}`}
          onClick={() => handleMenuClick('file')}
        >
          文件
          {activeMenu === 'file' && (
            <div className="menu-dropdown">
              {menus.file.map((item, index) => renderMenuItem(item, index))}
            </div>
          )}
        </div>

        <div
          className={`menu-bar-item ${activeMenu === 'edit' ? 'active' : ''}`}
          onClick={() => handleMenuClick('edit')}
        >
          编辑
          {activeMenu === 'edit' && (
            <div className="menu-dropdown">
              {menus.edit.map((item, index) => renderMenuItem(item, index))}
            </div>
          )}
        </div>

        <div
          className={`menu-bar-item ${activeMenu === 'view' ? 'active' : ''}`}
          onClick={() => handleMenuClick('view')}
        >
          视图
          {activeMenu === 'view' && (
            <div className="menu-dropdown">
              {menus.view.map((item, index) => renderMenuItem(item, index))}
            </div>
          )}
        </div>

        <div
          className={`menu-bar-item ${activeMenu === 'tools' ? 'active' : ''}`}
          onClick={() => handleMenuClick('tools')}
        >
          工具
          {activeMenu === 'tools' && (
            <div className="menu-dropdown">
              {menus.tools.map((item, index) => renderMenuItem(item, index))}
            </div>
          )}
        </div>

        <div
          className={`menu-bar-item ${activeMenu === 'help' ? 'active' : ''}`}
          onClick={() => handleMenuClick('help')}
        >
          帮助
          {activeMenu === 'help' && (
            <div className="menu-dropdown">
              {menus.help.map((item, index) => renderMenuItem(item, index))}
            </div>
          )}
        </div>

        {currentFilePath && (
          <div className="menu-bar-file-info">
            {currentFilePath.split(/[\\/]/).pop()}
          </div>
        )}
      </div>

      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
    </>
  );
};
