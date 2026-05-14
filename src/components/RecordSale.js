import React, { useState } from "react";
import { db } from "../services/firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const RecordSale = ({ products }) => {
  const [selectedId, setSelectedId] = useState("");
  const [qtySold, setQtySold] = useState("");

  const handleSale = async (e) => {
    e.preventDefault();
    const product = products.find((p) => p.id === selectedId);
    if (!product || !qtySold) return;

    const sellQty = Number(qtySold);
    const newStock = Number(product.quantity) - sellQty;

    if (newStock < 0) {
      alert("Error: Not enough stock in shop!");
      return;
    }

    try {
      // This Update the Product Stock (Deduction)
      const productRef = doc(db, "products", selectedId);
      await updateDoc(productRef, { quantity: newStock });

      // This Record Transaction (Income)
      await addDoc(collection(db, "transactions"), {
        productName: product.name,
        type: "sale",
        amount: sellQty,
        totalCash: sellQty * (Number(product.sellingPrice) || 0),
        date: serverTimestamp(),
      });

      setQtySold("");
      alert("Sale recorded successfully!");
    } catch (err) {
      console.error("Sale failed:", err);
    }
  };

  return (
    <div className="card form-card">
      <h2 style={{ color: "var(--success-green)" }}>Record a Sale</h2>
      <form onSubmit={handleSale}>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          required
        >
          <option value="">Select Product to Sell...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (Stock: {p.quantity})
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Quantity Sold"
          value={qtySold}
          onChange={(e) => setQtySold(e.target.value)}
          required
        />
        <button
          type="submit"
          className="add-btn"
          style={{ backgroundColor: "var(--success-green)" }}
        >
          Complete Sale
        </button>
      </form>
    </div>
  );
};

export default RecordSale;
