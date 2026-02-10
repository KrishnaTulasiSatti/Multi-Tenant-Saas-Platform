import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState, useRef, useEffect } from "react";
import "./DashboardNavbar.css";

export default function DashboardNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="dashboard-nav">
      {/* Logo */}
      <div className="logo">
        <Link to="/dashboard">SaaS Platform</Link>
      </div>

      {/* Hamburger */}
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* Menu */}
      <ul className={`menu ${menuOpen ? "open" : ""}`}>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/projects">Projects</Link></li>

        {(user.role === "super_admin") && (
          <li><Link to="/tasks">Tasks</Link></li>
        )}

        {user.role === "tenant_admin" && (
          <li><Link to="/users">Users</Link></li>
        )}

        {user.role === "super_admin" && (
          <li><Link to="/tenants">Tenants</Link></li>
        )}
      </ul>

      {/* User dropdown */}
      <div className="user-menu" ref={dropdownRef}>
        <button
          className="user-name"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {user.full_name} ({user.role})
        </button>

        {dropdownOpen && (
          <div className="dropdown">
            <Link to="/profile" onClick={() => setDropdownOpen(false)}>
              Profile
            </Link>
            <Link to="/settings" onClick={() => setDropdownOpen(false)}>
              Settings
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
