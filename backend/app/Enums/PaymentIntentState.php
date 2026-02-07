<?php

namespace App\Enums;

enum PaymentIntentState: string
{
    case CREATED = 'created';
    case PROCESSING = 'processing';
    case SUCCEEDED = 'succeeded';
    case FAILED = 'failed';
    case CANCELLED = 'cancelled';
}
