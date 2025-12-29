<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$visitorsFile = 'visitors.json';

function getVisitorStats() {
    global $visitorsFile;
    if (!file_exists($visitorsFile)) {
        file_put_contents($visitorsFile, json_encode(['total' => 0, 'today' => 0, 'last_reset' => date('Y-m-d')]));
        return ['total' => 0, 'today' => 0, 'last_reset' => date('Y-m-d')];
    }
    return json_decode(file_get_contents($visitorsFile), true);
}

function updateVisitorCount() {
    $stats = getVisitorStats();
    $today = date('Y-m-d');
    
    // Reset daily count if new day
    if ($stats['last_reset'] !== $today) {
        $stats['today'] = 0;
        $stats['last_reset'] = $today;
    }
    
    $stats['total']++;
    $stats['today']++;
    
    global $visitorsFile;
    file_put_contents($visitorsFile, json_encode($stats));
    return $stats;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        echo json_encode(getVisitorStats());
        break;
        
    case 'POST':
        echo json_encode(updateVisitorCount());
        break;
}
?>