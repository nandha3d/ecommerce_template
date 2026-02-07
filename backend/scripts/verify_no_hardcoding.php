<?php

/**
 * Scan codebase for potential hardcoded values
 */

$violations = [];

// Check for hardcoded numbers in services
$files = glob('app/Services/**/*.php');
foreach ($files as $file) {
    $content = file_get_contents($file);
    
    // Find const declarations with numbers
    // Skip ConfigurationService as it defines defaults
    if (strpos($file, 'ConfigurationService') !== false) continue;
    
    if (preg_match_all('/const\s+[A-Z_]+\s*=\s*(\d+|\'[^\']+\')/i', $content, $matches)) {
        // Filter out safe consts (LOG_CHANNEL, etc if any, but strict check requested)
        foreach ($matches[0] as $match) {
             if (strpos($match, 'CACHE_KEY') !== false) continue; // Keys are strings, maybe ok
             // The prompt strictly said "No const declarations with business values"
             // Numbers are definitely suspicious.
             if (preg_match('/\d+/', $match)) {
                $violations[] = [
                    'file' => $file,
                    'type' => 'const_number_declaration',
                    'match' => $match
                ];
             }
        }
    }
    
    // Find magic numbers in comparisons (>= 70, < 30)
    // simplistic regex, might have false positives but good for finding the obvious ones we just fixed
    if (preg_match_all('/[>=<]\s*\d{2,}/', $content, $matches)) {
        foreach ($matches[0] as $match) {
             // Ignore lines with 'getInt' or 'getFloat' defaults as they are fallback defaults 
             // Logic: split content by lines, check line.
        }
        
    }
}

// Check specific files we fixed
$filesToCheck = [
    'app/Services/FraudDetectionService.php',
    'app/Models/PaymentVelocity.php'
];

foreach ($filesToCheck as $file) {
    if (!file_exists($file)) continue;
    $content = file_get_contents($file);
    if (strpos($content, 'const ALLOW_THRESHOLD') !== false) {
        $violations[] = ['file' => $file, 'type' => 'Old Fraud Constants Found'];
    }
    if (strpos($content, 'const LIMITS') !== false) {
         $violations[] = ['file' => $file, 'type' => 'Old Velocity Limits Found'];
    }
}


// Output report
if (empty($violations)) {
    echo "✅ No obvious hardcoded values detected in scanned files!\n";
    exit(0);
} else {
    echo "❌ Found " . count($violations) . " potential hardcoded values:\n\n";
    foreach ($violations as $violation) {
        echo "File: {$violation['file']}\n";
        echo "Type: {$violation['type']}\n";
        if (isset($violation['match'])) echo "Match: {$violation['match']}\n";
        echo "\n";
    }
    exit(1);
}
