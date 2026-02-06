<?php

namespace App\Validators;

class VariantValidator
{
    /**
     * Validate variant data structure.
     * 
     * @param array $data
     * @throws \InvalidArgumentException
     */
    public function validate(array $data): void
    {
        // 1. Required Fields
        if (empty($data['sku'])) {
            throw new \InvalidArgumentException("Variant validation failed: SKU is required.");
        }

        if (!isset($data['price'])) {
            throw new \InvalidArgumentException("Variant validation failed: Price is required for SKU {$data['sku']}.");
        }

        // 2. Numeric Validation
        if (!is_numeric($data['price']) || $data['price'] < 0) {
            throw new \InvalidArgumentException("Variant validation failed: Price must be a non-negative number for SKU {$data['sku']}.");
        }

        if (array_key_exists('sale_price', $data) && !is_null($data['sale_price'])) {
            if (!is_numeric($data['sale_price']) || $data['sale_price'] < 0) {
                throw new \InvalidArgumentException("Variant validation failed: Sale price must be a non-negative number for SKU {$data['sku']}.");
            }
            if ($data['sale_price'] > $data['price']) {
                throw new \InvalidArgumentException("Variant validation failed: Sale price cannot be higher than regular price for SKU {$data['sku']}.");
            }
        }

        if (array_key_exists('stock_quantity', $data)) {
            if (!is_numeric($data['stock_quantity']) || $data['stock_quantity'] < 0) {
                throw new \InvalidArgumentException("Variant validation failed: Stock quantity must be a non-negative integer for SKU {$data['sku']}.");
            }
        }

        // 3. Attribute Validation (if strictly enforcing array map)
        if (isset($data['attributes']) && !is_array($data['attributes'])) {
             throw new \InvalidArgumentException("Variant validation failed: Attributes must be an array map for SKU {$data['sku']}.");
        }
    }
}
