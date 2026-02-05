<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Dynamic SEO -->
    <title><?php echo $__env->yieldContent('title', config('app.name') . ' - Premium Products'); ?></title>
    <meta name="description" content="<?php echo $__env->yieldContent('description', 'Premium supplements for health'); ?>">
    <link rel="canonical" href="<?php echo e(url()->current()); ?>">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Open Graph -->
    <meta property="og:title" content="<?php echo $__env->yieldContent('title', config('app.name')); ?>">
    <meta property="og:description" content="<?php echo $__env->yieldContent('description'); ?>">
    <meta property="og:image" content="<?php echo $__env->yieldContent('image', asset('images/og-default.jpg')); ?>">
    
    <!-- Schema.org -->
    <?php echo $__env->yieldContent('schema'); ?>
    
    <!-- Tailwind CSS & Config -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        primary: {
                            50: '#eff6ff',
                            100: '#dbeafe',
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8',
                            900: '#1e3a8a',
                        }
                    }
                }
            }
        }
    </script>
    
    <!-- Alpine.js -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    
    <!-- Livewire Styles -->
    <?php echo \Livewire\Mechanisms\FrontendAssets\FrontendAssets::styles(); ?>

    
    <style>
        [x-cloak] { display: none !important; }
        .glass {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
    </style>
</head>
<body class="bg-gray-50 text-gray-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-700">
    <!-- Header -->
    <header class="fixed w-full z-50 glass border-b border-gray-100 transition-all duration-300">
        <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
            <!-- Logo -->
            <a href="/" class="flex items-center gap-2 group">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300 transform group-hover:scale-105">
                    SK
                </div>
                <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700"><?php echo e(config('app.name')); ?></span>
            </a>

            <!-- Navigation -->
            <div class="hidden md:flex items-center space-x-8">
                <a href="/" class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Home</a>
                <a href="/products" class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Shop</a>
                <a href="/wishlist" class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Wishlist</a>
                <a href="/about" class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">About</a>
            </div>

            <div class="flex items-center gap-6">
                <!-- Search Icon (Desktop) -->
                <button class="text-gray-400 hover:text-gray-600 transition hidden md:block">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>

                <!-- Cart Indicator (Livewire) -->
                <?php
$__split = function ($name, $params = []) {
    return [$name, $params];
};
[$__name, $__params] = $__split('cart-indicator');

$key = null;
$__componentSlots = [];

$key ??= \Livewire\Features\SupportCompiledWireKeys\SupportCompiledWireKeys::generateKey('lw-2265960349-0', $key);

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
        </nav>
    </header>
    
    <!-- Main Content -->
    <main class="min-h-screen pt-24 pb-12">
        <?php echo $__env->yieldContent('content'); ?>
    </main>
    
    <!-- Footer -->
    <footer class="bg-gray-900 text-white pt-16 pb-8 border-t-4 border-blue-600">
        <div class="container mx-auto px-4 grid md:grid-cols-4 gap-12 mb-12">
            <div class="space-y-4">
                <div class="flex items-center gap-2">
                     <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        SK
                    </div>
                    <span class="text-xl font-bold"><?php echo e(config('app.name')); ?></span>
                </div>
                <p class="text-gray-400 text-sm leading-relaxed">
                    Premium scientifically-backed supplements designed to help you reach your peak performance goals faster and safer.
                </p>
                <div class="flex gap-4 pt-2">
                    <!-- Social Icons (Placeholder) -->
                    <a href="#" class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition text-gray-400 hover:text-white">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                    </a>
                    <a href="#" class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition text-gray-400 hover:text-white">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                </div>
            </div>
            <div>
                <h4 class="font-bold text-lg mb-6 text-white">Quick Links</h4>
                <ul class="space-y-3 text-gray-400 text-sm">
                    <li><a href="/" class="hover:text-blue-400 transition-colors flex items-center gap-2"><span class="w-1 h-1 bg-gray-500 rounded-full"></span>Home</a></li>
                    <li><a href="/products" class="hover:text-blue-400 transition-colors flex items-center gap-2"><span class="w-1 h-1 bg-gray-500 rounded-full"></span>Shop All</a></li>
                    <li><a href="/wishlist" class="hover:text-blue-400 transition-colors flex items-center gap-2"><span class="w-1 h-1 bg-gray-500 rounded-full"></span>My Wishlist</a></li>
                    <li><a href="/about" class="hover:text-blue-400 transition-colors flex items-center gap-2"><span class="w-1 h-1 bg-gray-500 rounded-full"></span>About Us</a></li>
                </ul>
            </div>
            <div>
                <h4 class="font-bold text-lg mb-6 text-white">Customer Care</h4>
                <ul class="space-y-3 text-gray-400 text-sm">
                    <li><a href="/contact" class="hover:text-blue-400 transition-colors flex items-center gap-2"><span class="w-1 h-1 bg-gray-500 rounded-full"></span>Contact Support</a></li>
                    <li><a href="#" class="hover:text-blue-400 transition-colors flex items-center gap-2"><span class="w-1 h-1 bg-gray-500 rounded-full"></span>Shipping Policy</a></li>
                    <li><a href="#" class="hover:text-blue-400 transition-colors flex items-center gap-2"><span class="w-1 h-1 bg-gray-500 rounded-full"></span>Returns & Exchanges</a></li>
                    <li><a href="#" class="hover:text-blue-400 transition-colors flex items-center gap-2"><span class="w-1 h-1 bg-gray-500 rounded-full"></span>FAQs</a></li>
                </ul>
            </div>
            <div>
                <h4 class="font-bold text-lg mb-6 text-white">Stay Updated</h4>
                <p class="text-gray-400 text-sm mb-4">Subscribe for exclusive offers and fitness tips.</p>
                <div class="space-y-2">
                    <input type="email" placeholder="Enter your email" class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm">
                    <button class="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">Subscribe Now</button>
                </div>
            </div>
        </div>
        <div class="container mx-auto px-4 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; <?php echo e(date('Y')); ?> <?php echo e(config('app.name')); ?>. All rights reserved.</p>
            <div class="flex gap-6">
                <a href="#" class="hover:text-white transition">Privacy Policy</a>
                <a href="#" class="hover:text-white transition">Terms of Service</a>
            </div>
        </div>
    </footer>
    
    <!-- Livewire Scripts -->
    <?php echo \Livewire\Mechanisms\FrontendAssets\FrontendAssets::scripts(); ?>

</body>
</html>
<?php /**PATH D:\PROJECTS\WEBSITES\supplement-ecommerce\backend\resources\views/layouts/app.blade.php ENDPATH**/ ?>