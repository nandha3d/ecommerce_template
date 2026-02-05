<div class="bg-white rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 border border-gray-100 group overflow-hidden h-full flex flex-col transform hover:-translate-y-1">
    <div class="relative">
        <a href="<?php echo e(route('products.show', $product->slug)); ?>" class="block overflow-hidden aspect-[4/5] bg-gray-50">
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($product->primaryImage): ?>
                <img src="<?php echo e($product->primaryImage->image_path); ?>" alt="<?php echo e($product->name); ?>" class="h-full w-full object-cover object-center group-hover:scale-105 transition duration-700 ease-in-out">
            <?php else: ?>
                <div class="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                    <svg class="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </a>
            
        <!-- Status Badges (Top Left) -->
        <div class="absolute top-3 left-3 flex flex-col gap-2 z-10">
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($product->is_in_stock == false): ?>
                <span class="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">Out of Stock</span>
            <?php elseif($product->sale_price): ?>
                <span class="bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">Sale</span>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </div>

        <!-- Wishlist Button (Top Right) -->
        <div class="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
            <?php
$__split = function ($name, $params = []) {
    return [$name, $params];
};
[$__name, $__params] = $__split('wishlist-button', ['productId' => $product->id]);

$key = 'wishlist-'.$product->id;
$__componentSlots = [];

$key ??= \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::generateKey('lw-3333651853-0', $key);

$__html = app('livewire')->mount($__name, $__params, $key, $__componentSlots);

echo $__html;

unset($__html);
unset($__name);
unset($__params);
unset($__componentSlots);
unset($__split);
if (isset($__slots)) unset($__slots);
?>
        </div>
        
        <!-- Quick Add Button (Bottom Hover) -->
        <div class="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
             <a href="<?php echo e(route('products.show', $product->slug)); ?>" class="block w-full bg-white/90 backdrop-blur text-gray-900 font-bold py-3 rounded-xl shadow-lg border border-gray-100 text-center hover:bg-blue-600 hover:text-white transition-colors text-sm">
                View Details
            </a>
        </div>
    </div>

    <div class="p-5 flex-1 flex flex-col">
        <div class="mb-2">
            <span class="text-xs font-medium text-blue-600 uppercase tracking-wide bg-blue-50 px-2 py-1 rounded-md"><?php echo e($product->brand ? $product->brand->name : config('app.name')); ?></span>
        </div>
        
        <h3 class="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[2.5rem]">
            <a href="<?php echo e(route('products.show', $product->slug)); ?>">
                <?php echo e($product->name); ?>

            </a>
        </h3>
        
        <div class="mt-auto pt-4 flex items-end justify-between border-t border-gray-50">
            <div class="flex flex-col">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($product->sale_price): ?>
                    <div class="flex items-center gap-2">
                        <span class="text-lg font-bold text-gray-900">$<?php echo e(number_format($product->sale_price, 2)); ?></span>
                        <span class="text-sm text-gray-400 line-through">$<?php echo e(number_format($product->price, 2)); ?></span>
                    </div>
                <?php else: ?>
                    <span class="text-lg font-bold text-gray-900">$<?php echo e(number_format($product->price, 2)); ?></span>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
            
            <div class="flex items-center gap-1">
                <svg class="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                <span class="text-xs font-bold text-gray-700"><?php echo e($product->average_rating); ?></span>
            </div>
        </div>
    </div>
</div>
<?php /**PATH D:\PROJECTS\WEBSITES\supplement-ecommerce\backend\resources\views/components/product-card.blade.php ENDPATH**/ ?>