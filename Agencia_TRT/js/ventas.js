/**
 * Módulo de Gestión de Ventas - CRUD completo
 */

const VentasManager = {
    // Base de datos en memoria
    ventas: [
        {
            id: 1,
            fechaVenta: '2024-06-01',
            fechaRegistro: getCurrentDate(),
            codigoReserva: 'RES001',
            cliente: 'Juan Pérez',
            totalVenta: 1500000,
            comision: 450000,
            usuarioRegistra: 'Ana García'
        },
        {
            id: 2,
            fechaVenta: '2024-06-02',
            fechaRegistro: getCurrentDate(),
            codigoReserva: 'RES002',
            cliente: 'María López',
            totalVenta: 2200000,
            comision: 660000,
            usuarioRegistra: 'Carlos Ruiz'
        },
        {
            id: 3,
            fechaVenta: '2024-06-03',
            fechaRegistro: getCurrentDate(),
            codigoReserva: 'RES003',
            cliente: 'Pedro González',
            totalVenta: 1800000,
            comision: 540000,
            usuarioRegistra: 'Ana García'
        }
    ],

    nextId: 4,
    editingId: null,

    // Elementos del DOM
    elements: {
        form: null,
        modal: null,
        tableBody: null,
        searchInput: null
    },

    // Inicializar el módulo
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadTable();
    },

    // Cachear elementos del DOM
    cacheElements() {
        this.elements.form = document.getElementById('ventaForm');
        this.elements.modal = document.getElementById('ventaModal');
        this.elements.tableBody = document.getElementById('ventasTableBody');
        this.elements.searchInput = document.getElementById('searchInput');
    },

    // Vincular eventos
    bindEvents() {
        if (this.elements.form) {
            this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Cálculo automático de comisión
        const totalVentaInput = document.getElementById('totalVenta');
        if (totalVentaInput) {
            totalVentaInput.addEventListener('input', () => this.calculateCommission());
        }

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (event) => {
            if (event.target === this.elements.modal) {
                this.closeModal();
            }
        });
    },

    // Obtener todas las ventas
    getAllVentas() {
        return this.ventas;
    },

    // Obtener venta por ID
    getVentaById(id) {
        return this.ventas.find(venta => venta.id === id);
    },

    // Cargar tabla de ventas
    loadTable() {
        if (!this.elements.tableBody) return;

        this.elements.tableBody.innerHTML = '';

        this.ventas.forEach(venta => {
            const row = this.elements.tableBody.insertRow();
            row.innerHTML = `
                <td>${formatDate(venta.fechaVenta)}</td>
                <td>${formatDate(venta.fechaRegistro)}</td>
                <td><strong>${escapeHtml(venta.codigoReserva)}</strong></td>
                <td>${escapeHtml(venta.cliente)}</td>
                <td>${formatCurrency(venta.totalVenta)}</td>
                <td>${formatCurrency(venta.comision)}</td>
                <td>${escapeHtml(venta.usuarioRegistra)}</td>
                <td>
                    <button class="btn btn-warning" onclick="VentasManager.editVenta(${venta.id})">✏️ Editar</button>
                    <button class="btn btn-danger" onclick="VentasManager.deleteVenta(${venta.id})">🗑️ Eliminar</button>
                </td>
            `;
        });
    },

    // Abrir modal
    openModal(id = null) {
        if (!this.elements.modal || !this.elements.form) return;

        this.elements.form.reset();
        this.clearErrors();

        const title = document.getElementById('modalTitle');

        if (id) {
            const venta = this.getVentaById(id);
            if (venta) {
                this.editingId = id;
                title.textContent = 'Editar Venta';
                this.populateForm(venta);
            }
        } else {
            this.editingId = null;
            title.textContent = 'Nueva Venta';
            document.getElementById('fechaVenta').value = getCurrentDate();
        }

        this.elements.modal.style.display = 'block';
    },

    // Cerrar modal
    closeModal() {
        if (this.elements.modal) {
            this.elements.modal.style.display = 'none';
        }
        this.editingId = null;
    },

    // Poblar formulario con datos
    populateForm(venta) {
        document.getElementById('ventaId').value = venta.id;
        document.getElementById('fechaVenta').value = venta.fechaVenta;
        document.getElementById('codigoReserva').value = venta.codigoReserva;
        document.getElementById('cliente').value = venta.cliente;
        document.getElementById('totalVenta').value = venta.totalVenta;
        document.getElementById('comision').value = venta.comision;
        document.getElementById('usuarioRegistra').value = venta.usuarioRegistra;
    },

    // Manejar envío del formulario
    handleSubmit(e) {
        e.preventDefault();

        if (this.validateForm()) {
            const formData = this.getFormData();

            if (this.editingId) {
                this.updateVenta(this.editingId, formData);
                showSuccessMessage('Venta actualizada exitosamente');
            } else {
                this.createVenta(formData);
                showSuccessMessage('Venta registrada exitosamente');
            }

            this.closeModal();
            this.loadTable();
            Dashboard.update();
        }
    },

    // Obtener datos del formulario
    getFormData() {
        const totalVenta = parseFloat(document.getElementById('totalVenta').value);
        
        return {
            fechaVenta: document.getElementById('fechaVenta').value,
            fechaRegistro: getCurrentDate(),
            codigoReserva: trimString(document.getElementById('codigoReserva').value),
            cliente: formatFullName(document.getElementById('cliente').value),
            totalVenta: totalVenta,
            comision: roundToDecimals(totalVenta * 0.3),
            usuarioRegistra: formatFullName(document.getElementById('usuarioRegistra').value)
        };
    },

    // Crear nueva venta
    createVenta(data) {
        const newVenta = {
            ...data,
            id: this.nextId++
        };
        this.ventas.push(newVenta);
    },

    // Actualizar venta existente
    updateVenta(id, data) {
        const index = this.ventas.findIndex(v => v.id === id);
        if (index !== -1) {
            this.ventas[index] = { ...data, id };
        }
    },

    // Editar venta
    editVenta(id) {
        this.openModal(id);
    },

    // Eliminar venta
    deleteVenta(id) {
        if (confirm('¿Está seguro de que desea eliminar esta venta?')) {
            this.ventas = this.ventas.filter(v => v.id !== id);
            this.loadTable();
            Dashboard.update();
            showSuccessMessage('Venta eliminada exitosamente');
        }
    },

    // Validar formulario
    validateForm() {
        let isValid = true;
        this.clearErrors();

        const fechaVenta = document.getElementById('fechaVenta').value;
        const codigoReserva = trimString(document.getElementById('codigoReserva').value);
        const cliente = trimString(document.getElementById('cliente').value);
        const totalVenta = document.getElementById('totalVenta').value;
        const usuarioRegistra = trimString(document.getElementById('usuarioRegistra').value);

        // Validar fecha de venta
        const fechaError = validateRequired(fechaVenta, 'Fecha de venta');
        if (fechaError) {
            showFieldError('fechaVentaError', fechaError);
            isValid = false;
        }

        // Validar código de reserva
        const codigoError = validateRequired(codigoReserva, 'Código de reserva');
        if (codigoError) {
            showFieldError('codigoReservaError', codigoError);
            isValid = false;
        } else {
            const existingCode = this.ventas.find(v => 
                v.codigoReserva === codigoReserva && v.id !== this.editingId
            );
            if (existingCode) {
                showFieldError('codigoReservaError', 'Este código de reserva ya existe');
                isValid = false;
            }
        }

        // Validar cliente
        const clienteError = validateRequired(cliente, 'Cliente');
        if (clienteError) {
            showFieldError('clienteError', clienteError);
            isValid = false;
        }

        // Validar total de venta
        const totalError = validatePositiveNumber(totalVenta, 'Total de venta');
        if (totalError) {
            showFieldError('totalVentaError', totalError);
            isValid = false;
        }

        // Validar usuario
        const usuarioError = validateRequired(usuarioRegistra, 'Usuario que registra');
        if (usuarioError) {
            showFieldError('usuarioRegistraError', usuarioError);
            isValid = false;
        }

        return isValid;
    },

    // Limpiar errores
    clearErrors() {
        const errorFields = [
            'fechaVentaError', 
            'codigoReservaError', 
            'clienteError', 
            'totalVentaError', 
            'usuarioRegistraError'
        ];
        errorFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) element.textContent = '';
        });
    },

    // Calcular comisión automáticamente
    calculateCommission() {
        const totalInput = document.getElementById('totalVenta');
        const comisionInput = document.getElementById('comision');
        
        if (totalInput && comisionInput) {
            const total = parseFloat(totalInput.value) || 0;
            const comision = roundToDecimals(total * 0.3);
            comisionInput.value = comision;
        }
    },

    // Filtrar tabla
    filterTable() {
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        const table = document.getElementById('ventasTable');
        const rows = table.getElementsByTagName('tr');

        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            let found = false;

            for (let j = 0; j < cells.length - 1; j++) {
                if (cells[j] && cells[j].textContent.toLowerCase().indexOf(searchTerm) > -1) {
                    found = true;
                    break;
                }
            }

            rows[i].style.display = found ? '' : 'none';
        }
    },

    // Exportar ventas
    exportVentas() {
        downloadAsJSON(this.ventas, `ventas-${getCurrentDate()}.json`);
    },

    // Importar ventas (desde JSON)
    importVentas(jsonData) {
        try {
            const importedVentas = JSON.parse(jsonData);
            if (Array.isArray(importedVentas)) {
                this.ventas = importedVentas;
                this.nextId = Math.max(...this.ventas.map(v => v.id)) + 1;
                this.loadTable();
                Dashboard.update();
                showSuccessMessage('Ventas importadas exitosamente');
            }
        } catch (error) {
            console.error('Error al importar ventas:', error);
            alert('Error al importar ventas. Verifique el formato del archivo.');
        }
    }
};

// Funciones globales para compatibilidad con el HTML
function openModal(id) {
    VentasManager.openModal(id);
}

function closeModal() {
    VentasManager.closeModal();
}

function filterTable() {
    VentasManager.filterTable();
}