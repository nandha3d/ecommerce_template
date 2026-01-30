<?php
$host = '127.0.0.1';
$db   = 'supplepro';
$user = 'supplepro';
$pass = 'secret';
$port = "3306";
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset;port=$port";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
     echo "✅ SUCCESS: Connected to database successfully!";
} catch (\PDOException $e) {
     echo "❌ ERROR: " . $e->getMessage();
     // Try root user as backup check
     echo "\n\nTrying root user...";
     try {
        $pdo = new PDO("mysql:host=$host;port=$port", 'root', '', $options);
        echo "\n⚠️ PARTIAL SUCCESS: Connected as 'root' (no password). Use these credentials instead.";
     } catch (\PDOException $e2) {
        echo "\n❌ ROOT ERROR: " . $e2->getMessage();
     }
}
