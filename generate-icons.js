// 簡易的なアイコン生成スクリプト
const fs = require('fs');
const path = require('path');

// Canvas APIのポリフィル（Node.js環境用）
const createCanvas = (width, height) => {
  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <text x="50%" y="45%" font-family="Arial Black" font-size="${width * 0.25}px" fill="white" text-anchor="middle">CD</text>
  <text x="50%" y="70%" font-family="Arial" font-size="${width * 0.08}px" fill="white" text-anchor="middle">Cadence Dungeon</text>
</svg>`;
  return svg;
};

// publicディレクトリが存在しない場合は作成
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// 192x192アイコン
fs.writeFileSync(
  path.join('public', 'icon-192.svg'),
  createCanvas(192, 192)
);

// 512x512アイコン
fs.writeFileSync(
  path.join('public', 'icon-512.svg'),
  createCanvas(512, 512)
);

console.log('Icons generated successfully!');