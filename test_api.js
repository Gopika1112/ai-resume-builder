const fs = require('fs');

async function testScore() {
    const fileData = fs.readFileSync('dummy.pdf');
    try {
        const pdf = require('pdf-parse');
        const result = await pdf(fileData);
        console.log("Extracted text:", result.text);
    } catch (e) {
        console.error("Parse error:", e);
    }
}

testScore();
