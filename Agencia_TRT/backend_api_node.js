// backend/server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'reserva_trip',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Pool de conexiones
const pool = mysql.createPool(dbConfig);

// Middleware para manejo de errores de base de datos
const handleDBError = (error, res) => {
    console.error('Error de base de datos:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
            success: false,
            message: 'Ya existe un registro con estos datos',
            error: error.message
        });
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            success: false,
            message: 'Referencia inválida en los datos',
            error: error.message
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error de base de datos'
    });
};

// =====================
// RUTAS DE VENTAS
// =====================

// Obtener todas las ventas
app.get('/api/ventas', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                id,
                fecha_venta,
                fecha_registro,
                codigo_reserva,
                cliente_nombre as cliente,
                total_venta,
                comision,
                usuario_nombre as usuarioRegistra
            FROM ventas 
            WHERE activo = TRUE 
            ORDER BY fecha_registro DESC
        `);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        handleDBError(error, res);
    }
});

// Obtener una venta por ID
app.get('/api/ventas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(`
            SELECT 
                id,
                fecha_venta,
                fecha_registro,
                codigo_reserva,
                cliente_nombre as cliente,
                total_venta,
                comision,
                usuario_nombre as usuarioRegistra
            FROM ventas 
            WHERE id = ? AND activo = TRUE
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        handleDBError(error, res);
    }
});

// Crear nueva venta
app.post('/api/ventas', async (req, res) => {
    try {
        const {
            fechaVenta,
            codigoReserva,
            cliente,
            totalVenta,
            usuarioRegistra
        } = req.body;
        
        // Validaciones básicas
        if (!fechaVenta || !codigoReserva || !cliente || !totalVenta || !usuarioRegistra) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }
        
        if (totalVenta <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El total de venta debe ser mayor a 0'
            });
        }
        
        // Calcular comisión (30%)
        const comision = Math.round(totalVenta * 0.3 * 100) / 100;
        
        // Insertar venta
        const [result] = await pool.execute(`
            INSERT INTO ventas (
                fecha_venta, 
                codigo_reserva, 
                cliente_nombre, 
                total_venta, 
                comision, 
                usuario_nombre
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [fechaVenta, codigoReserva, cliente, totalVenta, comision, usuarioRegistra]);
        
        // Obtener la venta creada
        const [newVenta] = await pool.execute(`
            SELECT 
                id,
                fecha_venta,
                fecha_registro,
                codigo_reserva,
                cliente_nombre as cliente,
                total_venta,
                comision,
                usuario_nombre as usuarioRegistra
            FROM ventas 
            WHERE id = ?
        `, [result.insertId]);
        
        res.status(201).json({
            success: true,
            message: 'Venta creada exitosamente',
            data: newVenta[0]
        });
    } catch (error) {
        handleDBError(error, res);
    }
});

// Actualizar venta
app.put('/api/ventas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fechaVenta,
            codigoReserva,
            cliente,
            totalVenta,
            usuarioRegistra
        } = req.body;
        
        // Validaciones básicas
        if (!fechaVenta || !codigoReserva || !cliente || !totalVenta || !usuarioRegistra) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }
        
        if (totalVenta <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El total de venta debe ser mayor a 0'
            });
        }
        
        // Verificar que la venta existe
        const [existing] = await pool.execute('SELECT id FROM ventas WHERE id = ? AND activo = TRUE', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }
        
        // Calcular comisión (30%)
        const comision = Math.round(totalVenta * 0.3 * 100) / 100;
        
        // Actualizar venta
        await pool.execute(`
            UPDATE ventas SET 
                fecha_venta = ?, 
                codigo_reserva = ?, 
                cliente_nombre = ?, 
                total_venta = ?, 
                comision = ?, 
                usuario_nombre = ?
            WHERE id = ?
        `, [fechaVenta, codigoReserva, cliente, totalVenta, comision, usuarioRegistra, id]);
        
        // Obtener la venta actualizada
        const [updatedVenta] = await pool.execute(`
            SELECT 
                id,
                fecha_venta,
                fecha_registro,
                codigo_reserva,
                cliente_nombre as cliente,
                total_venta,
                comision,
                usuario_nombre as usuarioRegistra
            FROM ventas 
            WHERE id = ?
        `, [id]);
        
        res.json({
            success: true,
            message: 'Venta actualizada exitosamente',
            data: updatedVenta[0]
        });
    } catch (error) {
        handleDBError(error, res);
    }
});

// Eliminar venta (soft delete)
app.delete('/api/ventas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar que la venta existe
        const [existing] = await pool.execute('SELECT id FROM ventas WHERE id = ? AND activo = TRUE', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }
        
        // Soft delete
        await pool.execute('UPDATE ventas SET activo = FALSE WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Venta eliminada exitosamente'
        });
    } catch (error) {
        handleDBError(error, res);
    }
});

// =====================
// RUTAS DE DASHBOARD
// =====================

// Obtener estadísticas del dashboard
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        
        let whereClause = 'WHERE activo = TRUE';
        let params = [];
        
        if (fechaInicio && fechaFin) {
            whereClause += ' AND fecha_venta BETWEEN ? AND ?';
            params.push(fechaInicio, fechaFin);
        }
        
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(*) as numeroVentas,
                COALESCE(SUM(total_venta), 0) as totalVentas,
                COALESCE(AVG(total_venta), 0) as promedioVentas,
                COALESCE(SUM(comision), 0) as totalComisiones
            FROM ventas 
            ${whereClause}
        `, params);
        
        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        handleDBError(error, res);
    }
});

// Obtener top usuarios
app.get('/api/dashboard/top-users', async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        
        const [users] = await pool.execute(`
            SELECT 
                usuario_nombre as nombre,
                COUNT(*) as numeroVentas,
                SUM(total_venta) as totalVentas,
                SUM(comision) as totalComisiones
            FROM ventas 
            WHERE activo = TRUE
            GROUP BY usuario_nombre
            ORDER BY totalVentas DESC
            LIMIT ?
        `, [parseInt(limit)]);
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        handleDBError(error, res);
    }
});

// Obtener estadísticas mensuales
app.get('/api/dashboard/monthly-stats', async (req, res) => {
    try {
        const [stats] = await pool.execute(`
            SELECT 
                DATE_FORMAT(fecha_venta, '%Y-%m') as mes,
                COUNT(*) as numeroVentas,
                SUM(total_venta) as totalVentas,
                SUM(comision) as totalComisiones
            FROM ventas 
            WHERE activo = TRUE
            GROUP BY DATE_FORMAT(fecha_venta, '%Y-%m')
            ORDER BY mes ASC
        `);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        handleDBError(error, res);
    }
});

// =====================
// RUTAS DE USUARIOS
// =====================

// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id, nombre, email, telefono, activo, fecha_creacion
            FROM usuarios 
            WHERE activo = TRUE 
            ORDER BY nombre ASC
        `);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        handleDBError(error, res);
    }
});

// =====================
// RUTAS DE CLIENTES
// =====================

// Obtener todos los clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id, nombre, email, telefono, documento, fecha_creacion
            FROM clientes 
            ORDER BY nombre ASC
        `);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        handleDBError(error, res);
    }
});

// =====================
// RUTAS GENERALES
// =====================

// Ruta principal - servir la aplicación
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Ruta de salud de la API
app.get('/api/health', async (req, res) => {
    try {
        await pool.execute('SELECT 1');
        res.json({
            success: true,
            message: 'API funcionando correctamente',
            database: 'Conectada',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error de conexión a la base de datos',
            error: error.message
        });
    }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo global de errores
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error del servidor'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📱 API disponible en http://localhost:${PORT}/api`);
    console.log(`🌐 Aplicación disponible en http://localhost:${PORT}`);
});

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
    console.log('Cerrando servidor...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Cerrando servidor...');
    await pool.end();
    process.exit(0);
});