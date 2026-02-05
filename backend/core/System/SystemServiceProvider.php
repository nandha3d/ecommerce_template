<?php

namespace Core\System;

use Illuminate\Support\ServiceProvider;

class SystemServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Load routes if needed, or register them in api.php for simplicity in Phase-1
    }
}
