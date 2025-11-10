// 调试 MDX 文件的块顺序
import { invoke } from '@tauri-apps/api/core';

async function debugMdxChunks() {
  try {
    // 从 MPQ 读取 Arthas.mdx
    const mdxData = await invoke<number[]>('read_mpq_file', {
      archivePath: 'E:\\Games\\War3\\War3.mpq',
      fileName: 'Units\\Human\\Arthas\\Arthas.mdx'
    });
    
    const buffer = new Uint8Array(mdxData);
    console.log('MDX 文件大小:', buffer.length, 'bytes');
    
    // 读取魔数
    const magic = String.fromCharCode(...buffer.slice(0, 4));
    console.log('Magic:', magic);
    
    // 逐个读取块
    let offset = 4;
    let chunkIndex = 0;
    
    while (offset < buffer.length - 8) {
      const chunkId = String.fromCharCode(...buffer.slice(offset, offset + 4));
      const chunkSize = new DataView(buffer.buffer).getUint32(offset + 4, true);
      
      console.log(`Chunk #${chunkIndex}: ${chunkId} (size: ${chunkSize} bytes, offset: ${offset})`);
      
      offset += 8 + chunkSize;
      chunkIndex++;
      
      if (chunkIndex > 50) {
        console.log('... (限制显示前50个块)');
        break;
      }
    }
    
    console.log('总共找到', chunkIndex, '个块');
    
  } catch (error) {
    console.error('错误:', error);
  }
}

// 导出到全局
(window as any).debugMdxChunks = debugMdxChunks;
console.log('调试函数已加载，运行: debugMdxChunks()');
