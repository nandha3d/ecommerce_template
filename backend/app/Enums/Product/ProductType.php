<?php

namespace App\Enums\Product;

enum ProductType: string
{
    case SIMPLE = 'simple';
    case VARIABLE = 'variable';
    case BUNDLE = 'bundle';
    case DIGITAL = 'digital';

    public function label(): string
    {
        return match($this) {
            self::SIMPLE => 'Simple Product',
            self::VARIABLE => 'Variable Product',
            self::BUNDLE => 'Product Bundle',
            self::DIGITAL => 'Digital Product',
        };
    }
}
