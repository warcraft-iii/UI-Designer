import { FrameData, FrameType } from '../types';
import { createDefaultAnchors } from '../utils/anchorUtils';

/**
 * 预设模板定义
 */
export interface FrameTemplate {
  id: string;
  name: string;
  icon: string;
  category: 'basic' | 'button' | 'text' | 'backdrop' | 'input' | 'bar';
  description: string;
  createFrame: () => Partial<FrameData>;
}

/**
 * 所有预设模板
 */
export const templates: FrameTemplate[] = [
  // ========== 基础控件 ==========
  {
    id: 'basic-backdrop',
    name: 'Backdrop',
    icon: '▭',
    category: 'basic',
    description: '基础背景框架',
    createFrame: () => ({
      name: 'Backdrop',
      type: FrameType.BACKDROP,
      x: 0.1,
      y: 0.1,
      width: 0.1,
      height: 0.1,
      anchors: createDefaultAnchors(0.1, 0.1, 0.1, 0.1),
      diskTexture: '',
      wc3Texture: '',
      children: [],
    }),
  },
  {
    id: 'basic-button',
    name: 'Button',
    icon: '🔘',
    category: 'basic',
    description: '基础按钮',
    createFrame: () => ({
      name: 'Button',
      type: FrameType.BUTTON,
      x: 0.1,
      y: 0.1,
      width: 0.1,
      height: 0.1,
      anchors: createDefaultAnchors(0.1, 0.1, 0.1, 0.1),
      diskTexture: '',
      wc3Texture: '',
      children: [],
    }),
  },
  {
    id: 'basic-text',
    name: 'Text',
    icon: 'T',
    category: 'basic',
    description: '基础文本框',
    createFrame: () => ({
      name: 'Text',
      type: FrameType.TEXT_FRAME,
      x: 0.1,
      y: 0.1,
      width: 0.1,
      height: 0.1,
      anchors: createDefaultAnchors(0.1, 0.1, 0.1, 0.1),
      text: 'Text',
      textScale: 1,
      textColor: '#FFFFFF',
      horAlign: 'left',
      verAlign: 'start',
      diskTexture: '',
      wc3Texture: '',
      children: [],
    }),
  },
  {
    id: 'basic-checkbox',
    name: 'Checkbox',
    icon: '☑',
    category: 'basic',
    description: '基础复选框',
    createFrame: () => ({
      name: 'Checkbox',
      type: FrameType.CHECKBOX,
      x: 0.1,
      y: 0.1,
      width: 0.1,
      height: 0.1,
      anchors: createDefaultAnchors(0.1, 0.1, 0.1, 0.1),
      diskTexture: '',
      wc3Texture: '',
      children: [],
    }),
  },

  // ========== 按钮类 ==========
  {
    id: 'icon-button',
    name: '图标按钮',
    icon: '🔘',
    category: 'button',
    description: '带图标的可点击按钮',
    createFrame: () => ({
      name: '图标按钮',
      type: FrameType.BUTTON,
      x: 0.35,
      y: 0.25,
      width: 0.04,
      height: 0.04,
      anchors: createDefaultAnchors(0.35, 0.25, 0.04, 0.04),
      text: '',
      wc3Texture: 'ReplaceableTextures\\CommandButtons\\BTNSelectHeroOn.blp',
      diskTexture: '',
      children: [],
    }),
  },
  {
    id: 'script-dialog-button',
    name: '对话框按钮',
    icon: '📝',
    category: 'button',
    description: '带文本的对话框按钮',
    createFrame: () => ({
      name: '对话框按钮',
      type: FrameType.SCRIPT_DIALOG_BUTTON,
      x: 0.3,
      y: 0.25,
      width: 0.15,
      height: 0.04,
      anchors: createDefaultAnchors(0.3, 0.25, 0.15, 0.04),
      text: '按钮',
      textScale: 1.0,
      diskTexture: '',
      wc3Texture: '',
      children: [],
    }),
  },
  {
    id: 'browser-button',
    name: '浏览器按钮',
    icon: '🔲',
    category: 'button',
    description: '蓝色风格的浏览器按钮',
    createFrame: () => ({
      name: '浏览器按钮',
      type: FrameType.BROWSER_BUTTON,
      x: 0.3,
      y: 0.25,
      width: 0.15,
      height: 0.04,
      anchors: createDefaultAnchors(0.3, 0.25, 0.15, 0.04),
      text: '浏览',
      textScale: 1.0,
      diskTexture: '',
      wc3Texture: '',
      children: [],
    }),
  },

  // ========== 文本类 ==========
  {
    id: 'text-frame',
    name: '文本框',
    icon: '📄',
    category: 'text',
    description: '显示文本的框架',
    createFrame: () => ({
      name: '文本',
      type: FrameType.TEXT_FRAME,
      x: 0.25,
      y: 0.25,
      width: 0.2,
      height: 0.05,
      anchors: createDefaultAnchors(0.25, 0.25, 0.2, 0.05),
      text: '文本内容',
      textScale: 1.0,
      textColor: 'rgba(255, 255, 255, 1)',
      diskTexture: '',
      wc3Texture: '',
      children: [],
    }),
  },
  {
    id: 'title-text',
    name: '标题文本',
    icon: '📌',
    category: 'text',
    description: '大号标题文本',
    createFrame: () => ({
      name: '标题',
      type: FrameType.TEXT_FRAME,
      x: 0.25,
      y: 0.4,
      width: 0.3,
      height: 0.06,
      anchors: createDefaultAnchors(0.25, 0.4, 0.3, 0.06),
      text: '标题文本',
      textScale: 1.5,
      textColor: 'rgba(255, 220, 100, 1)',
      diskTexture: '',
      wc3Texture: '',
      children: [],
    }),
  },

  // ========== 背景类 ==========
  {
    id: 'backdrop-panel',
    name: '面板背景',
    icon: '🖼️',
    category: 'backdrop',
    description: '半透明黑色背景面板',
    createFrame: () => ({
      name: '背景面板',
      type: FrameType.BACKDROP,
      x: 0.15,
      y: 0.15,
      width: 0.4,
      height: 0.3,
      anchors: createDefaultAnchors(0.15, 0.15, 0.4, 0.3),
      wc3Texture: '',
      diskTexture: '',
      textColor: 'rgba(0, 0, 0, 0.7)',
      children: [],
    }),
  },
  {
    id: 'backdrop-border',
    name: '边框背景',
    icon: '🔳',
    category: 'backdrop',
    description: '带边框的装饰性背景',
    createFrame: () => ({
      name: '边框',
      type: FrameType.BACKDROP,
      x: 0.2,
      y: 0.2,
      width: 0.3,
      height: 0.2,
      anchors: createDefaultAnchors(0.2, 0.2, 0.3, 0.2),
      wc3Texture: 'UI\\Widgets\\EscMenu\\Human\\editbox-border.blp',
      diskTexture: '',
      children: [],
    }),
  },

  // ========== 输入类 ==========
  {
    id: 'edit-box',
    name: '编辑框',
    icon: '✏️',
    category: 'input',
    description: '可编辑的文本输入框',
    createFrame: () => ({
      name: '输入框',
      type: FrameType.EDITBOX,
      x: 0.25,
      y: 0.25,
      width: 0.2,
      height: 0.03,
      anchors: createDefaultAnchors(0.25, 0.25, 0.2, 0.03),
      text: '',
      textScale: 1.0,
      diskTexture: '',
      wc3Texture: '',
      children: [],
    }),
  },
  {
    id: 'checkbox',
    name: '复选框',
    icon: '☑️',
    category: 'input',
    description: '可勾选的复选框',
    createFrame: () => ({
      name: '复选框',
      type: FrameType.CHECKBOX,
      x: 0.35,
      y: 0.25,
      width: 0.03,
      height: 0.03,
      anchors: createDefaultAnchors(0.35, 0.25, 0.03, 0.03),
      diskTexture: '',
      wc3Texture: '',
      children: [],
    }),
  },

  // ========== 进度条类 ==========
  {
    id: 'progress-bar',
    name: '进度条',
    icon: '📊',
    category: 'bar',
    description: '水平进度条',
    createFrame: () => ({
      name: '进度条',
      type: FrameType.HORIZONTAL_BAR,
      x: 0.25,
      y: 0.25,
      width: 0.2,
      height: 0.02,
      anchors: createDefaultAnchors(0.25, 0.25, 0.2, 0.02),
      wc3Texture: 'UI\\Widgets\\ToolTips\\Human\\human-tooltip-background.blp',
      diskTexture: '',
      children: [],
    }),
  },
];

/**
 * 根据类别获取模板
 */
export const getTemplatesByCategory = (category: string): FrameTemplate[] => {
  return templates.filter(t => t.category === category);
};

/**
 * 根据ID获取模板
 */
export const getTemplateById = (id: string): FrameTemplate | undefined => {
  return templates.find(t => t.id === id);
};

/**
 * 获取所有类别
 */
export const getCategories = (): { id: string; name: string; icon: string }[] => {
  return [
    { id: 'basic', name: '基础控件', icon: '🔧' },
    { id: 'button', name: '按钮', icon: '🔘' },
    { id: 'text', name: '文本', icon: '📄' },
    { id: 'backdrop', name: '背景', icon: '🖼️' },
    { id: 'input', name: '输入', icon: '✏️' },
    { id: 'bar', name: '进度条', icon: '📊' },
  ];
};
