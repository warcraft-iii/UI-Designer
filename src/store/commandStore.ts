import { create } from 'zustand';

// 命令接口
export interface Command {
  execute: () => void;
  undo: () => void;
  redo: () => void;
}

interface CommandState {
  undoStack: Command[];
  redoStack: Command[];
  
  executeCommand: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

export const useCommandStore = create<CommandState>((set, get) => ({
  undoStack: [],
  redoStack: [],

  executeCommand: (command) => {
    command.execute();
    set((state) => ({
      undoStack: [...state.undoStack, command],
      redoStack: [], // 清空重做栈
    }));
  },

  undo: () => {
    const { undoStack, redoStack } = get();
    if (undoStack.length === 0) return;

    const command = undoStack[undoStack.length - 1];
    command.undo();

    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, command],
    });
  },

  redo: () => {
    const { undoStack, redoStack } = get();
    if (redoStack.length === 0) return;

    const command = redoStack[redoStack.length - 1];
    command.redo();

    set({
      undoStack: [...undoStack, command],
      redoStack: redoStack.slice(0, -1),
    });
  },

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,

  clearHistory: () => set({ undoStack: [], redoStack: [] }),
}));
