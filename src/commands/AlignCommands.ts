import { Command } from '../store/commandStore';
import { useProjectStore } from '../store/projectStore';
import { FrameData } from '../types';

type AlignType = 'left' | 'right' | 'top' | 'bottom' | 'centerH' | 'centerV';
type DistributeType = 'horizontal' | 'vertical';

// 对齐命令
export class AlignCommand implements Command {
  private frameIds: string[];
  private alignType: AlignType;
  private oldPositions: Map<string, { x: number; y: number }> = new Map();

  constructor(frameIds: string[], alignType: AlignType) {
    this.frameIds = frameIds;
    this.alignType = alignType;
  }

  execute(): void {
    const store = useProjectStore.getState();
    const frames = this.frameIds.map(id => store.getFrame(id)).filter(Boolean) as FrameData[];
    
    if (frames.length < 2) {
      console.warn('[AlignCommand] Need at least 2 frames to align');
      return;
    }

    // 保存原始位置
    frames.forEach(frame => {
      this.oldPositions.set(frame.id, { x: frame.x, y: frame.y });
    });

    // 计算对齐目标位置（使用第一个控件作为参考）
    const referenceFrame = frames[0];
    
    switch (this.alignType) {
      case 'left':
        // 左对齐：所有控件的 x 坐标对齐到参考控件
        frames.forEach(frame => {
          if (frame.id !== referenceFrame.id) {
            store.updateFrame(frame.id, { x: referenceFrame.x });
          }
        });
        break;

      case 'right':
        // 右对齐：所有控件的右边缘对齐
        const referenceRight = referenceFrame.x + referenceFrame.width;
        frames.forEach(frame => {
          if (frame.id !== referenceFrame.id) {
            store.updateFrame(frame.id, { x: referenceRight - frame.width });
          }
        });
        break;

      case 'top':
        // 顶部对齐：所有控件的顶边对齐（顶边 = y + height）
        const referenceTop = referenceFrame.y + referenceFrame.height;
        frames.forEach(frame => {
          if (frame.id !== referenceFrame.id) {
            // 新的 y = 参考顶边 - 自己的高度
            store.updateFrame(frame.id, { y: referenceTop - frame.height });
          }
        });
        break;

      case 'bottom':
        // 底部对齐：所有控件的底边对齐（底边 = y）
        frames.forEach(frame => {
          if (frame.id !== referenceFrame.id) {
            store.updateFrame(frame.id, { y: referenceFrame.y });
          }
        });
        break;

      case 'centerH':
        // 水平居中：所有控件的水平中心对齐
        const referenceCenterX = referenceFrame.x + referenceFrame.width / 2;
        frames.forEach(frame => {
          if (frame.id !== referenceFrame.id) {
            store.updateFrame(frame.id, { x: referenceCenterX - frame.width / 2 });
          }
        });
        break;

      case 'centerV':
        // 垂直居中：所有控件的垂直中心对齐（中心 = y + height/2）
        const referenceCenterY = referenceFrame.y + referenceFrame.height / 2;
        frames.forEach(frame => {
          if (frame.id !== referenceFrame.id) {
            // 新的 y = 参考中心 - 自己高度的一半
            store.updateFrame(frame.id, { y: referenceCenterY - frame.height / 2 });
          }
        });
        break;
    }

    console.log(`[AlignCommand] Aligned ${frames.length} frames to ${this.alignType}`);
  }

  undo(): void {
    const store = useProjectStore.getState();
    this.oldPositions.forEach((pos, frameId) => {
      store.updateFrame(frameId, { x: pos.x, y: pos.y });
    });
  }

  redo(): void {
    this.execute();
  }
}

// 分布命令
export class DistributeCommand implements Command {
  private frameIds: string[];
  private distributeType: DistributeType;
  private oldPositions: Map<string, { x: number; y: number }> = new Map();

  constructor(frameIds: string[], distributeType: DistributeType) {
    this.frameIds = frameIds;
    this.distributeType = distributeType;
  }

  execute(): void {
    const store = useProjectStore.getState();
    const frames = this.frameIds.map(id => store.getFrame(id)).filter(Boolean) as FrameData[];
    
    if (frames.length < 3) {
      console.warn('[DistributeCommand] Need at least 3 frames to distribute');
      return;
    }

    // 保存原始位置
    frames.forEach(frame => {
      this.oldPositions.set(frame.id, { x: frame.x, y: frame.y });
    });

    if (this.distributeType === 'horizontal') {
      // 水平分布：按 x 坐标排序
      const sortedFrames = [...frames].sort((a, b) => a.x - b.x);
      const leftmost = sortedFrames[0];
      const rightmost = sortedFrames[sortedFrames.length - 1];
      
      // 计算总间距
      const totalSpace = (rightmost.x + rightmost.width) - leftmost.x;
      const totalFrameWidth = sortedFrames.reduce((sum, f) => sum + f.width, 0);
      const gap = (totalSpace - totalFrameWidth) / (sortedFrames.length - 1);
      
      // 分布控件
      let currentX = leftmost.x;
      sortedFrames.forEach((frame, index) => {
        if (index === 0 || index === sortedFrames.length - 1) {
          // 保持首尾控件不动
          currentX = frame.x + frame.width + gap;
          return;
        }
        store.updateFrame(frame.id, { x: currentX });
        currentX += frame.width + gap;
      });
    } else {
      // 垂直分布：按 y 坐标排序（WC3 坐标系 y 是底边，向上递增）
      const sortedFrames = [...frames].sort((a, b) => a.y - b.y);
      const bottommost = sortedFrames[0];
      const topmost = sortedFrames[sortedFrames.length - 1];
      
      // 计算总间距（从最底部的底边到最顶部的顶边）
      const totalSpace = (topmost.y + topmost.height) - bottommost.y;
      const totalFrameHeight = sortedFrames.reduce((sum, f) => sum + f.height, 0);
      const gap = (totalSpace - totalFrameHeight) / (sortedFrames.length - 1);
      
      // 分布控件（从下往上）
      let currentY = bottommost.y;
      sortedFrames.forEach((frame, index) => {
        if (index === 0 || index === sortedFrames.length - 1) {
          // 保持首尾控件不动
          currentY += frame.height + gap;
          return;
        }
        store.updateFrame(frame.id, { y: currentY });
        currentY += frame.height + gap;
      });
    }

    console.log(`[DistributeCommand] Distributed ${frames.length} frames ${this.distributeType}ly`);
  }

  undo(): void {
    const store = useProjectStore.getState();
    this.oldPositions.forEach((pos, frameId) => {
      store.updateFrame(frameId, { x: pos.x, y: pos.y });
    });
  }

  redo(): void {
    this.execute();
  }
}
