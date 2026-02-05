

<?php $__env->startSection('title', 'Shop Products - ' . config('app.name')); ?>
<?php $__env->startSection('description', 'Browse our wide selection of premium supplements.'); ?>

<?php $__env->startSection('content'); ?>
<!-- Hero Section -->
<div class="relative bg-gray-900 text-white overflow-hidden">
    <div class="absolute inset-0">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-900 to-gray-900 opacity-90"></div>
    </div>
    <div class="relative container mx-auto px-4 py-20 md:py-32">
        <div class="max-w-3xl">
            <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Fuel Your Ambition with <span class="text-blue-500">Premium Supplements</span>
            </h1>
            <p class="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
                Discover scientifically formulated products designed to help you reach your peak performance. Tested for purity, proven for results.
            </p>
        </div>
    </div>
</div>

<div class="bg-gray-50 py-12">
    <div class="container mx-auto px-4">
        <!-- Breadcrumbs -->
        <nav class="flex mb-8 text-sm font-medium">
            <a href="/" class="text-gray-500 hover:text-blue-600 transition-colors">Home</a>
            <span class="mx-3 text-gray-400">/</span>
            <span class="text-gray-900">Shop</span>
        </nav>

        <!-- Livewire Product Filter Component -->
        <?php
$__split = function ($name, $params = []) {
    return [$name, $params];
};
[$__name, $__params] = $__split('product-filter');

$key = null;
$__componentSlots = [];

$key ??= \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::generateKey('lw-2831516806-0', $key);

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
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH D:\PROJECTS\WEBSITES\supplement-ecommerce\backend\resources\views/products/index.blade.php ENDPATH**/ ?>