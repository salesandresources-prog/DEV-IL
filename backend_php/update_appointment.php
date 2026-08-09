<?php
// update_appointment.php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_config.php';

$input = json_decode(file_get_contents("php://input"), true);

$stmt = $pdo->prepare("UPDATE citas SET cedula=:cedula, fecha=:fecha, hora=:hora, motivo=:motivo, encargado=:encargado, estado=:estado WHERE id=:id");

$stmt->execute([
    ':id'        => $input['id'],
    ':cedula'    => $input['cedula']    ?? '',
    ':fecha'     => $input['fecha']     ?? '',
    ':hora'      => $input['hora']      ?? '',
    ':motivo'    => $input['motivo']    ?? '',
    ':encargado' => $input['encargado'] ?? '',
    ':estado'    => $input['estado']    ?? 'Pendiente',
]);

echo json_encode(["success" => true]);
