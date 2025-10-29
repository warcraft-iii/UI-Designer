import React from 'react';
import { useProjectStore } from '../store/projectStore';
import './ProjectTree.css';

export const ProjectTree: React.FC = () => {
  const { project, selectedFrameId, selectFrame } = useProjectStore();

  const renderTreeNode = (frameId: string, level: number = 0): React.ReactElement => {
    const frame = project.frames[frameId];
    if (!frame) return <></>;

    const isSelected = frameId === selectedFrameId;
    const hasChildren = frame.children.length > 0;

    return (
      <div key={frameId} className="tree-node" style={{ paddingLeft: `${level * 20}px` }}>
        <div
          className={`tree-node-item ${isSelected ? 'selected' : ''}`}
          onClick={() => selectFrame(frameId)}
        >
          {hasChildren && <span className="tree-node-toggle">▼</span>}
          <span className="tree-node-name">{frame.name}</span>
        </div>
        {hasChildren && (
          <div className="tree-node-children">
            {frame.children.map(childId => renderTreeNode(childId, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="project-tree">
      <div className="tree-header">
        <h3>项目树</h3>
      </div>
      <div className="tree-content">
        <div className="tree-node">
          <div className="tree-node-item root">
            <span className="tree-node-name">Origin</span>
          </div>
          <div className="tree-node-children">
            {project.rootFrameIds.map(frameId => renderTreeNode(frameId, 1))}
          </div>
        </div>
      </div>
    </div>
  );
};
