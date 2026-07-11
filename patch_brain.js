const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const navItem = `                <a class="nav-item" data-page="brain-ia">
                    <i class="fas fa-brain"></i>
                    <span>Cerebro IA®</span>
                </a>`;

code = code.replace(navItem, '');
fs.writeFileSync('index.html', code);
console.log("Removed nav item");
