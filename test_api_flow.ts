import puppeteer from 'puppeteer';
import * as fs from 'fs';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/resume/fc750471-b720-4dc6-af71-5858323deac9', { waitUntil: 'networkidle0' });

    // Simulate printing exactly how the user would
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true
    });
    await browser.close();

    fs.writeFileSync('generated_resume.pdf', pdfBuffer);

    // now we upload it
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('resume', blob, 'resume.pdf');

    const res = await fetch('http://localhost:3000/api/score', {
        method: 'POST',
        body: formData
    });

    const text = await res.text();
    console.log("API Response Status:", res.status);
    console.log("API Response Body:", text);
})();
