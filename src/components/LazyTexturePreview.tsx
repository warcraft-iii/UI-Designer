import React, { useEffect, useRef, useState } from 'react';
import { textureLoader } from '../utils/textureLoader';

interface LazyTexturePreviewProps {
  path: string;
  name: string;
}

/**
 * 懒加载纹理预览组件
 * 使用 Intersection Observer 检测可见性，只加载可见的纹理
 */
export const LazyTexturePreview: React.FC<LazyTexturePreviewProps> = ({
  path,
  name,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || hasLoadedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadTexture();
            observer.disconnect();
          }
        });
      },
      {
        // 提前100px开始加载
        rootMargin: '100px',
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [path]);

  const loadTexture = async () => {
    setIsLoading(true);
    setLoadError(false);

    try {
      const dataUrl = await textureLoader.loadTexture(path);
      setPreview(dataUrl);
    } catch (error) {
      // 静默失败，很多文件在 listfile 中但无法读取是正常的
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="texture-preview"
      style={{ cursor: 'zoom-in' }}
    >
      {preview ? (
        <img src={preview} alt={name} />
      ) : isLoading ? (
        <div className="preview-placeholder loading">⏳</div>
      ) : loadError ? (
        <div className="preview-placeholder error">❌</div>
      ) : (
        <div className="preview-placeholder">🖼️</div>
      )}
    </div>
  );
};
