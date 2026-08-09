<?php
// get_historias.php — Lista historias clínicas (opcionalmente filtradas por paciente)
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_config.php';

$pacienteId = $_GET['paciente_id'] ?? null;

if ($pacienteId) {
    $stmt = $pdo->prepare("SELECT * FROM historias_clinicas WHERE paciente_id = :pid ORDER BY fecha_consulta DESC");
    $stmt->execute([':pid' => $pacienteId]);
} else {
    $stmt = $pdo->query("SELECT * FROM historias_clinicas ORDER BY fecha_consulta DESC");
}

$rows = $stmt->fetchAll();
echo json_encode($rows);
