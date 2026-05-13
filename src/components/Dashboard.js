import React from "react";

const Dashboard = ({ products, transactions }) => {
  // 1. Calculate Total Income (Sum of all sales)
  const totalIncome = transactions
    .filter((t) => t.type === "sale")
    .reduce((acc, t) => acc + (Number(t.totalCash) || 0), 0);

  // 2. Calculate Total Expenses (Sum of all restocks/purchases)
  const totalExpenses = transactions
    .filter((t) => t.type === "restock")
    .reduce((acc, t) => acc + (Number(t.totalCash) || 0), 0);

  // 3. Calculate Current Stock Value (Inventory money sitting on shelves)
  const stockValue = products.reduce((acc, p) => {
    return acc + (Number(p.quantity) || 0) * (Number(p.costPrice) || 0);
  }, 0);

  // 4. Net Profit
  const profit = totalIncome - totalExpenses;

  return (
    <div className="dashboard-grid">
      <div className="card">
        <h3>Total Income</h3>
        <p style={{ color: "var(--success-green)" }}>
          ₦{totalIncome.toLocaleString()}
        </p>
      </div>

      <div className="card">
        <h3>Total Expenses</h3>
        <p style={{ color: "var(--danger-red)" }}>
          ₦{totalExpenses.toLocaleString()}
        </p>
      </div>

      <div className="card">
        <h3>Net Profit</h3>
        <p
          style={{
            color: profit >= 0 ? "var(--success-green)" : "var(--danger-red)",
          }}
        >
          ₦{profit.toLocaleString()}
        </p>
      </div>

      <div className="card">
        <h3>Current Stock Value</h3>
        <p>₦{stockValue.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Dashboard;
