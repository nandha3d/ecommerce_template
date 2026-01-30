<?php

namespace App\Services\Seo;

use Illuminate\Support\Facades\File;
use Illuminate\Http\Response;

class SeoRenderer
{
    /**
     * Render the React app with injected SEO tags.
     *
     * @param string $type
     * @param mixed $model
     * @return Response
     */
    public function render(string $type, $model = null): Response
    {
        // 1. Load HTML
        $path = public_path('index.html');
        
        if (!File::exists($path)) {
            return response("Frontend build not found.", 404);
        }

        $html = File::get($path);

        // 2. Build Data
        $meta = MetaBuilder::build($type, $model);
        $schema = SchemaBuilder::build($type, $model);

        // 3. Hydration Data (Bridge to keep existing functionality)
        // If the model is a product, pass it for hydration
        if ($type === 'product' && $model) {
            $meta['initial_data'] = $model;
        }

        // 4. Inject
        $finalHtml = HtmlInjector::inject($html, $meta, $schema);

        // 5. Return Response with Headers
        return response($finalHtml)
            ->header('Content-Type', 'text/html')
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    }
}
