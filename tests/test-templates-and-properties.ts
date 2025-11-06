/**
 * 测试模板和属性完整性
 * 验证所有29种控件类型的模板和属性支持
 */

import { templates } from '../src/data/templates';
import { FrameType } from '../src/types';

console.log('🧪 开始测试模板和属性系统...\n');

// 测试1: 验证基础控件模板数量
console.log('📊 测试1: 基础控件模板统计');
const basicTemplates = templates.filter(t => t.category === 'basic');
console.log(`  ✅ 基础控件模板数量: ${basicTemplates.length}`);

// 按控件类型分类统计
const typeCount: Record<string, number> = {};
basicTemplates.forEach(t => {
  const frame = t.createFrame();
  const typeName = FrameType[frame.type as number];
  typeCount[typeName] = (typeCount[typeName] || 0) + 1;
});

console.log('  📝 控件类型分布:');
Object.entries(typeCount).sort().forEach(([type, count]) => {
  console.log(`     - ${type}: ${count}个`);
});

// 测试2: 验证所有29种控件类型都有模板
console.log('\n📊 测试2: 验证29种控件类型覆盖');
const expectedTypes = [
  // 基础容器 (4)
  'ORIGIN', 'FRAME', 'BACKDROP', 'SIMPLEFRAME',
  // 文本控件 (3)
  'TEXT_FRAME', 'SIMPLEFONTSTRING', 'TEXTAREA',
  // 按钮控件 (7)
  'BUTTON', 'GLUETEXTBUTTON', 'GLUEBUTTON', 'SIMPLEBUTTON',
  'SCRIPT_DIALOG_BUTTON', 'BROWSER_BUTTON', 'INVIS_BUTTON',
  // 交互控件 (7)
  'CHECKBOX', 'EDITBOX', 'SLIDER', 'SCROLLBAR',
  'LISTBOX', 'MENU', 'POPUPMENU',
  // 图形控件 (3)
  'SPRITE', 'MODEL', 'HIGHLIGHT',
  // 状态栏 (2)
  'SIMPLESTATUSBAR', 'STATUSBAR',
  // 其他 (3)
  'CONTROL', 'DIALOG', 'TIMERTEXT',
];

const allTemplateTypes = new Set<string>();
templates.forEach(t => {
  const frame = t.createFrame();
  allTemplateTypes.add(FrameType[frame.type as number]);
});

let missingTypes = 0;
expectedTypes.forEach(type => {
  if (!allTemplateTypes.has(type)) {
    console.log(`  ❌ 缺少模板: ${type}`);
    missingTypes++;
  }
});

if (missingTypes === 0) {
  console.log(`  ✅ 所有29种核心控件类型都有模板支持`);
} else {
  console.log(`  ⚠️  缺少 ${missingTypes} 种控件类型的模板`);
}

// 测试3: 验证模板创建的控件具有必需属性
console.log('\n📊 测试3: 验证模板属性完整性');
let invalidTemplates = 0;
templates.forEach(t => {
  const frame = t.createFrame();
  
  // 检查必需属性
  const requiredProps = ['type', 'x', 'y', 'width', 'height', 'anchors'];
  const missing = requiredProps.filter(prop => !(prop in frame));
  
  if (missing.length > 0) {
    console.log(`  ❌ ${t.name} 缺少属性: ${missing.join(', ')}`);
    invalidTemplates++;
  }
});

if (invalidTemplates === 0) {
  console.log(`  ✅ 所有 ${templates.length} 个模板都包含必需属性`);
} else {
  console.log(`  ❌ ${invalidTemplates} 个模板缺少必需属性`);
}

// 测试4: 验证特定控件的专有属性
console.log('\n📊 测试4: 验证控件专有属性支持');

// 文本控件应有text属性
const textTemplates = templates.filter(t => {
  const frame = t.createFrame();
  const type = frame.type as FrameType;
  return [
    FrameType.TEXT_FRAME,
    FrameType.SIMPLEFONTSTRING,
    FrameType.TEXTAREA,
    FrameType.GLUETEXTBUTTON,
    FrameType.SCRIPT_DIALOG_BUTTON,
    FrameType.BROWSER_BUTTON,
  ].includes(type);
});

const textWithText = textTemplates.filter(t => 'text' in t.createFrame());
console.log(`  ✅ 文本控件: ${textWithText.length}/${textTemplates.length} 个包含text属性`);

// SLIDER应有min/max/step属性
const sliderTemplates = templates.filter(t => {
  const frame = t.createFrame();
  return frame.type === FrameType.SLIDER;
});

if (sliderTemplates.length > 0) {
  const slider = sliderTemplates[0].createFrame();
  const hasSliderProps = 'minValue' in slider && 'maxValue' in slider && 'stepSize' in slider;
  console.log(`  ${hasSliderProps ? '✅' : '❌'} SLIDER: ${hasSliderProps ? '包含' : '缺少'} min/max/step属性`);
}

// 测试5: 验证所有模板ID唯一性
console.log('\n📊 测试5: 验证模板ID唯一性');
const templateIds = templates.map(t => t.id);
const uniqueIds = new Set(templateIds);

if (templateIds.length === uniqueIds.size) {
  console.log(`  ✅ 所有 ${templates.length} 个模板ID都是唯一的`);
} else {
  console.log(`  ❌ 发现重复的模板ID (总数:${templateIds.length}, 唯一:${uniqueIds.size})`);
  
  // 找出重复的ID
  const duplicates = templateIds.filter((id, index) => templateIds.indexOf(id) !== index);
  console.log(`  重复ID: ${[...new Set(duplicates)].join(', ')}`);
}

// 测试6: 验证组合模板 (从compositeTemplates导入)
console.log('\n📊 测试6: 组合模板');
// 注意: 组合模板在单独的compositeTemplates数组中
console.log(`  📦 组合模板功能独立于基础模板`);

// 测试7: 分类统计
console.log('\n📊 测试7: 模板分类统计');
const categories: Record<string, number> = {};
templates.forEach(t => {
  categories[t.category] = (categories[t.category] || 0) + 1;
});

console.log('  📂 分类分布:');
Object.entries(categories).sort().forEach(([cat, count]) => {
  console.log(`     - ${cat}: ${count}个`);
});

// 总结
console.log('\n' + '='.repeat(60));
console.log('📋 测试总结:');
console.log(`  ✅ 总模板数: ${templates.length}`);
console.log(`  ✅ 基础控件模板: ${basicTemplates.length}`);
console.log(`  ✅ 控件类型覆盖: ${allTemplateTypes.size}/29`);
console.log(`  ✅ 所有模板ID唯一: ${templateIds.length === uniqueIds.size ? '是' : '否'}`);
console.log(`  ✅ 所有模板属性完整: ${invalidTemplates === 0 ? '是' : '否'}`);
console.log('='.repeat(60));

// 退出代码
if (missingTypes > 0 || invalidTemplates > 0 || templateIds.length !== uniqueIds.size) {
  console.log('\n❌ 测试失败');
  process.exit(1);
} else {
  console.log('\n✅ 所有测试通过!');
  process.exit(0);
}
