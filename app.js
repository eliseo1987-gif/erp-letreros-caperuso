// ===================================
// CRM LETREROS CAPERUSO
// Sistema de Gestión Comercial
// ===================================

// ============= DATA STRUCTURE =============
let CRM = {
    customers: [],
    quotations: [],
    tasks: [],
    pipeline: [],
    settings: {
        companyName: 'LETREROS CAPERUSO',
        companyRut: '76.491.931-9',
        companyAddress: 'AV 18 SEPTIEMBRE 1350, PAINE, RM',
        companyPhone: '(+56) 9 8999 7253',
        companyWeb: 'WWW.LETREROSCAPERUSO.CL'
    }
};

// Precios de materiales (mantiene la estructura original)
let precios = {
    placas: {
        'SIN PLACA': 0,
        'ALUMINIO 3MM': 16056,
        'ALUMINIO 4MM': 20833,
        'TROVICEL 3MM': 4167,
        'TROVICEL 5MM': 8681,
        'TROVICEL 10MM': 12153,
        'ACRÍLICO 3MM': 20833,
        'ACRÍLICO 6MM': 55000,
        'ACRÍLICO 10MM': 95000,
        'IMANTADO 0.5MM': 15000,
        'PENDÓN ROLLER 80X200CM': 12500,
        'PENDÓN ROLLER 100X200CM': 15500
    },
    adhesivos: {
        'SIN ADHESIVO': 0,
        'ADHESIVO NORMAL': 1800,
        'ADH REFLECTANTE ING': 6000,
        'ADH REFLECTANTE ALTA INTENSIDAD': 30000,
        'ADH FOTOLUMINISCENTE': 29970,
        'TELA PVC': 6000,
        'DUSTED METAMARK': 12000,
        'LAMINADO TRANSPARENTE NORMAL': 1800,
        'LAMINADO TRANSPARENTE LG': 9000,
        'MALLA MESH': 17500
    },
    laminados: {
        'SIN LAMINADO': 0,
        'LAMINADO NORMAL': 1800,
        'LAMINADO LG': 9000,
        'LAMINADO FLOOR GRAPHICS': 12000
    },
    anclajes: {
        'SIN ANCLAJE': 0,
        'CINTA TESA 4965 12MM': 400,
        'CINTA 3M VHB 4910 12MM TRANSPARENTE': 2300,
        'CINTA 3M VHB – DE USO GENERAL 5952 12MM': 1750
    },
    impresion: 1400
};

let shippingPrices = {
    'retiro': 0,
    'privado': 15000,
    'starkenSucursal': 8000,
    'starkenDomicilio': 12000
};

// Carrito temporal para cotizaciones
let carrito = [];

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', function () {
    loadData();
    initializeNavigation();
    initializeCharts();
    updateDashboard();
    loadQuoterContent();
});

// ============= LOCAL STORAGE =============
function loadData() {
    const saved = localStorage.getItem('crmCaperuso');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            CRM = { ...CRM, ...data };
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }

    // Load precios separately
    const savedPrecios = localStorage.getItem('preciosMateriales');
    if (savedPrecios) {
        try {
            precios = JSON.parse(savedPrecios);
        } catch (e) {
            console.error('Error loading prices:', e);
        }
    }
}

function saveData() {
    localStorage.setItem('crmCaperuso', JSON.stringify(CRM));
    localStorage.setItem('preciosMateriales', JSON.stringify(precios));
}

function exportAllData() {
    const data = {
        crm: CRM,
        precios: precios,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caperuso-crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('✅ Datos exportados exitosamente', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                CRM = data.crm;
                precios = data.precios;
                saveData();
                location.reload();
            } catch (error) {
                showNotification('❌ Error al importar datos', 'danger');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    if (confirm('⚠️ ¿Estás seguro de eliminar todos los datos? Esta acción no se puede deshacer.')) {
        if (confirm('⚠️ ÚLTIMA CONFIRMACIÓN: ¿Realmente deseas eliminar TODOS los datos?')) {
            localStorage.clear();
            location.reload();
        }
    }
}

// ============= NAVIGATION =============
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const page = this.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
        });
    });
}

function navigateToPage(pageName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');

    // Update pages
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(pageName)?.classList.add('active');

    // Load page-specific content
    switch (pageName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'customers':
            loadCustomersTable();
            break;
        case 'quotations':
            loadQuotationsTable();
            break;
        case 'pipeline':
            loadPipeline();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'reports':
            updateReports();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// ============= DASHBOARD =============
function updateDashboard() {
    // Update stats
    const totalSales = CRM.quotations
        .filter(q => q.status === 'aprobada')
        .reduce((sum, q) => sum + (q.total || 0), 0);

    document.getElementById('monthSales').textContent = formatPrecio(totalSales);
    document.getElementById('totalCustomers').textContent = CRM.customers.length;
    document.getElementById('activeQuotations').textContent = CRM.quotations.filter(q => q.status !== 'aprobada' && q.status !== 'rechazada').length;

    // Update badges
    document.getElementById('customersCount').textContent = CRM.customers.length;
    document.getElementById('quotationsCount').textContent = CRM.quotations.length;

    // Load activity feed
    loadActivityFeed();

    // Update charts
    updateSalesChart();
}

function loadActivityFeed() {
    const feed = document.getElementById('activityFeed');

    if (CRM.quotations.length === 0 && CRM.customers.length === 0) {
        feed.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No hay actividad reciente</h3>
                <p>Las actividades aparecerán aquí</p>
            </div>
        `;
        return;
    }

    let activities = [];

    // Add recent quotations
    CRM.quotations.slice(-5).reverse().forEach(q => {
        activities.push({
            type: 'quotation',
            icon: 'fa-file-invoice',
            color: 'var(--gradient-1)',
            title: `Cotización #${q.numero} creada`,
            time: timeAgo(q.fecha)
        });
    });

    // Add recent customers
    CRM.customers.slice(-3).reverse().forEach(c => {
        activities.push({
            type: 'customer',
            icon: 'fa-user-plus',
            color: 'var(--gradient-3)',
            title: `Cliente ${c.nombre} agregado`,
            time: timeAgo(c.createdAt)
        });
    });

    feed.innerHTML = activities.map(a => `
        <div class="activity-item">
            <div class="activity-icon" style="background: ${a.color};">
                <i class="fas ${a.icon}" style="color: white;"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${a.title}</div>
                <div class="activity-time">${a.time}</div>
            </div>
        </div>
    `).join('');
}

// ============= CUSTOMERS =============
function showNewCustomerModal() {
    document.getElementById('newCustomerModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Form submission for new customer
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('newCustomerForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const customer = {
                id: generateId(),
                nombre: formData.get('nombre'),
                empresa: formData.get('empresa'),
                rut: formData.get('rut'),
                telefono: formData.get('telefono'),
                correo: formData.get('correo'),
                giro: formData.get('giro'),
                direccion: formData.get('direccion'),
                notas: formData.get('notas'),
                createdAt: new Date().toISOString(),
                totalSales: 0,
                quotationsCount: 0,
                status: 'activo'
            };

            CRM.customers.push(customer);
            saveData();

            closeModal('newCustomerModal');
            this.reset();

            showNotification('✅ Cliente agregado exitosamente', 'success');

            if (document.getElementById('customers').classList.contains('active')) {
                loadCustomersTable();
            }
            updateDashboard();
        });
    }
});

function loadCustomersTable() {
    const tbody = document.getElementById('customersTableBody');

    if (CRM.customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No hay clientes registrados</h3>
                        <p>Comienza agregando tu primer cliente</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = CRM.customers.map(c => `
        <tr>
            <td><input type="checkbox" class="customer-checkbox" value="${c.id}"></td>
            <td>
                <div class="customer-profile">
                    <div class="customer-avatar">${getInitials(c.nombre)}</div>
                    <div class="customer-info">
                        <h4>${c.nombre}</h4>
                        <p>${c.correo}</p>
                    </div>
                </div>
            </td>
            <td>${c.empresa || '-'}</td>
            <td>
                ${c.telefono}<br>
                <small style="color: var(--gray);">${c.correo}</small>
            </td>
            <td>${c.quotationsCount || 0}</td>
            <td>${formatPrecio(c.totalSales || 0)}</td>
            <td><span class="badge badge-success">Activo</span></td>
            <td>
                <button class="btn btn-sm" onclick="editCustomer('${c.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm" onclick="viewCustomer('${c.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: var(--gradient-3);">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function editCustomer(id) {
    const customer = CRM.customers.find(c => c.id === id);
    if (customer) {
        // TODO: Implement edit modal
        showNotification('🔧 Función de edición en desarrollo', 'warning');
    }
}

function viewCustomer(id) {
    const customer = CRM.customers.find(c => c.id === id);
    if (customer) {
        // TODO: Implement customer detail view
        showNotification('🔧 Vista de detalle en desarrollo', 'warning');
    }
}

// ============= QUOTATIONS =============
function showNewQuotationModal() {
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
    }

    // Optional: Ask if clear cart? For now we force clear for clean state
    carrito = [];
    if (document.getElementById('carrito')) {
        actualizarCarrito();
    }
}

function loadQuotationsTable() {
    const tbody = document.getElementById('quotationsTableBody');

    if (CRM.quotations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="fas fa-file-invoice"></i>
                        <h3>No hay cotizaciones</h3>
                        <p>Crea tu primera cotización</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = CRM.quotations.map(q => {
        const statusBadge = {
            'borrador': 'badge-warning',
            'enviada': 'badge-primary',
            'aprobada': 'badge-success',
            'rechazada': 'badge-danger'
        }[q.status] || 'badge-warning';

        const approveButton = q.status !== 'aprobada' ? `
            <button class="btn btn-sm" onclick="approveQuotation('${q.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: var(--gradient-4); color: white; margin-right: 0.5rem; box-shadow: 0 2px 8px rgba(67, 233, 123, 0.3);" title="Aprobar y Pasar a Pipeline">
                <i class="fas fa-check-circle"></i> Aprobar
            </button>
        ` : `
            <span class="badge badge-success" style="padding: 0.5rem 1rem; margin-right: 0.5rem;">
                <i class="fas fa-check-circle"></i> Aprobada
            </span>
        `;


        return `
            <tr>
                <td><input type="checkbox" class="quotation-checkbox" value="${q.id}"></td>
                <td><strong>#${q.numero}</strong></td>
                <td>${q.cliente?.nombre || 'Sin cliente'}</td>
                <td>${formatDate(q.fecha)}</td>
                <td>${q.items?.length || 0}</td>
                <td><strong>${formatPrecio(q.total)}</strong></td>
                <td><span class="badge ${statusBadge}">${q.status}</span></td>
                <td>
                    ${approveButton}
                    <button class="btn btn-sm" onclick="editQuotation('${q.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: var(--warning); color: var(--dark); margin-right: 0.5rem;" title="Editar Cotización">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm" onclick="viewQuotation('${q.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;" title="Ver Detalle">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm" onclick="printQuotation('${q.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem; background: var(--gradient-2);" title="Imprimir">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewQuotation(id) {
    const quotation = CRM.quotations.find(q => q.id === id);
    if (!quotation) {
        showNotification('❌ Cotización no encontrada', 'danger');
        return;
    }

    const modalBody = document.getElementById('quotationModalBody');
    modalBody.innerHTML = generateQuotationHTML(quotation);

    // Store current quotation ID for buttons in modal
    modalBody.dataset.quotationId = id;

    // Handle Approve button visibility
    const approveBtn = document.getElementById('modalApproveBtn');
    if (approveBtn) {
        approveBtn.style.display = quotation.status === 'aprobada' ? 'none' : 'block';
    }

    document.getElementById('quotationModal').classList.add('active');
}

function approveFromModal() {
    const modalBody = document.getElementById('quotationModalBody');
    const id = modalBody.dataset.quotationId;
    if (id) {
        closeModal('quotationModal');
        approveQuotation(id);
    }
}

function printQuotation(id) {
    const quotation = CRM.quotations.find(q => q.id === id);
    if (!quotation) {
        showNotification('❌ Cotización no encontrada', 'danger');
        return;
    }

    const content = generateQuotationHTML(quotation, true);

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Cotización N° ${quotation.numero}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                :root {
                    --primary: #ff0055;
                    --dark: #1a1a2e;
                    --dark-light: #16213e;
                    --gray: #6c757d;
                    --gray-light: #e9ecef;
                    --white: #ffffff;
                }
                body { 
                    font-family: 'Inter', sans-serif; 
                    font-size: 11px; 
                    color: var(--dark); 
                    margin: 0;
                    padding: 0;
                }
                .quotation-document { padding: 40px; max-width: 800px; margin: auto; }
                
                .doc-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                    border-bottom: 2px solid var(--gray-light);
                    padding-bottom: 1rem;
                }

                .doc-title {
                    font-size: 24px;
                    font-weight: 800;
                    color: var(--primary);
                    margin-bottom: 5px;
                }

                .section-header {
                    background: var(--gray-light) !important;
                    padding: 8px 15px;
                    font-weight: 700;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 20px 0 10px 0;
                    border-radius: 8px;
                    color: var(--dark-light);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    -webkit-print-color-adjust: exact;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 20px;
                }

                .info-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .info-table td {
                    padding: 6px 0;
                    border-bottom: 1px solid var(--gray-light);
                }

                .info-table .label {
                    font-weight: 600;
                    color: var(--gray);
                    width: 120px;
                }

                .items-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin-bottom: 25px;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid var(--gray-light);
                }

                .items-table th {
                    background: var(--dark-light) !important;
                    color: var(--white) !important;
                    padding: 12px 10px;
                    text-align: left;
                    font-size: 10px;
                    font-weight: 600;
                    -webkit-print-color-adjust: exact;
                }

                .items-table td {
                    padding: 10px;
                    border-bottom: 1px solid var(--gray-light);
                    font-size: 10px;
                }

                .totals-section {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 15px;
                }

                .totals-table {
                    width: 300px;
                    border-collapse: collapse;
                }

                .totals-table td {
                    padding: 8px 15px;
                    font-size: 11px;
                }

                .total-row {
                    background: var(--primary) !important;
                    color: var(--white) !important;
                    font-weight: 800;
                    font-size: 14px;
                    -webkit-print-color-adjust: exact;
                }
                
                .total-row td { border-radius: 8px; }

                .materials-summary {
                    background: #f8f9fa !important;
                    border-radius: 12px;
                    padding: 15px;
                    border: 1px dashed var(--gray);
                    -webkit-print-color-adjust: exact;
                }

                .terms-box {
                    font-size: 10px;
                    color: var(--gray);
                    line-height: 1.5;
                    background: #fff9fa !important;
                    padding: 15px;
                    border-radius: 12px;
                    border-left: 4px solid var(--primary);
                    -webkit-print-color-adjust: exact;
                }

                .terms-box h3 {
                    color: var(--primary);
                    margin: 0 0 8px 0;
                    font-size: 11px;
                }

                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .quotation-document { padding: 0; }
                }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

function printCurrentQuotation() {
    const modalBody = document.getElementById('quotationModalBody');
    const id = modalBody.dataset.quotationId;
    if (id) {
        printQuotation(id);
    }
}

function generateQuotationHTML(quotation, forPrint = false) {
    const client = quotation.cliente || {};
    const ivaRate = 0.19;
    
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
    const diasFabDisplay = quotation.diasFabricacion || 0;

    const materials = { placas: {}, adhesivos: {}, laminados: {} };
    let totalArea = 0;

    const itemsHtml = quotation.items.map((item, index) => {
        if (item.detalles.placa.tipo !== 'SIN PLACA') {
            materials.placas[item.detalles.placa.tipo] = (materials.placas[item.detalles.placa.tipo] || 0) + (item.detalles.area * item.cantidad);
        }
        if (item.detalles.adhesivo.tipo !== 'SIN ADHESIVO') {
            materials.adhesivos[item.detalles.adhesivo.tipo] = (materials.adhesivos[item.detalles.adhesivo.tipo] || 0) + (item.detalles.area * item.cantidad);
        }
        if (item.detalles.laminado.tipo !== 'SIN LAMINADO') {
            materials.laminados[item.detalles.laminado.tipo] = (materials.laminados[item.detalles.laminado.tipo] || 0) + (item.detalles.area * item.cantidad);
        }
        totalArea += (item.detalles.area * item.cantidad);

        return `
            <tr>
                <td>${index + 1}</td>
                <td style="font-weight:600">${item.nombre}<br><small style="color:var(--gray)">${item.dimensiones}</small></td>
                <td style="text-align:center">${item.cantidad}</td>
                <td>${item.detalles.placa.tipo.replace(/SIN PLACA|SIN/g, '-')}</td>
                <td>${item.detalles.adhesivo.tipo.replace(/SIN ADHESIVO|SIN/g, '-')}</td>
                <td>${item.detalles.laminado.tipo.replace(/SIN LAMINADO|SIN/g, '-')}</td>
                <td>${item.detalles.anclaje.tipo.replace(/SIN ANCLAJE|SIN/g, '-')}</td>
                <td style="text-align:right">${formatPrecio(item.detalles.precioFinalPorUnidad)}</td>
                <td style="text-align:right; font-weight:700">${formatPrecio(item.precio)}</td>
            </tr>
        `;
    }).join('');

    let materialsHtml = '';
    for (const [name, area] of Object.entries(materials.placas)) { materialsHtml += `<tr><td>Placa ${name}</td><td style="text-align:right">${area.toFixed(2)} m²</td></tr>`; }
    for (const [name, area] of Object.entries(materials.adhesivos)) { materialsHtml += `<tr><td>Adhesivo ${name}</td><td style="text-align:right">${area.toFixed(2)} m²</td></tr>`; }
    for (const [name, area] of Object.entries(materials.laminados)) { materialsHtml += `<tr><td>Laminado ${name}</td><td style="text-align:right">${area.toFixed(2)} m²</td></tr>`; }

    return `
        <div class="quotation-document">
            <div class="doc-header">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="logo.png" alt="Logo" style="height: 60px; width: auto; object-fit: contain;">
                    <div>
                        <div class="doc-title">Cotización N° ${quotation.numero}</div>
                        <div style="color: var(--gray); font-size: 0.9rem;">Fecha de Emisión: ${formatDate(quotation.fecha)}</div>
                    </div>
                </div>
                <div style="text-align: right">
                    <div style="font-weight: 800; color: var(--dark-light); font-size: 1.1rem;">LETREROS CAPERUSO</div>
                    <div style="font-size: 0.85rem; color: var(--gray)">Diseño Industrial EIRL</div>
                    <div style="font-size: 0.8rem; color: var(--gray)">RUT: ${CRM.settings.companyRut}</div>
                </div>
            </div>

            <div class="info-grid">
                <div>
                    <div class="section-header"><i class="fas fa-user"></i> Datos del Cliente</div>
                    <table class="info-table">
                        <tr><td class="label">Nombre:</td><td>${client.nombre || 'N/A'}</td></tr>
                        <tr><td class="label">Empresa:</td><td>${client.empresa || 'N/A'}</td></tr>
                        <tr><td class="label">RUT:</td><td>${client.rut || 'N/A'}</td></tr>
                        <tr><td class="label">Giro:</td><td>${client.giro || 'N/A'}</td></tr>
                    </table>
                </div>
                <div>
                    <div class="section-header"><i class="fas fa-map-marker-alt"></i> Contacto y Entrega</div>
                    <table class="info-table">
                        <tr><td class="label">Teléfono:</td><td>${client.telefono || 'N/A'}</td></tr>
                        <tr><td class="label">Email:</td><td>${client.email || 'N/A'}</td></tr>
                        <tr><td class="label">Dirección:</td><td>${client.direccion || 'N/A'}</td></tr>
                        <tr><td class="label">Pedido:</td><td>#${quotation.numero}</td></tr>
                    </table>
                </div>
            </div>

            <div class="section-header"><i class="fas fa-list"></i> Detalle de Productos</div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Ítem</th>
                        <th>Descripción</th>
                        <th>Cant.</th>
                        <th>Placa</th>
                        <th>Adhesivo</th>
                        <th>Laminado</th>
                        <th>Anclaje</th>
                        <th style="text-align:right">Unitario</th>
                        <th style="text-align:right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>

            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; align-items: start;">
                <div class="materials-summary">
                    <div style="font-weight:700; margin-bottom: 0.5rem; color: var(--dark-light); font-size: 0.9rem;">Resumen de Materiales</div>
                    <table style="width:100%; font-size: 0.85rem;">
                        ${materialsHtml}
                        <tr style="border-top: 1px solid #ddd"><td style="padding-top:0.5rem"><strong>Área Total de Impresión</strong></td><td style="text-align:right; padding-top:0.5rem"><strong>${totalArea.toFixed(2)} m²</strong></td></tr>
                    </table>
                    <div style="margin-top: 1rem; font-size: 0.85rem">
                        <strong>Tiempo estimado de fabricación:</strong> 3 días hábiles.
                    </div>
                </div>

                <div class="totals-section">
                    <table class="totals-table">
                        <tr><td>Subtotal Neto</td><td style="text-align:right">${formatPrecio(subtotal)}</td></tr>
                        <tr><td>IVA (19%)</td><td style="text-align:right">${formatPrecio(ivaAmount)}</td></tr>
                        <tr><td>Envío / Instalación</td><td style="text-align:right">${formatPrecio(costoEnvio + costoInstalacion)}</td></tr>
                        <tr class="total-row"><td>TOTAL</td><td style="text-align:right">${formatPrecio(totalFinal)}</td></tr>
                    </table>
                </div>
            </div>

            <div class="section-header"><i class="fas fa-info-circle"></i> Términos y Condiciones</div>
            <div class="terms-box">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div>
                        <h3>Proceso de Compra</h3>
                        <p>1. Una vez Aprobada la cotización debe cancelar el total del pedido 100% o enviar Orden de compra OC (Sujeto a aprobación).</p>
                        <p>2. Aprobado el Pago entregaremos un Visto Bueno Digital para su validación.</p>
                        <p>3. Tras su aprobación del diseño comienza el plazo de fabricación.</p>
                    </div>
                    <div>
                        <h3>Consideraciones</h3>
                        <p>• Pago: Transferencia, Efectivo o Cheque.</p>
                        <p>• Plazo: 2-3 días hábiles desde aprobación de diseño.</p>
                        <p>• Despacho: Vía Starken, Chilexpress o Correos de Chile (Por pagar).</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}


function editQuotation(id) {
    const quotation = CRM.quotations.find(q => q.id === id);
    if (!quotation) {
        showNotification('❌ Cotización no encontrada', 'danger');
        return;
    }

    navigateToPage('quoter');

    // Populate client data
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
    }

    // Populate items
    carrito = [...quotation.items];
    actualizarCarrito();

    // Set edit mode
    document.getElementById('editingQuotationId').value = id;

    showNotification(`✏️ Editando Cotización #${quotation.numero}`, 'info');
}

// ============= PIPELINE =============
function showNewOpportunityModal() {
    const container = document.getElementById('availableQuotationsList');

    // Get quotations that are not already in pipeline
    const quotationsInPipeline = CRM.pipeline.map(p => p.quotationId);
    const availableQuotations = CRM.quotations.filter(q => !quotationsInPipeline.includes(q.id));

    if (availableQuotations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No hay cotizaciones disponibles</h3>
                <p>Todas las cotizaciones ya están en el pipeline o no hay cotizaciones creadas.</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>N° Cotización</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${availableQuotations.map(q => {
            const statusBadge = {
                'borrador': 'badge-warning',
                'enviada': 'badge-primary',
                'aprobada': 'badge-success',
                'rechazada': 'badge-danger'
            }[q.status] || 'badge-warning';

            return `
                                <tr>
                                    <td><strong>#${q.numero}</strong></td>
                                    <td>${q.cliente?.nombre || 'Sin cliente'}</td>
                                    <td>${formatDate(q.fecha)}</td>
                                    <td><strong>${formatPrecio(q.total)}</strong></td>
                                    <td><span class="badge ${statusBadge}">${q.status}</span></td>
                                    <td>
                                        <button class="btn btn-primary btn-sm" onclick="addQuotationToPipeline('${q.id}')" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                                            <i class="fas fa-plus"></i> Agregar
                                        </button>
                                    </td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    document.getElementById('addOpportunityModal').classList.add('active');
}

function addQuotationToPipeline(quotationId) {
    const quotation = CRM.quotations.find(q => q.id === quotationId);
    if (!quotation) {
        showNotification('❌ Cotización no encontrada', 'danger');
        return;
    }

    // Check if already in pipeline
    const existingInPipeline = CRM.pipeline.find(p => p.quotationId === quotationId);
    if (existingInPipeline) {
        showNotification('⚠️ Esta cotización ya está en el pipeline', 'warning');
        return;
    }

    // Add to pipeline in Cotizacion stage
    CRM.pipeline.push({
        id: generateId(),
        quotationId: quotationId,
        stage: 'Cotizacion',
        cliente: quotation.cliente?.nombre || 'Sin cliente',
        total: quotation.total,
        fecha: new Date().toISOString()
    });

    saveData();
    showNotification('✅ Cotización agregada al pipeline', 'success');

    // Refresh the modal and pipeline
    showNewOpportunityModal();
    loadPipeline();
}

function approveQuotation(id) {
    const quotation = CRM.quotations.find(q => q.id === id);
    if (!quotation) {
        showNotification('❌ Cotización no encontrada', 'danger');
        return;
    }

    // Confirm approval
    const clientName = quotation.cliente?.nombre || 'Sin cliente';
    const confirmMessage = `¿Deseas aprobar la Cotización #${quotation.numero} de ${clientName} por ${formatPrecio(quotation.total)}?\n\nEsta acción agregará la cotización al pipeline de ventas.`;

    if (!confirm(confirmMessage)) {
        return;
    }

    // Update quotation status
    quotation.status = 'aprobada';

    // Add to pipeline if not already there
    const existingInPipeline = CRM.pipeline.find(p => p.quotationId === id);
    if (!existingInPipeline) {
        CRM.pipeline.push({
            id: generateId(),
            quotationId: id,
            stage: 'Cotizacion',
            cliente: quotation.cliente?.nombre || 'Sin cliente',
            total: quotation.total,
            fecha: new Date().toISOString()
        });
    }

    saveData();
    showNotification(`✅ Cotización #${quotation.numero} aprobada y agregada al pipeline`, 'success');

    // Refresh tables
    loadQuotationsTable();
    updateDashboard();

    // Navigate to pipeline after a short delay to show the notification
    setTimeout(() => {
        navigateToPage('pipeline');
    }, 1500);
}

function loadPipeline() {
    const stages = ['Cotizacion', 'Negociacion', 'Fabricacion', 'Terminado', 'Perdido'];

    // Clear all columns
    stages.forEach(stage => {
        const el = document.getElementById(`pipeline${stage}`);
        if (el) {
            el.innerHTML = '';
            el.ondragover = handleDragOver;
            el.ondragenter = handleDragEnter;
            el.ondragleave = handleDragLeave;
            el.ondrop = handleDrop;
        }
    });

    // Load pipeline items
    if (CRM.pipeline.length === 0) {
        stages.forEach(stage => {
            const el = document.getElementById(`pipeline${stage}`);
            if (el) {
                el.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Sin oportunidades</p></div>';
            }
        });
        return;
    }

    // Group items by stage
    CRM.pipeline.forEach(item => {
        const el = document.getElementById(`pipeline${item.stage}`);
        if (el) {
            // Remove empty state if present
            const emptyState = el.querySelector('.empty-state');
            if (emptyState) {
                el.innerHTML = '';
            }

            // Get quotation details
            const quotation = CRM.quotations.find(q => q.id === item.quotationId);

            const card = document.createElement('div');
            card.className = 'pipeline-item';
            card.draggable = true;
            card.dataset.itemId = item.id;
            card.ondragstart = handleDragStart;
            card.ondragend = handleDragEnd;

            card.innerHTML = `
                <div style="margin-bottom: 0.5rem;">
                    <strong>${item.cliente}</strong>
                </div>
                <div style="font-size: 0.875rem; color: var(--gray); margin-bottom: 0.5rem;">
                    ${quotation ? `Cotización #${quotation.numero}` : 'Sin cotización'}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600; color: var(--primary);">${formatPrecio(item.total)}</span>
                    <span style="font-size: 0.75rem; color: var(--gray);">${timeAgo(item.fecha)}</span>
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                    <button onclick="openPipelineQuotation('${item.quotationId}')" class="btn btn-sm" style="flex: 1; padding: 0.4rem; font-size: 0.75rem; background: var(--gradient-1);">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button onclick="deletePipelineItem('${item.id}')" class="btn btn-sm" style="padding: 0.4rem 0.6rem; font-size: 0.75rem; background: var(--danger); color: white;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            el.appendChild(card);
        }
    });

    // Update counts
    stages.forEach(stage => {
        const count = CRM.pipeline.filter(p => p.stage === stage).length;
        const el = document.querySelector(`#pipeline${stage}`)?.parentElement?.querySelector('.pipeline-count');
        if (el) {
            el.textContent = count;
        }
    });
}

// Drag and Drop handlers
let draggedItem = null;

function handleDragStart(e) {
    // Ensure we are dragging the item and not a child element
    draggedItem = e.target.closest('.pipeline-item');
    if (!draggedItem) return;

    draggedItem.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedItem.dataset.itemId);
}

function handleDragEnd(e) {
    if (draggedItem) {
        draggedItem.style.opacity = '1';
    }
    draggedItem = null;

    // Clean up any stray drag-over classes
    document.querySelectorAll('.pipeline-drop-zone').forEach(el => {
        el.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();

    e.currentTarget.classList.remove('drag-over');

    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
        const newStage = e.currentTarget.id.replace('pipeline', '');

        // Find and update the item
        const item = CRM.pipeline.find(p => p.id === itemId);
        if (item) {
            if (item.stage !== newStage) {
                item.stage = newStage;
                saveData();
                loadPipeline();
                showNotification(`✅ Oportunidad movida a ${newStage}`, 'success');
            }
        }
    }

    return false;
}

function openPipelineQuotation(quotationId) {
    if (quotationId) {
        viewQuotation(quotationId);
    } else {
        showNotification('❌ No hay cotización asociada', 'danger');
    }
}

function deletePipelineItem(itemId) {
    if (confirm('¿Estás seguro de eliminar esta oportunidad del pipeline?')) {
        const index = CRM.pipeline.findIndex(p => p.id === itemId);
        if (index !== -1) {
            CRM.pipeline.splice(index, 1);
            saveData();
            loadPipeline();
            showNotification('✅ Oportunidad eliminada del pipeline', 'success');
        }
    }
}

// ============= TASKS =============
function showNewTaskModal() {
    showNotification('🔧 Función en desarrollo', 'warning');
}

function loadTasks() {
    ['Pending', 'InProgress', 'Completed'].forEach(status => {
        const el = document.getElementById(`tasks${status}`);
        if (el) {
            el.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>Sin tareas</p></div>';
        }
    });
}

// ============= CHARTS =============
let salesChart, materialsChart, customersChart;

function initializeCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        salesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                datasets: [{
                    label: 'Ventas',
                    data: [0, 0, 0, 0, 0, 0],
                    borderColor: 'rgb(153, 50, 204)',
                    backgroundColor: 'rgba(153, 50, 204, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '$' + value.toLocaleString('es-CL');
                            }
                        }
                    }
                }
            }
        });
    }
}

function updateSalesChart() {
    if (salesChart && CRM.quotations.length > 0) {
        // Group sales by month
        const monthlyData = new Array(6).fill(0);
        CRM.quotations.forEach(q => {
            if (q.status === 'aprobada' && q.fecha) {
                const date = new Date(q.fecha);
                const monthIndex = date.getMonth();
                const currentMonth = new Date().getMonth();
                const diff = currentMonth - monthIndex;
                if (diff >= 0 && diff < 6) {
                    monthlyData[5 - diff] += q.total || 0;
                }
            }
        });

        salesChart.data.datasets[0].data = monthlyData;
        salesChart.update();
    }
}

function updateReports() {
    // Materials Chart
    const materialsCtx = document.getElementById('materialsChart');
    if (materialsCtx && !materialsChart) {
        materialsChart = new Chart(materialsCtx, {
            type: 'doughnut',
            data: {
                labels: ['Acrílico', 'Aluminio', 'Trovicel', 'Otros'],
                datasets: [{
                    data: [30, 35, 25, 10],
                    backgroundColor: [
                        'rgba(153, 50, 204, 0.8)',
                        'rgba(29, 162, 245, 0.8)',
                        'rgba(255, 0, 85, 0.8)',
                        'rgba(0, 212, 170, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Customers Chart
    const customersCtx = document.getElementById('customersChart');
    if (customersCtx && !customersChart) {
        customersChart = new Chart(customersCtx, {
            type: 'bar',
            data: {
                labels: ['Nuevos', 'Recurrentes', 'Inactivos'],
                datasets: [{
                    label: 'Clientes',
                    data: [CRM.customers.length, 0, 0],
                    backgroundColor: [
                        'rgba(0, 212, 170, 0.8)',
                        'rgba(153, 50, 204, 0.8)',
                        'rgba(255, 167, 38, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

// ============= SETTINGS =============
function loadSettings() {
    const container = document.getElementById('materialsSettings');

    let html = '<div class="grid grid-2" style="gap: 1rem;">';

    // Placas
    html += '<div><h4 style="margin-bottom: 1rem;">Placas</h4>';
    for (const [name, price] of Object.entries(precios.placas)) {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid var(--gray-light);">
                <span style="font-weight: 500;">${name}</span>
                <span style="color: var(--primary); font-weight: 600;">${formatPrecio(price)}</span>
            </div>
        `;
    }
    html += '</div>';

    // Adhesivos
    html += '<div><h4 style="margin-bottom: 1rem;">Adhesivos</h4>';
    for (const [name, price] of Object.entries(precios.adhesivos)) {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid var(--gray-light);">
                <span style="font-weight: 500;">${name}</span>
                <span style="color: var(--primary); font-weight: 600;">${formatPrecio(price)}</span>
            </div>
        `;
    }
    html += '</div>';

    html += '</div>';
    container.innerHTML = html;
}

function showEditPricesModal() {
    showNotification('🔧 Editor de precios en desarrollo', 'warning');
}

// ============= QUOTER (ORIGINAL FUNCTIONALITY) =============
function loadQuoterContent() {
    const quoterContainer = document.getElementById('quoterContent');

    quoterContainer.innerHTML = `
        <div class="card" style="margin-bottom: 2rem;">
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
        </div>

        <div class="card" style="display: none;">
            <h3 style="margin-bottom: 2rem; color: var(--primary);">PRECIOS DE MATERIALES</h3>
            <div class="materiales-container" id="materialesContainer"></div>
        </div>
        
        <div class="card" style="margin-top: 2rem;">
            <h3 style="margin-bottom: 2rem; color: var(--primary);">DATOS DEL LETRERO</h3>
            <form id="cotizadorForm">
                <div class="grid grid-2">
                    <div class="form-group">
                        <label class="form-label">NOMBRE DEL LETRERO:</label>
                        <input type="text" id="nombre" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">CANTIDAD:</label>
                        <input type="number" id="cantidad" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">ANCHO (CM):</label>
                        <input type="number" id="ancho" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">ALTO (CM):</label>
                        <input type="number" id="alto" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">TIPO DE PLACA:</label>
                        <select id="tipoPlaca" class="form-control" required>
                            <option value="">SELECCIONE UN TIPO</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">TIPO DE ADHESIVO:</label>
                        <select id="tipoAdhesivo" class="form-control" required>
                            <option value="">SELECCIONE UN TIPO</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">TIPO DE LAMINADO:</label>
                        <select id="tipoLaminado" class="form-control" required>
                            <option value="">SELECCIONE UN TIPO</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">TIPO DE ANCLAJE:</label>
                        <select id="tipoAnclaje" class="form-control" required>
                            <option value="">SELECCIONE UN TIPO</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">UTILIDAD (%):</label>
                        <input type="number" id="utilidad" value="30" class="form-control" required>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                    <i class="fas fa-calculator"></i> CALCULAR COTIZACIÓN
                </button>
            </form>
        </div>
        
        <div id="resultado"></div>
        
        <div id="carrito" style="display: none;">
            <div class="card" style="margin-top: 2rem;">
                <h3 style="margin-bottom: 1.5rem; color: var(--primary);">CARRITO DE COMPRAS</h3>
                <div id="carritoItems"></div>
                <div id="carritoTotal"></div>
            </div>
        </div>
    `;

    // Initialize quoter
    generarCamposMateriales();
    actualizarOpcionesSelect();

    // Form submission
    document.getElementById('cotizadorForm').addEventListener('submit', calcularCotizacion);
}

function generarCamposMateriales() {
    const container = document.getElementById('materialesContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="grid grid-2">
            ${createMaterialGroup('PLACAS', precios.placas)}
            ${createMaterialGroup('ADHESIVOS', precios.adhesivos)}
            ${createMaterialGroup('LAMINADOS', precios.laminados)}
            ${createMaterialGroup('ANCLAJES', precios.anclajes)}
        </div>
    `;
}

function createMaterialGroup(title, items) {
    return `
        <div class="card">
            <h4 style="margin-bottom: 1rem; color: var(--dark);">${title}</h4>
            ${Object.entries(items).map(([name, price]) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid var(--gray-light);">
                    <span>${name}</span>
                    <input type="number" value="${price}" 
                           data-tipo="${title}" 
                           data-nombre="${name}" 
                           onchange="actualizarPrecio(event)"
                           style="width: 120px; padding: 0.5rem; border: 2px solid var(--gray-light); border-radius: 8px;">
                </div>
            `).join('')}
        </div>
    `;
}

function actualizarPrecio(e) {
    const tipo = e.target.dataset.tipo;
    const nombre = e.target.dataset.nombre;
    const nuevoPrecio = parseFloat(e.target.value);

    if (tipo === 'IMPRESIÓN') {
        precios.impresion = nuevoPrecio;
    } else {
        precios[tipo.toLowerCase()][nombre] = nuevoPrecio;
    }

    actualizarOpcionesSelect();
    saveData();
}

function actualizarOpcionesSelect() {
    const selects = {
        tipoPlaca: precios.placas,
        tipoAdhesivo: precios.adhesivos,
        tipoLaminado: precios.laminados,
        tipoAnclaje: precios.anclajes
    };

    for (const [selectId, options] of Object.entries(selects)) {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">SELECCIONE UN TIPO</option>';
            for (const name of Object.keys(options)) {
                select.innerHTML += `<option value="${name}">${name}</option>`;
            }
        }
    }
}

function calcularCotizacion(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const ancho = parseFloat(document.getElementById('ancho').value);
    const alto = parseFloat(document.getElementById('alto').value);
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const tipoPlaca = document.getElementById('tipoPlaca').value;
    const tipoAdhesivo = document.getElementById('tipoAdhesivo').value;
    const tipoLaminado = document.getElementById('tipoLaminado').value;
    const tipoAnclaje = document.getElementById('tipoAnclaje').value;
    const utilidad = parseFloat(document.getElementById('utilidad').value) / 100;

    const area = tipoPlaca.includes('PENDÓN ROLLER') ? 1 : (ancho * alto / 10000);
    const perimeter = tipoPlaca.includes('PENDÓN ROLLER') ? 0 : ((ancho + alto) * 2 / 100);

    const costoPlaca = tipoPlaca === 'SIN PLACA' ? 0 :
        tipoPlaca.includes('PENDÓN ROLLER') ? precios.placas[tipoPlaca] : precios.placas[tipoPlaca] * area;
    const costoAdhesivo = precios.adhesivos[tipoAdhesivo] * area;
    const costoLaminado = precios.laminados[tipoLaminado] * area;
    const costoImpresion = precios.impresion * area;
    const costoAnclaje = precios.anclajes[tipoAnclaje] * perimeter;

    const costoMaterialesPorUnidad = Math.round(costoPlaca + costoAdhesivo + costoLaminado + costoImpresion + costoAnclaje);
    const costoMaterialesBase = Math.round(costoPlaca + costoAdhesivo + costoLaminado + costoAnclaje);
    const costoDiseno = Math.round(costoMaterialesBase * 0.25);
    const costoFabricacion = Math.round(costoMaterialesBase * 0.25);
    const costoServiciosPorUnidad = Math.round(costoDiseno + costoFabricacion);
    const costoTotalPorUnidad = Math.round(costoMaterialesPorUnidad + costoServiciosPorUnidad);
    const utilidadPorUnidad = Math.round(costoTotalPorUnidad * utilidad);
    const precioFinalPorUnidad = Math.round(costoTotalPorUnidad + utilidadPorUnidad);
    const precioFinal = Math.round(precioFinalPorUnidad * cantidad);

    const item = {
        nombre,
        dimensiones: `${ancho}cm x ${alto}cm`,
        cantidad,
        precio: precioFinal,
        detalles: {
            placa: { tipo: tipoPlaca, costo: costoPlaca },
            adhesivo: { tipo: tipoAdhesivo, costo: costoAdhesivo },
            laminado: { tipo: tipoLaminado, costo: costoLaminado },
            anclaje: { tipo: tipoAnclaje, costo: costoAnclaje },
            impresion: { costo: costoImpresion },
            servicios: {
                diseno: { costo: costoDiseno },
                fabricacion: { costo: costoFabricacion }
            },
            area,
            costoMaterialesPorUnidad,
            costoServiciosPorUnidad,
            costoTotalPorUnidad,
            utilidadPorUnidad,
            precioFinalPorUnidad
        }
    };

    mostrarResultado(item);
}

function mostrarResultado(item) {
    const resultado = document.getElementById('resultado');

    resultado.innerHTML = `
        <div class="card" style="margin-top: 2rem;">
            <h3 style="color: var(--primary); margin-bottom: 1.5rem;">
                COTIZACIÓN: "${item.nombre.toUpperCase()}"
            </h3>
            
            <div class="grid grid-2" style="margin-bottom: 1.5rem;">
                <div>
                    <p><strong>Dimensiones:</strong> ${item.dimensiones}</p>
                    <p><strong>Área:</strong> ${Math.round(item.detalles.area * 100) / 100} M²</p>
                    <p><strong>Cantidad:</strong> ${item.cantidad}</p>
                </div>
                <div style="text-align: right;">
                    <p style="font-size: 0.875rem; color: var(--gray);">Precio Unitario</p>
                    <p style="font-size: 2rem; font-weight: 800; color: var(--primary);">
                        ${formatPrecio(item.detalles.precioFinalPorUnidad)}
                    </p>
                    <p style="font-size: 1.25rem; font-weight: 700; color: var(--dark);">
                        Total: ${formatPrecio(item.precio)}
                    </p>
                </div>
            </div>
            
            <details style="margin-bottom: 1rem;">
                <summary style="cursor: pointer; font-weight: 600; padding: 0.75rem; background: var(--gray-light); border-radius: 8px;">
                    Ver Desglose Detallado
                </summary>
                <div style="padding: 1rem; margin-top: 0.5rem;">
                    <h4>Materiales:</h4>
                    <ul>
                        <li>Placa: ${formatPrecio(item.detalles.placa.costo)}</li>
                        <li>Adhesivo: ${formatPrecio(item.detalles.adhesivo.costo)}</li>
                        <li>Laminado: ${formatPrecio(item.detalles.laminado.costo)}</li>
                        <li>Impresión: ${formatPrecio(item.detalles.impresion.costo)}</li>
                        <li>Anclaje: ${formatPrecio(item.detalles.anclaje.costo)}</li>
                    </ul>
                    <h4>Servicios:</h4>
                    <ul>
                        <li>Diseño: ${formatPrecio(item.detalles.servicios.diseno.costo)}</li>
                        <li>Fabricación: ${formatPrecio(item.detalles.servicios.fabricacion.costo)}</li>
                    </ul>
                    <h4>Totales:</h4>
                    <ul>
                        <li><strong>Costo Total: ${formatPrecio(item.detalles.costoTotalPorUnidad)}</strong></li>
                        <li><strong>Utilidad: ${formatPrecio(item.detalles.utilidadPorUnidad)}</strong></li>
                    </ul>
                </div>
            </details>
            
            <button class="btn btn-success" onclick='agregarAlCarrito(${JSON.stringify(item).replace(/'/g, "&#39;")})' style="width: 100%;">
                <i class="fas fa-cart-plus"></i> AGREGAR AL CARRITO
            </button>
        </div>
    `;
}

function agregarAlCarrito(item) {
    carrito.push(item);
    document.getElementById('carrito').style.display = 'block';
    actualizarCarrito();
    showNotification('✅ Item agregado al carrito', 'success');
}

function actualizarCarrito() {
    const carritoItems = document.getElementById('carritoItems');
    const carritoTotal = document.getElementById('carritoTotal');

    if (carrito.length === 0) {
        document.getElementById('carrito').style.display = 'none';
        return;
    }

    let total = 0;

    carritoItems.innerHTML = carrito.map((item, index) => {
        total += item.precio;
        return `
            <div class="card" style="margin-bottom: 1rem; background: rgba(255,255,255,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4>${item.nombre} - ${item.dimensiones}</h4>
                        <p>Cantidad: ${item.cantidad} | Unitario: ${formatPrecio(item.detalles.precioFinalPorUnidad)}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">
                            ${formatPrecio(item.precio)}
                        </p>
                        <button class="btn" onclick="eliminarDelCarrito(${index})" 
                                style="background: var(--danger); color: white; padding: 0.5rem 1rem; font-size: 0.875rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const iva = Math.round(total * 0.19);
    const totalConIva = total + iva;

    carritoTotal.innerHTML = `
        <div style="background: var(--bg-card); padding: 1.5rem; border-radius: 12px; margin-top: 1rem; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Subtotal:</span>
                <span style="font-weight: 600;">${formatPrecio(total)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>IVA (19%):</span>
                <span style="font-weight: 600;">${formatPrecio(iva)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 2px solid var(--gray-light);">
                <span style="font-size: 1.25rem; font-weight: 700;">TOTAL:</span>
                <span style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">${formatPrecio(totalConIva)}</span>
            </div>
            
            <button class="btn btn-primary" onclick="finalizarCotizacion()" style="width: 100%; margin-top: 1rem;">
                <i class="fas fa-check"></i> FINALIZAR Y GUARDAR COTIZACIÓN
            </button>
        </div>
    `;
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
    showNotification('Item eliminado del carrito', 'warning');
}

function finalizarCotizacion() {
    if (carrito.length === 0) return;

    const editingId = document.getElementById('editingQuotationId').value;
    const manualNumero = document.getElementById('cotizacionNumero').value;
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
    };

    const total = carrito.reduce((sum, item) => sum + item.precio, 0);

    if (editingId) {
        // Update existing quotation
        const index = CRM.quotations.findIndex(q => q.id === editingId);
        if (index !== -1) {
            CRM.quotations[index].items = [...carrito];
            CRM.quotations[index].total = total;
            CRM.quotations[index].cliente = clientData;
            CRM.quotations[index].diasFabricacion = diasFabricacion;
            CRM.quotations[index].envio = envio;
            CRM.quotations[index].instalacion = instalacion;
            if(manualNumero) CRM.quotations[index].numero = manualNumero;

            showNotification(`✅ Cotización #${CRM.quotations[index].numero} actualizada`, 'success');
        }
    } else {
        // Create new quotation
        const numero = (CRM.quotations.length + 1).toString().padStart(4, '0');

        const quotation = {
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
        };

        CRM.quotations.push(quotation);

        // Auto-add to pipeline stage 'Cotizacion'
        CRM.pipeline.push({
            id: generateId(),
            quotationId: quotation.id,
            stage: 'Cotizacion',
            cliente: quotation.cliente?.nombre || 'Sin cliente',
            total: quotation.total,
            fecha: new Date().toISOString()
        });

        showNotification(`✅ Cotización #${numero} guardada e ingresada al pipeline`, 'success');
    }

    saveData();

    carrito = [];
    actualizarCarrito();

    // Clear inputs
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
    document.getElementById('editingQuotationId').value = '';

    // Update dashboard
    updateDashboard();

    // Navigate back to quotations list
    navigateToPage('quotations');
    loadQuotationsTable();
}

// ============= UTILITY FUNCTIONS =============
function formatPrecio(valor) {
    return `$${Math.round(valor).toLocaleString('es-CL')}`;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL');
}

function timeAgo(dateString) {
    if (!dateString) return 'Hace un momento';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return formatDate(dateString);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substr(0, 2).toUpperCase();
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--gradient-4)' :
            type === 'danger' ? 'var(--gradient-2)' :
                type === 'warning' ? 'var(--warning)' : 'var(--gradient-3)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        font-weight: 600;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============= INITIALIZATION =============
console.log('🎨 CRM LETREROS CAPERUSO - Sistema Iniciado');
console.log('📊 Clientes:', CRM.customers.length);
console.log('📝 Cotizaciones:', CRM.quotations.length);

// --- AI Module Mocks and Missing Functions ---

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function openModal(id) {
    const modal = document.getElementById(id);
    if(modal) modal.classList.add('active');
}

function configureGeminiKey() {
    alert("Función para configurar API Key de Gemini en desarrollo...");
}

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
        const prompt = `
Genera un mensaje de correo electrónico para un cliente corporativo de una empresa de letreros (Letreros Caperuso).
Destinatario: ${recipient || 'Cliente'}
Asunto propuesto: ${subject || 'Propuesta de Letreros'}
Tipo de mensaje: ${msgType}
Estrategia/Framework: ${framework}
Objetivo: ${goal}
Tono: ${tone}
Extensión: ${length}

Escribe únicamente el cuerpo del correo, sin explicaciones extra. Usa el asunto sugerido si aplica.`;

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

function copyIAMessage() {
    const output = document.getElementById('iaOutputBody');
    if(output) {
        navigator.clipboard.writeText(output.value);
        showNotification("Mensaje copiado al portapapeles", "success");
    }
}

function openIAMailClient() {
    alert("Abriendo cliente de correo...");
}

function switchIAContext(context) {
    document.querySelectorAll('.ia-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + context)?.classList.add('active');
    document.querySelectorAll('.ia-context-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('ctx-' + context)?.classList.add('active');
}

function loadQuotationForIA() {
    console.log("Cotización cargada para IA");
}

function setMessageChannel(channel) {
    document.getElementById('iaMessageChannel').value = channel;
    document.getElementById('channelEmail').style.background = channel === 'email' ? 'rgba(100, 108, 255, 0.1)' : 'transparent';
    document.getElementById('channelWhatsapp').style.background = channel === 'whatsapp' ? 'rgba(100, 108, 255, 0.1)' : 'transparent';
}

function syncKnowledgeWithFirebase() {
    alert("Sincronizando Base de Conocimientos...");
}

function handleBrainFileUpload(event) {
    alert("Archivos cargados en memoria");
}

function ingestBrainUrl() {
    alert("Rastreando URL...");
}

function saveBrainDirectives() {
    alert("Directivas guardadas");
}

function resetBrainIA() {
    if(confirm("¿Purgar toda la memoria?")) {
        alert("Memoria purgada");
    }
}

function exportCustomers() { alert("Exportando..."); }
function importCustomersFile() { alert("Importando..."); }
function deleteSelectedCustomers() { alert("Borrando seleccionados..."); }
function deleteAllCustomers() { if(confirm("¿Borrar todos?")) alert("Borrados"); }
function toggleSelectAllCustomers() {}

function deleteSelectedQuotations() {}
function deleteAllQuotations() {}
function toggleSelectAllQuotations() {}

function showAddImageModal() { openModal('addImageModal'); }

function togglePipelineStats() {
    const el = document.getElementById('pipelineDashboard');
    if(el.style.display === 'none') {
        el.style.display = 'block';
        document.getElementById('pipelineStatsBtnText').textContent = 'Ocultar Reporte';
    } else {
        el.style.display = 'none';
        document.getElementById('pipelineStatsBtnText').textContent = 'Mostrar Reporte';
    }
}

function openAIMessageCenter() { openModal('aiMessageCenterModal'); }
async function regenerateMessage() {
    const msgType = document.getElementById('msgType').value;
    const tone = document.getElementById('msgTone').value;
    const subjectEl = document.getElementById('aiMsgSubject');
    const bodyEl = document.getElementById('aiMsgBody');
    const recipient = document.getElementById('aiMsgRecipient').value;
    
    if(!bodyEl) return;
    
    bodyEl.value = "Generando...";
    
    try {
        const prompt = `
Genera un correo electrónico (Asunto y Cuerpo).
Tipo de mensaje: ${msgType}
Tono: ${tone}
Destinatario: ${recipient || 'Cliente'}

Devuelve la respuesta en formato JSON estricto con las siguientes claves: "asunto" y "cuerpo". No incluyas markdown de bloque de código.`;

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
            if(jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/```json\n/g, '').replace(/```/g, '');
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
function regenerateEmailMessage() {}
function copyEmailToClipboard() {}
function openMailClient() {}
function openEmailClient() {}
function startPOSPrint() { alert("Impresión POS iniciada"); }
