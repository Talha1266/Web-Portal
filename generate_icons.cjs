const sharp = require('sharp');
const fs = require('fs');

async function generate() {
  await sharp('public/logo.jpg')
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toFormat('png')
    .toFile('public/pwa-192x192.png');
    
  await sharp('public/logo.jpg')
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toFormat('png')
    .toFile('public/pwa-512x512.png');
    
  await sharp('public/logo.jpg')
    .resize(144, 144, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toFormat('png')
    .toFile('public/apple-touch-icon-180x180.png');
    
  console.log("Icons generated.");
}

generate();
