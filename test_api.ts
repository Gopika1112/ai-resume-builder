import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function testPdfParse() {
    const file = fs.readFileSync('dummy.pdf');
    const arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
    const pdfParser = new PDFParse({ data: new Uint8Array(arrayBuffer) });

    try {
        const textResult = await pdfParser.getText();
        console.log("Extracted length:", textResult.text.length);
        console.log("Extracted text snippet:", textResult.text.substring(0, 500));
    } catch (e: any) {
        console.error("Parse error:", e.message);
    }
}

testPdfParse();
