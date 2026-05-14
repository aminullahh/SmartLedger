import React from "react";
import { db } from "../services/firebaseConfig";
import { doc, deleteDoc } from "firebase/firestore";

const InventoryList = ({ products }) => {
  //This Function is to permanently delete a product
  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to completely remove ${name} from your shop?`,
      )
    ) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div className="card inventory-card">
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
        Current Inventory
      </h2>

      {products.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999" }}>
          Your shop is currently empty.
        </p>
      ) : (
        <div className="inventory-container">
          {products.map((product) => (
            <div key={product.id} className="inventory-item">
              <div className="item-info">
                <strong>{product.name}</strong>
                <span className="item-category">{product.category}</span>
              </div>

              <div className="item-actions">
                {/* This Highlights stock in red if it falls below 10 */}
                <span
                  className={`stock-count ${product.quantity < 10 ? "low-stock" : ""}`}
                >
                  Qty: {product.quantity}
                </span>
                <span className="price-tag">
                  ₦{Number(product.sellingPrice).toLocaleString()}
                </span>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  className="delete-icon"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryList;
