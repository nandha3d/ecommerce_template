

<?php $__env->startSection('title', $product->seo_title ?? $product->name . ' - ' . config('app.name')); ?>
<?php $__env->startSection('description', $product->seo_description ?? Str::limit($product->short_description, 160)); ?>
<?php $__env->startSection('image', $product->primaryImage ? $product->primaryImage->image_path : ($product->images->first()->image_path ?? asset('images/og-default.jpg'))); ?>

<?php $__env->startSection('schema'); ?>
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "<?php echo e($product->name); ?>",
  "description": "<?php echo e($product->seo_description ?? Str::limit(strip_tags($product->description), 160)); ?>",
  "image": [
    <?php $__currentLoopData = $product->images; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $image): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
    "<?php echo e($image->image_path); ?>"<?php echo e(!$loop->last ? ',' : ''); ?>

    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
  ],
  "brand": {
    "@type": "Brand",
    "name": "<?php echo e($product->brand ? $product->brand->name : config('app.name')); ?>"
  },
  "offers": {
    "@type": "Offer",
    "url": "<?php echo e(route('products.show', $product->slug)); ?>",
    "priceCurrency": "USD",
    "price": "<?php echo e($product->current_price); ?>",
    "availability": "<?php echo e($product->is_in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'); ?>"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "<?php echo e($product->average_rating); ?>",
    "reviewCount": "<?php echo e($product->review_count); ?>"
  }
}
</script>
<?php $__env->stopSection(); ?>

<?php $__env->startSection('content'); ?>
<?php $__env->startSection('content'); ?>
<div class="bg-white">
    <div class="container mx-auto px-4 py-8">
        <!-- Breadcrumbs -->
        <nav class="flex mb-8 text-sm font-medium">
            <a href="/" class="text-gray-500 hover:text-blue-600 transition-colors">Home</a>
            <span class="mx-3 text-gray-300">/</span>
            <a href="<?php echo e(route('products.index')); ?>" class="text-gray-500 hover:text-blue-600 transition-colors">Shop</a>
            <span class="mx-3 text-gray-300">/</span>
            <span class="text-gray-900 line-clamp-1 max-w-[200px]"><?php echo e($product->name); ?></span>
        </nav>

        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16">
            
            <!-- Product Images (Alpine.js Gallery) -->
            <div x-data="{ selected: '<?php echo e($product->primaryImage ? $product->primaryImage->image_path : ($product->images->first()->image_path ?? '')); ?>' }" class="space-y-6">
                <!-- Main Image -->
                <div class="aspect-[4/4] bg-gray-50 rounded-3xl overflow-hidden relative group shadow-sm border border-gray-100">
                    <template x-if="selected">
                        <img :src="selected" alt="<?php echo e($product->name); ?>" class="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-700 ease-in-out">
                    </template>
                    <template x-if="!selected">
                        <div class="flex items-center justify-center h-full text-gray-400">
                            <svg class="w-20 h-20 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                    </template>
                    
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($product->sale_price): ?>
                        <div class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold shadow-lg text-sm">
                            SAVE <?php echo e($product->discount_percentage); ?>%
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
                
                <!-- Thumbnails -->
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($product->images->count() > 1): ?>
                <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::openLoop(); ?><?php endif; ?><?php $__currentLoopData = $product->images; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $image): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::startLoop($loop->index); ?><?php endif; ?>
                    <button 
                        @click="selected = '<?php echo e($image->image_path); ?>'"
                        :class="selected === '<?php echo e($image->image_path); ?>' ? 'ring-2 ring-blue-600 ring-offset-2 opacity-100' : 'opacity-70 hover:opacity-100 hover:ring-2 hover:ring-gray-300 ring-offset-1'"
                        class="relative flex-none w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 transition-all duration-200 border border-gray-100">
                        <img src="<?php echo e($image->image_path); ?>" class="w-full h-full object-cover" alt="Thumbnail">
                    </button>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::endLoop(); ?><?php endif; ?><?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::closeLoop(); ?><?php endif; ?>
                </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
            
            <!-- Product Info -->
            <div class="lg:sticky lg:top-24 h-fit">
                <div class="mb-4">
                     <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($product->brand): ?>
                        <a href="<?php echo e(route('products.index', ['brand' => $product->brand->slug])); ?>" class="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm uppercase tracking-wider hover:text-blue-700 bg-blue-50 px-3 py-1 rounded-full transition-colors">
                            <?php echo e($product->brand->name); ?>

                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                        </a>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
                
                <div class="flex justify-between items-start mb-4">
                    <h1 class="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight"><?php echo e($product->name); ?></h1>
                    <div class="mt-2 ml-4">
                        <?php
$__split = function ($name, $params = []) {
    return [$name, $params];
};
[$__name, $__params] = $__split('wishlist-button', ['productId' => $product->id]);

$key = null;
$__componentSlots = [];

$key ??= \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::generateKey('lw-272978609-0', $key);

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
                </div>
                
                <!-- Rating -->
                <div class="flex items-center gap-4 mb-8">
                    <div class="flex items-center gap-1">
                        <div class="flex text-yellow-400">
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php for($i = 1; $i <= 5; $i++): ?>
                                <svg class="w-5 h-5 <?php echo e($i <= round($product->average_rating) ? 'fill-current' : 'text-gray-200 fill-current'); ?>" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                            <?php endfor; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                        <span class="font-bold text-gray-900 ml-2"><?php echo e(number_format($product->average_rating, 1)); ?></span>
                    </div>
                    <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span class="text-sm font-medium text-gray-500 hover:text-blue-600 cursor-pointer transition-colors"><?php echo e($product->review_count); ?> Reviews</span>
                </div>
                
                <!-- Price -->
                <div class="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                    <div class="flex items-end gap-3 mb-2">
                         <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($product->sale_price): ?>
                            <span class="text-5xl font-black text-gray-900 tracking-tight">$<?php echo e(number_format($product->sale_price, 2)); ?></span>
                            <span class="text-xl text-gray-400 line-through font-medium mb-2">$<?php echo e(number_format($product->price, 2)); ?></span>
                        <?php else: ?>
                            <span class="text-5xl font-black text-gray-900 tracking-tight">$<?php echo e(number_format($product->price, 2)); ?></span>
                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    </div>

                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!$product->is_in_stock): ?>
                        <div class="inline-flex items-center gap-2 text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Temporarily Out of Stock
                        </div>
                    <?php else: ?>
                        <div class="inline-flex items-center gap-2 text-green-700 font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 text-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            In Stock & Ready to Ship
                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
                
                <!-- Short Description -->
                <div class="prose prose-lg text-gray-600 mb-8 leading-relaxed">
                    <p><?php echo e($product->short_description); ?></p>
                </div>
                
                <!-- Livewire Add to Cart -->
                <div class="mb-8">
                    <?php
$__split = function ($name, $params = []) {
    return [$name, $params];
};
[$__name, $__params] = $__split('add-to-cart', ['productId' => $product->id]);

$key = null;
$__componentSlots = [];

$key ??= \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::generateKey('lw-272978609-1', $key);

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
                
                <!-- Benefits -->
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($product->benefits && count($product->benefits) > 0): ?>
                <div class="border-t border-gray-100 pt-8">
                    <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Why You'll Love It
                    </h3>
                    <ul class="grid grid-cols-1 gap-3">
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::openLoop(); ?><?php endif; ?><?php $__currentLoopData = $product->benefits; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $benefit): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::startLoop($loop->index); ?><?php endif; ?>
                        <li class="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                            <div class="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-0.5">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <span class="text-gray-700 font-medium"><?php echo e($benefit); ?></span>
                        </li>
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::endLoop(); ?><?php endif; ?><?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::closeLoop(); ?><?php endif; ?>
                    </ul>
                </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        </div>
        
        <!-- Tabs Section -->
        <div class="mt-20 border-t border-gray-100 pt-16" x-data="{ tab: 'description' }">
            <div class="flex flex-col md:flex-row gap-8">
                <!-- Tab Headers -->
                <div class="flex md:flex-col gap-2 md:w-64 flex-shrink-0 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
                    <button @click="tab = 'description'" :class="tab === 'description' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'" class="px-6 py-4 rounded-xl font-bold text-left transition-all duration-300 w-full whitespace-nowrap md:whitespace-normal">Description</button>
                    <button @click="tab = 'ingredients'" :class="tab === 'ingredients' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'" class="px-6 py-4 rounded-xl font-bold text-left transition-all duration-300 w-full whitespace-nowrap md:whitespace-normal">Ingredients</button>
                    <button @click="tab = 'reviews'" :class="tab === 'reviews' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'" class="px-6 py-4 rounded-xl font-bold text-left transition-all duration-300 w-full whitespace-nowrap md:whitespace-normal">
                        Reviews 
                        <span :class="tab === 'reviews' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'" class="ml-2 text-xs px-2 py-0.5 rounded-full"><?php echo e($product->review_count); ?></span>
                    </button>
                </div>
                
                <!-- Tab Content -->
                <div class="flex-1 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[400px]">
                    <!-- Description Tab -->
                    <div x-show="tab === 'description'" x-cloak class="prose prose-lg max-w-none prose-blue">
                        <?php echo $product->description; ?>

                    </div>
                    
                    <!-- Ingredients Tab -->
                    <div x-show="tab === 'ingredients'" x-cloak class="prose prose-lg max-w-none prose-blue">
                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($product->ingredients): ?>
                            <h3 class="font-bold text-2xl mb-6">Supplement Facts & Ingredients</h3>
                            
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(is_array($product->ingredients)): ?>
                                <div class="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                                    <ul class="grid md:grid-cols-2 gap-4 m-0 p-0 text-base list-none">
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::openLoop(); ?><?php endif; ?><?php $__currentLoopData = $product->ingredients; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $ing): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::startLoop($loop->index); ?><?php endif; ?>
                                        <li class="flex items-center gap-3 p-0 m-0">
                                            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                            <span><?php echo e($ing); ?></span>
                                        </li>
                                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::endLoop(); ?><?php endif; ?><?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::closeLoop(); ?><?php endif; ?>
                                    </ul>
                                </div>
                            <?php else: ?>
                                <p class="mb-8 text-gray-600"><?php echo e($product->ingredients); ?></p>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                            
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($product->nutrition_facts): ?>
                            <div class="border rounded-2xl overflow-hidden shadow-sm">
                                <div class="bg-gray-50 px-6 py-4 border-b font-bold text-lg">Nutrition Information</div>
                                <div class="overflow-x-auto">
                                    <table class="min-w-full text-left text-sm whitespace-nowrap m-0">
                                        <thead class="bg-white text-gray-500 border-b">
                                            <tr>
                                                <th class="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Nutrient</th>
                                                <th class="px-6 py-3 font-semibold uppercase tracking-wider text-xs text-right">Amount per serving</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-gray-100 bg-white">
                                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::openLoop(); ?><?php endif; ?><?php $__currentLoopData = $product->nutrition_facts; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $val): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::startLoop($loop->index); ?><?php endif; ?>
                                            <tr class="hover:bg-gray-50 transition-colors">
                                                <td class="px-6 py-4 font-medium text-gray-900"><?php echo e($key); ?></td>
                                                <td class="px-6 py-4 text-gray-600 text-right font-mono"><?php echo e($val); ?></td>
                                            </tr>
                                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::endLoop(); ?><?php endif; ?><?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::closeLoop(); ?><?php endif; ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        <?php else: ?>
                           <div class="text-center py-12">
                               <p class="text-gray-500 italic">No specific ingredients listed for this product.</p>
                           </div>
                        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                    </div>
                    
                    <!-- Reviews Tab -->
                    <div x-show="tab === 'reviews'" x-cloak>
                        <div class="space-y-8">
                            <div class="flex items-center justify-between mb-8">
                                <div>
                                    <h3 class="text-2xl font-bold text-gray-900">Customer Reviews</h3>
                                    <p class="text-gray-500">Based on <?php echo e($product->review_count); ?> reviews</p>
                                </div>
                                <button class="px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-900/10">Write a Review</button>
                            </div>

                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::openLoop(); ?><?php endif; ?><?php $__empty_1 = true; $__currentLoopData = $product->reviews; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $review): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::startLoop($loop->index); ?><?php endif; ?>
                            <div class="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                                <div class="flex items-center justify-between mb-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                            <?php echo e(substr($review->user ? $review->user->name : 'A', 0, 1)); ?>

                                        </div>
                                        <div>
                                            <div class="font-bold text-gray-900"><?php echo e($review->user ? $review->user->name : 'Anonymous'); ?></div>
                                            <div class="text-xs text-gray-400"><?php echo e($review->created_at->format('F d, Y')); ?></div>
                                        </div>
                                    </div>
                                    <div class="flex text-yellow-400">
                                        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php for($i = 1; $i <= 5; $i++): ?>
                                            <svg class="w-4 h-4 <?php echo e($i <= $review->rating ? 'fill-current' : 'text-gray-200 fill-current'); ?>" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                                        <?php endfor; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                    </div>
                                </div>
                                
                                <div class="pl-13 ml-13">
                                    <h4 class="font-bold text-gray-900 mb-2"><?php echo e($review->title); ?></h4>
                                    <p class="text-gray-600 leading-relaxed"><?php echo e($review->comment); ?></p>
                                    
                                     <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($review->is_verified_purchase): ?>
                                        <div class="mt-4 inline-flex items-center gap-1.5 text-green-600 text-xs font-semibold bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Verified Purchase
                                        </div>
                                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                                </div>
                            </div>
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::endLoop(); ?><?php endif; ?><?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::closeLoop(); ?><?php endif; ?>
                            <div class="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                                <h3 class="text-lg font-bold text-gray-900 mb-1">No reviews yet</h3>
                                <p class="text-gray-500">Be the first to share your thoughts on this product.</p>
                            </div>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Related Products -->
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($relatedProducts->count() > 0): ?>
        <div class="mt-24 border-t border-gray-100 pt-16">
            <h2 class="text-3xl font-bold mb-8 text-center">You May Also Like</h2>
            <div class="grid md:grid-cols-4 gap-8">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::openLoop(); ?><?php endif; ?><?php $__currentLoopData = $relatedProducts; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $related): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::startLoop($loop->index); ?><?php endif; ?>
                    <?php echo $__env->make('components.product-card', ['product' => $related], \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::endLoop(); ?><?php endif; ?><?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::closeLoop(); ?><?php endif; ?>
            </div>
        </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH D:\PROJECTS\WEBSITES\supplement-ecommerce\backend\resources\views/products/show.blade.php ENDPATH**/ ?>