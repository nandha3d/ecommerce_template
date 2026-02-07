export interface Currency {
    code: string;
    symbol: string;
    name: string;
    is_default: boolean;
}

export interface Timezone {
    identifier: string;
    offset: string;
}

export interface GlobalizationContextState {
    currency: {
        active_code: string;
        symbol: string;
        position: 'before' | 'after';
        decimals: number;
        exchange_rate: string;
        available: Currency[];
    };
    timezone: {
        identifier: string;
        offset: string;
    };
    isLoading: boolean;
    switchCurrency: (code: string) => Promise<void>;
    switchTimezone: (identifier: string) => Promise<void>;
}
