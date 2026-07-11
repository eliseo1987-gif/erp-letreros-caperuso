const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const sandbox = {
    CRM: { settings: { companyRut: '123' }, quotations: [] },
    formatPrecio: (val) => '$' + val,
    formatDate: (val) => val,
    document: { 
        getElementById: () => ({}),
        addEventListener: () => {},
        querySelectorAll: () => [],
        createElement: () => ({}),
        head: { appendChild: () => {} }
    },
    window: {},
    console: console,
    Math: Math,
    Object: Object,
    parseFloat: parseFloat,
    parseInt: parseInt,
    Date: Date
};

const vm = require('vm');
vm.createContext(sandbox);

try {
    vm.runInContext(code, sandbox);
    const mockQuotation = {
        id: '123',
        numero: '0001',
        fecha: new Date().toISOString(),
        total: 256,
        cliente: { nombre: 'Test' },
        items: [
            {
                nombre: 'Letrero',
                dimensiones: '100x100',
                cantidad: 1,
                detalles: {
                    placa: { tipo: 'SIN PLACA' },
                    adhesivo: { tipo: 'VINILO' },
                    laminado: { tipo: 'MATE' },
                    anclaje: { tipo: 'PERNOS' },
                    precioFinalPorUnidad: 256,
                    costoTotalPorUnidad: 100,
                    utilidadPorUnidad: 156,
                    area: 1
                }
            }
        ]
    };
    const html = sandbox.generateQuotationHTML(mockQuotation);
    console.log("Success! HTML length:", html.length);
} catch (e) {
    console.error("Error:", e);
}
