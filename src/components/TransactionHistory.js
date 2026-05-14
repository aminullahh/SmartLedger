import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

const TransactionHistory = ({ transactions, products }) => {
  const [filter, setFilter] = useState("all");

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate();
    return (
      date.toLocaleDateString("en-GB") +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const filteredTransactions = transactions
    .filter((t) => {
      if (filter === "all") return true;
      if (!t.date) return true;
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
      if (filter === "week") return diffDays <= 7;
      if (filter === "month") {
        return (
          tDate.getMonth() === now.getMonth() &&
          tDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = a.date ? a.date.toMillis() : Date.now();
      const dateB = b.date ? b.date.toMillis() : Date.now();
      return dateB - dateA;
    });

  const handleVoidTransaction = async (t) => {
    const confirmVoid = window.confirm(
      `Void this ${t.type}? This will restore the stock and update the dashboard.`,
    );

    if (!confirmVoid) return;

    try {
      //This Mark the transaction as voided
      const transactionRef = doc(db, "transactions", t.id);
      await updateDoc(transactionRef, { isVoided: true });

      //This Find the product and restore the stock
      const product = products.find((p) => p.id === t.productId);
      if (product) {
        const productRef = doc(db, "products", t.productId);

        //This Logic Handle: If we void a SALE, we ADD items back. If we void a RESTOCK, we SUBTRACT them.
        const stockAdjustment =
          t.type === "sale" ? Number(t.amount) : -Number(t.amount);

        await updateDoc(productRef, {
          quantity: Number(product.quantity) + stockAdjustment,
        });
      }
    } catch (error) {
      console.error("Error voiding: ", error);
      alert("Failed to update record.");
    }
  };

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
            <div
              key={t.id}
              className={`history-item ${t.type}`}
              style={{
                opacity: t.isVoided ? 0.5 : 1,
                textDecoration: t.isVoided ? "line-through" : "none",
                position: "relative",
              }}
            >
              <div className="history-info">
                <strong>{t.productName}</strong>
                <span className="history-date">{formatDate(t.date)}</span>
              </div>
              <div className="history-details">
                <span className="history-action">
                  {t.type === "sale" ? "Sold" : "Bought"} {t.amount}
                </span>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span className={`history-cash ${t.type}`}>
                    {t.type === "sale" ? "+" : "-"}₦
                    {Number(t.totalCash).toLocaleString()}
                  </span>

                  {!t.isVoided && (
                    <button
                      onClick={() => handleVoidTransaction(t)}
                      style={{
                        background: "#ff4d4f",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "2px 8px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Delete
                    </button>
                  )}
                  {t.isVoided && (
                    <span
                      style={{
                        fontSize: "10px",
                        color: "red",
                        fontWeight: "bold",
                        textDecoration: "none",
                      }}
                    >
                      VOIDED
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
