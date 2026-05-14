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
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);

  // 1. NEW: Add a loading state
  const [loading, setLoading] = useState(true);

  // 2. Setup Auth Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
      // Tell the app we are done checking Firebase
      setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  // 3. Setup Data Listeners
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

  // 4. NEW: Early Return for Loading Screen
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
          Loading Amiinullah Store...
        </h2>
      </div>
    );
  }

  // 5. Early Return for Login
  if (!loggedIn) {
    return <Login />;
  }

  // 6. Main Application Render
  return (
    <div className="container">
      <header className="card">
        <h1>Amiinullah Store</h1>
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
        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
}

export default App;
