const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const oldGenerateQuotationHTML = `    const ivaRate = 0.19;
    const subtotal = Math.round(quotation.total / (1 + ivaRate));
    const ivaAmount = Math.round(quotation.total - subtotal);
    const envio = 0;
    const instalacion = 0;
    const totalFinal = quotation.total;`;

const newGenerateQuotationHTML = `    const ivaRate = 0.19;
    
    // Calcular totales con los nuevos montos
    let baseTotal = quotation.total || 0;
    
    let costoEnvio = 0;
    if (quotation.envio && quotation.envio.tipo === 'Monto Manual') {
        costoEnvio = parseFloat(quotation.envio.costo) || 0;
    }
    
    let costoInstalacion = 0;
    if (quotation.instalacion && quotation.instalacion.tipo === 'Monto Manual') {
        costoInstalacion = parseFloat(quotation.instalacion.costo) || 0;
    }
    
    const subtotal = Math.round(baseTotal / (1 + ivaRate));
    const ivaAmount = Math.round(baseTotal - subtotal);
    
    const envioDisplay = quotation.envio ? (quotation.envio.tipo === 'Monto Manual' ? formatPrecio(costoEnvio) : quotation.envio.tipo) : '$0';
    const instalacionDisplay = quotation.instalacion ? (quotation.instalacion.tipo === 'Monto Manual' ? formatPrecio(costoInstalacion) : quotation.instalacion.tipo) : '$0';
    
    const totalFinal = baseTotal + costoEnvio + costoInstalacion;
    const diasFabDisplay = quotation.diasFabricacion || 0;`;
code = code.replace(oldGenerateQuotationHTML, newGenerateQuotationHTML);

// Replace the totals table
const oldTotalsTable = `                <div class="totals-section">
                    <table class="totals-table">
                        <tr><td>Subtotal Neto</td><td>\${formatPrecio(subtotal)}</td></tr>
                        <tr><td>IVA (19%)</td><td>\${formatPrecio(ivaAmount)}</td></tr>
                        <tr class="total-row"><td>Total Cotización</td><td>\${formatPrecio(totalFinal)}</td></tr>
                    </table>
                </div>`;
const newTotalsTable = `                <div class="totals-section">
                    <table class="totals-table">
                        <tr><td>Subtotal Neto</td><td>\${formatPrecio(subtotal)}</td></tr>
                        <tr><td>IVA (19%)</td><td>\${formatPrecio(ivaAmount)}</td></tr>
                        <tr><td>Envío</td><td>\${envioDisplay}</td></tr>
                        <tr><td>Instalación</td><td>\${instalacionDisplay}</td></tr>
                        <tr class="total-row"><td>Total Cotización</td><td>\${formatPrecio(totalFinal)}</td></tr>
                    </table>
                    <div style="margin-top: 1rem; text-align: right; font-size: 0.85rem; color: var(--gray);">
                        <strong>Tiempo de Fabricación:</strong> \${diasFabDisplay} días hábiles
                    </div>
                </div>`;
code = code.replace(oldTotalsTable, newTotalsTable);

fs.writeFileSync('app.js', code);
console.log("Patched methods 3");
