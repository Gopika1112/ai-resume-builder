import puppeteer from 'puppeteer';
import { PDFParse } from 'pdf-parse';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/resume/fc750471-b720-4dc6-af71-5858323deac9', { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    const pdfParser = new PDFParse({ data: pdfBuffer });
    try {
        const textResult = await pdfParser.getText();
        console.log("Extracted Text Length:", textResult.text.length);
        console.log("Extracted Text Snippet:", textResult.text.substring(0, 500));
        if (textResult.text.length < 50) {
            console.log("Not enough text extracted!");
        }
    } catch (e: any) {
        console.error("Parse Error:", e.message);
    }
})();
