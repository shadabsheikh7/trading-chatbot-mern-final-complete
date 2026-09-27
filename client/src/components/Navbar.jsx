import { useState } from "react";
export default function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black border-bottom sticky-top">
      <div className="container-fluid px-3 px-lg-4">
        <a className="navbar-brand fw-bold" href="#top">
          <span className="brand-mark">TP</span> TradePilot
        </a>
        <button className="navbar-toggler" onClick={() => setOpen(!open)}>
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
          <div className="navbar-nav me-auto">
            <a className="nav-link" href="#dashboard">
              Dashboard
            </a>
            <a className="nav-link" href="#strategies">
              Strategies
            </a>
            <a className="nav-link" href="#portfolio">
              Portfolio
            </a>
            <a className="nav-link" href="#orders">
              Orders
            </a>
            <a className="nav-link" href="#assistant">
              AI Assistant
            </a>
            {user?.role === "admin" && (
              <a className="nav-link text-warning" href="#admin">
                Admin
              </a>
            )}
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-secondary">{user?.name}</span>
            <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
