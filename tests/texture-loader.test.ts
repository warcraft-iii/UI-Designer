/**
 * 纹理加载器测试
 * 
 * 测试纹理加载系统的各种功能
 */

import { TextureLoader, TextureType, textureLoader } from '../src/utils/textureLoader';
import { mpqManager } from '../src/utils/mpqManager';

/**
 * 测试纹理类型识别
 */
function testTextureTypeDetection() {
  console.log('='.repeat(60));
  console.log('纹理类型识别测试');
  console.log('='.repeat(60));
  
  const loader = new TextureLoader();
  
  const testCases = [
    { path: 'data:image/png;base64,iVBORw0KG...', expected: TextureType.DATA_URL },
    { path: 'http://example.com/image.png', expected: TextureType.HTTP_URL },
    { path: 'https://example.com/image.jpg', expected: TextureType.HTTP_URL },
    { path: 'UI\\Widgets\\EscMenu\\Human\\button-background.blp', expected: TextureType.WC3_PATH },
    { path: 'UI/Widgets/Console/Human/CommandButton-Up.blp', expected: TextureType.WC3_PATH },
    { path: 'Textures/Black32.blp', expected: TextureType.WC3_PATH },
    { path: 'C:\\Users\\Test\\image.png', expected: TextureType.LOCAL_FILE },
    { path: 'D:\\Textures\\icon.blp', expected: TextureType.LOCAL_FILE },
    { path: '/home/user/image.png', expected: TextureType.LOCAL_FILE },
    { path: '', expected: TextureType.UNKNOWN },
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(({ path, expected }) => {
    const result = loader.getTextureType(path);
    const success = result === expected;
    
    if (success) {
      passed++;
      console.log(`✓ ${expected}: ${path.substring(0, 50)}...`);
    } else {
      failed++;
      console.log(`✗ Expected ${expected}, got ${result}: ${path}`);
    }
  });
  
  console.log(`\n结果: ${passed} 通过, ${failed} 失败\n`);
}

/**
 * 测试 Data URL 加载
 */
async function testDataURLLoading() {
  console.log('='.repeat(60));
  console.log('Data URL 加载测试');
  console.log('='.repeat(60));
  
  const loader = new TextureLoader();
  
  // 1x1 红色像素 PNG (base64)
  const dataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  
  try {
    const result = await loader.loadTexture(dataURL);
    console.log(`✓ Data URL 加载成功`);
    console.log(`  原始长度: ${dataURL.length}`);
    console.log(`  结果长度: ${result.length}`);
    console.log(`  相同: ${result === dataURL}`);
  } catch (error: any) {
    console.error(`✗ Data URL 加载失败:`, error.message);
  }
  
  console.log();
}

/**
 * 测试 WC3 纹理加载 (需要先加载 MPQ)
 */
async function testWC3TextureLoading() {
  console.log('='.repeat(60));
  console.log('WC3 纹理加载测试');
  console.log('='.repeat(60));
  
  const loader = new TextureLoader();
  
  // 检查 MPQ 是否已加载
  const mpqStatus = mpqManager.getStatus();
  if (mpqStatus.archivesLoaded === 0) {
    console.log('⚠ 跳过测试: MPQ 档案未加载');
    console.log('请先运行 mpq-manager.test.ts 加载 MPQ 档案\n');
    return;
  }
  
  console.log(`MPQ 状态: ${mpqStatus.archivesLoaded} 个档案, ${mpqStatus.totalFiles} 个文件`);
  
  // 测试常见的 WC3 纹理
  const testTextures = [
    'UI\\Widgets\\EscMenu\\Human\\editbox-background.blp',
    'UI\\Widgets\\Console\\Human\\CommandButton-Up.blp',
    'Textures\\Black32.blp',
  ];
  
  for (const texturePath of testTextures) {
    try {
      console.log(`\n加载: ${texturePath}`);
      
      const startTime = performance.now();
      const url = await loader.loadTexture(texturePath);
      const endTime = performance.now();
      
      console.log(`✓ 加载成功 (${(endTime - startTime).toFixed(2)}ms)`);
      console.log(`  URL 类型: ${url.startsWith('data:') ? 'Data URL' : 'Blob URL'}`);
      console.log(`  URL 长度: ${url.length}`);
      
      // 获取纹理信息
      const info = await loader.getTextureInfo(texturePath);
      console.log(`  纹理类型: ${info.type}`);
      console.log(`  已缓存: ${info.cached}`);
      
    } catch (error: any) {
      console.error(`✗ 加载失败: ${error.message}`);
    }
  }
  
  console.log();
}

/**
 * 测试缓存功能
 */
async function testCaching() {
  console.log('='.repeat(60));
  console.log('缓存功能测试');
  console.log('='.repeat(60));
  
  const loader = new TextureLoader();
  
  const dataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  
  // 第一次加载
  console.log('第一次加载...');
  const start1 = performance.now();
  await loader.loadTexture(dataURL);
  const time1 = performance.now() - start1;
  console.log(`耗时: ${time1.toFixed(2)}ms`);
  
  // 第二次加载 (应该从缓存)
  console.log('第二次加载 (从缓存)...');
  const start2 = performance.now();
  await loader.loadTexture(dataURL);
  const time2 = performance.now() - start2;
  console.log(`耗时: ${time2.toFixed(2)}ms`);
  console.log(`加速比: ${(time1 / time2).toFixed(1)}x`);
  
  // 检查缓存状态
  const status = loader.getCacheStatus();
  console.log(`\n缓存状态:`);
  console.log(`  缓存数量: ${status.size}/${status.maxSize}`);
  status.entries.forEach(entry => {
    console.log(`  - ${entry.type}: 访问 ${entry.accessCount} 次, ${(entry.age / 1000).toFixed(1)}s 前`);
  });
  
  // 清空缓存
  loader.clearCache();
  console.log('\n✓ 缓存已清空');
  
  const statusAfter = loader.getCacheStatus();
  console.log(`缓存数量: ${statusAfter.size}\n`);
}

/**
 * 测试预加载功能
 */
async function testPreloading() {
  console.log('='.repeat(60));
  console.log('预加载功能测试');
  console.log('='.repeat(60));
  
  const loader = new TextureLoader();
  
  const textures = [
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVQI12P4//8/AAX+Av7czFnnAAAAAElFTkSuQmCC',
  ];
  
  console.log(`预加载 ${textures.length} 个纹理...`);
  
  const startTime = performance.now();
  const results = await loader.preloadTextures(textures);
  const endTime = performance.now();
  
  console.log(`✓ 预加载完成 (${(endTime - startTime).toFixed(2)}ms)`);
  console.log(`成功加载: ${results.size}/${textures.length}`);
  
  const status = loader.getCacheStatus();
  console.log(`缓存数量: ${status.size}\n`);
}

/**
 * 测试纹理存在检查
 */
async function testTextureExists() {
  console.log('='.repeat(60));
  console.log('纹理存在性检查测试');
  console.log('='.repeat(60));
  
  const loader = new TextureLoader();
  
  const testCases = [
    { path: 'data:image/png;base64,test', expected: true },
    { path: 'http://example.com/image.png', expected: true },
    { path: 'C:\\NonExistent\\image.png', expected: false },
  ];
  
  for (const { path, expected } of testCases) {
    try {
      const exists = await loader.hasTexture(path);
      const icon = exists === expected ? '✓' : '✗';
      console.log(`${icon} ${path.substring(0, 50)}: ${exists}`);
    } catch (error: any) {
      console.log(`✗ ${path}: 检查失败`);
    }
  }
  
  console.log();
}

/**
 * 性能基准测试
 */
async function performanceBenchmark() {
  console.log('='.repeat(60));
  console.log('性能基准测试');
  console.log('='.repeat(60));
  
  const loader = new TextureLoader();
  
  const dataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  
  const iterations = 1000;
  
  // 预热
  await loader.loadTexture(dataURL);
  loader.clearCache();
  
  // 测试首次加载
  const startCold = performance.now();
  for (let i = 0; i < iterations; i++) {
    await loader.loadTexture(`${dataURL}?v=${i}`);
  }
  const coldTime = performance.now() - startCold;
  
  // 清空缓存
  loader.clearCache();
  
  // 测试缓存加载
  await loader.loadTexture(dataURL);
  const startHot = performance.now();
  for (let i = 0; i < iterations; i++) {
    await loader.loadTexture(dataURL);
  }
  const hotTime = performance.now() - startHot;
  
  console.log(`首次加载 (${iterations} 次): ${coldTime.toFixed(2)}ms (平均 ${(coldTime / iterations).toFixed(3)}ms)`);
  console.log(`缓存加载 (${iterations} 次): ${hotTime.toFixed(2)}ms (平均 ${(hotTime / iterations).toFixed(3)}ms)`);
  console.log(`加速比: ${(coldTime / hotTime).toFixed(1)}x\n`);
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('\n');
  console.log('█'.repeat(60));
  console.log('纹理加载器测试套件');
  console.log('█'.repeat(60));
  console.log('\n');
  
  // 基础功能测试
  testTextureTypeDetection();
  await testDataURLLoading();
  await testCaching();
  await testPreloading();
  await testTextureExists();
  
  // WC3 集成测试 (可选)
  await testWC3TextureLoading();
  
  // 性能测试
  await performanceBenchmark();
  
  console.log('█'.repeat(60));
  console.log('所有测试完成');
  console.log('█'.repeat(60));
}

// 运行测试
runAllTests().catch(error => {
  console.error('测试失败:', error);
  process.exit(1);
});
