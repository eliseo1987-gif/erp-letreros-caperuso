const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// 1. Replace loadQuoterContent (from line 1361 to 1386)
const oldQuoterContent = `        <div class="card" style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1.5rem; color: var(--primary);">DATOS DEL CLIENTE</h3>
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">Nombre Cliente / Empresa:</label>
                    <input type="text" id="clienteNombre" class="form-control" placeholder="Ej: Juan Pérez">
                </div>
                <div class="form-group">
                    <label class="form-label">Email:</label>
                    <input type="email" id="clienteEmail" class="form-control" placeholder="cliente@email.com">
                </div>
                <div class="form-group">
                    <label class="form-label">Teléfono:</label>
                    <input type="tel" id="clienteTelefono" class="form-control" placeholder="+56 9 ...">
                </div>
                <div class="form-group">
                    <label class="form-label">RUT / Empresa:</label>
                    <input type="text" id="clienteEmpresa" class="form-control" placeholder="77.123.456-7">
                </div>
            </div>
            <input type="hidden" id="editingQuotationId" value="">
        </div>`;

const newQuoterContent = `        <div class="card" style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1.5rem; color: var(--primary);">DATOS DEL CLIENTE</h3>
            <div class="grid grid-2">
                <div class="form-group">
                    <label class="form-label">N° de Cotización:</label>
                    <input type="text" id="cotizacionNumero" class="form-control" placeholder="Ej: 0001">
                </div>
                <div class="form-group">
                    <label class="form-label">Nombre del Cliente:</label>
                    <input type="text" id="clienteNombre" class="form-control" placeholder="Ej: Juan Pérez">
                </div>
                <div class="form-group">
                    <label class="form-label">Empresa:</label>
                    <input type="text" id="clienteEmpresaNombre" class="form-control" placeholder="Nombre de la empresa">
                </div>
                <div class="form-group">
                    <label class="form-label">RUT Empresa:</label>
                    <input type="text" id="clienteRut" class="form-control" placeholder="77.123.456-7">
                </div>
                <div class="form-group">
                    <label class="form-label">Teléfono:</label>
                    <input type="tel" id="clienteTelefono" class="form-control" placeholder="+56 9 ...">
                </div>
                <div class="form-group">
                    <label class="form-label">Email:</label>
                    <input type="email" id="clienteEmail" class="form-control" placeholder="cliente@email.com">
                </div>
                <div class="form-group">
                    <label class="form-label">Dirección:</label>
                    <input type="text" id="clienteDireccion" class="form-control" placeholder="Av. Principal 123">
                </div>
                <div class="form-group">
                    <label class="form-label">Giro:</label>
                    <input type="text" id="clienteGiro" class="form-control" placeholder="Venta de intangibles">
                </div>
                <div class="form-group">
                    <label class="form-label">Días de Fabricación:</label>
                    <input type="number" id="diasFabricacion" class="form-control" value="0">
                </div>
                <div class="form-group">
                    <!-- Placeholder to align grid -->
                </div>
                <div class="form-group">
                    <label class="form-label">Costo de Envío:</label>
                    <select id="tipoEnvio" class="form-control" onchange="document.getElementById('costoEnvio').style.display = this.value === 'Monto Manual' ? 'block' : 'none'">
                        <option value="Monto Manual">Monto Manual</option>
                        <option value="Retiro en Tienda">Retiro en Tienda</option>
                        <option value="Envio Gratis">Envío Gratis</option>
                    </select>
                    <input type="number" id="costoEnvio" class="form-control" placeholder="Monto Envío" style="margin-top: 0.5rem; display: block;">
                </div>
                <div class="form-group">
                    <label class="form-label">Costo de Instalación:</label>
                    <select id="tipoInstalacion" class="form-control" onchange="document.getElementById('costoInstalacion').style.display = this.value === 'Monto Manual' ? 'block' : 'none'">
                        <option value="Monto Manual">Monto Manual</option>
                        <option value="Sin Instalación">Sin Instalación</option>
                    </select>
                    <input type="number" id="costoInstalacion" class="form-control" placeholder="Monto Instalación" style="margin-top: 0.5rem; display: block;">
                </div>
            </div>
            <input type="hidden" id="editingQuotationId" value="">
        </div>`;

code = code.replace(oldQuoterContent, newQuoterContent);

fs.writeFileSync('app.js', code);
console.log("Patched loadQuoterContent");
