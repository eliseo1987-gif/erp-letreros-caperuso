const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Patch showNewQuotationModal
const oldShowNewQuotationModal = `function showNewQuotationModal() {
    navigateToPage('quoter');

    // Clear form and cart for new quotation
    if (document.getElementById('clienteNombre')) {
        document.getElementById('clienteNombre').value = '';
        document.getElementById('clienteEmail').value = '';
        document.getElementById('clienteTelefono').value = '';
        document.getElementById('clienteEmpresa').value = '';
        document.getElementById('editingQuotationId').value = '';
    }`;
const newShowNewQuotationModal = `function showNewQuotationModal() {
    navigateToPage('quoter');

    // Clear form and cart for new quotation
    if (document.getElementById('clienteNombre')) {
        document.getElementById('cotizacionNumero').value = '';
        document.getElementById('clienteNombre').value = '';
        document.getElementById('clienteEmpresaNombre').value = '';
        document.getElementById('clienteRut').value = '';
        document.getElementById('clienteTelefono').value = '';
        document.getElementById('clienteEmail').value = '';
        document.getElementById('clienteDireccion').value = '';
        document.getElementById('clienteGiro').value = '';
        document.getElementById('diasFabricacion').value = '0';
        
        document.getElementById('tipoEnvio').value = 'Monto Manual';
        document.getElementById('costoEnvio').value = '';
        document.getElementById('costoEnvio').style.display = 'block';
        
        document.getElementById('tipoInstalacion').value = 'Monto Manual';
        document.getElementById('costoInstalacion').value = '';
        document.getElementById('costoInstalacion').style.display = 'block';
        
        document.getElementById('editingQuotationId').value = '';
    }`;
code = code.replace(oldShowNewQuotationModal, newShowNewQuotationModal);


fs.writeFileSync('app.js', code);
console.log("Patched methods 1");
