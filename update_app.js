const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const newCode = `
async function generateIAPageMessage() {
    const output = document.getElementById('iaOutputBody');
    const logArea = document.getElementById('iaNeuralLogContent');
    const btn = document.getElementById('generateIAMsgBtn');
    
    if(!output) return;
    
    // Get form data
    const msgType = document.getElementById('iaMsgType').value;
    const framework = document.getElementById('iaFrameworkSelect').value;
    const goal = document.getElementById('iaGoalSelect').value;
    const tone = document.getElementById('iaMsgTone').value;
    const length = document.getElementById('iaMsgLength').value;
    const recipient = document.getElementById('iaOutputRecipient').value;
    const subject = document.getElementById('iaOutputSubject').value;
    const context = document.getElementById('brainDirectivesInput') ? document.getElementById('brainDirectivesInput').value : "Eres Zenith IA.";
    
    output.value = "Iniciando protocolo de generación neuronal... por favor espere.";
    if (logArea) logArea.innerHTML += "<br>[SYS] Contactando red neuronal (Gemini 2.5 Flash)...";
    if (btn) btn.disabled = true;
    
    try {
        const prompt = \`
Genera un mensaje de correo electrónico para un cliente corporativo de una empresa de letreros (Letreros Caperuso).
Destinatario: \${recipient || 'Cliente'}
Asunto propuesto: \${subject || 'Propuesta de Letreros'}
Tipo de mensaje: \${msgType}
Estrategia/Framework: \${framework}
Objetivo: \${goal}
Tono: \${tone}
Extensión: \${length}

Escribe únicamente el cuerpo del correo, sin explicaciones extra. Usa el asunto sugerido si aplica.\`;

        const response = await fetch('/api/gemini/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt,
                systemInstruction: context
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || "Error en el servidor");
        }
        
        output.value = data.result;
        if (logArea) logArea.innerHTML += "<br>[SYS] <span style='color:#00ff88'>Protocolo Completado Exitosamente.</span>";
        
    } catch (err) {
        console.error(err);
        output.value = "Error: " + err.message;
        if (logArea) logArea.innerHTML += "<br>[SYS] <span style='color:#ff4444'>Error de conexión neuronal: " + err.message + "</span>";
    } finally {
        if (btn) btn.disabled = false;
    }
}
`;

// Replace the old mock function
code = code.replace(/function generateIAPageMessage\(\) \{[\s\S]*?\n\}/m, newCode.trim());

fs.writeFileSync('app.js', code);
console.log("Updated app.js");
