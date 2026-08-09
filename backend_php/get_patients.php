<?php
// get_patients.php — Lista todos los pacientes (tabla leads)
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_config.php';

$stmt = $pdo->query("SELECT * FROM leads ORDER BY id DESC");
$rows = $stmt->fetchAll();

// Mapear nombres de columnas de la BD a los que espera el frontend
$patients = array_map(function($row) {
    return [
        "id"           => $row['id'],
        "nombre"       => $row['nombre']       ?? '',
        "cedula"       => $row['cedula']        ?? '',
        "telefono"     => $row['telefono']      ?? '',
        "whatsapp"     => $row['whatsapp']      ?? '',
        "direccion"    => $row['direccion']     ?? '',
        "correo"       => $row['correo']        ?? '',
        "fechaIngreso" => $row['fechaIngreso']  ?? $row['fecha_ingreso'] ?? '',
        "encargado"    => $row['encargado']     ?? '',
    ];
}, $rows);

echo json_encode($patients);
