<?php
// delete_appointment.php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_config.php';

$input = json_decode(file_get_contents("php://input"), true);
$id = $input['id'] ?? null;

if (!$id) {
    echo json_encode(["success" => false, "error" => "ID requerido"]);
    exit;
}

$stmt = $pdo->prepare("DELETE FROM citas WHERE id = :id");
$stmt->execute([':id' => $id]);

echo json_encode(["success" => true]);
