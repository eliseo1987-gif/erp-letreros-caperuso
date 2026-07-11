const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const oldEditQuotation = `    // Populate client data
    if (quotation.cliente) {
        document.getElementById('clienteNombre').value = quotation.cliente.nombre || '';
        document.getElementById('clienteEmail').value = quotation.cliente.email || '';
        document.getElementById('clienteTelefono').value = quotation.cliente.telefono || '';
        document.getElementById('clienteEmpresa').value = quotation.cliente.empresa || '';
    }`;
const newEditQuotation = `    // Populate client data
    if (quotation.cliente) {
        document.getElementById('cotizacionNumero').value = quotation.numero || '';
        document.getElementById('clienteNombre').value = quotation.cliente.nombre || '';
        document.getElementById('clienteEmpresaNombre').value = quotation.cliente.empresa || '';
        document.getElementById('clienteRut').value = quotation.cliente.rut || '';
        document.getElementById('clienteTelefono').value = quotation.cliente.telefono || '';
        document.getElementById('clienteEmail').value = quotation.cliente.email || '';
        document.getElementById('clienteDireccion').value = quotation.cliente.direccion || '';
        document.getElementById('clienteGiro').value = quotation.cliente.giro || '';
        document.getElementById('diasFabricacion').value = quotation.diasFabricacion || 0;
        
        if (quotation.envio) {
            document.getElementById('tipoEnvio').value = quotation.envio.tipo || 'Monto Manual';
            document.getElementById('costoEnvio').value = quotation.envio.costo || '';
            document.getElementById('costoEnvio').style.display = document.getElementById('tipoEnvio').value === 'Monto Manual' ? 'block' : 'none';
        }
        
        if (quotation.instalacion) {
            document.getElementById('tipoInstalacion').value = quotation.instalacion.tipo || 'Monto Manual';
            document.getElementById('costoInstalacion').value = quotation.instalacion.costo || '';
            document.getElementById('costoInstalacion').style.display = document.getElementById('tipoInstalacion').value === 'Monto Manual' ? 'block' : 'none';
        }
    }`;
code = code.replace(oldEditQuotation, newEditQuotation);


const oldFinalizarCotizacionClear = `    // Clear inputs
    document.getElementById('clienteNombre').value = '';
    document.getElementById('clienteEmail').value = '';
    document.getElementById('clienteTelefono').value = '';
    document.getElementById('clienteEmpresa').value = '';
    document.getElementById('editingQuotationId').value = '';`;
const newFinalizarCotizacionClear = `    // Clear inputs
    if(document.getElementById('cotizacionNumero')) document.getElementById('cotizacionNumero').value = '';
    document.getElementById('clienteNombre').value = '';
    document.getElementById('clienteEmpresaNombre').value = '';
    document.getElementById('clienteRut').value = '';
    document.getElementById('clienteTelefono').value = '';
    document.getElementById('clienteEmail').value = '';
    document.getElementById('clienteDireccion').value = '';
    document.getElementById('clienteGiro').value = '';
    document.getElementById('diasFabricacion').value = '0';
    document.getElementById('costoEnvio').value = '';
    document.getElementById('tipoEnvio').value = 'Monto Manual';
    document.getElementById('costoEnvio').style.display = 'block';
    document.getElementById('costoInstalacion').value = '';
    document.getElementById('tipoInstalacion').value = 'Monto Manual';
    document.getElementById('costoInstalacion').style.display = 'block';
    document.getElementById('editingQuotationId').value = '';`;
code = code.replace(oldFinalizarCotizacionClear, newFinalizarCotizacionClear);


const oldFinalizarCotizacionClient = `    const clientData = {
        nombre: document.getElementById('clienteNombre').value,
        email: document.getElementById('clienteEmail').value,
        telefono: document.getElementById('clienteTelefono').value,
        empresa: document.getElementById('clienteEmpresa').value
    };`;
const newFinalizarCotizacionClient = `    const manualNumero = document.getElementById('cotizacionNumero').value;
    const clientData = {
        nombre: document.getElementById('clienteNombre').value,
        empresa: document.getElementById('clienteEmpresaNombre').value,
        rut: document.getElementById('clienteRut').value,
        telefono: document.getElementById('clienteTelefono').value,
        email: document.getElementById('clienteEmail').value,
        direccion: document.getElementById('clienteDireccion').value,
        giro: document.getElementById('clienteGiro').value
    };
    
    const diasFabricacion = parseInt(document.getElementById('diasFabricacion').value) || 0;
    const envio = {
        tipo: document.getElementById('tipoEnvio').value,
        costo: parseFloat(document.getElementById('costoEnvio').value) || 0
    };
    const instalacion = {
        tipo: document.getElementById('tipoInstalacion').value,
        costo: parseFloat(document.getElementById('costoInstalacion').value) || 0
    };`;
code = code.replace(oldFinalizarCotizacionClient, newFinalizarCotizacionClient);

// Patch the update and create sections to include new fields
const oldFinalizarUpdate = `            CRM.quotations[index].items = [...carrito];
            CRM.quotations[index].total = total;
            CRM.quotations[index].cliente = clientData;

            showNotification(\`✅ Cotización #\${CRM.quotations[index].numero} actualizada\`, 'success');`;
const newFinalizarUpdate = `            CRM.quotations[index].items = [...carrito];
            CRM.quotations[index].total = total;
            CRM.quotations[index].cliente = clientData;
            CRM.quotations[index].diasFabricacion = diasFabricacion;
            CRM.quotations[index].envio = envio;
            CRM.quotations[index].instalacion = instalacion;
            if(manualNumero) CRM.quotations[index].numero = manualNumero;

            showNotification(\`✅ Cotización #\${CRM.quotations[index].numero} actualizada\`, 'success');`;
code = code.replace(oldFinalizarUpdate, newFinalizarUpdate);


const oldFinalizarCreate = `        const quotation = {
            id: generateId(),
            numero: numero,
            fecha: new Date().toISOString(),
            items: [...carrito],
            total: total,
            status: 'borrador',
            cliente: clientData
        };`;
const newFinalizarCreate = `        const quotation = {
            id: generateId(),
            numero: manualNumero || numero,
            fecha: new Date().toISOString(),
            items: [...carrito],
            total: total,
            status: 'borrador',
            cliente: clientData,
            diasFabricacion: diasFabricacion,
            envio: envio,
            instalacion: instalacion
        };`;
code = code.replace(oldFinalizarCreate, newFinalizarCreate);


fs.writeFileSync('app.js', code);
console.log("Patched methods 2");
