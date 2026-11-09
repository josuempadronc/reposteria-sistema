const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, 'www');
if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

const files = [
  'index.html',
  'admin.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'html5-qrcode.min.js',
  'icon.svg',
  'sw.js',
  'icon-postflow.png',
  'portada-postflow.png',
  'portada-postflow.jpg',
  'icon-192.png',
  'icon-512.png',
  'favicon.png'
];
for (const f of files) {
  const src = path.join(__dirname, f);
  const dest = path.join(wwwDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}
console.log('Carpeta www sincronizada correctamente para Android APK.');

