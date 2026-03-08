import { PDFParse } from 'pdf-parse';
import * as fs from 'fs';

async function test() {
    try {
        console.log("Testing PDF extraction with standard fonts...");
        const pdfBuffer = fs.readFileSync('generated_resume.pdf');

        const pdfParser = new PDFParse({
            data: new Uint8Array(pdfBuffer),
            standardFontDataUrl: 'c:/Users/gopik/OneDrive/Desktop/antigravity/node_modules/pdfjs-dist/standard_fonts/'
        });

        const result = await pdfParser.getText();
        console.log("Extracted Text Length:", result.text.length);
        console.log("Snippet:", result.text.substring(0, 200));

        if (result.text.length > 50) {
            console.log("SUCCESS: Sufficient text extracted.");
        } else {
            console.error("FAILURE: Extraction yielded too little text.");
            process.exit(1);
        }
    } catch (e: any) {
        console.error("Extraction failed:", e.message);
        process.exit(1);
    }
}

test();
