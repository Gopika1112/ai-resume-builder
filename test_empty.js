const fs = require('fs');

async function testScore() {
    const formData = new FormData();
    // Create an unparsable or empty PDF
    const minimalPdfBase64 = "JVBERi0xLjcKCjEgMCBvYmogICUKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCgkJPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggMAo+PgpzdGFydHhyZWYKMwolJUVPRgo="; // Empty text pdf
    const pdfBuffer = Buffer.from(minimalPdfBase64, 'base64');
    fs.writeFileSync('empty.pdf', pdfBuffer);

    formData.append('resume', new Blob([fs.readFileSync('empty.pdf')]), 'empty.pdf');

    try {
        const res = await fetch('http://localhost:3000/api/score', {
            method: 'POST',
            body: formData
        });

        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Response text:", text);
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

testScore();
