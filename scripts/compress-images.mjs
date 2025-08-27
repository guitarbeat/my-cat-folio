// Image compression script using Sharp
// - Recompresses JPG/JPEG/PNG in public/images in-place (lower quality, progressive)
// - Also emits WebP and AVIF variants next to originals

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const IMAGES_DIR = path.resolve(process.cwd(), 'public', 'images');
const MAX_WIDTH = Number(process.env.MAX_WIDTH || 1600);
const JPEG_QUALITY = Number(process.env.JPEG_QUALITY || 74);
const PNG_QUALITY = Number(process.env.PNG_QUALITY || 72);
const WEBP_QUALITY = Number(process.env.WEBP_QUALITY || 74);
const AVIF_QUALITY = Number(process.env.AVIF_QUALITY || 50);

/**
 * Recursively list files in a directory
 */
function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(full));
    else files.push(full);
  }
  return files;
}

function isTarget(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.gif') return false; // skip animated gif for now
  return ['.jpg', '.jpeg', '.png'].includes(ext);
}

async function compressFile(file) {
  const ext = path.extname(file).toLowerCase();
  const base = file.slice(0, -ext.length);

  const input = sharp(file);
  const meta = await input.metadata();

  // Resize down if wider than MAX_WIDTH
  let pipeline = input;
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH });
  }

  // Re-encode original format in-place
  if (ext === '.jpg' || ext === '.jpeg') {
    await pipeline
      .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
      .toFile(file + '.tmp');
  } else if (ext === '.png') {
    await pipeline
      .png({ quality: PNG_QUALITY, compressionLevel: 9 })
      .toFile(file + '.tmp');
  }

  fs.renameSync(file + '.tmp', file);

  // Emit WebP
  await (meta.width && meta.width > MAX_WIDTH
    ? input.resize({ width: MAX_WIDTH })
    : input
  )
    .webp({ quality: WEBP_QUALITY })
    .toFile(base + '.webp');

  // Emit AVIF (smaller, slower)
  await (meta.width && meta.width > MAX_WIDTH
    ? input.resize({ width: MAX_WIDTH })
    : input
  )
    .avif({ quality: AVIF_QUALITY })
    .toFile(base + '.avif');
}

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('No public/images directory found');
    process.exit(1);
  }

  const files = listFiles(IMAGES_DIR).filter(isTarget);
  if (files.length === 0) {
    console.log('No compressible images found.');
    return;
  }

  console.log(`Found ${files.length} images. Compressing...`);
  for (const file of files) {
    try {
      const before = fs.statSync(file).size;
      await compressFile(file);
      const after = fs.statSync(file).size;
      const saved = (((before - after) / before) * 100).toFixed(1);
      console.log(`✔ ${path.basename(file)}: ${(before/1024/1024).toFixed(2)}MB → ${(after/1024/1024).toFixed(2)}MB (-${saved}%)`);
    } catch (e) {
      console.warn(`⚠ Failed to compress ${file}:`, e.message);
    }
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

