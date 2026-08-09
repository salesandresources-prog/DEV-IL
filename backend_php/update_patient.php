<?php
// update_patient.php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_config.php';

$input = json_decode(file_get_contents("php://input"), true);

$stmt = $pdo->prepare("UPDATE leads SET nombre=:nombre, cedula=:cedula, telefono=:telefono, whatsapp=:whatsapp, direccion=:direccion, correo=:correo, fechaIngreso=:fechaIngreso, encargado=:encargado WHERE id=:id");

$stmt->execute([
    ':id'           => $input['id'],
    ':nombre'       => $input['nombre']       ?? '',
    ':cedula'       => $input['cedula']        ?? '',
    ':telefono'     => $input['telefono']      ?? '',
    ':whatsapp'     => $input['whatsapp']      ?? '',
    ':direccion'    => $input['direccion']     ?? '',
    ':correo'       => $input['correo']        ?? '',
    ':fechaIngreso' => $input['fechaIngreso']  ?? '',
    ':encargado'    => $input['encargado']     ?? '',
]);

echo json_encode(["success" => true]);
