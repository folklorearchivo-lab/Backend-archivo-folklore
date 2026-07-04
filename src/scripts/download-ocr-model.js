const { createWorker } = require('tesseract.js');

async function downloadModel() {
  console.log('Downloading Spanish OCR model (spa.traineddata)...\n');

  const worker = await createWorker('spa');
  await worker.terminate();

  console.log('OCR model downloaded and ready.');
}

downloadModel().catch(err => {
  console.error('Failed to download OCR model:', err.message);
  process.exit(1);
});
