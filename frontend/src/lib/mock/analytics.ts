/**
 * Mock Analytics Data - Realistic data for deep-dive reporting
 */

export const mockAnalyticsData = {
    salesByCategory: [
        { name: 'Electronics', value: 4500000, percentage: 45 },
        { name: 'Clothing', value: 3000000, percentage: 30 },
        { name: 'Home', value: 1500000, percentage: 15 },
        { name: 'Other', value: 1000000, percentage: 10 },
    ],

    revenueByDay: Array.from({ length: 30 }).map((_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 400000) + 100000,
        orders: Math.floor(Math.random() * 20) + 5,
        label: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })),

    retention_cohort: {
        '2025-08-01': { month1: 100, month2: 65, month3: 45, month4: 32, month5: 25, month6: 20 },
        '2025-09-01': { month1: 100, month2: 70, month3: 50, month4: 35, month5: 28, month6: 22 },
        '2025-10-01': { month1: 100, month2: 60, month3: 40, month4: 30, month5: 20, month6: 15 },
    },

    customer_segmentation: {
        champions: 120,
        loyal: 450,
        at_risk: 85,
        lost: 210
    },

    acquisition_sources: [
        { source: 'Direct', count: 450, percentage: 45 },
        { source: 'Referral', count: 280, percentage: 28 },
        { source: 'Social', count: 150, percentage: 15 },
        { source: 'Search', count: 120, percentage: 12 },
    ],

    inventory_turnover: 0.65,

    stats: {
        revenue: {
            total: 12500000, // $125k
            previous_period: 11000000,
            change_percentage: 13.6,
            currency_code: 'USD',
            order_count: 850
        },
        orders: {
            total: 850,
            previous_period: 780,
            change_percentage: 9.0,
            by_status: {
                completed: 750,
                processing: 45,
                shipped: 35,
                pending: 20
            },
            average_value: 14705, // ~$147
            aov_growth: 4.2
        },
        business_health: {
            conversion_rate: 3.4,
            abandonment_rate: 62.1,
            aov: 14705,
            clv: 85000
        },
        customers: {
            total: 1250,
            new_in_period: 145,
            previous_period: 1100,
            change_percentage: 12.8,
            active: 850,
            lifetime_value: 85000
        },
        products: {
            total: 120,
            active: 112,
            inactive: 8,
            low_stock: 14,
            out_of_stock: 5,
            new_in_period: 3
        }
    },

    topProducts: [
        { id: 1, name: 'Premium Whey Protein', sku: 'WHEY-001', units_sold: 450, revenue: 2250000, average_price: 5000 },
        { id: 2, name: 'Organic Multivitamin', sku: 'MV-ORG-2', units_sold: 380, revenue: 1140000, average_price: 3000 },
        { id: 3, name: 'Omega-3 Fish Oil', sku: 'FSH-OIL-3', units_sold: 310, revenue: 930000, average_price: 3000 },
        { id: 4, name: 'Pre-Workout Blast', sku: 'PWO-BLAST', units_sold: 290, revenue: 1450000, average_price: 5000 },
        { id: 5, name: 'Vegan BCAA', sku: 'BCAA-VEG', units_sold: 210, revenue: 840000, average_price: 4000 },
    ],

    recentOrders: Array.from({ length: 10 }).map((_, i) => ({
        id: 1000 + i,
        order_number: `ORD-${2026}${i.toString().padStart(3, '0')}`,
        customer_name: ['John Doe', 'Jane Smith', 'Mike Ross', 'Rachel Zane'][i % 4],
        customer_email: `customer${i}@example.com`,
        total: Math.floor(Math.random() * 20000) + 5000,
        status: ['completed', 'processing', 'shipped', 'pending'][i % 4] as any,
        created_at: new Date(Date.now() - i * i * 3600000).toISOString(),
        items_count: Math.floor(Math.random() * 5) + 1
    }))
};
