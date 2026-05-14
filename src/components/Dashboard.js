import React from "react";

const Dashboard = ({ products, transactions }) => {
  //This Filter out voided transactions so they don't affect the math
  const validTransactions = transactions.filter((t) => !t.isVoided);

  //This Calculate Total Income (Using only valid sales)
  const totalIncome = validTransactions
    .filter((t) => t.type === "sale")
    .reduce((acc, t) => acc + (Number(t.totalCash) || 0), 0);

  //This Calculate Total Expenses (Using only valid restocks)
  const totalExpenses = validTransactions
    .filter((t) => t.type === "restock")
    .reduce((acc, t) => acc + (Number(t.totalCash) || 0), 0);

  //This Calculate Current Stock Value
  const stockValue = products.reduce((acc, p) => {
    return acc + (Number(p.quantity) || 0) * (Number(p.costPrice) || 0);
  }, 0);

  // This Calculate Net Profit
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
