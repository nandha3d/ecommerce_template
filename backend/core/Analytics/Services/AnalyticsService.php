<?php

namespace Core\Analytics\Services;

use PDO;

class AnalyticsService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get aggregate dashboard stats.
     */
    public function getDashboardStats(): array
    {
        return [
            'total_revenue' => $this->getTotalRevenue(),
            'total_orders'  => $this->getTotalOrders(),
            'total_products' => $this->getTotalProducts(),
            'recent_orders' => $this->getRecentOrders(5),
            'top_products'  => $this->getTopSellingProducts(5)
        ];
    }

    private function getTotalRevenue(): float
    {
        // Assuming 'orders' table has 'total_price' and 'status' = 'delivered' or 'paid'
        // For now, counting all non-cancelled orders or just 'paid'
        $sql = "SELECT SUM(total_price) FROM orders WHERE status != 'cancelled'";
        $stmt = $this->pdo->query($sql);
        return (float) $stmt->fetchColumn();
    }

    private function getTotalOrders(): int
    {
        $sql = "SELECT COUNT(*) FROM orders";
        $stmt = $this->pdo->query($sql);
        return (int) $stmt->fetchColumn();
    }

    private function getTotalProducts(): int
    {
        $sql = "SELECT COUNT(*) FROM products"; // Assuming products table exists
        $stmt = $this->pdo->query($sql);
        return (int) $stmt->fetchColumn();
    }

    private function getRecentOrders(int $limit): array
    {
        $sql = "SELECT id, order_number, total_price, status, created_at FROM orders ORDER BY created_at DESC LIMIT :limit";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getTopSellingProducts(int $limit): array
    {
        // This is a complex query joining order_items and products
        // Assuming order_items table exists with product_id and quantity
        $sql = "
            SELECT p.name, SUM(oi.quantity) as total_sold 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY p.id, p.name
            ORDER BY total_sold DESC
            LIMIT :limit
        ";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
