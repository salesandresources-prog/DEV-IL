<?php
// add_appointment.php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_config.php';

$input = json_decode(file_get_contents("php://input"), true);

$stmt = $pdo->prepare("INSERT INTO citas (cedula, fecha, hora, motivo, encargado, estado) VALUES (:cedula, :fecha, :hora, :motivo, :encargado, :estado)");

$stmt->execute([
    ':cedula'    => $input['cedula']    ?? '',
    ':fecha'     => $input['fecha']     ?? date('Y-m-d'),
    ':hora'      => $input['hora']      ?? '09:00',
    ':motivo'    => $input['motivo']    ?? '',
    ':encargado' => $input['encargado'] ?? '',
    ':estado'    => $input['estado']    ?? 'Pendiente',
]);

echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
