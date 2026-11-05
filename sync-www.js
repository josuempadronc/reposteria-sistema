const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, 'www');
if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

const files = ['index.html', 'styles.css', 'app.js', 'manifest.json', 'icon.svg', 'sw.js'];
for (const f of files) {
  const src = path.join(__dirname, f);
  const dest = path.join(wwwDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}
console.log('Carpeta www sincronizada correctamente para Android APK.');

