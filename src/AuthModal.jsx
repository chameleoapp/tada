import React, { useState } from "react";

export function AuthModal({ initialMode = "login", reason = null, onClose }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        
        <h2>{mode === "login" ? "Log In" : "Sign Up"}</h2>
        
        {reason && (
          <p className="modal-reason">{reason}</p>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="primary-button">
            {mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>
        
        <p className="modal-toggle">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => setMode("login")}
              >
                Log in
              </button>
            </>
          )}
        </p>
        
        <p className="coming-soon-notice">
          Authentication is coming soon. For now, this is a preview of the interface.
        </p>
      </div>
    </div>
  );
}
