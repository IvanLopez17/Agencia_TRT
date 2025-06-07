/**
 * API Client - Integración con backend MySQL
 * Reemplaza el archivo js/ventas.js existente
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Configuración global de fetch
const apiConfig = {
    headers: {
        'Content-Type': 'application/json',
    }
};

// Utilidad para manejar respuestas de la API
async function handleApiResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
    }
    
    return data;
}

// Cliente API
const ApiClient = {
    // Obtener todas las ventas
    async getVentas() {
        try {
            const response = await fetch(`${API_BASE_URL}/ventas`, {
                method: 'GET',
                ...apiConfig
            });
            
            const result = await handleApiResponse(response);
            return result.data;
        } catch (error) {
            console.error('Error al obtener ventas:', error);
            throw error;
        }
    },

    // Obtener una venta por ID
    async getVenta(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/ventas/${id}`, {
                method: 'GET',
                ...apiConfig
            });
            
            const result = await handleApiResponse(response);
            return result.data;
        } catch (error) {
            console.error('Error al obtener venta:', error);
            throw error;
        }
    },

    // Crear nueva venta
    async createVenta(ventaData) {
        try {
            const response = await fetch(`${API_BASE_URL}/ventas`, {
                method: 'POST',
                ...apiConfig,
                body: JSON.stringify(ventaData)
            });
            
            const result = await handleApiResponse(response);
            return result.data;
        } catch (error) {
            console.error('Error al crear venta:', error);
            throw error;
        }
    },

    // Actualizar venta
    async updateVenta(id, ventaData) {
        try {
            const response = await fetch(`${API_BASE_URL}/ventas/${id}`, {
                method: 'PUT',
                ...apiConfig,
                body: JSON.stringify(ventaData)
            });
            
            const result = await handleApiResponse(response);
            return result.data;
        } catch (error) {
            console.error('Error al actualizar venta:', error);
            throw error;
        }
    },

    // Eliminar venta
    async deleteVenta(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/ventas/${id}`, {
                method: 'DELETE',
                ...apiConfig
            });
            
            const result = await handleApiResponse(response);
            return result;
        } catch (error) {
            console.error('Error al eliminar venta:', error);
            throw error;
        }
    },

    // Obtener estadísticas del dashboard
    async getDashboardStats(fechaInicio = null, fechaFin = null) {
        try {
            let url = `${API_BASE_URL}/dashboard/stats`;
            
            if (fechaInicio && fechaFin) {
                url += `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                ...apiConfig
            });
            
            const result = await handleApiResponse(response);
            return result.data;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    },

    // Obtener top usuarios
    async getTopUsers(limit = 5) {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/top-users?limit=${limit}`, {
                method: 'GET',
                ...apiConfig
            });
            
            const result = await handleApiResponse(response);
            return result.data;
        } catch (error) {
            console.error('Error al obtener top usuarios:', error);
            throw error;
        }
    },

    // Obtener estadísticas mensuales
    async getMonthlyStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/monthly-stats`, {
                method: 'GET',
                ...apiConfig
            });
            
            const result = await handleApiResponse(response);
            return result.data;
        } catch (error) {
            console.error('Error al obtener estadísticas mensuales:', error);
            throw error;
        }
    },

    // Verificar salud de la API
    async checkHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`, {
                method: 'GET',
                ...apiConfig
            });
            
            const result = await handleApiResponse(response);
            return result;
        } catch (error) {
            console.error('Error al verificar salud de la API:', error);
            throw error;
        }
    }
};

/**
 * Módulo de Gestión de Ventas - Versión con Base de Datos
 */
const VentasManager = {
    // Estado local
    ventas: [],
    editingId: null,

    // Elementos del DOM
    elements: {
        form: null,
        modal: null,
        tableBody: null,
        search