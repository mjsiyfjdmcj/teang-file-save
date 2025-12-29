<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$dataFile = 'trainings.json';
$historyFile = 'training_history.json';
$userFile = 'users.json';

// Initialize user data
function initUsers() {
    global $userFile;
    if (!file_exists($userFile)) {
        $users = [
            'admin' => [
                'password' => 'si1s/so',
                'name' => 'Sohi Admin'
            ]
        ];
        file_put_contents($userFile, json_encode($users, JSON_PRETTY_PRINT));
    }
}

function getTrainings() {
    global $dataFile;
    if (!file_exists($dataFile)) {
        file_put_contents($dataFile, '[]');
        return [];
    }
    $trainings = json_decode(file_get_contents($dataFile), true) ?: [];
    
    // Remove image field for details page requests
    if (isset($_GET['details']) && $_GET['details'] === 'true') {
        foreach ($trainings as &$training) {
            unset($training['image']);
        }
    }
    
    return $trainings;
}

function saveTrainings($trainings) {
    global $dataFile;
    file_put_contents($dataFile, json_encode($trainings, JSON_PRETTY_PRINT));
}

function getHistory() {
    global $historyFile;
    if (!file_exists($historyFile)) {
        file_put_contents($historyFile, '[]');
        return [];
    }
    return json_decode(file_get_contents($historyFile), true) ?: [];
}

function saveToHistory($training) {
    $history = getHistory();
    $training['saved_at'] = date('Y-m-d H:i:s');
    $history[] = $training;
    global $historyFile;
    file_put_contents($historyFile, json_encode($history, JSON_PRETTY_PRINT));
}

function authenticateUser($username, $password) {
    global $userFile;
    initUsers();
    $users = json_decode(file_get_contents($userFile), true);
    return isset($users[$username]) && $users[$username]['password'] === $password;
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'history') {
            echo json_encode(getHistory());
        } else {
            echo json_encode(getTrainings());
        }
        break;
        
    case 'POST':
        if ($action === 'login') {
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';
            
            if (authenticateUser($username, $password)) {
                echo json_encode(['success' => true, 'message' => 'Login successful']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
            }
            break;
        }
        
        if ($action === 'restore') {
            $historyId = $input['historyId'] ?? '';
            $history = getHistory();
            
            foreach ($history as $item) {
                if ($item['id'] == $historyId) {
                    $trainings = getTrainings();
                    $restoredTraining = $item;
                    $restoredTraining['id'] = time() . rand(100, 999); // New ID for restored post
                    unset($restoredTraining['saved_at']); // Remove history timestamp
                    $trainings[] = $restoredTraining;
                    saveTrainings($trainings);
                    echo json_encode(['success' => true, 'training' => $restoredTraining]);
                    return;
                }
            }
            echo json_encode(['success' => false, 'message' => 'Training not found in history']);
            break;
        }
        
        $trainings = getTrainings();
        $newTraining = [
            'id' => time() . rand(100, 999),
            'name' => $input['name'],
            'description' => $input['description'],
            'organization' => $input['organization'],
            'dateTime' => $input['dateTime'],
            'fee' => $input['fee'],
            'discountCode' => $input['discountCode'] ?? '',
            'image' => $input['image'] ?? '',
            'applyLink' => $input['applyLink'] ?? '',
            'created_at' => date('Y-m-d H:i:s')
        ];
        $trainings[] = $newTraining;
        saveTrainings($trainings);
        saveToHistory($newTraining); // Save to history
        echo json_encode(['success' => true, 'training' => $newTraining]);
        break;
        
    case 'PUT':
        $trainings = getTrainings();
        $id = $input['id'];
        foreach ($trainings as $key => $training) {
            if ($training['id'] == $id) {
                $trainings[$key] = $input;
                saveToHistory($input); // Save updated version to history
                break;
            }
        }
        saveTrainings($trainings);
        echo json_encode(['success' => true]);
        break;
        
    case 'DELETE':
        $trainings = getTrainings();
        $id = $_GET['id'];
        $trainings = array_filter($trainings, function($t) use ($id) {
            return $t['id'] != $id;
        });
        saveTrainings(array_values($trainings));
        echo json_encode(['success' => true]);
        break;
}
?>