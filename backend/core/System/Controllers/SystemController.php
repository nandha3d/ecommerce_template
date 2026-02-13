<?php

namespace Core\System\Controllers;

use App\Http\Controllers\Controller;
use Core\System\Models\SiteSetting;
use Illuminate\Http\JsonResponse;

class SystemController extends Controller
{
    public function getConfig(): JsonResponse
    {
        $settings = SiteSetting::where('is_public', true)
            ->get()
            ->mapWithKeys(function ($setting) {
                return [$setting->key => $setting->value];
            });

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    public function getVariantBuilderConfig(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'maxImagesPerVariant' => 10,
                'maxDuplicateCount' => 50,
                'allowedImageFormats' => ['image/jpeg', 'image/png', 'image/webp'],
                'maxImageSizeBytes' => 5 * 1024 * 1024, // 5MB
                'skuFormat' => '{baseSku}-{attributeCodes}',
                'titleFormat' => '{productName} - {attributes}',
                'validationRules' => [
                    'priceMinimum' => 0,
                    'stockMinimum' => 0,
                    'weightMinimum' => 0,
                    'dimensionsRequired' => false,
                ],
                'fieldLabels' => [
                    'cost' => 'Cost price',
                    'price' => 'Selling Price',
                    'salePrice' => 'Offer Price',
                    'stock' => 'Stock Qty',
                    'weight' => 'Net Wt(kg)',
                    'length' => 'L',
                    'breadth' => 'B',
                    'height' => 'H'
                ]
            ]
        ]);
    }
}
