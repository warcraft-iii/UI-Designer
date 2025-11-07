/**
 * 纹理加载 Hook
 * 
 * 用于在 React 组件中异步加载 WC3 纹理
 */

import { useState, useEffect } from 'react';
import { textureLoader } from '../utils/textureLoader';

/**
 * 纹理加载状态
 */
interface TextureLoadState {
  url: string | null;
  loading: boolean;
  error: Error | null;
}

/**
 * 使用纹理加载器加载纹理
 * @param path WC3纹理路径或本地文件路径
 * @returns 加载后的Data URL或HTTP URL
 */
export function useTextureLoader(path: string | undefined): TextureLoadState {
  const [state, setState] = useState<TextureLoadState>({
    url: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    // 如果路径为空,重置状态
    if (!path) {
      setState({ url: null, loading: false, error: null });
      return;
    }

    // 如果已经是Data URL或HTTP URL,直接使用
    if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
      setState({ url: path, loading: false, error: null });
      return;
    }

    // 开始加载
    setState({ url: null, loading: true, error: null });

    let cancelled = false;

    textureLoader.loadTexture(path)
      .then((url) => {
        if (!cancelled) {
          setState({ url, loading: false, error: null });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error(`[useTextureLoader] Failed to load texture: ${path}`, error);
          setState({ url: null, loading: false, error });
        }
      });

    // 清理函数
    return () => {
      cancelled = true;
    };
  }, [path]);

  return state;
}

/**
 * 批量加载多个纹理
 * @param paths 纹理路径数组
 * @returns 加载状态映射
 */
export function useTextureLoaderBatch(paths: (string | undefined)[]): Map<string, TextureLoadState> {
  const [stateMap, setStateMap] = useState<Map<string, TextureLoadState>>(new Map());

  useEffect(() => {
    const newMap = new Map<string, TextureLoadState>();
    const loadPromises: Promise<void>[] = [];

    for (const path of paths) {
      if (!path) continue;

      // 如果已经是Data URL或HTTP URL,直接使用
      if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
        newMap.set(path, { url: path, loading: false, error: null });
        continue;
      }

      // 开始加载
      newMap.set(path, { url: null, loading: true, error: null });

      const loadPromise = textureLoader.loadTexture(path)
        .then((url) => {
          newMap.set(path, { url, loading: false, error: null });
        })
        .catch((error) => {
          console.error(`[useTextureLoaderBatch] Failed to load texture: ${path}`, error);
          newMap.set(path, { url: null, loading: false, error });
        });

      loadPromises.push(loadPromise);
    }

    // 等待所有纹理加载完成
    Promise.all(loadPromises).then(() => {
      setStateMap(new Map(newMap));
    });
  }, [paths.join(',')]); // 使用join作为依赖,避免数组引用变化

  return stateMap;
}
