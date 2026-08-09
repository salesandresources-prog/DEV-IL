<?php
// get_appointments.php — Lista todas las citas
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_config.php';

$stmt = $pdo->query("SELECT * FROM citas ORDER BY fecha DESC, hora ASC");
$rows = $stmt->fetchAll();

echo json_encode($rows);
