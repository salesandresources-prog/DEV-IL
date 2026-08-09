<?php
// add_patient.php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_config.php';

$input = json_decode(file_get_contents("php://input"), true);

$stmt = $pdo->prepare("INSERT INTO leads (nombre, cedula, telefono, whatsapp, direccion, correo, fechaIngreso, encargado) VALUES (:nombre, :cedula, :telefono, :whatsapp, :direccion, :correo, :fechaIngreso, :encargado)");

$stmt->execute([
    ':nombre'       => $input['nombre']       ?? '',
    ':cedula'       => $input['cedula']        ?? '',
    ':telefono'     => $input['telefono']      ?? '',
    ':whatsapp'     => $input['whatsapp']      ?? '',
    ':direccion'    => $input['direccion']     ?? '',
    ':correo'       => $input['correo']        ?? '',
    ':fechaIngreso' => $input['fechaIngreso']  ?? date('Y-m-d'),
    ':encargado'    => $input['encargado']     ?? '',
]);

echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
