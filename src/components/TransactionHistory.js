import React, { useState } from "react";

const TransactionHistory = ({ transactions }) => {
  const [filter, setFilter] = useState("all");

  // Helper to safely format Firestore dates
  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate();
    return (
      date.toLocaleDateString("en-GB") +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Filter Logic
  const filteredTransactions = transactions
    .filter((t) => {
      if (filter === "all") return true;

      if (!t.date) return true; // Include pending transactions

      const tDate = t.date.toDate();
      const now = new Date();
      const diffTime = Math.abs(now - tDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (filter === "today") {
        return (
          tDate.getDate() === now.getDate() &&
          tDate.getMonth() === now.getMonth() &&
          tDate.getFullYear() === now.getFullYear()
        );
      }
      if (filter === "week") {
        return diffDays <= 7;
      }
      if (filter === "month") {
        return (
          tDate.getMonth() === now.getMonth() &&
          tDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sort newest to oldest
      const dateA = a.date ? a.date.toMillis() : Date.now();
      const dateB = b.date ? b.date.toMillis() : Date.now();
      return dateB - dateA;
    });

  return (
    <div className="card history-card">
      <div className="history-header">
        <h2 style={{ color: "#2c3e50", margin: 0 }}>Transaction History</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="history-filter"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="history-list">
        {filteredTransactions.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", padding: "20px 0" }}>
            No transactions found for this period.
          </p>
        ) : (
          filteredTransactions.map((t) => (
            <div key={t.id} className={`history-item ${t.type}`}>
              <div className="history-info">
                <strong>{t.productName}</strong>
                <span className="history-date">{formatDate(t.date)}</span>
              </div>
              <div className="history-details">
                <span className="history-action">
                  {t.type === "sale" ? "Sold" : "Bought"} {t.amount}
                </span>
                <span className={`history-cash ${t.type}`}>
                  {t.type === "sale" ? "+" : "-"}₦
                  {Number(t.totalCash).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
