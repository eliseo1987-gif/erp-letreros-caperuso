const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

code = code.replace('<div class="card" style="margin-top: 2rem; background: var(--white);">', '<div class="card" style="margin-top: 2rem;">');
code = code.replace('<div style="background: var(--white); padding: 1.5rem; border-radius: 12px; margin-top: 1rem;">', '<div style="background: var(--bg-card); padding: 1.5rem; border-radius: 12px; margin-top: 1rem; border: 1px solid var(--border-color);">');

fs.writeFileSync('app.js', code);
console.log("Patched background colors");
