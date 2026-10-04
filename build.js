import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, 'public');

console.log('Building production assets in ./public ...');

// Ensure clean public directory
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Helper to copy file
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

// Helper to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

// 1. Copy all production HTML files in root
const rootFiles = fs.readdirSync(__dirname);
let htmlCount = 0;
for (const file of rootFiles) {
  if (file.endsWith('.html')) {
    copyFile(path.join(__dirname, file), path.join(PUBLIC_DIR, file));
    htmlCount++;
  }
}
console.log(`Copied ${htmlCount} root HTML files to ./public`);

// 2. Copy static asset directories: assets/ and artikel/
if (fs.existsSync(path.join(__dirname, 'assets'))) {
  copyDir(path.join(__dirname, 'assets'), path.join(PUBLIC_DIR, 'assets'));
  console.log('Copied assets/ to ./public/assets');
}

if (fs.existsSync(path.join(__dirname, 'artikel'))) {
  copyDir(path.join(__dirname, 'artikel'), path.join(PUBLIC_DIR, 'artikel'));
  console.log('Copied artikel/ to ./public/artikel');
}

// 3. Copy CSS, JS, and SEO metadata files
const staticFiles = [
  'style.css',
  'artikel-seo.css',
  'print.css',
  'script.js',
  'sitemap.xml',
  'sitemap-nonwww.xml',
  'robots.txt',
  'ads.txt',
  'articles.json'
];

for (const file of staticFiles) {
  const srcPath = path.join(__dirname, file);
  if (fs.existsSync(srcPath)) {
    copyFile(srcPath, path.join(PUBLIC_DIR, file));
    console.log(`Copied ${file} to ./public/${file}`);
  }
}

// 4. Verify no prohibited files exist in public/
const prohibited = ['node_modules', '.git', '.wrangler', 'server.js', 'package.json', 'package-lock.json', 'bun.lock'];
for (const bad of prohibited) {
  if (fs.existsSync(path.join(PUBLIC_DIR, bad))) {
    throw new Error(`Prohibited file/directory found in public: ${bad}`);
  }
}

console.log('✅ Production asset build complete! Output directory: ./public');
process.exit(0);
