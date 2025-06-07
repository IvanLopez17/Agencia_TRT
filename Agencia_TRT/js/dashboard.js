/**
 * Módulo Dashboard - Gestión de métricas y estadísticas
 */

const Dashboard = {
    
    // Elementos del DOM
    elements: {
        totalVentas: null,
        promedioVentas: null,
        totalComisiones: null,
        numeroVentas: null
    },

    // Inicializar el dashboard
    init() {
        this.cacheElements();
        this.update();
    },

    // Cachear elementos del DOM
    cacheElements() {
        this.elements.totalVentas = document.getElementById('totalVentas');
        this.elements.promedioVentas = document.getElementById('promedioVentas');
        this.elements.totalComisiones = document.getElementById('totalComisiones');
        this.elements.numeroVentas = document.getElementById('numeroVentas');
    },

    // Actualizar todas las métricas del dashboard
    update() {
        if (!this.elements.totalVentas) return;

        const metrics = this.calculateMetrics();
        this.displayMetrics(metrics);
    },

    // Calcular todas las métricas
    calculateMetrics() {
        const ventas = VentasManager.getAllVentas();
        
        const totalVentas = this.calculateTotalVentas(ventas);
        const promedioVentas = this.calculatePromedioVentas(ventas, totalVentas);
        const totalComisiones = this.calculateTotalComisiones(ventas);
        const numeroVentas = ventas.length;

        return {
            totalVentas,
            promedioVentas,
            totalComisiones,
            numeroVentas
        };
    },

    // Calcular total de ventas
    calculateTotalVentas(ventas) {
        return ventas.reduce((sum, venta) => sum + venta.totalVenta, 0);
    },

    // Calcular promedio de ventas
    calculatePromedioVentas(ventas, totalVentas) {
        return ventas.length > 0 ? totalVentas / ventas.length : 0;
    },

    // Calcular total de comisiones
    calculateTotalComisiones(ventas) {
        return ventas.reduce((sum, venta) => sum + venta.comision, 0);
    },

    // Mostrar métricas en el dashboard
    displayMetrics(metrics) {
        this.elements.totalVentas.textContent = formatCurrency(metrics.totalVentas);
        this.elements.promedioVentas.textContent = formatCurrency(metrics.promedioVentas);
        this.elements.totalComisiones.textContent = formatCurrency(metrics.totalComisiones);
        this.elements.numeroVentas.textContent = metrics.numeroVentas;
    },

    // Obtener métricas por período
    getMetricsByPeriod(startDate, endDate) {
        const ventas = VentasManager.getAllVentas();
        const filteredVentas = ventas.filter(venta => {
            const ventaDate = new Date(venta.fechaVenta);
            return ventaDate >= new Date(startDate) && ventaDate <= new Date(endDate);
        });

        return {
            totalVentas: this.calculateTotalVentas(filteredVentas),
            promedioVentas: this.calculatePromedioVentas(filteredVentas, this.calculateTotalVentas(filteredVentas)),
            totalComisiones: this.calculateTotalComisiones(filteredVentas),
            numeroVentas: filteredVentas.length
        };
    },

    // Obtener métricas por usuario
    getMetricsByUser(usuario) {
        const ventas = VentasManager.getAllVentas();
        const userVentas = ventas.filter(venta => 
            venta.usuarioRegistra.toLowerCase() === usuario.toLowerCase()
        );

        return {
            totalVentas: this.calculateTotalVentas(userVentas),
            promedioVentas: this.calculatePromedioVentas(userVentas, this.calculateTotalVentas(userVentas)),
            totalComisiones: this.calculateTotalComisiones(userVentas),
            numeroVentas: userVentas.length
        };
    },

    // Obtener top usuarios por ventas
    getTopUsers(limit = 5) {
        const ventas = VentasManager.getAllVentas();
        const userStats = {};

        ventas.forEach(venta => {
            if (!userStats[venta.usuarioRegistra]) {
                userStats[venta.usuarioRegistra] = {
                    nombre: venta.usuarioRegistra,
                    totalVentas: 0,
                    numeroVentas: 0,
                    totalComisiones: 0
                };
            }

            userStats[venta.usuarioRegistra].totalVentas += venta.totalVenta;
            userStats[venta.usuarioRegistra].numeroVentas += 1;
            userStats[venta.usuarioRegistra].totalComisiones += venta.comision;
        });

        return Object.values(userStats)
            .sort((a, b) => b.totalVentas - a.totalVentas)
            .slice(0, limit);
    },

    // Obtener estadísticas por mes
    getMonthlyStats() {
        const ventas = VentasManager.getAllVentas();
        const monthlyStats = {};

        ventas.forEach(venta => {
            const date = new Date(venta.fechaVenta);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = {
                    mes: monthKey,
                    totalVentas: 0,
                    numeroVentas: 0,
                    totalComisiones: 0
                };
            }

            monthlyStats[monthKey].totalVentas += venta.totalVenta;
            monthlyStats[monthKey].numeroVentas += 1;
            monthlyStats[monthKey].totalComisiones += venta.comision;
        });

        return Object.values(monthlyStats).sort((a, b) => a.mes.localeCompare(b.mes));
    },

    // Generar reporte resumido
    generateSummaryReport() {
        const metrics = this.calculateMetrics();
        const topUsers = this.getTopUsers(3);
        const monthlyStats = this.getMonthlyStats();

        return {
            resumen: metrics,
            topUsuarios: topUsers,
            estadisticasMensuales: monthlyStats,
            fechaGeneracion: getCurrentDate()
        };
    },

    // Exportar datos del dashboard
    exportData() {
        const report = this.generateSummaryReport();
        downloadAsJSON(report, `dashboard-report-${getCurrentDate()}.json`);
    }
};