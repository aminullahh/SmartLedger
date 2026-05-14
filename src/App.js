import React, { useState, useEffect } from "react";
import "./main.css";
import { db, auth } from "./services/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

import Dashboard from "./components/Dashboard";
import AddProduct from "./components/AddProduct";
import RecordSale from "./components/RecordSale";
import InventoryList from "./components/InventoryList";
import TransactionHistory from "./components/TransactionHistory";
import Login from "./components/Login";

function App() {
  const shopName = process.env.REACT_APP_SHOP_NAME || "Amtech Smart Ledger";
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  // This Add a loading state
  const [loading, setLoading] = useState(true);

  // This Handle Setup Auth Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
      // This Tell the app we are done checking Firebase
      setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  // This Handle Setup Data Listeners
  useEffect(() => {
    if (!loggedIn) return;

    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubTransactions = onSnapshot(
      collection(db, "transactions"),
      (snapshot) => {
        setTransactions(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      },
    );

    return () => {
      unsubProducts();
      unsubTransactions();
    };
  }, [loggedIn]);

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']");
    if (!link) {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      document.getElementsByTagName("head")[0].appendChild(newLink);
    }
  }, []);

  // This handle Early Return for Loading Screen
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h2 style={{ color: "var(--primary-purple)" }}>
          Loading Amtech Smart Ledger...
        </h2>
      </div>
    );
  }

  // This Handle Early Return for Login
  if (!loggedIn) {
    return <Login />;
  }

  //  This handle Main Application Render
  return (
    <div className="container">
      <header className="card">
        <div>
          <h1 style={{ margin: 0 }}>{shopName}</h1>
          <small style={{ color: "var(--primary-purple)", fontWeight: "bold" }}>
            Powered by Amtech Digital Solution
          </small>
        </div>
        <button onClick={() => signOut(auth)} className="logout-btn">
          Logout
        </button>
      </header>

      <Dashboard products={products} transactions={transactions} />

      <div className="main-layout">
        <div className="forms-grid">
          <AddProduct products={products} />
          <RecordSale products={products} />
        </div>

        <InventoryList products={products} />
        <TransactionHistory transactions={transactions} products={products} />
      </div>
    </div>
  );
}

export default App;
