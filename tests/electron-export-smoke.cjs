const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { app } = require('electron');
const { renderDocumentPdf } = require('../dist/main/services/pdf-renderer.js');

app.whenReady().then(async () => {
  let temporaryDirectory;
  try {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-export-smoke-'));
    const outputPath = path.join(temporaryDirectory, 'edited-document.pdf');
    const pdf = await renderDocumentPdf('Export smoke test', 'This is real edited document content.');
    fs.writeFileSync(outputPath, pdf);

    const signature = fs.readFileSync(outputPath).subarray(0, 5).toString('ascii');
    if (signature !== '%PDF-') {
      throw new Error(`Unexpected PDF signature: ${signature}`);
    }

    console.log(`PDF export smoke test passed (${fs.statSync(outputPath).size} bytes).`);
    app.exit(0);
  } catch (error) {
    console.error(error);
    app.exit(1);
  } finally {
    if (temporaryDirectory) {
      fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  }
});
