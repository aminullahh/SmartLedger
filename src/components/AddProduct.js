import React, { useState } from "react";
import { db } from "../services/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

const AddProduct = ({ products }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Prepare clean numeric data to prevent NaN
    const qtyNum = Number(quantity) || 0;
    const costNum = Number(costPrice) || 0;
    const sellNum = Number(sellingPrice) || 0;
    const totalCost = qtyNum * costNum;

    // 2. Check if product already exists in your local state
    const existingProduct = products.find(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    );

    try {
      if (existingProduct) {
        // --- UPDATE MODE ---
        const productRef = doc(db, "products", existingProduct.id);
        await updateDoc(productRef, {
          // Adds new quantity to the existing stock number
          quantity: (Number(existingProduct.quantity) || 0) + qtyNum,
          // Updates prices to the most recent values
          costPrice: costNum,
          sellingPrice: sellNum,
          lastUpdated: serverTimestamp(),
        });
      } else {
        // --- CREATE MODE ---
        await addDoc(collection(db, "products"), {
          name,
          category,
          quantity: qtyNum,
          costPrice: costNum,
          sellingPrice: sellNum,
          createdAt: serverTimestamp(),
        });
      }

      // 3. Record the transaction for the "Total Expenses" card
      await addDoc(collection(db, "transactions"), {
        productName: name,
        type: "restock",
        amount: qtyNum,
        totalCash: totalCost,
        date: serverTimestamp(),
      });

      // Clear Form fields
      setName("");
      setCategory("");
      setQuantity("");
      setCostPrice("");
      setSellingPrice("");

      alert(
        existingProduct
          ? `${name} stock updated!`
          : `${name} added successfully!`,
      );
    } catch (error) {
      console.error("Error saving inventory: ", error);
      alert("Failed to save inventory. Check console for details.");
    }
  };

  return (
    <div className="card form-card">
      <h2>Add New Inventory</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name (e.g. Milo)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Category (e.g. Beverages)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Quantity Added"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Your Cost Price per unit (₦)"
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Your Selling Price per unit (₦)"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(e.target.value)}
          required
        />
        <button type="submit" className="add-btn">
          Upload to Shop
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
