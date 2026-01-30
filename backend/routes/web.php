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

// Home Page
Route::get('/', [MetaController::class, 'home']);

// Product Page
Route::get('/product/{slug}', [MetaController::class, 'product']);

// Sitemap
Route::get('/sitemap.xml', [App\Http\Controllers\SitemapController::class, 'index']);

// Fallback for all other React routes
Route::fallback([MetaController::class, 'default']);
