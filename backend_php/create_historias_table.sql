-- Ejecuta esto en phpMyAdmin (pestaña SQL) para crear la tabla de historias clínicas
CREATE TABLE IF NOT EXISTS historias_clinicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id VARCHAR(50) NOT NULL,
    fecha_consulta DATE NOT NULL,
    motivo_consulta TEXT,
    od_esfera VARCHAR(20) DEFAULT '',
    od_cilindro VARCHAR(20) DEFAULT '',
    od_eje VARCHAR(20) DEFAULT '',
    oi_esfera VARCHAR(20) DEFAULT '',
    oi_cilindro VARCHAR(20) DEFAULT '',
    oi_eje VARCHAR(20) DEFAULT '',
    dip VARCHAR(20) DEFAULT '',
    diagnostico TEXT,
    recomendaciones TEXT,
    proxima_cita VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
