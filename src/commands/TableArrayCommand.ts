import { Command } from '../store/commandStore';
import { useProjectStore } from '../store/projectStore';
import { FrameData, TableArrayData } from '../types';

/**
 * 创建表格数组命令
 * 基于一个控件批量创建表格布局的控件阵列
 */
export class CreateTableArrayCommand implements Command {
  private sourceFrameId: string;
  private rows: number;
  private cols: number;
  private xGap: number;
  private yGap: number;
  private arrayId: string;
  private createdFrameIds: string[] = [];
  private tableArrayData: TableArrayData | null = null;

  constructor(
    sourceFrameId: string,
    rows: number,
    cols: number,
    xGap: number,
    yGap: number
  ) {
    this.sourceFrameId = sourceFrameId;
    this.rows = rows;
    this.cols = cols;
    this.xGap = xGap;
    this.yGap = yGap;
    this.arrayId = `table-array-${Date.now()}`;
  }

  execute(): void {
    const store = useProjectStore.getState();
    const sourceFrame = store.getFrame(this.sourceFrameId);
    if (!sourceFrame) return;

    const baseName = sourceFrame.name.replace(/\[.*\]$/, '');
    const startX = sourceFrame.x;
    const startY = sourceFrame.y;
    const frameWidth = sourceFrame.width;
    const frameHeight = sourceFrame.height;

    // 创建第一个控件 (修改原控件)
    const firstName = `${baseName}[0]`;
    store.updateFrame(this.sourceFrameId, {
      name: firstName,
      arrayId: this.arrayId,
    });
    this.createdFrameIds.push(this.sourceFrameId);

    // 创建其余控件
    let index = 1;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (row === 0 && col === 0) continue; // 跳过第一个 (已经存在)

        const newX = startX + col * (frameWidth + this.xGap);
        const newY = startY - row * (frameHeight + this.yGap); // WC3 Y轴向上

        const newFrame: FrameData = {
          ...sourceFrame,
          id: `frame-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          name: `${baseName}[${index}]`,
          x: newX,
          y: newY,
          children: [],
          arrayId: this.arrayId,
        };

        store.addFrame(newFrame);
        this.createdFrameIds.push(newFrame.id);
        index++;
      }
    }

    // 创建 TableArray 数据
    this.tableArrayData = {
      id: this.arrayId,
      name: baseName,
      rows: this.rows,
      cols: this.cols,
      xGap: this.xGap,
      yGap: this.yGap,
      elements: this.createdFrameIds,
    };

    store.addTableArray(this.tableArrayData);

    console.log(`创建表格数组: ${baseName} (${this.rows}×${this.cols} = ${this.createdFrameIds.length} 个控件)`);
  }

  undo(): void {
    const store = useProjectStore.getState();

    // 删除所有创建的控件 (除了第一个源控件)
    for (let i = 1; i < this.createdFrameIds.length; i++) {
      store.removeFrame(this.createdFrameIds[i]);
    }

    // 恢复第一个控件的名称
    if (this.createdFrameIds.length > 0) {
      const sourceFrame = store.getFrame(this.createdFrameIds[0]);
      if (sourceFrame && this.tableArrayData) {
        const originalName = this.tableArrayData.name;
        store.updateFrame(this.createdFrameIds[0], {
          name: originalName,
          arrayId: undefined,
        });
      }
    }

    // 删除 TableArray 数据
    if (this.tableArrayData) {
      store.removeTableArray(this.arrayId);
    }

    console.log(`撤销表格数组: 已删除 ${this.createdFrameIds.length - 1} 个控件`);
  }

  redo(): void {
    this.execute();
  }
}
