const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const startIndex = code.indexOf('<!-- Cerebro IA® Page');
const endIndex = code.indexOf('<!-- Settings Page -->');

if (startIndex !== -1 && endIndex !== -1) {
    code = code.substring(0, startIndex) + code.substring(endIndex);
    fs.writeFileSync('index.html', code);
    console.log("Removed section");
} else {
    console.log("Section not found", startIndex, endIndex);
}
