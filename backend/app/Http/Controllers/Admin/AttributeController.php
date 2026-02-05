<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeOption;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AttributeController extends Controller
{
    /**
     * List all attributes with their options.
     */
    public function index(): JsonResponse
    {
        $attributes = ProductAttribute::with('options')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $attributes->map(fn($attr) => [
                'id' => $attr->id,
                'name' => $attr->name,
                'slug' => $attr->slug,
                'type' => $attr->type,
                'type_display' => $attr->swatch_type_display,
                'is_active' => $attr->is_active,
                'show_price_diff' => $attr->show_price_diff ?? false,
                'sort_order' => $attr->sort_order,
                'options_count' => $attr->options->count(),
                'options' => $attr->options->map(fn($opt) => $opt->toSwatchArray()),
            ]),
        ]);
    }

    /**
     * Get single attribute with options.
     */
    public function show(int $id): JsonResponse
    {
        $attribute = ProductAttribute::with('options')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $attribute->id,
                'name' => $attribute->name,
                'slug' => $attribute->slug,
                'type' => $attribute->type,
                'is_active' => $attribute->is_active,
                'sort_order' => $attribute->sort_order,
                'options' => $attribute->options->map(fn($opt) => $opt->toSwatchArray()),
            ],
        ]);
    }

    /**
     * Create new attribute.
     */
    public function store(Request $request): JsonResponse
    {
        \Illuminate\Support\Facades\Log::info('Attribute Store Request:', $request->all());
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:text,color,image,select,button,radio',
            'is_active' => 'boolean',
            'show_price_diff' => 'boolean',
            'sort_order' => 'integer',
            'options' => 'nullable|array',
            'options.*.value' => 'required_with:options|string|max:255',
            'options.*.label' => 'nullable|string|max:255',
            'options.*.color_code' => 'nullable|string|max:50',
            'options.*.image' => 'nullable|string|max:500',
            'options.*.price_modifier' => 'nullable|numeric',
        ]);

        DB::beginTransaction();
        try {
            $attribute = ProductAttribute::create([
                'name' => $validated['name'],
                'slug' => Str::slug($validated['name']),
                'type' => $validated['type'],
                'is_active' => $validated['is_active'] ?? true,
                'show_price_diff' => $validated['show_price_diff'] ?? false,
                'sort_order' => $validated['sort_order'] ?? 0,
            ]);

            // Create options
            if (!empty($validated['options'])) {
                foreach ($validated['options'] as $index => $optionData) {
                    ProductAttributeOption::create([
                        'attribute_id' => $attribute->id,
                        'value' => $optionData['value'],
                        'label' => $optionData['label'] ?? null,
                        'color_code' => $optionData['color_code'] ?? null,
                        'image' => $optionData['image'] ?? null,
                        'price_modifier' => $optionData['price_modifier'] ?? 0,
                        'sort_order' => $index,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Attribute created successfully',
                'data' => $attribute->load('options'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create attribute: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update attribute.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        \Illuminate\Support\Facades\Log::info("Attribute Update Request ($id):", $request->all());
        $attribute = ProductAttribute::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:text,color,image,select,button,radio',
            'is_active' => 'boolean',
            'show_price_diff' => 'boolean',
            'sort_order' => 'integer',
            'options' => 'nullable|array',
            'options.*.id' => 'nullable|integer',
            'options.*.value' => 'required_with:options|string|max:255',
            'options.*.label' => 'nullable|string|max:255',
            'options.*.color_code' => 'nullable|string|max:50',
            'options.*.image' => 'nullable|string|max:500',
            'options.*.price_modifier' => 'nullable|numeric',
        ]);

        DB::beginTransaction();
        try {
            // Update main fields
            if (isset($validated['name'])) {
                $attribute->name = $validated['name'];
                $attribute->slug = Str::slug($validated['name']);
            }
            if (isset($validated['type'])) $attribute->type = $validated['type'];
            if (array_key_exists('is_active', $validated)) $attribute->is_active = $validated['is_active'];
            if (array_key_exists('show_price_diff', $validated)) $attribute->show_price_diff = $validated['show_price_diff'];
            if (isset($validated['sort_order'])) $attribute->sort_order = $validated['sort_order'];
            $attribute->save();

            // Update options (replace all)
            if (isset($validated['options'])) {
                $existingIds = [];
                foreach ($validated['options'] as $index => $optionData) {
                    if (!empty($optionData['id'])) {
                        // Update existing
                        $option = ProductAttributeOption::find($optionData['id']);
                        if ($option && $option->attribute_id === $attribute->id) {
                            $option->update([
                                'value' => $optionData['value'],
                                'label' => $optionData['label'] ?? null,
                                'color_code' => $optionData['color_code'] ?? null,
                                'image' => $optionData['image'] ?? null,
                                'price_modifier' => $optionData['price_modifier'] ?? 0,
                                'sort_order' => $index,
                            ]);
                            $existingIds[] = $option->id;
                        }
                    } else {
                        // Create new
                        $option = ProductAttributeOption::create([
                            'attribute_id' => $attribute->id,
                            'value' => $optionData['value'],
                            'label' => $optionData['label'] ?? null,
                            'color_code' => $optionData['color_code'] ?? null,
                            'image' => $optionData['image'] ?? null,
                            'price_modifier' => $optionData['price_modifier'] ?? 0,
                            'sort_order' => $index,
                        ]);
                        $existingIds[] = $option->id;
                    }
                }
                // Delete removed options
                $attribute->options()->whereNotIn('id', $existingIds)->delete();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Attribute updated successfully',
                'data' => $attribute->fresh(['options']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update attribute: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete attribute.
     */
    public function destroy(int $id): JsonResponse
    {
        $attribute = ProductAttribute::findOrFail($id);
        $attribute->delete();

        return response()->json([
            'success' => true,
            'message' => 'Attribute deleted successfully',
        ]);
    }

    /**
     * Get available swatch types.
     */
    public function types(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                ['value' => 'text', 'label' => 'Text (S, M, L, XL)'],
                ['value' => 'color', 'label' => 'Color Swatch'],
                ['value' => 'image', 'label' => 'Image Swatch'],
                ['value' => 'select', 'label' => 'Dropdown'],
                ['value' => 'button', 'label' => 'Buttons'],
                ['value' => 'radio', 'label' => 'Radio Buttons'],
            ],
        ]);
    }
}
