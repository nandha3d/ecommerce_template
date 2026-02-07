<?php

namespace Core\Pricing\Models;

class PricingRule
{
    public ?int $id = null;
    public string $name;
    public ?string $description = null;
    public array $conditions = [];
    public array $actions = [];
    public int $priority = 0;
    public bool $isActive = true;
    public ?\DateTime $startsAt = null;
    public ?\DateTime $endsAt = null;

    public function __construct(
        string $name, 
        array $actions, 
        array $conditions = [], 
        int $priority = 0, 
        bool $isActive = true
    ) {
        $this->name = $name;
        $this->actions = $actions;
        $this->conditions = $conditions;
        $this->priority = $priority;
        $this->isActive = $isActive;
    }

    public static function fromArray(array $data): self
    {
        $rule = new self(
            $data['name'],
            is_string($data['actions']) ? json_decode($data['actions'], true) : $data['actions'],
            is_string($data['conditions']) ? json_decode($data['conditions'], true) : ($data['conditions'] ?? []),
            $data['priority'] ?? 0,
            (bool)($data['is_active'] ?? true)
        );
        $rule->id = $data['id'] ?? null;
        $rule->startsAt = isset($data['starts_at']) ? new \DateTime($data['starts_at']) : null;
        $rule->endsAt = isset($data['ends_at']) ? new \DateTime($data['ends_at']) : null;
        
        return $rule;
    }
}
