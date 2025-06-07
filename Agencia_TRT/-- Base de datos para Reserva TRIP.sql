-- Base de datos para Reserva TRIP
CREATE DATABASE IF NOT EXISTS reserva_trip;
USE reserva_trip;

-- Tabla de usuarios/asesores
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    documento VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de ventas
CREATE TABLE ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_venta DATE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    codigo_reserva VARCHAR(50) UNIQUE NOT NULL,
    cliente_id INT,
    cliente_nombre VARCHAR(100) NOT NULL, -- Para compatibilidad con el sistema actual
    total_venta DECIMAL(15,2) NOT NULL,
    comision DECIMAL(15,2) NOT NULL,
    usuario_id INT,
    usuario_nombre VARCHAR(100) NOT NULL, -- Para compatibilidad con el sistema actual
    activo BOOLEAN DEFAULT TRUE,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    INDEX idx_fecha_venta (fecha_venta),
    INDEX idx_codigo_reserva (codigo_reserva),
    INDEX idx_cliente_nombre (cliente_nombre),
    INDEX idx_usuario_nombre (usuario_nombre)
);

-- Insertar algunos usuarios de ejemplo
INSERT INTO usuarios (nombre, email, telefono) VALUES
('Ana García', 'ana.garcia@reservatrip.com', '3001234567'),
('Carlos Ruiz', 'carlos.ruiz@reservatrip.com', '3007654321'),
('María López', 'maria.lopez@reservatrip.com', '3009876543');

-- Insertar algunos clientes de ejemplo
INSERT INTO clientes (nombre, email, telefono, documento) VALUES
('Juan Pérez', 'juan.perez@email.com', '3011234567', '12345678'),
('María López', 'maria.lopez@email.com', '3012345678', '87654321'),
('Pedro González', 'pedro.gonzalez@email.com', '3013456789', '11223344');

-- Insertar algunas ventas de ejemplo
INSERT INTO ventas (fecha_venta, codigo_reserva, cliente_id, cliente_nombre, total_venta, comision, usuario_id, usuario_nombre) VALUES
('2024-06-01', 'RES001', 1, 'Juan Pérez', 1500000.00, 450000.00, 1, 'Ana García'),
('2024-06-02', 'RES002', 2, 'María López', 2200000.00, 660000.00, 2, 'Carlos Ruiz'),
('2024-06-03', 'RES003', 3, 'Pedro González', 1800000.00, 540000.00, 1, 'Ana García');

-- Crear vista para reportes
CREATE VIEW vista_ventas_completa AS
SELECT 
    v.id,
    v.fecha_venta,
    v.fecha_registro,
    v.codigo_reserva,
    v.cliente_nombre,
    c.email as cliente_email,
    c.telefono as cliente_telefono,
    v.total_venta,
    v.comision,
    v.usuario_nombre,
    u.email as usuario_email,
    YEAR(v.fecha_venta) as año,
    MONTH(v.fecha_venta) as mes,
    DAY(v.fecha_venta) as dia
FROM ventas v
LEFT JOIN clientes c ON v.cliente_id = c.id
LEFT JOIN usuarios u ON v.usuario_id = u.id
WHERE v.activo = TRUE
ORDER BY v.fecha_venta DESC;

-- Crear procedimiento almacenado para estadísticas
DELIMITER //
CREATE PROCEDURE GetVentasStats(
    IN fecha_inicio DATE,
    IN fecha_fin DATE
)
BEGIN
    SELECT 
        COUNT(*) as total_ventas,
        SUM(total_venta) as suma_total,
        AVG(total_venta) as promedio_venta,
        SUM(comision) as total_comisiones,
        MIN(total_venta) as venta_minima,
        MAX(total_venta) as venta_maxima
    FROM ventas 
    WHERE fecha_venta BETWEEN fecha_inicio AND fecha_fin 
    AND activo = TRUE;
    
    -- Ventas por usuario
    SELECT 
        usuario_nombre,
        COUNT(*) as num_ventas,
        SUM(total_venta) as total_usuario,
        SUM(comision) as comision_usuario
    FROM ventas 
    WHERE fecha_venta BETWEEN fecha_inicio AND fecha_fin 
    AND activo = TRUE
    GROUP BY usuario_nombre, usuario_id
    ORDER BY total_usuario DESC;
END //
DELIMITER ;

-- Función para calcular comisión
DELIMITER //
CREATE FUNCTION CalcularComision(total_venta DECIMAL(15,2), porcentaje DECIMAL(5,2) DEFAULT 30.00)
RETURNS DECIMAL(15,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    RETURN ROUND(total_venta * (porcentaje / 100), 2);
END //
DELIMITER ;