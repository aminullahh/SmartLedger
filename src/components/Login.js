import React, { useState } from "react";
import { auth } from "../services/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      // Clean up Firebase error messages for the user
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  return (
    <div
      className="login-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <div
        className="card form-card"
        style={{ maxWidth: "400px", width: "100%", height: "auto" }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          {isRegistering ? "Create an Account" : "Welcome Back"}
        </h2>

        {error && (
          <p
            style={{
              color: "var(--danger-red)",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {error}
          </p>
        )}

        <form
          onSubmit={handleAuth}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn" type="submit">
            {isRegistering ? "Sign Up" : "Login"}
          </button>
        </form>

        <p
          onClick={() => setIsRegistering(!isRegistering)}
          className="login-toggle-text"
          style={{
            cursor: "pointer",
            textAlign: "center",
            marginTop: "20px",
            color: "var(--primary)",
            fontWeight: "bold",
          }}
        >
          {isRegistering
            ? "Already have an account? Login here."
            : "New user? Create an account here."}
        </p>
      </div>
    </div>
  );
};

export default Login;
