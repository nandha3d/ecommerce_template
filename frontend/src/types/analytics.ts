/**
 * Analytics Types - Complete type definitions for dashboard analytics
 * 
 * CRITICAL RULES:
 * 1. All monetary values are in CENTS (integer) - never use floats for money
 * 2. All dates must be ISO 8601 strings from backend
 * 3. All optional fields must be explicitly marked with ?
 * 4. Use specific enums, never generic strings
 */

export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
}

export enum TimePeriod {
    TODAY = 'today',
    YESTERDAY = 'yesterday',
    LAST_7_DAYS = 'last_7_days',
    LAST_30_DAYS = 'last_30_days',
    THIS_MONTH = 'this_month',
    LAST_MONTH = 'last_month',
    THIS_YEAR = 'this_year',
    CUSTOM = 'custom',
}

/**
 * Revenue metric with comparison to previous period
 */
export interface RevenueMetric {
    /** Total revenue in cents */
    total: number;
    /** Revenue in previous period in cents */
    previous_period: number;
    /** Percentage change from previous period */
    change_percentage: number;
    /** Currency code (ISO 4217) */
    currency_code: string;
    /** Number of orders contributing to revenue */
    order_count: number;
}

/**
 * Orders metric with status breakdown
 */
export interface OrdersMetric {
    /** Total number of orders */
    total: number;
    /** Orders in previous period */
    previous_period: number;
    /** Percentage change from previous period */
    change_percentage: number;
    /** Breakdown by status */
    by_status: {
        [key in OrderStatus]?: number;
    };
    /** Average order value in cents */
    average_value: number;
    /** Percentage change in AOV */
    aov_growth: number;
}

/**
 * Products metric with stock information
 */
export interface ProductsMetric {
    /** Total number of products */
    total: number;
    /** Number of active products */
    active: number;
    /** Number of inactive products */
    inactive: number;
    /** Products with low stock */
    low_stock: number;
    /** Products out of stock */
    out_of_stock: number;
    /** Products added in current period */
    new_in_period: number;
}

/**
 * Customers metric
 */
export interface CustomersMetric {
    /** Total number of customers */
    total: number;
    /** New customers in current period */
    new_in_period: number;
    /** Customers in previous period */
    previous_period: number;
    /** Percentage change from previous period */
    change_percentage: number;
    /** Active customers (ordered in last 30 days) */
    active: number;
    /** Average customer lifetime value in cents */
    lifetime_value: number;
}

/**
 * Data point for revenue chart
 */
export interface RevenueChartDataPoint {
    /** Date in ISO 8601 format (YYYY-MM-DD) */
    date: string;
    /** Revenue in cents */
    revenue: number;
    /** Number of orders on this date */
    orders: number;
    /** Label for display (formatted date) */
    label?: string;
    /** Value for the metric (revenue or count) */
    value?: number;
}

/**
 * Top selling product data
 */
export interface TopProduct {
    /** Product ID */
    id: number;
    /** Product name */
    name: string;
    /** Product SKU */
    sku: string;
    /** Total units sold in period */
    units_sold: number;
    /** Total revenue in cents */
    revenue: number;
    /** Average sale price in cents */
    average_price: number;
    /** Product image URL (optional) */
    image_url?: string;
    /** Category name (optional) */
    category?: string;
}

/**
 * Recent order for table display
 */
export interface RecentOrder {
    /** Order ID */
    id: number;
    /** Order number (display) */
    order_number: string;
    /** Customer name */
    customer_name: string;
    /** Customer email */
    customer_email: string;
    /** Total amount in cents */
    total: number;
    /** Order status */
    status: OrderStatus;
    /** Created timestamp (ISO 8601) */
    created_at: string;
    /** Number of items in order */
    items_count: number;
    /** Payment method */
    payment_method?: string;
}

/**
 * Low stock product alert
 */
export interface LowStockProduct {
    /** Product ID */
    id: number;
    /** Product name */
    name: string;
    /** SKU */
    sku: string;
    /** Current stock quantity */
    current_stock: number;
    /** Low stock threshold */
    threshold: number;
    /** Stock status severity */
    severity: 'critical' | 'warning' | 'low';
    /** Product image URL (optional) */
    image_url?: string;
    /** Variant information (if applicable) */
    variant_name?: string;
}

/**
 * Sales by category data
 */
export interface CategorySales {
    /** Category ID */
    category_id: number;
    /** Category name */
    category_name: string;
    /** Total sales in cents */
    total_sales: number;
    /** Number of orders */
    order_count: number;
    /** Percentage of total sales */
    percentage: number;
    /** Total sales value (duplicate of total_sales for compatibility) */
    value?: number;
    /** Display name */
    name?: string;
}

/**
 * Complete dashboard statistics response from API
 */
export interface DashboardStats {
    /** Revenue metrics */
    revenue: RevenueMetric;
    /** Orders metrics */
    orders: OrdersMetric;
    /** Products metrics */
    products: ProductsMetric;
    /** Customers metrics */
    customers: CustomersMetric;
    /** Revenue chart data (last 30 days) */
    revenue_chart: RevenueChartDataPoint[];
    /** Top selling products */
    top_products: TopProduct[];
    /** Recent orders */
    recent_orders: RecentOrder[];
    /** Low stock alerts */
    low_stock_products: LowStockProduct[];
    /** Sales by category */
    sales_by_category: CategorySales[];
    /** Orders chart data */
    orders_chart: RevenueChartDataPoint[];
    /** Business health overview */
    business_health: {
        conversion_rate: number;
        abandonment_rate: number;
        aov: number;
        clv: number;
    };
    /** Critical items requiring attention */
    action_required: {
        pending_fulfillment: number;
        out_of_stock: number;
        refund_requests: number;
        pending_customizations: number;
    };
    /** Activity summarized for today */
    today_activity: {
        new_orders: number;
        new_customers: number;
        timeline: any[];
    };
    /** Retention cohort data */
    retention_cohort: {
        [cohortMonth: string]: {
            [month: string]: number;
        };
    };
    /** Customer segmentation counts */
    customer_segmentation: {
        champions: number;
        loyal: number;
        at_risk: number;
        lost: number;
    };
    /** Acquisition sources data */
    acquisition_sources: {
        source: string;
        count: number;
        percentage: number;
    }[];
    /** Inventory turnover ratio */
    inventory_turnover: number;
    /** Period for which stats are calculated */
    period: TimePeriod;
    /** Start date of period (ISO 8601) */
    period_start: string;
    /** End date of period (ISO 8601) */
    period_end: string;
    /** Timestamp of data generation (ISO 8601) */
    generated_at: string;
}

/**
 * API request parameters for fetching dashboard stats
 */
export interface DashboardStatsParams {
    /** Time period filter */
    period?: TimePeriod;
    /** Custom start date (ISO 8601) - required if period is 'custom' */
    start_date?: string;
    /** Custom end date (ISO 8601) - required if period is 'custom' */
    end_date?: string;
    /** Currency code for revenue display */
    currency?: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: Record<string, string[]>;
}
