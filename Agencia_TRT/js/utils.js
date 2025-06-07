/**
 * Funciones utilitarias para el proyecto Reserva TRIP
 */

// Formateo de moneda colombiana
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

// Formateo de fechas
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-CO');
}

// Obtener fecha actual en formato YYYY-MM-DD
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// Validar si una fecha es válida
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validar teléfono colombiano
function isValidPhoneNumber(phone) {
    const phoneRegex = /^[+]?[0-9]{10,13}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Limpiar espacios en blanco
function trimString(str) {
    return str ? str.trim() : '';
}

// Capitalizar primera letra
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Formatear nombre completo
function formatFullName(name) {
    return name.split(' ')
        .map(word => capitalizeFirst(word))
        .join(' ');
}

// Generar ID único simple
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Calcular porcentaje
function calculatePercentage(value, total) {
    return total > 0 ? (value / total) * 100 : 0;
}

// Redondear a decimales específicos
function roundToDecimals(num, decimals = 2) {
    return Number(Math.round(num + 'e' + decimals) + 'e-' + decimals);
}

// Debounce function para búsquedas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mostrar mensaje de éxito
function showSuccessMessage(message, duration = 3000) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, duration);
    }
}

// Mostrar error en campo específico
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Limpiar todos los errores
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

// Validar campo requerido
function validateRequired(value, fieldName) {
    if (!value || value.trim() === '') {
        return `${fieldName} es requerido`;
    }
    return null;
}

// Validar número positivo
function validatePositiveNumber(value, fieldName) {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
        return `${fieldName} debe ser un número mayor a 0`;
    }
    return null;
}

// Validar longitud mínima
function validateMinLength(value, minLength, fieldName) {
    if (value && value.length < minLength) {
        return `${fieldName} debe tener al menos ${minLength} caracteres`;
    }
    return null;
}

// Validar longitud máxima
function validateMaxLength(value, maxLength, fieldName) {
    if (value && value.length > maxLength) {
        return `${fieldName} no puede tener más de ${maxLength} caracteres`;
    }
    return null;
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Copiar al portapapeles
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
        return false;
    }
}

// Descargar datos como JSON
function downloadAsJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Obtener parámetros de URL
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Formatear número de teléfono
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    }
    return phone;
}