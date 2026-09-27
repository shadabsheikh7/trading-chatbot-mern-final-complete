import { useState } from "react";
export default function AuthPage({ mode, onSubmit, onSwitch, error }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const set = (k, v) => setForm((x) => ({ ...x, [k]: v }));
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="brand-mark mx-auto mb-2">TP</div>
          <h2>TradePilot</h2>
          <p className="text-secondary">Conversational trading automation</p>
        </div>
        <h4>{mode === "login" ? "Welcome back" : "Create account"}</h4>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
        >
          {mode === "register" && (
            <input
              className="form-control mb-3"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          )}
          <input
            className="form-control mb-3"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
          <input
            className="form-control mb-3"
            type="password"
            placeholder="Password (6+ characters)"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            required
            minLength={6}
          />
          <button className="btn btn-primary w-100">
            {mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
        <button className="btn btn-link w-100 mt-2" onClick={onSwitch}>
          {mode === "login"
            ? "Create a new account"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
