#!/usr/bin/env node

console.log('🔍 开始诊断 Netlify 页面空白问题...\n');

import fs from 'fs';
import path from 'path';

// 检查关键文件是否存在
const criticalFiles = [
    'dist/index.html',
    'dist/assets/index-z-b1g0GS.js',
    'dist/assets/index-D38MquTd.css',
    'src/main.tsx',
    'src/App.tsx',
    'src/lib/supabaseClient.ts',
    'netlify.toml'
];

console.log('📁 检查关键文件...');
let missingFiles = [];

criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - 文件缺失!`);
        missingFiles.push(file);
    }
});

// 检查 dist/index.html 内容
console.log('\n📄 检查 dist/index.html 内容...');
if (fs.existsSync('dist/index.html')) {
    const content = fs.readFileSync('dist/index.html', 'utf-8');
    
    if (content.includes('<div id="root"></div>')) {
        console.log('✅ 找到 root div');
    } else {
        console.log('❌ 缺少 root div');
    }
    
    if (content.includes('index-z-b1g0GS.js')) {
        console.log('✅ JS文件引用正确');
    } else {
        console.log('❌ JS文件引用有问题');
    }
    
    if (content.includes('index-D38MquTd.css')) {
        console.log('✅ CSS文件引用正确');
    } else {
        console.log('❌ CSS文件引用有问题');
    }
}

// 检查 netlify.toml 配置
console.log('\n⚙️ 检查 Netlify 配置...');
if (fs.existsSync('netlify.toml')) {
    const tomlContent = fs.readFileSync('netlify.toml', 'utf-8');
    
    if (tomlContent.includes('publish = "dist"')) {
        console.log('✅ 发布目录配置正确');
    } else {
        console.log('❌ 发布目录配置错误');
    }
    
    if (tomlContent.includes('[[redirects]]')) {
        console.log('✅ 找到重定向配置');
    } else {
        console.log('❌ 缺少重定向配置');
    }
}

// 检查构建产物大小
console.log('\n📊 检查构建产物大小...');
const checkFileSize = (filename) => {
    if (fs.existsSync(filename)) {
        const stats = fs.statSync(filename);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`📄 ${filename}: ${sizeKB} KB`);
        return stats.size;
    }
    return 0;
};

const jsSize = checkFileSize('dist/assets/index-z-b1g0GS.js');
const cssSize = checkFileSize('dist/assets/index-D38MquTd.css');

if (jsSize < 1000) {  // 如果JS文件小于1KB，可能有问题
    console.log('⚠️ JavaScript 文件过小，可能构建有问题');
}

// 检查环境变量配置
console.log('\n🔑 检查环境变量配置...');
if (fs.existsSync('src/lib/supabaseClient.ts')) {
    const supabaseContent = fs.readFileSync('src/lib/supabaseClient.ts', 'utf-8');
    
    if (supabaseContent.includes('wmwcnnjvdbicxiculumk.supabase.co')) {
        console.log('✅ 使用硬编码 Supabase URL');
    } else if (supabaseContent.includes('import.meta.env.VITE_SUPABASE_URL')) {
        console.log('⚠️ 使用环境变量，可能在 Netlify 中未正确配置');
    }
}

// 生成问题诊断报告
console.log('\n📋 生成问题诊断...');

const issues = [];
const solutions = [];

if (missingFiles.length > 0) {
    issues.push('关键文件缺失');
    solutions.push('重新运行 npm run build');
}

if (jsSize < 1000) {
    issues.push('JavaScript构建产物异常');
    solutions.push('检查TypeScript编译错误');
}

// 最可能的问题分析
console.log('\n🎯 最可能的问题原因:');

console.log('\n1. **Netlify环境变量未配置** (最可能)');
console.log('   - 问题: netlify.toml中的环境变量是占位符');
console.log('   - 影响: Supabase客户端初始化失败，导致应用崩溃');
console.log('   - 解决: 在Netlify后台配置真实的环境变量');

console.log('\n2. **SPA路由配置问题**');
console.log('   - 问题: 单页应用需要重定向所有路径到index.html');
console.log('   - 影响: 直接访问URL时返回404');
console.log('   - 解决: 确认netlify.toml中的redirects配置');

console.log('\n3. **JavaScript运行时错误**');
console.log('   - 问题: React应用启动时抛出异常');
console.log('   - 影响: 页面白屏，无任何内容渲染');
console.log('   - 解决: 检查浏览器控制台错误信息');

console.log('\n✅ 诊断完成！');
console.log('\n📝 建议下一步操作:');
console.log('1. 访问Netlify站点，打开浏览器开发者工具');
console.log('2. 查看Console选项卡的错误信息'); 
console.log('3. 查看Network选项卡，确认所有资源都能正确加载');
console.log('4. 根据错误信息进行针对性修复');