<?php
// db_config.php — Conexión a MySQL en InfinityFree
// Actualiza estas credenciales con las de tu panel de InfinityFree

$DB_HOST = 'sql303.infinityfree.com';
$DB_USER = 'if0_42607567';          // tu usuario de InfinityFree
$DB_PASS = '5ZKJiycTdfi6';
$DB_NAME = 'if0_42607567_db_devi_leads';

try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}
