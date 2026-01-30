<?php

namespace App\Services\Seo;

class HtmlInjector
{
    /**
     * Inject SEO data into HTML content.
     *
     * @param string $html
     * @param array $meta
     * @param array|null $schema
     * @return string
     */
    public static function inject(string $html, array $meta, ?array $schema = null): string
    {
        // 1. Prepare Values (Escaped)
        $title = SeoEscaper::esc($meta['title'] ?? '');
        $description = SeoEscaper::esc($meta['description'] ?? '');
        $canonical = SeoEscaper::esc($meta['canonical'] ?? '');
        $image = SeoEscaper::esc($meta['image'] ?? '');
        
        // 2. Replace Title
        // Use exact replacement if possible, or regex if needed
        $html = preg_replace('/<title>.*?<\/title>/', "<title>{$title}</title>", $html);

        // 3. Replace or Inject Description
        if (strpos($html, '<meta name="description"') !== false) {
            $html = preg_replace('/<meta name="description".*?>/', "<meta name=\"description\" content=\"{$description}\">", $html);
        } else {
            // Fallback injection if not present (unlikely with index.html but safe)
            $html = str_replace('</head>', "<meta name=\"description\" content=\"{$description}\">\n</head>", $html);
        }

        // 4. Build Extra Head Strings
        $extraHead = "";

        // Canonical
        if ($canonical) {
            $extraHead .= "<link rel=\"canonical\" href=\"{$canonical}\">\n";
        }

        // Open Graph
        $extraHead .= "<meta property=\"og:title\" content=\"{$title}\">\n";
        $extraHead .= "<meta property=\"og:description\" content=\"{$description}\">\n";
        if ($canonical) {
            $extraHead .= "<meta property=\"og:url\" content=\"{$canonical}\">\n";
        }
        if ($image) {
            $extraHead .= "<meta property=\"og:image\" content=\"{$image}\">\n";
        }

        // JSON-LD
        if ($schema) {
            // Encode with strict flags for HTML script injection safety
            $json = json_encode($schema, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);
            $extraHead .= "<script type=\"application/ld+json\">{$json}</script>\n";
        }

        // Hydration Logic (if present in meta)
        // Note: The spec mentioned hydration separately in Phase 3, but existing MetaController logic
        // placed it here. I will keep it supported here to not REGRESS functionality, as per global rule #7 ("SEO output identical").
        if (isset($meta['initial_data'])) {
             $initialData = json_encode($meta['initial_data'], JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);
             $extraHead .= "<script>window.__INITIAL_DATA__ = {$initialData};</script>\n";
        }

        // 5. Inject all at once before </head>
        return str_replace('</head>', $extraHead . '</head>', $html);
    }
}
