<?php
// index.php — Página principal del backend (health check)
require_once __DIR__ . '/cors.php';

echo json_encode([
    "status" => "ok",
    "message" => "DEVI API backend is running",
    "version" => "1.0.0",
    "endpoints" => [
        "POST /login.php",
        "GET  /get_patients.php",
        "POST /add_patient.php",
        "POST /update_patient.php",
        "POST /delete_patient.php",
        "GET  /get_appointments.php",
        "POST /add_appointment.php",
        "POST /update_appointment.php",
        "POST /delete_appointment.php",
        "GET  /get_historias.php",
        "POST /add_historia.php",
        "POST /delete_historia.php",
    ]
]);
