namespace Backend.DTOs.Admin;

public class AdminDashboardDto
{
    public int TotalUsers { get; set; }
    public int TotalSellers { get; set; }
    public int PendingSellerApprovals { get; set; }
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public decimal PlatformRevenue { get; set; }

    // Alerts
    public AlertsDto Alerts { get; set; } = new();

    // Recent activities
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
    public List<PendingApprovalDto> PendingApprovals { get; set; } = new();
    public List<TopSellerDto> TopSellers { get; set; } = new();
    public List<RecentOrderDto> RecentOrders { get; set; } = new();
}

public class AlertsDto
{
    public int LowStockProducts { get; set; }
    public int PendingSellerApprovals { get; set; }
    public int NewOrders { get; set; }
    public int FailedPayments { get; set; }
    public int SuspiciousActivity { get; set; }
}

public class RecentActivityDto
{
    public string Type { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string User { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
}

public class PendingApprovalDto
{
    public Guid Id { get; set; }
    public string ShopName { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Status { get; set; } = "pending";
}

public class TopSellerDto
{
    public Guid Id { get; set; }
    public string ShopName { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Orders { get; set; }
}

public class RecentOrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string Customer { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}

