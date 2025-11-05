/**
 * 调试坐标转换
 */

import { FDFLexer } from '../src/utils/fdfLexer';
import { FDFParser } from '../src/utils/fdfParser';
import { FDFTransformer } from '../src/utils/fdfTransformer';

const fdfContent = `
Frame "TEXT" "LockTeamsLabel" {
    SetPoint TOPLEFT, "AdvancedOptionsTitleLabel", BOTTOMLEFT, 0.0, -0.002,
    SetPoint TOPRIGHT, "AdvancedOptionsTitleLabel", BOTTOMRIGHT, 0.0, -0.002,
    Text "COLON_LOCK_TEAMS",
}
`;

console.log('=== 测试坐标转换 ===\n');
console.log('原始 FDF:');
console.log('  SetPoint TOPLEFT, "AdvancedOptionsTitleLabel", BOTTOMLEFT, 0.0, -0.002');
console.log('');

const lexer = new FDFLexer(fdfContent);
const tokens = lexer.tokenize();

const parser = new FDFParser(tokens);
const ast = parser.parse();

const transformer = new FDFTransformer({
  baseWidth: 800,
  baseHeight: 600,
});
const frames = transformer.transform(ast);

const lockTeamsLabel = frames[0];

console.log('转换结果:');
console.log(`  Frame 名称: ${lockTeamsLabel.name}`);
console.log(`  位置: (${lockTeamsLabel.x.toFixed(3)}, ${lockTeamsLabel.y.toFixed(3)})`);
console.log(`  尺寸: ${lockTeamsLabel.width.toFixed(3)} x ${lockTeamsLabel.height.toFixed(3)}`);
console.log('');

if (lockTeamsLabel.anchors && lockTeamsLabel.anchors.length > 0) {
  console.log('锚点:');
  const pointNames = ['TOPLEFT', 'TOP', 'TOPRIGHT', 'LEFT', 'CENTER', 'RIGHT', 'BOTTOMLEFT', 'BOTTOM', 'BOTTOMRIGHT'];
  
  for (const anchor of lockTeamsLabel.anchors) {
    console.log(`  ${pointNames[anchor.point]}:`);
    console.log(`    偏移: (${anchor.x.toFixed(3)}, ${anchor.y.toFixed(3)})`);
    if (anchor.relativeTo) {
      console.log(`    相对于: ${anchor.relativeTo}`);
      console.log(`    相对点: ${pointNames[anchor.relativePoint || 0]}`);
    }
  }
}

console.log('');
console.log('=== 验证 ===');
console.log('X 偏移 0.0:');
console.log(`  期望: 0 像素`);
console.log(`  实际: ${lockTeamsLabel.anchors[0].x.toFixed(3)} 像素`);
console.log('');
console.log('Y 偏移 -0.002:');
console.log(`  期望: -1.2 像素 (600 * 0.002 = 1.2)`);
console.log(`  实际: ${lockTeamsLabel.anchors[0].y.toFixed(3)} 像素`);
console.log('');

if (Math.abs(lockTeamsLabel.anchors[0].y - (-1.2)) < 0.01) {
  console.log('✓ Y 坐标转换正确！');
} else {
  console.log('✗ Y 坐标转换错误');
}

