<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MetaController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group.
|
*/

// Home Page - API Status
Route::get('/', function () {
    return response()->json([
        'status' => 'online',
        'message' => 'Backend API is running. Please access the storefront at: ' . env('FRONTEND_URL', 'http://localhost:5173'),
        'service' => 'Supplement Ecommerce API'
    ]);
})->name('home');

// Products (API only, redirect UI requests to Frontend)
Route::redirect('/products', env('FRONTEND_URL', 'http://localhost:5173') . '/shop');

// Sitemap & Robots
Route::get('/sitemap.xml', [App\Http\Controllers\SitemapController::class, 'index']);
Route::get('/robots.txt', [App\Http\Controllers\SitemapController::class, 'robots']);

// Health Check
Route::get('/health', [App\Http\Controllers\HealthController::class, 'ping']);
Route::get('/health/status', [App\Http\Controllers\HealthController::class, 'status']);

// Cart - Redirect to Frontend
Route::redirect('/cart', env('FRONTEND_URL', 'http://localhost:5173') . '/cart');
Route::redirect('/wishlist', env('FRONTEND_URL', 'http://localhost:5173') . '/wishlist');

// Admin Panel
Route::get('/admin/{any?}', [MetaController::class, 'default'])->where('any', '.*');
