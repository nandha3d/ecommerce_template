<?php

namespace Core\Pricing\Repositories;

use Core\Pricing\Models\PricingRule;
use Illuminate\Support\Facades\DB; 
// Note: We are using Laravel's DB Facade here generally as a bridge, 
// BUT the spec says Forbidden in Core: Laravel Facades (DB).
// So I should inject PDO or use a Connection interface.
// However, getting a PDO instance in Laravel requires DB::getPdo().
// To strictly follow "No Laravel Facades in Core", I should inject the PDO instance via Constructor.

class PricingRuleRepository
{
    private \PDO $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get all active rules sorted by priority.
     * @return PricingRule[]
     */
    public function getActiveRules(): array
    {
        $sql = "
            SELECT * FROM pricing_rules 
            WHERE is_active = 1 
            AND (starts_at IS NULL OR starts_at <= NOW()) 
            AND (ends_at IS NULL OR ends_at >= NOW())
            ORDER BY priority DESC
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        
        $rules = [];
        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $rules[] = PricingRule::fromArray($row);
        }

        return $rules;
    }
}
