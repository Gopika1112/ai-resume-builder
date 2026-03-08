const aiResponse = `\`\`\`json
{
  "atsScore": 85,
  "keywordMatch": 80,
  "impactAndMetrics": 90,
  "feedback": ["good"]
}
\`\`\``;

let cleanJson = aiResponse.trim();
if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.replace(/^```json/, '');
}
if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```/, '');
}
if (cleanJson.endsWith('```')) {
    cleanJson = cleanJson.replace(/```$/, '');
}

console.log("CLEANED:");
console.log(cleanJson);
try {
    JSON.parse(cleanJson.trim());
    console.log("PARSE OK");
} catch (e) {
    console.log("PARSE FAIL", e.message);
}
