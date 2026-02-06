<?php

namespace Core\Cart\Exceptions;

use Exception;

class PriceChangedException extends Exception
{
    protected array $changes;

    public function __construct(string $message = "Prices have changed", array $changes = [])
    {
        parent::__construct($message, 409); // 409 Conflict
        $this->changes = $changes;
    }

    public function getChanges(): array
    {
        return $this->changes;
    }
}
