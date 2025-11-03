import React, { useState } from 'react';
import { useCommandStore } from '../store/commandStore';
import { CreateFrameCommand } from '../commands/FrameCommands';
import { templates, getCategories, getTemplatesByCategory, FrameTemplate } from '../data/templates';
import { FrameData } from '../types';
import './TemplatePanel.css';

export const TemplatePanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = getCategories();

  const handleCreateFromTemplate = (template: FrameTemplate) => {
    const { executeCommand } = useCommandStore.getState();
    
    // 生成唯一ID
    const frameId = `frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 从模板创建完整的 FrameData
    const templateData = template.createFrame();
    const frameData: FrameData = {
      id: frameId,
      parentId: null, // 模板创建的控件都是根控件
      z: 0,
      tooltip: false,
      isRelative: false,
      diskTexture: '',
      wc3Texture: '',
      ...templateData,
    } as FrameData;
    
    const command = new CreateFrameCommand(frameData);
    executeCommand(command);
    
    console.log(`从模板创建控件: ${template.name}`, frameData);
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : getTemplatesByCategory(selectedCategory);

  return (
    <div className={`template-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="template-panel-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="template-panel-toggle-icon">
          {isExpanded ? '◀' : '▶'}
        </span>
        <span className="template-panel-toggle-text">模板</span>
      </div>

      {isExpanded && (
        <div className="template-panel-content">
          <div className="template-panel-header">
            <h3>📦 控件模板</h3>
          </div>

          <div className="template-categories">
            <button
              className={`template-category ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              全部
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`template-category ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          <div className="template-list">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="template-item"
                onClick={() => handleCreateFromTemplate(template)}
                title={template.description}
              >
                <div className="template-item-icon">{template.icon}</div>
                <div className="template-item-info">
                  <div className="template-item-name">{template.name}</div>
                  <div className="template-item-desc">{template.description}</div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="template-empty">
              暂无模板
            </div>
          )}
        </div>
      )}
    </div>
  );
};
