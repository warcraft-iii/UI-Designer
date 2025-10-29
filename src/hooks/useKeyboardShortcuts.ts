import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useCommandStore } from '../store/commandStore';
import { RemoveFrameCommand } from '../commands/FrameCommands';
import { DuplicateFrameCommand } from '../commands/DuplicateFrameCommand';
import { saveProject } from '../utils/fileOperations';

export const useKeyboardShortcuts = (currentFilePath: string | null) => {
  const { selectedFrameId, project } = useProjectStore();
  const { undo, redo, canUndo, canRedo, executeCommand } = useCommandStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentFilePath) {
          saveProject(project, currentFilePath).catch(err => {
            console.error('保存失败:', err);
          });
        }
      }

      // Ctrl/Cmd + Z: 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      }

      // Ctrl/Cmd + Y 或 Ctrl/Cmd + Shift + Z: 重做
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }

      // Delete: 删除选中的 Frame
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedFrameId && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          const command = new RemoveFrameCommand(selectedFrameId);
          executeCommand(command);
        }
      }

      // Escape: 取消选择
      if (e.key === 'Escape') {
        const { selectFrame } = useProjectStore.getState();
        selectFrame(null);
      }

      // Ctrl/Cmd + D: 快速复制
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedFrameId) {
          const command = new DuplicateFrameCommand(selectedFrameId);
          executeCommand(command);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedFrameId, currentFilePath, project, undo, redo, canUndo, canRedo, executeCommand]);
};
