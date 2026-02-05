<?php

// Framework-agnostic migration runner
// Usage: php migrate_pricing.php

require __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$host = $_ENV['DB_HOST'] ?? '127.0.0.1';
$db   = $_ENV['DB_DATABASE'] ?? 'ecommerce_db';
$user = $_ENV['DB_USERNAME'] ?? 'root';
$pass = $_ENV['DB_PASSWORD'] ?? '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    echo "Connected to Database.\n";
    
    $sql = "
    CREATE TABLE IF NOT EXISTS pricing_rules (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        name varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
        description text COLLATE utf8mb4_unicode_ci,
        conditions json DEFAULT NULL,
        actions json NOT NULL,
        priority int(11) NOT NULL DEFAULT '0',
        is_active tinyint(1) NOT NULL DEFAULT '1',
        starts_at timestamp NULL DEFAULT NULL,
        ends_at timestamp NULL DEFAULT NULL,
        created_at timestamp NULL DEFAULT NULL,
        updated_at timestamp NULL DEFAULT NULL,
        deleted_at timestamp NULL DEFAULT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    $pdo->exec($sql);
    echo "Migration 'pricing_rules' executed successfully.\n";

} catch (\PDOException $e) {
    echo "Migration Failed: " . $e->getMessage() . "\n";
    exit(1);
}
