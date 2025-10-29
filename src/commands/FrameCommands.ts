import { Command } from '../store/commandStore';
import { useProjectStore } from '../store/projectStore';
import { FrameData } from '../types';

// 创建Frame命令
export class CreateFrameCommand implements Command {
  private frame: FrameData;
  private previousSelection: string | null;

  constructor(frame: FrameData) {
    this.frame = frame;
    this.previousSelection = useProjectStore.getState().selectedFrameId;
  }

  execute(): void {
    const store = useProjectStore.getState();
    store.addFrame(this.frame);
    store.selectFrame(this.frame.id);
  }

  undo(): void {
    const store = useProjectStore.getState();
    store.removeFrame(this.frame.id);
    store.selectFrame(this.previousSelection);
  }

  redo(): void {
    this.execute();
  }
}

// 删除Frame命令
export class RemoveFrameCommand implements Command {
  private frameId: string;
  private frameData: FrameData | null = null;
  private previousSelection: string | null;

  constructor(frameId: string) {
    this.frameId = frameId;
    this.previousSelection = useProjectStore.getState().selectedFrameId;
  }

  execute(): void {
    const store = useProjectStore.getState();
    this.frameData = store.getFrame(this.frameId) || null;
    store.removeFrame(this.frameId);
  }

  undo(): void {
    if (this.frameData) {
      const store = useProjectStore.getState();
      store.addFrame(this.frameData);
      store.selectFrame(this.previousSelection);
    }
  }

  redo(): void {
    this.execute();
  }
}

// 更新Frame属性命令
export class UpdateFrameCommand implements Command {
  private frameId: string;
  private updates: Partial<FrameData>;
  private previousState: Partial<FrameData> = {};

  constructor(frameId: string, updates: Partial<FrameData>) {
    this.frameId = frameId;
    this.updates = updates;
  }

  execute(): void {
    const store = useProjectStore.getState();
    const frame = store.getFrame(this.frameId);
    
    if (frame) {
      // 保存之前的状态
      Object.keys(this.updates).forEach(key => {
        const k = key as keyof FrameData;
        (this.previousState as any)[k] = frame[k];
      });
      
      store.updateFrame(this.frameId, this.updates);
    }
  }

  undo(): void {
    const store = useProjectStore.getState();
    store.updateFrame(this.frameId, this.previousState);
  }

  redo(): void {
    const store = useProjectStore.getState();
    store.updateFrame(this.frameId, this.updates);
  }
}

// 移动Frame命令
export class MoveFrameCommand implements Command {
  private frameId: string;
  private newX: number;
  private newY: number;
  private oldX: number = 0;
  private oldY: number = 0;

  constructor(frameId: string, x: number, y: number) {
    this.frameId = frameId;
    this.newX = x;
    this.newY = y;
  }

  execute(): void {
    const store = useProjectStore.getState();
    const frame = store.getFrame(this.frameId);
    
    if (frame) {
      this.oldX = frame.x;
      this.oldY = frame.y;
      store.updateFrame(this.frameId, { x: this.newX, y: this.newY });
    }
  }

  undo(): void {
    const store = useProjectStore.getState();
    store.updateFrame(this.frameId, { x: this.oldX, y: this.oldY });
  }

  redo(): void {
    this.execute();
  }
}

// 修改父级命令
export class ChangeParentCommand implements Command {
  private frameId: string;
  private newParentId: string | null;
  private oldParentId: string | null = null;

  constructor(frameId: string, newParentId: string | null) {
    this.frameId = frameId;
    this.newParentId = newParentId;
  }

  execute(): void {
    const store = useProjectStore.getState();
    const frame = store.getFrame(this.frameId);
    
    if (frame) {
      this.oldParentId = frame.parentId;
      
      // 从旧父级移除
      if (this.oldParentId) {
        const oldParent = store.getFrame(this.oldParentId);
        if (oldParent) {
          store.updateFrame(this.oldParentId, {
            children: oldParent.children.filter(id => id !== this.frameId)
          });
        }
      }
      
      // 添加到新父级
      if (this.newParentId) {
        const newParent = store.getFrame(this.newParentId);
        if (newParent) {
          store.updateFrame(this.newParentId, {
            children: [...newParent.children, this.frameId]
          });
        }
      }
      
      store.updateFrame(this.frameId, { parentId: this.newParentId });
    }
  }

  undo(): void {
    const store = useProjectStore.getState();
    const frame = store.getFrame(this.frameId);
    
    if (frame) {
      // 从当前父级移除
      if (this.newParentId) {
        const currentParent = store.getFrame(this.newParentId);
        if (currentParent) {
          store.updateFrame(this.newParentId, {
            children: currentParent.children.filter(id => id !== this.frameId)
          });
        }
      }
      
      // 恢复到旧父级
      if (this.oldParentId) {
        const oldParent = store.getFrame(this.oldParentId);
        if (oldParent) {
          store.updateFrame(this.oldParentId, {
            children: [...oldParent.children, this.frameId]
          });
        }
      }
      
      store.updateFrame(this.frameId, { parentId: this.oldParentId });
    }
  }

  redo(): void {
    this.execute();
  }
}
