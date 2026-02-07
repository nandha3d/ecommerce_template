<?php

namespace Core\Base\Events;

use Illuminate\Support\Facades\Log;

class EventBus
{
    private array $listeners = [];

    /**
     * Dispatch an event to all registered listeners.
     */
    public function dispatch(Event $event): void
    {
        $eventClass = get_class($event);
        
        if (!isset($this->listeners[$eventClass])) {
            return;
        }

        foreach ($this->listeners[$eventClass] as $listener) {
            try {
                // If listener is a class string, instantiate it
                if (is_string($listener)) {
                    $instance = app($listener);
                    $instance->handle($event);
                } elseif (is_callable($listener)) {
                    $listener($event);
                }
            } catch (\Exception $e) {
                Log::error("EventBus Error: " . $e->getMessage(), [
                    'event' => $eventClass,
                    'listener' => is_string($listener) ? $listener : 'callable',
                ]);
                throw $e; // Rethrow or handle based on policy. For now, we want to know if it fails.
            }
        }
    }

    /**
     * Register a listener for an event.
     */
    public function listen(string $eventClass, string|callable $listener): void
    {
        $this->listeners[$eventClass][] = $listener;
    }
}
