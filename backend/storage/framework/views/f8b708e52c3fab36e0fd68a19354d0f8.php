<div>
    <button 
        wire:click="toggleWishlist"
        class="p-2 rounded-full transition-colors duration-200 <?php echo e($isInWishlist ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'); ?>"
        title="<?php echo e($isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'); ?>"
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="<?php echo e($isInWishlist ? 'currentColor' : 'none'); ?>" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    </button>
</div>
<?php /**PATH D:\PROJECTS\WEBSITES\supplement-ecommerce\backend\resources\views/livewire/wishlist-button.blade.php ENDPATH**/ ?>