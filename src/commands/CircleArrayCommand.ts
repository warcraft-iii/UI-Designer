import { Command } from '../store/commandStore';
import { useProjectStore } from '../store/projectStore';
import { FrameData, CircleArrayData } from '../types';

/**
 * 创建环形数组命令
 * 基于一个控件沿圆周批量创建控件阵列
 */
export class CreateCircleArrayCommand implements Command {
  private sourceFrameId: string;
  private centerX: number;
  private centerY: number;
  private radius: number;
  private count: number;
  private initialAngle: number;
  private arrayId: string;
  private createdFrameIds: string[] = [];
  private circleArrayData: CircleArrayData | null = null;

  constructor(
    sourceFrameId: string,
    centerX: number,
    centerY: number,
    radius: number,
    count: number,
    initialAngle: number
  ) {
    this.sourceFrameId = sourceFrameId;
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.count = count;
    this.initialAngle = initialAngle;
    this.arrayId = `circle-array-${Date.now()}`;
  }

  execute(): void {
    const store = useProjectStore.getState();
    const sourceFrame = store.getFrame(this.sourceFrameId);
    if (!sourceFrame) return;

    const baseName = sourceFrame.name.replace(/\[.*\]$/, '');
    const angleStep = (Math.PI * 2) / this.count;

    // 修改原控件为第一个元素
    const firstName = `${baseName}[0]`;
    const firstX = this.centerX + this.radius * Math.cos(this.initialAngle);
    const firstY = this.centerY + this.radius * Math.sin(this.initialAngle);
    
    store.updateFrame(this.sourceFrameId, {
      name: firstName,
      x: firstX,
      y: firstY,
      arrayId: this.arrayId,
    });
    this.createdFrameIds.push(this.sourceFrameId);

    // 创建其余控件
    for (let i = 1; i < this.count; i++) {
      const angle = this.initialAngle + angleStep * i;
      const newX = this.centerX + this.radius * Math.cos(angle);
      const newY = this.centerY + this.radius * Math.sin(angle);

      const newFrame: FrameData = {
        ...sourceFrame,
        id: `frame-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${baseName}[${i}]`,
        x: newX,
        y: newY,
        children: [],
        arrayId: this.arrayId,
      };

      store.addFrame(newFrame);
      this.createdFrameIds.push(newFrame.id);
    }

    // 创建 CircleArray 数据
    this.circleArrayData = {
      id: this.arrayId,
      name: baseName,
      radius: this.radius,
      count: this.count,
      initialAngle: this.initialAngle,
      elements: this.createdFrameIds,
    };

    store.addCircleArray(this.circleArrayData);

    console.log(`创建环形数组: ${baseName} (${this.count} 个控件, 半径 ${this.radius})`);
  }

  undo(): void {
    const store = useProjectStore.getState();

    // 删除所有创建的控件 (除了第一个源控件)
    for (let i = 1; i < this.createdFrameIds.length; i++) {
      store.removeFrame(this.createdFrameIds[i]);
    }

    // 恢复第一个控件的名称和位置
    if (this.createdFrameIds.length > 0 && this.circleArrayData) {
      const sourceFrame = store.getFrame(this.createdFrameIds[0]);
      if (sourceFrame) {
        const originalName = this.circleArrayData.name;
        store.updateFrame(this.createdFrameIds[0], {
          name: originalName,
          arrayId: undefined,
        });
      }
    }

    // 删除 CircleArray 数据
    if (this.circleArrayData) {
      store.removeCircleArray(this.arrayId);
    }

    console.log(`撤销环形数组: 已删除 ${this.createdFrameIds.length - 1} 个控件`);
  }

  redo(): void {
    this.execute();
  }
}
