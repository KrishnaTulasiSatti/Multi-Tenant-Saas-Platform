import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="nav">
      <Link to="/" className="TestDec">SaaS Platform</Link>
      <div className="Division">
            <Link to="/register" className="TestDec">Register</Link>
            <Link to="/login" className="TestDec">Login</Link>
      </div>
    </nav>
  );
}
