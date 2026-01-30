<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductCustomization extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'order_item_id',
        'session_id',
        'uploaded_image',
        'preview_image',
        'customization_data',
        'status',
        'admin_notes',
    ];

    protected $casts = [
        'customization_data' => 'array',
    ];

    const STATUS_DRAFT = 'draft';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    /**
     * Get the product
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get uploaded image URL
     */
    public function getUploadedImageUrlAttribute()
    {
        if (!$this->uploaded_image) return null;
        return asset('storage/' . $this->uploaded_image);
    }

    /**
     * Get preview image URL
     */
    public function getPreviewImageUrlAttribute()
    {
        if (!$this->preview_image) return null;
        return asset('storage/' . $this->preview_image);
    }

    /**
     * Check if can be edited
     */
    public function getCanEditAttribute()
    {
        return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_REJECTED]);
    }

    /**
     * Approve customization
     */
    public function approve(string $notes = null)
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'admin_notes' => $notes,
        ]);
    }

    /**
     * Reject customization
     */
    public function reject(string $reason)
    {
        $this->update([
            'status' => self::STATUS_REJECTED,
            'admin_notes' => $reason,
        ]);
    }
}
