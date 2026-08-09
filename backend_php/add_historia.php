<?php
// add_historia.php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db_config.php';

$input = json_decode(file_get_contents("php://input"), true);

$stmt = $pdo->prepare("INSERT INTO historias_clinicas (paciente_id, fecha_consulta, motivo_consulta, od_esfera, od_cilindro, od_eje, oi_esfera, oi_cilindro, oi_eje, dip, diagnostico, recomendaciones, proxima_cita) VALUES (:paciente_id, :fecha_consulta, :motivo_consulta, :od_esfera, :od_cilindro, :od_eje, :oi_esfera, :oi_cilindro, :oi_eje, :dip, :diagnostico, :recomendaciones, :proxima_cita)");

$stmt->execute([
    ':paciente_id'      => $input['paciente_id']      ?? '',
    ':fecha_consulta'   => $input['fecha_consulta']   ?? date('Y-m-d'),
    ':motivo_consulta'  => $input['motivo_consulta']  ?? '',
    ':od_esfera'        => $input['od_esfera']        ?? '',
    ':od_cilindro'      => $input['od_cilindro']      ?? '',
    ':od_eje'           => $input['od_eje']            ?? '',
    ':oi_esfera'        => $input['oi_esfera']        ?? '',
    ':oi_cilindro'      => $input['oi_cilindro']      ?? '',
    ':oi_eje'           => $input['oi_eje']            ?? '',
    ':dip'              => $input['dip']               ?? '',
    ':diagnostico'      => $input['diagnostico']      ?? '',
    ':recomendaciones'  => $input['recomendaciones']  ?? '',
    ':proxima_cita'     => $input['proxima_cita']     ?? '',
]);

echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
