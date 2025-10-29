import React from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { ProjectTree } from './components/ProjectTree';
import { PropertiesPanel } from './components/PropertiesPanel';
import './App.css';

function App() {
  return (
    <div className="app">
      <Toolbar />
      <div className="app-content">
        <ProjectTree />
        <Canvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default App;
