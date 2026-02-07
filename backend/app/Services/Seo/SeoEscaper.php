<?php

namespace App\Services\Seo;

class SeoEscaper
{
    /**
     * Escape value for safe HTML injection.
     * Prevents XSS and broken meta tags.
     *
     * @param string|null $value
     * @return string
     */
    public static function esc(?string $value): string
    {
        if (empty($value)) {
            return '';
        }
        // Trim, decode entities (to prevent double encoding), then strictly encode for HTML5
        return htmlspecialchars(html_entity_decode(trim($value), ENT_QUOTES | ENT_HTML5, 'UTF-8'), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
}
