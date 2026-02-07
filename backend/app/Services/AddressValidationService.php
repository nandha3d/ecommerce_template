<?php

namespace App\Services;

use App\Models\Address;
use Illuminate\Support\Facades\Log;

class AddressValidationService
{
    protected ConfigurationService $configService;

    // Standard GST State Codes (India)
    // Ideally this could be in DB, but a map here or config is acceptable for initialization
    protected $stateMap = [
        '01' => 'Jammu and Kashmir',
        '02' => 'Himachal Pradesh',
        '03' => 'Punjab',
        '04' => 'Chandigarh',
        '05' => 'Uttarakhand',
        '06' => 'Haryana',
        '07' => 'Delhi',
        '08' => 'Rajasthan',
        '09' => 'Uttar Pradesh',
        '10' => 'Bihar',
        '11' => 'Sikkim',
        '12' => 'Arunachal Pradesh',
        '13' => 'Nagaland',
        '14' => 'Manipur',
        '15' => 'Mizoram',
        '16' => 'Tripura',
        '17' => 'Meghalaya',
        '18' => 'Assam',
        '19' => 'West Bengal',
        '20' => 'Jharkhand',
        '21' => 'Odisha',
        '22' => 'Chhattisgarh',
        '23' => 'Madhya Pradesh',
        '24' => 'Gujarat',
        '27' => 'Maharashtra',
        '29' => 'Karnataka',
        '30' => 'Goa',
        '32' => 'Kerala',
        '33' => 'Tamil Nadu',
        '36' => 'Telangana',
        '37' => 'Andhra Pradesh',
    ];

    public function __construct(ConfigurationService $configService)
    {
        $this->configService = $configService;
    }

    /**
     * Validate and Normalize Address
     */
    public function validate(array $data): array
    {
        $errors = [];

        // 1. Phone Validation (Simple global check or specific regex from config)
        $phoneRegex = $this->configService->get('validation.phone_regex', '/^[0-9]{10,15}$/');
        if (!preg_match($phoneRegex, $data['phone'])) {
            $errors['phone'] = 'Invalid phone number format.';
        }

        // 2. Postal Code (Pincode) Validation
        $postalRegex = $this->configService->get('validation.postal_regex', '/^[0-9]{6}$/'); // Default to Indian 6-digit
        if (!preg_match($postalRegex, $data['postal_code'])) {
            $errors['postal_code'] = 'Invalid postal code.';
        }

        // 3. State Normalization/Validation
        // Try to find state in map to ensure it's valid for Tax/GST
        $normalizedState = $this->normalizeState($data['state']);
        if (!$normalizedState) {
            // Warning or Error? Let's treat as warning or fallback
            // $errors['state'] = 'State not recognized.'; 
        }

        return [
            'isValid' => empty($errors),
            'errors' => $errors,
            'normalizedData' => $normalizedState ? array_merge($data, ['state' => $normalizedState]) : $data
        ];
    }

    /**
     * Normalize state name
     */
    public function normalizeState(string $inputState): ?string
    {
        $inputState = strtolower(trim($inputState));
        
        foreach ($this->stateMap as $code => $name) {
            if (strtolower($name) === $inputState) {
                return $name;
            }
        }
        
        return null;
    }

    /**
     * Get GST Code for state
     */
    public function getGstCode(string $stateName): ?string
    {
        $stateName = strtolower(trim($stateName));
        foreach ($this->stateMap as $code => $name) {
            if (strtolower($name) === $stateName) {
                return $code;
            }
        }
        return null; // Default or null
    }
}
