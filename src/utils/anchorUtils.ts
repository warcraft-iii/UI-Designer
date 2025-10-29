import { FrameAnchor, FramePoint } from '../types';

/**
 * 从 x, y, width, height 创建默认的双锚点（TOPLEFT 和 BOTTOMRIGHT）
 */
export function createDefaultAnchors(
  x: number,
  y: number,
  width: number,
  height: number
): FrameAnchor[] {
  // WC3坐标系：左下角为原点，Y轴向上
  // x, y 是左下角坐标
  const topLeftX = x;
  const topLeftY = y + height;
  const bottomRightX = x + width;
  const bottomRightY = y;

  return [
    {
      point: FramePoint.TOPLEFT,
      x: topLeftX,
      y: topLeftY,
    },
    {
      point: FramePoint.BOTTOMRIGHT,
      x: bottomRightX,
      y: bottomRightY,
    },
  ];
}

/**
 * 从锚点数组计算 x, y, width, height（用于编辑器显示）
 * 假设使用 TOPLEFT 和 BOTTOMRIGHT 锚点
 */
export function calculateBoundsFromAnchors(anchors: FrameAnchor[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const topLeft = anchors.find(a => a.point === FramePoint.TOPLEFT);
  const bottomRight = anchors.find(a => a.point === FramePoint.BOTTOMRIGHT);

  if (!topLeft || !bottomRight) {
    // 如果没有找到标准锚点，返回默认值
    return { x: 0, y: 0, width: 0.1, height: 0.1 };
  }

  // WC3坐标系：左下角为原点
  const x = topLeft.x;
  const y = bottomRight.y;
  const width = bottomRight.x - topLeft.x;
  const height = topLeft.y - bottomRight.y;

  return { x, y, width, height };
}

/**
 * 更新锚点以反映新的位置和大小
 */
export function updateAnchorsFromBounds(
  anchors: FrameAnchor[],
  x: number,
  y: number,
  width: number,
  height: number
): FrameAnchor[] {
  const newBounds = createDefaultAnchors(x, y, width, height);
  
  // 如果已有锚点，保留相对定位信息
  return anchors.map((anchor, index) => {
    const newAnchor = newBounds[index] || anchor;
    return {
      ...newAnchor,
      relativeTo: anchor.relativeTo,
      relativePoint: anchor.relativePoint,
    };
  });
}

/**
 * 从旧数据迁移：将 anchorPoint + x/y/width/height 转换为双锚点系统
 */
export function migrateFromLegacyAnchor(
  x: number,
  y: number,
  width: number,
  height: number,
  _anchorPoint?: number
): FrameAnchor[] {
  // 如果已经使用双锚点系统，直接返回
  // 否则使用默认的 TOPLEFT 和 BOTTOMRIGHT
  return createDefaultAnchors(x, y, width, height);
}
