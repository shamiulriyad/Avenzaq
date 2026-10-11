namespace Backend.DTOs.Sellers;

public class SellerDashboardDto
{
    public string ShopName { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    
    // Stats
    public int TotalProducts { get; set; }
    public int PendingOrders { get; set; }
    public decimal TotalSales { get; set; }
    public double AverageRating { get; set; }
    
    // Changes (%)
    public int ProductsChange { get; set; }
    public int OrdersChange { get; set; }
    public int SalesChange { get; set; }
    public int RatingChange { get; set; }
    
    // Quick Stats
    public double ConversionRate { get; set; }
    public decimal AvgOrderValue { get; set; }
    public int ReturningCustomers { get; set; }
    public int LowStockCount { get; set; }
    
    // Sales Chart (7 days/bars)
    public List<int> SalesChart { get; set; } = new();
    
    // Recent Data
    public List<SellerRecentOrderDto> RecentOrders { get; set; } = new();
    public List<TopProductDto> TopProducts { get; set; } = new();
    public List<SellerReviewDto> RecentReviews { get; set; } = new();
}

public class SellerRecentOrderDto
{
    public Guid Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class TopProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Image { get; set; }
    public int Sold { get; set; }
    public decimal Revenue { get; set; }
}

public class SellerReviewDto
{
    public string CustomerName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
}
