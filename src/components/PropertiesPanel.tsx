import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { FrameType, FramePoint, ProjectData, FrameAnchor } from '../types';
import { createDefaultAnchors, updateAnchorsFromBounds } from '../utils/anchorUtils';
import './PropertiesPanel.css';

export const PropertiesPanel: React.FC = () => {
  const { project, selectedFrameId, updateFrame } = useProjectStore();
  const selectedFrame = selectedFrameId ? project.frames[selectedFrameId] : null;

  if (!selectedFrame) {
    return (
      <div className="properties-panel">
        <h3>通用设置</h3>
        <GeneralSettings />
      </div>
    );
  }

  const handleChange = (field: string, value: any) => {
    if (selectedFrameId) {
      updateFrame(selectedFrameId, { [field]: value });
    }
  };

  return (
    <div className="properties-panel">
      <h3>属性面板</h3>
      
      {/* 基本信息 */}
      <section>
        <h4>详细信息</h4>
        <div className="form-group">
          <label>名称</label>
          <input
            type="text"
            value={selectedFrame.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>类型</label>
          <select
            value={selectedFrame.type}
            onChange={(e) => handleChange('type', parseInt(e.target.value))}
          >
            <option value={FrameType.BACKDROP}>Backdrop</option>
            <option value={FrameType.BUTTON}>Button</option>
            <option value={FrameType.BROWSER_BUTTON}>Browser Button</option>
            <option value={FrameType.SCRIPT_DIALOG_BUTTON}>Script Dialog Button</option>
            <option value={FrameType.TEXT_FRAME}>Text Frame</option>
            <option value={FrameType.CHECKBOX}>Checkbox</option>
            <option value={FrameType.HORIZONTAL_BAR}>Horizontal Bar</option>
            <option value={FrameType.TEXTAREA}>Text Area</option>
            <option value={FrameType.EDITBOX}>Edit Box</option>
            <option value={FrameType.SLIDER}>Slider</option>
          </select>
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={selectedFrame.tooltip}
              onChange={(e) => handleChange('tooltip', e.target.checked)}
            />
            作为父级的Tooltip
          </label>
        </div>
      </section>

      {/* 坐标和大小 */}
      <section>
        <h4>坐标</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label>X</label>
            <input
              type="number"
              step="0.01"
              value={selectedFrame.x}
              onChange={(e) => {
                const newX = parseFloat(e.target.value);
                handleChange('x', newX);
                handleChange('anchors', updateAnchorsFromBounds(
                  selectedFrame.anchors || createDefaultAnchors(selectedFrame.x, selectedFrame.y, selectedFrame.width, selectedFrame.height),
                  newX,
                  selectedFrame.y,
                  selectedFrame.width,
                  selectedFrame.height
                ));
              }}
            />
          </div>
          <div className="form-group">
            <label>Y</label>
            <input
              type="number"
              step="0.01"
              value={selectedFrame.y}
              onChange={(e) => {
                const newY = parseFloat(e.target.value);
                handleChange('y', newY);
                handleChange('anchors', updateAnchorsFromBounds(
                  selectedFrame.anchors || createDefaultAnchors(selectedFrame.x, selectedFrame.y, selectedFrame.width, selectedFrame.height),
                  selectedFrame.x,
                  newY,
                  selectedFrame.width,
                  selectedFrame.height
                ));
              }}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>宽度</label>
            <input
              type="number"
              step="0.01"
              value={selectedFrame.width}
              onChange={(e) => {
                const newWidth = parseFloat(e.target.value);
                handleChange('width', newWidth);
                handleChange('anchors', updateAnchorsFromBounds(
                  selectedFrame.anchors || createDefaultAnchors(selectedFrame.x, selectedFrame.y, selectedFrame.width, selectedFrame.height),
                  selectedFrame.x,
                  selectedFrame.y,
                  newWidth,
                  selectedFrame.height
                ));
              }}
            />
          </div>
          <div className="form-group">
            <label>高度</label>
            <input
              type="number"
              step="0.01"
              value={selectedFrame.height}
              onChange={(e) => {
                const newHeight = parseFloat(e.target.value);
                handleChange('height', newHeight);
                handleChange('anchors', updateAnchorsFromBounds(
                  selectedFrame.anchors || createDefaultAnchors(selectedFrame.x, selectedFrame.y, selectedFrame.width, selectedFrame.height),
                  selectedFrame.x,
                  selectedFrame.y,
                  selectedFrame.width,
                  newHeight
                ));
              }}
            />
          </div>
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={selectedFrame.isRelative}
              onChange={(e) => handleChange('isRelative', e.target.checked)}
            />
            相对于父级定位
          </label>
        </div>
      </section>

      {/* 锚点管理 */}
      <section>
        <h4>锚点</h4>
        <div className="anchors-list">
          {(selectedFrame.anchors || createDefaultAnchors(selectedFrame.x, selectedFrame.y, selectedFrame.width, selectedFrame.height)).map((anchor, index) => (
            <div key={index} className="anchor-item">
              <div className="anchor-header">
                <strong>锚点 {index + 1}</strong>
                {selectedFrame.anchors && selectedFrame.anchors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newAnchors = selectedFrame.anchors!.filter((_, i) => i !== index);
                      handleChange('anchors', newAnchors);
                    }}
                  >
                    删除
                  </button>
                )}
              </div>
              
              <div className="form-group">
                <label>锚点类型</label>
                <select
                  value={anchor.point}
                  onChange={(e) => {
                    const newAnchors = [...(selectedFrame.anchors || [])];
                    newAnchors[index] = { ...anchor, point: parseInt(e.target.value) };
                    handleChange('anchors', newAnchors);
                  }}
                >
                  <option value={FramePoint.TOPLEFT}>左上角</option>
                  <option value={FramePoint.TOP}>顶部中心</option>
                  <option value={FramePoint.TOPRIGHT}>右上角</option>
                  <option value={FramePoint.LEFT}>左侧中心</option>
                  <option value={FramePoint.CENTER}>中心</option>
                  <option value={FramePoint.RIGHT}>右侧中心</option>
                  <option value={FramePoint.BOTTOMLEFT}>左下角</option>
                  <option value={FramePoint.BOTTOM}>底部中心</option>
                  <option value={FramePoint.BOTTOMRIGHT}>右下角</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>X</label>
                  <input
                    type="number"
                    step="0.01"
                    value={anchor.x}
                    onChange={(e) => {
                      const newAnchors = [...(selectedFrame.anchors || [])];
                      newAnchors[index] = { ...anchor, x: parseFloat(e.target.value) };
                      handleChange('anchors', newAnchors);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Y</label>
                  <input
                    type="number"
                    step="0.01"
                    value={anchor.y}
                    onChange={(e) => {
                      const newAnchors = [...(selectedFrame.anchors || [])];
                      newAnchors[index] = { ...anchor, y: parseFloat(e.target.value) };
                      handleChange('anchors', newAnchors);
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>相对于控件 (可选)</label>
                <input
                  type="text"
                  placeholder="留空表示绝对定位"
                  value={anchor.relativeTo || ''}
                  onChange={(e) => {
                    const newAnchors = [...(selectedFrame.anchors || [])];
                    newAnchors[index] = { ...anchor, relativeTo: e.target.value || undefined };
                    handleChange('anchors', newAnchors);
                  }}
                />
              </div>

              {anchor.relativeTo && (
                <div className="form-group">
                  <label>相对锚点</label>
                  <select
                    value={anchor.relativePoint ?? FramePoint.TOPLEFT}
                    onChange={(e) => {
                      const newAnchors = [...(selectedFrame.anchors || [])];
                      newAnchors[index] = { ...anchor, relativePoint: parseInt(e.target.value) };
                      handleChange('anchors', newAnchors);
                    }}
                  >
                    <option value={FramePoint.TOPLEFT}>左上角</option>
                    <option value={FramePoint.TOP}>顶部中心</option>
                    <option value={FramePoint.TOPRIGHT}>右上角</option>
                    <option value={FramePoint.LEFT}>左侧中心</option>
                    <option value={FramePoint.CENTER}>中心</option>
                    <option value={FramePoint.RIGHT}>右侧中心</option>
                    <option value={FramePoint.BOTTOMLEFT}>左下角</option>
                    <option value={FramePoint.BOTTOM}>底部中心</option>
                    <option value={FramePoint.BOTTOMRIGHT}>右下角</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            const newAnchor: FrameAnchor = {
              point: FramePoint.TOPLEFT,
              x: selectedFrame.x,
              y: selectedFrame.y
            };
            const newAnchors = [...(selectedFrame.anchors || createDefaultAnchors(selectedFrame.x, selectedFrame.y, selectedFrame.width, selectedFrame.height)), newAnchor];
            handleChange('anchors', newAnchors);
          }}
        >
          添加锚点
        </button>
      </section>

      {/* 纹理 */}
      {shouldShowField(selectedFrame.type, 'texture') && (
        <section>
          <h4>纹理</h4>
          <div className="form-group">
            <label>应用内纹理路径</label>
            <input
              type="text"
              value={selectedFrame.diskTexture}
              onChange={(e) => handleChange('diskTexture', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>游戏内纹理路径</label>
            <input
              type="text"
              value={selectedFrame.wc3Texture}
              onChange={(e) => handleChange('wc3Texture', e.target.value)}
            />
          </div>
        </section>
      )}

      {/* 文本 */}
      {shouldShowField(selectedFrame.type, 'text') && (
        <section>
          <h4>文本属性</h4>
          <div className="form-group">
            <label>文本</label>
            <textarea
              value={selectedFrame.text || ''}
              onChange={(e) => handleChange('text', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>文本缩放</label>
            <input
              type="number"
              step="0.1"
              value={selectedFrame.textScale || 1}
              onChange={(e) => handleChange('textScale', parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label>文本颜色</label>
            <input
              type="color"
              value={selectedFrame.textColor || '#FFFFFF'}
              onChange={(e) => handleChange('textColor', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>水平对齐</label>
              <select
                value={selectedFrame.horAlign || 'left'}
                onChange={(e) => handleChange('horAlign', e.target.value)}
              >
                <option value="left">左对齐</option>
                <option value="center">居中</option>
                <option value="right">右对齐</option>
              </select>
            </div>
            <div className="form-group">
              <label>垂直对齐</label>
              <select
                value={selectedFrame.verAlign || 'start'}
                onChange={(e) => handleChange('verAlign', e.target.value)}
              >
                <option value="start">顶部</option>
                <option value="center">居中</option>
                <option value="flex-end">底部</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* 功能 */}
      {shouldShowField(selectedFrame.type, 'trigger') && (
        <section>
          <h4>功能</h4>
          <div className="form-group">
            <label>触发变量</label>
            <input
              type="text"
              value={selectedFrame.trigVar || ''}
              onChange={(e) => handleChange('trigVar', e.target.value)}
              placeholder="udg_"
            />
          </div>
        </section>
      )}

      {/* EDITBOX 特定属性 */}
      {selectedFrame.type === FrameType.EDITBOX && (
        <section>
          <h4>编辑框设置</h4>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={selectedFrame.multiline || false}
                onChange={(e) => handleChange('multiline', e.target.checked)}
              />
              多行编辑
            </label>
          </div>
        </section>
      )}

      {/* SLIDER 特定属性 */}
      {selectedFrame.type === FrameType.SLIDER && (
        <section>
          <h4>滑块设置</h4>
          <div className="form-group">
            <label>最小值</label>
            <input
              type="number"
              step="0.01"
              value={selectedFrame.minValue || 0}
              onChange={(e) => handleChange('minValue', parseFloat(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>最大值</label>
            <input
              type="number"
              step="0.01"
              value={selectedFrame.maxValue || 100}
              onChange={(e) => handleChange('maxValue', parseFloat(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>步长</label>
            <input
              type="number"
              step="0.01"
              value={selectedFrame.stepSize || 1}
              onChange={(e) => handleChange('stepSize', parseFloat(e.target.value))}
            />
          </div>
        </section>
      )}

      {/* CHECKBOX 特定属性 */}
      {selectedFrame.type === FrameType.CHECKBOX && (
        <section>
          <h4>复选框设置</h4>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={selectedFrame.checked || false}
                onChange={(e) => handleChange('checked', e.target.checked)}
              />
              默认选中
            </label>
          </div>
        </section>
      )}
    </div>
  );
};

const GeneralSettings: React.FC = () => {
  const { project, updateGeneralSettings } = useProjectStore();

  // 预设背景图列表
  const backgroundOptions = [
    { value: '', label: '无背景 (棋盘格)' },
    { value: '/backgrounds/wc3-with-ui.png', label: 'WC3 1920x1080 (带UI)' },
    { value: '/backgrounds/wc3-no-ui.png', label: 'WC3 1920x1080 (无UI)' },
  ];

  return (
    <div>
      <div className="form-group">
        <label>库名称</label>
        <input
          type="text"
          value={project.libraryName}
          onChange={(e) => updateGeneralSettings({ libraryName: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Origin模式</label>
        <select
          value={project.originMode}
          onChange={(e) => updateGeneralSettings({ originMode: e.target.value as any })}
        >
          <option value="gameui">Game UI</option>
          <option value="worldframe">World Frame</option>
          <option value="consoleui">Console UI</option>
        </select>
      </div>

      <div className="form-group">
        <label>画布背景图</label>
        <select
          value={project.backgroundImage || ''}
          onChange={(e) => updateGeneralSettings({ backgroundImage: e.target.value || undefined })}
        >
          {backgroundOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <h4>隐藏默认游戏UI</h4>
      {[
        { key: 'hideGameUI', label: '隐藏所有游戏UI' },
        { key: 'hideHeroBar', label: '隐藏英雄栏' },
        { key: 'hideMiniMap', label: '隐藏小地图' },
        { key: 'hideResources', label: '隐藏资源栏' },
        { key: 'hideButtonBar', label: '隐藏按钮栏' },
        { key: 'hidePortrait', label: '隐藏头像' },
        { key: 'hideChat', label: '隐藏聊天' },
      ].map(({ key, label }) => (
        <div key={key} className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={project[key as keyof ProjectData] as boolean}
              onChange={(e) => updateGeneralSettings({ [key]: e.target.checked })}
            />
            {label}
          </label>
        </div>
      ))}
    </div>
  );
};

// 辅助函数：判断是否显示某个字段
function shouldShowField(type: FrameType, field: string): boolean {
  const textTypes = [
    FrameType.TEXT_FRAME,
    FrameType.BROWSER_BUTTON,
    FrameType.SCRIPT_DIALOG_BUTTON,
    FrameType.TEXTAREA,
    FrameType.EDITBOX,
  ];

  const textureTypes = [
    FrameType.BACKDROP,
    FrameType.BUTTON,
    FrameType.HORIZONTAL_BAR,
  ];

  const triggerTypes = [
    FrameType.BUTTON,
    FrameType.BROWSER_BUTTON,
    FrameType.SCRIPT_DIALOG_BUTTON,
    FrameType.INVIS_BUTTON,
    FrameType.CHECKBOX,
  ];

  switch (field) {
    case 'text':
      return textTypes.includes(type);
    case 'texture':
      return textureTypes.includes(type);
    case 'trigger':
      return triggerTypes.includes(type);
    default:
      return false;
  }
}
