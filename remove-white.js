const fs = require('fs');
const { createCanvas, loadImage } = require('canvas'); // We will install canvas

async function processImage() {
    const inputPath = './src/assets/doodles/Crown and Sparkle Doodle Stickers.png';
    const outputPath = './src/assets/doodles/Crown and Sparkle Doodle Stickers.png';

    const image = await loadImage(inputPath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Make white (and near-white) transparent
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // If it's very bright (white-ish), make it transparent
        if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // Alpha to 0
        }
    }

    ctx.putImageData(imageData, 0, 0);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log("White background removed.");
}

processImage().catch(console.error);
