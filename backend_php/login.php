<?php
// login.php — Autenticación de usuario
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_config.php';

$input = json_decode(file_get_contents("php://input"), true);
$user     = $input['user']     ?? '';
$password = $input['password'] ?? '';

if (empty($user) || empty($password)) {
    echo json_encode(["success" => false, "error" => "Faltan credenciales"]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE (username = :user OR email = :user) LIMIT 1");
$stmt->execute([':user' => $user]);
$row = $stmt->fetch();

if (!$row) {
    echo json_encode(["success" => false, "error" => "Usuario no encontrado"]);
    exit;
}

// Verificar contraseña (soporta password_hash y texto plano como fallback)
$valid = false;
if (password_verify($password, $row['password'] ?? '')) {
    $valid = true;
} elseif (($row['password'] ?? '') === $password) {
    // Fallback para contraseñas en texto plano (NO recomendado para producción)
    $valid = true;
}

if (!$valid) {
    echo json_encode(["success" => false, "error" => "Contraseña incorrecta"]);
    exit;
}

echo json_encode([
    "success" => true,
    "user" => [
        "id"       => (int) $row['id'],
        "username" => $row['username'],
        "email"    => $row['email'] ?? '',
        "role"     => $row['role'] ?? 'user',
    ]
]);
