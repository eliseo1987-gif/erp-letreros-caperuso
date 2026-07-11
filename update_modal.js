const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const newCode = `
async function regenerateMessage() {
    const msgType = document.getElementById('msgType').value;
    const tone = document.getElementById('msgTone').value;
    const subjectEl = document.getElementById('aiMsgSubject');
    const bodyEl = document.getElementById('aiMsgBody');
    const recipient = document.getElementById('aiMsgRecipient').value;
    
    if(!bodyEl) return;
    
    bodyEl.value = "Generando...";
    
    try {
        const prompt = \`
Genera un correo electrónico (Asunto y Cuerpo).
Tipo de mensaje: \${msgType}
Tono: \${tone}
Destinatario: \${recipient || 'Cliente'}

Devuelve la respuesta en formato JSON estricto con las siguientes claves: "asunto" y "cuerpo". No incluyas markdown de bloque de código.\`;

        const response = await fetch('/api/gemini/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        try {
            let jsonText = data.result;
            // Clean markdown format if present
            if(jsonText.startsWith('\`\`\`json')) {
                jsonText = jsonText.replace(/\`\`\`json\\n/g, '').replace(/\`\`\`/g, '');
            }
            const parsed = JSON.parse(jsonText.trim());
            if (subjectEl) subjectEl.value = parsed.asunto;
            bodyEl.value = parsed.cuerpo;
        } catch(e) {
            bodyEl.value = data.result;
        }
        
    } catch (err) {
        bodyEl.value = "Error: " + err.message;
    }
}
`;

code = code.replace(/function regenerateMessage\(\) \{\}/m, newCode.trim());
fs.writeFileSync('app.js', code);
