/**
 * Aplicación principal - Reserva TRIP
 * Controlador principal y gestión de navegación
 */

const App = {
    // Estado de la aplicación
    state: {
        currentSection: 'dashboard',
        isInitialized: false
    },

    // Configuración
    config: {
        defaultSection: 'dashboard',
        autoSaveInterval: 30000, // 30 segundos
        version: '1.0.0'
    },

    // Inicializar aplicación
    init() {
        if (this.state.isInitialized) return;

        console.log(`Inicializando Reserva TRIP v${this.config.version}`);
        
        this.bindGlobalEvents();
        this.initializeModules();
        this.showSection(this.config.defaultSection);
        this.startAutoSave();
        
        this.state.isInitialized = true;
        console.log('Aplicación inicializada correctamente');
    },

    // Vincular eventos globales
    bindGlobalEvents() {
        // Manejo de errores globales
        window.addEventListener('error', (e) => {
            console.error('Error global:', e.error);
            this.handleGlobalError(e.error);
        });

        // Manejo de promesas rechazadas
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promesa rechazada:', e.reason);
            this.handleGlobalError(e.reason);
        });

        // Prevenir cierre accidental
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    },

    // Inicializar módulos
    initializeModules() {
        try {
            // Inicializar módulo de ventas
            if (typeof VentasManager !== 'undefined') {
                VentasManager.init();
            }

            // Inicializar dashboard
            if (typeof Dashboard !== 'undefined') {
                Dashboard.init();
            }

            console.log('Módulos inicializados correctamente');
        } catch (error) {
            console.error('Error al inicializar módulos:', error);
            this.showError('Error al inicializar la aplicación');
        }
    },

    // Mostrar sección específica
    showSection(sectionName) {
        const sections = document.querySelectorAll('.section');
        const buttons = document.querySelectorAll('.nav-btn');

        if (!sections.length || !buttons.length) return;

        // Ocultar todas las secciones
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Desactivar todos los botones
        buttons.forEach(button => {
            button.classList.remove('active');
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.state.currentSection = sectionName;
        }

        // Activar botón correspondiente
        const activeButton = Array.from(buttons).find(button => 
            button.onclick && button.onclick.toString().includes(sectionName)
        );
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Ejecutar acciones específicas por sección
        this.handleSectionChange(sectionName);
    },

    // Manejar cambio de sección
    handleSectionChange(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                if (typeof Dashboard !== 'undefined') {
                    Dashboard.update();
                }
                break;
            case 'ventas':
                if (typeof VentasManager !== 'undefined') {
                    VentasManager.loadTable();
                }
                break;
            default:
                console.warn(`Sección desconocida: ${sectionName}`);
        }
    },

    // Manejo de atajos de teclado
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S para guardar
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveData();
        }

        // Ctrl/Cmd + N para nueva venta
        if ((e.ctrlKey || e.metaKey) && e.key === 'n' && this.state.currentSection === 'ventas') {
            e.preventDefault();
            if (typeof VentasManager !== 'undefined') {
                VentasManager.openModal();
            }
        }

        // Escape para cerrar modales
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }

        // F1 para ayuda
        if (e.key === 'F1') {
            e.preventDefault();
            this.showHelp();
        }
    },

    // Verificar cambios no guardados
    hasUnsavedChanges() {
        // Implementar lógica para detectar cambios no guardados
        const modals = document.querySelectorAll('.modal');
        return Array.from(modals).some(modal => modal.style.display === 'block');
    },

    // Guardar datos
    saveData() {
        try {
            if (typeof VentasManager !== 'undefined') {
                const data = {
                    ventas: VentasManager.getAllVentas(),
                    timestamp: new Date().toISOString(),
                    version: this.config.version
                };
                
                localStorage.setItem('reserva-trip-data', JSON.stringify(data));
                this.showNotification('Datos guardados correctamente', 'success');
            }
        } catch (error) {
            console.error('Error al guardar datos:', error);
            this.showError('Error al guardar los datos');
        }
    },

    // Cargar datos guardados
    loadData() {
        try {
            const savedData = localStorage.getItem('reserva-trip-data');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                if (data.ventas && typeof VentasManager !== 'undefined') {
                    VentasManager.ventas = data.ventas;
                    VentasManager.nextId = Math.max(...data.ventas.map(v => v.id)) + 1;
                    VentasManager.loadTable();
                    Dashboard.update();
                    
                    this.showNotification('Datos cargados correctamente', 'success');
                }
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            this.showError('Error al cargar los datos guardados');
        }
    },

    // Auto-guardado
    startAutoSave() {
        setInterval(() => {
            this.saveData();
        }, this.config.autoSaveInterval);
    },

    // Mostrar notificación
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            border-radius: 5px;
            color: white;
            z-index: 9999;
            animation: slideInRight 0.3s ease;
        `;

        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#48bb78';
                break;
            case 'error':
                notification.style.backgroundColor = '#f56565';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ed8936';
                break;
            default:
                notification.style.backgroundColor = '#4299e1';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, duration);
    },

    // Mostrar error
    showError(message) {
        this.showNotification(message, 'error');
    },

    // Mostrar ayuda
    showHelp() {
        const helpContent = `
            <h3>Atajos de Teclado</h3>
            <ul>
                <li><strong>Ctrl/Cmd + S:</strong> Guardar datos</li>
                <li><strong>Ctrl/Cmd + N:</strong> Nueva venta (en sección ventas)</li>
                <li><strong>Escape:</strong> Cerrar modales</li>
                <li><strong>F1:</strong> Mostrar ayuda</li>
            </ul>
            <h3>Funcionalidades</h3>
            <ul>
                <li>Gestión completa de ventas (CRUD)</li>
                <li>Dashboard con métricas en tiempo real</li>
                <li>Búsqueda y filtrado de ventas</li>
                <li>Exportación de datos</li>
                <li>Auto-guardado cada 30 segundos</li>
            </ul>
        `;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <div>${helpContent}</div>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // Manejo de errores globales
    handleGlobalError(error) {
        console.error('Error capturado:', error);
        this.showError('Ha ocurrido un error inesperado. Por favor, recarga la página.');
    },

    // Obtener información del sistema
    getSystemInfo() {
        return {
            version: this.config.version,
            currentSection: this.state.currentSection,
            isInitialized: this.state.isInitialized,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }
};

// Función global para navegación (compatibilidad con HTML)
function showSection(sectionName) {
    App.showSection(sectionName);
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    App.loadData(); // Cargar datos guardados si existen
});

// Exportar para uso en otros módulos
if (typeof window !== 'undefined') {
    window.App = App;
}