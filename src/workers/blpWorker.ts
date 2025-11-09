/**
 * BLP 解码 Web Worker
 * 在后台线程中使用 Rust 解码 BLP 图像，避免阻塞主线程
 */

import { decodeBLPToRGBA, blpImageDataToImageData } from '../utils/rustBridge';

interface WorkerMessage {
  id: string;
  buffer: ArrayBuffer;
}

interface WorkerResponse {
  id: string;
  success: boolean;
  dataUrl?: string;
  error?: string;
}

// 监听主线程消息
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { id, buffer } = e.data;
  
  try {
    // 使用 Rust 解码 BLP
    const blpImageData = await decodeBLPToRGBA(new Uint8Array(buffer));
    const imageData = blpImageDataToImageData(blpImageData);
    
    // 将 ImageData 转换为 DataURL
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('无法创建 Canvas 上下文');
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // 转换为 Blob
    const blob = await canvas.convertToBlob({ type: 'image/png' });
    
    // 转换为 DataURL
    const reader = new FileReader();
    reader.onload = () => {
      const response: WorkerResponse = {
        id,
        success: true,
        dataUrl: reader.result as string,
      };
      self.postMessage(response);
    };
    reader.onerror = () => {
      const response: WorkerResponse = {
        id,
        success: false,
        error: 'FileReader 错误',
      };
      self.postMessage(response);
    };
    reader.readAsDataURL(blob);
    
  } catch (error) {
    const response: WorkerResponse = {
      id,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(response);
  }
};

export {};
