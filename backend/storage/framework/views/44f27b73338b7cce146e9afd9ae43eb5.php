

<?php $__env->startSection('title', config('app.name') . ' - Premium Products'); ?>
<?php $__env->startSection('description', 'High quality supplements to fuel your fitness journey.'); ?>

<?php $__env->startSection('content'); ?>
<!-- Hero Section -->
<div class="bg-gray-900 text-white relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10"></div>
    <!-- Simple placeholder for hero bg if no image available -->
    <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-40"></div>
    
    <div class="container mx-auto px-4 py-24 relative z-20">
        <div class="max-w-2xl">
            <h1 class="text-5xl font-bold mb-6 leading-tight">Fuel Your Ambition <br>With <span class="text-blue-500">Premium Nutrition</span></h1>
            <p class="text-xl text-gray-300 mb-8">Science-backed supplements designed to help you reach your peak performance.</p>
            <div class="flex gap-4">
                <a href="<?php echo e(route('products.index')); ?>" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition">Shop Now</a>
                <a href="#featured" class="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition backdrop-blur-sm">Explore</a>
            </div>
        </div>
    </div>
</div>

<!-- Featured Products -->
<div id="featured" class="container mx-auto px-4 py-16">
    <div class="flex justify-between items-end mb-8">
        <div>
            <h2 class="text-3xl font-bold mb-2">Featured Products</h2>
            <p class="text-gray-600">Hand-picked by our experts</p>
        </div>
        <a href="<?php echo e(route('products.index')); ?>" class="text-blue-600 font-semibold hover:underline">View All &rarr;</a>
    </div>

    <div class="grid md:grid-cols-4 gap-6">
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::openLoop(); ?><?php endif; ?><?php $__currentLoopData = $featuredProducts; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $product): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::startLoop($loop->index); ?><?php endif; ?>
            <?php echo $__env->make('components.product-card', ['product' => $product], \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::endLoop(); ?><?php endif; ?><?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::closeLoop(); ?><?php endif; ?>
    </div>
</div>

<!-- Value Props -->
<div class="bg-gray-100 py-16">
    <div class="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
        <div class="bg-white p-8 rounded-xl shadow-sm">
            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            </div>
            <h3 class="font-bold text-xl mb-2">Lab Tested Quality</h3>
            <p class="text-gray-600">Every batch is rigorously tested for purity and potency.</p>
        </div>
        <div class="bg-white p-8 rounded-xl shadow-sm">
            <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 class="font-bold text-xl mb-2">Fast Shipping</h3>
            <p class="text-gray-600">Free shipping on all orders over $50.</p>
        </div>
        <div class="bg-white p-8 rounded-xl shadow-sm">
            <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h3 class="font-bold text-xl mb-2">Satisfaction Guaranteed</h3>
            <p class="text-gray-600">30-day money-back guarantee on all products.</p>
        </div>
    </div>
</div>

<!-- Best Sellers -->
<div class="container mx-auto px-4 py-16">
    <div class="flex justify-between items-end mb-8">
        <div>
            <h2 class="text-3xl font-bold mb-2">Best Sellers</h2>
            <p class="text-gray-600">Our community favorites</p>
        </div>
        <a href="<?php echo e(route('products.index', ['sort' => 'popularity'])); ?>" class="text-blue-600 font-semibold hover:underline">View All &rarr;</a>
    </div>

    <div class="grid md:grid-cols-4 gap-6">
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::openLoop(); ?><?php endif; ?><?php $__currentLoopData = $bestSellers; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $product): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::startLoop($loop->index); ?><?php endif; ?>
            <?php echo $__env->make('components.product-card', ['product' => $product], \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::endLoop(); ?><?php endif; ?><?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::closeLoop(); ?><?php endif; ?>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH D:\PROJECTS\WEBSITES\supplement-ecommerce\backend\resources\views/home.blade.php ENDPATH**/ ?>