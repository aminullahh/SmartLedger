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

  // 1. Setup Auth Listener (Hook must be at the top)
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) setLoggedIn(true);
      else setLoggedIn(false);
    });
    return () => unsubAuth();
  }, []);

  // 2. Setup Data Listeners (Hook must be at the top)
  useEffect(() => {
    if (!loggedIn) return; // Silent guard inside the hook is fine

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

  // 3. Early Return for Login (This MUST come after all Hooks)
  if (!loggedIn) {
    return <Login setLoggedIn={setLoggedIn} />;
  }

  // 4. Main Application Render
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
