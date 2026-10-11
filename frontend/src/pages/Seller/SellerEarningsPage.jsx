import { useEffect, useState } from "react";
import { getSellerEarnings, requestPayout } from "../../services/sellerService";

export default function SellerEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(null);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const data = await getSellerEarnings();
      setEarnings(data);
      setPayoutHistory(data?.payoutHistory || []);
    } catch (error) {
      console.error("Failed to load earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setRequesting(true);
    try {
      await requestPayout(parseFloat(payoutAmount));
      alert("Payout request submitted successfully!");
      setShowPayoutModal(false);
      setPayoutAmount("");
      await loadEarnings();
    } catch (error) {
      console.error("Failed to request payout:", error);
      alert("Failed to request payout");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "24px", color: "#666" }}>Loading...</div>
      </div>
    );
  }

  const statCardStyle = {
    padding: "20px",
    background: "white",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    marginBottom: "16px"
  };

  const statLabelStyle = {
    fontSize: "12px",
    fontWeight: "500",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px"
  };

  const statValueStyle = {
    fontSize: "28px",
    fontWeight: "600",
    color: "#111827"
  };

  const statSubStyle = {
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "4px"
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "30px 20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "30px", color: "#111827" }}>
        💰 Earnings & Payouts
      </h1>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "30px" }}>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Total Earnings</div>
          <div style={statValueStyle}>${earnings?.totalEarnings?.toFixed(2) || "0.00"}</div>
          <div style={statSubStyle}>All-time earnings</div>
        </div>

        <div style={statCardStyle}>
          <div style={statLabelStyle}>Available Balance</div>
          <div style={{ ...statValueStyle, color: earnings?.availableBalance > 0 ? "#059669" : "#6b7280" }}>
            ${earnings?.availableBalance?.toFixed(2) || "0.00"}
          </div>
          <div style={statSubStyle}>Ready to withdraw</div>
        </div>

        <div style={statCardStyle}>
          <div style={statLabelStyle}>Pending Payout</div>
          <div style={{ ...statValueStyle, color: "#f59e0b" }}>
            ${earnings?.pendingPayout?.toFixed(2) || "0.00"}
          </div>
          <div style={statSubStyle}>Processing</div>
        </div>

        <div style={statCardStyle}>
          <div style={statLabelStyle}>This Month</div>
          <div style={statValueStyle}>${earnings?.thisMonthEarnings?.toFixed(2) || "0.00"}</div>
          <div style={statSubStyle}>Current month</div>
        </div>
      </div>

      {/* Request Payout Button */}
      <div style={{ marginBottom: "30px" }}>
        <button
          onClick={() => setShowPayoutModal(true)}
          disabled={!earnings || earnings.availableBalance <= 0}
          style={{
            padding: "12px 24px",
            background: earnings && earnings.availableBalance > 0 ? "#1a56db" : "#d1d5db",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: earnings && earnings.availableBalance > 0 ? "pointer" : "default",
            transition: "background 0.2s ease"
          }}
        >
          💳 Request Payout
        </button>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "30px",
            maxWidth: "400px",
            width: "90%"
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>Request Payout</h2>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>
                Amount to Withdraw
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "10px", fontSize: "14px" }}>$</span>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  max={earnings?.availableBalance || 0}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 28px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "14px"
                  }}
                />
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                Available: ${earnings?.availableBalance?.toFixed(2) || "0.00"}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => {
                  setShowPayoutModal(false);
                  setPayoutAmount("");
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestPayout}
                disabled={requesting}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: requesting ? "#9ca3af" : "#1a56db",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: requesting ? "default" : "pointer"
                }}
              >
                {requesting ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout History */}
      <div style={{ background: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600" }}>Payout History</h2>
        </div>

        {payoutHistory.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#6b7280" }}>
            No payouts yet
          </div>
        ) : (
          <table style={{ width: "100%" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Date</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Amount</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Status</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Method</th>
              </tr>
            </thead>
            <tbody>
              {payoutHistory.map((payout, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                    {new Date(payout.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500" }}>
                    ${payout.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: payout.status === "completed" ? "#dcfce7" : payout.status === "pending" ? "#fef3c7" : "#fee2e2",
                      color: payout.status === "completed" ? "#166534" : payout.status === "pending" ? "#92400e" : "#991b1b"
                    }}>
                      {payout.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>{payout.method || "Bank Transfer"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
