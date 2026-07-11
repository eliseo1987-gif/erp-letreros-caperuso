const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const oldCard = `<div class="card">
            <h3 style="margin-bottom: 2rem; color: var(--primary);">PRECIOS DE MATERIALES</h3>
            <div class="materiales-container" id="materialesContainer"></div>
        </div>`;
const newCard = `<div class="card" style="display: none;">
            <h3 style="margin-bottom: 2rem; color: var(--primary);">PRECIOS DE MATERIALES</h3>
            <div class="materiales-container" id="materialesContainer"></div>
        </div>`;

code = code.replace(oldCard, newCard);
fs.writeFileSync('app.js', code);
console.log("Patched prices card visibility");
