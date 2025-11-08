import React, { createContext, useContext, useState, useEffect } from 'react';
import { dirname } from '@tauri-apps/api/path';

interface ProjectContextType {
  currentFilePath: string | null;
  projectDir: string | null;
  setCurrentFilePath: (path: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType>({
  currentFilePath: null,
  projectDir: null,
  setCurrentFilePath: () => {},
});

export const useProjectContext = () => useContext(ProjectContext);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [projectDir, setProjectDir] = useState<string | null>(null);

  // 当文件路径变化时，更新项目目录
  useEffect(() => {
    const updateProjectDir = async () => {
      if (currentFilePath) {
        try {
          const dir = await dirname(currentFilePath);
          setProjectDir(dir);
        } catch (error) {
          console.error('Failed to get project directory:', error);
          setProjectDir(null);
        }
      } else {
        setProjectDir(null);
      }
    };

    updateProjectDir();
  }, [currentFilePath]);

  return (
    <ProjectContext.Provider value={{ currentFilePath, projectDir, setCurrentFilePath }}>
      {children}
    </ProjectContext.Provider>
  );
};
