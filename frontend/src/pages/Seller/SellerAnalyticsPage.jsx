import { useState } from "react";

export default function SellerAnalyticsPage() {
  const [analytics] = useState({
    totalViews: 1250,
    totalClicks: 342,
    conversionRate: 27.4,
    totalRevenue: 15420.50,
  });

  const styles = {
    page: {
      padding: "24px",
      maxWidth: "1400px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "32px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#111827",
      marginBottom: "8px",
    },
    subtitle: {
      fontSize: "14px",
      color: "#6B7280",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      marginBottom: "32px",
    },
    card: {
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    },
    cardLabel: {
      fontSize: "12px",
      fontWeight: "500",
      color: "#9CA3AF",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: "8px",
    },
    cardValue: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#6f55ff",
      marginBottom: "4px",
    },
    cardChange: {
      fontSize: "12px",
      color: "#10b981",
    },
    chartContainer: {
      background: "#FFFFFF",
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      textAlign: "center",
      color: "#9CA3AF",
      minHeight: "200px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Analytics</h1>
        <p style={styles.subtitle}>Track your shop performance and metrics</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Views</div>
          <div style={styles.cardValue}>{analytics.totalViews.toLocaleString()}</div>
          <div style={styles.cardChange}>+12% from last month</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Clicks</div>
          <div style={styles.cardValue}>{analytics.totalClicks.toLocaleString()}</div>
          <div style={styles.cardChange}>+8% from last month</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>Conversion Rate</div>
          <div style={styles.cardValue}>{analytics.conversionRate}%</div>
          <div style={styles.cardChange}>+2.1% from last month</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Revenue</div>
          <div style={styles.cardValue}>${analytics.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
          <div style={styles.cardChange}>+23% from last month</div>
        </div>
      </div>

      <div style={styles.chartContainer}>
        📊 Advanced analytics charts coming soon...
      </div>
    </div>
  );
}
