import React from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { MenuBar } from './components/MenuBar';
import { ProjectTree } from './components/ProjectTree';
import { PropertiesPanel } from './components/PropertiesPanel';
import { SidePanel } from './components/SidePanel';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './App.css';

function App() {
  const [currentFilePath, setCurrentFilePath] = React.useState<string | null>(null);
  const canvasRef = React.useRef<{ setScale: (s: number) => void; centerCanvas: () => void } | null>(null);

  // 注册全局快捷键
  useKeyboardShortcuts(
    currentFilePath,
    setCurrentFilePath,
    (scale) => canvasRef.current?.setScale(typeof scale === 'function' ? scale(1) : scale),
    () => canvasRef.current?.centerCanvas()
  );

  return (
    <div className="app">
      <MenuBar 
        currentFilePath={currentFilePath} 
        setCurrentFilePath={setCurrentFilePath}
      />
      <Toolbar currentFilePath={currentFilePath} setCurrentFilePath={setCurrentFilePath} />
      <div className="app-content">
        <ProjectTree />
        <Canvas ref={canvasRef as any} />
        <PropertiesPanel />
        <SidePanel />
      </div>
    </div>
  );
}

export default App;
