-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Tabla de usuarios (para el login)
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de pacientes (leads)
CREATE TABLE IF NOT EXISTS public.leads (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    whatsapp VARCHAR(20),
    direccion TEXT,
    correo VARCHAR(100),
    fecha_ingreso DATE,
    encargado VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de citas
CREATE TABLE IF NOT EXISTS public.citas (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    motivo TEXT,
    encargado VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'Pendiente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de historias clínicas
CREATE TABLE IF NOT EXISTS public.historias_clinicas (
    id SERIAL PRIMARY KEY,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar el usuario administrador inicial
INSERT INTO public.users (username, password, email, role) 
VALUES ('admin', 'admin123', 'admin@devi.com', 'admin')
ON CONFLICT (username) DO NOTHING;
