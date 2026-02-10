import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
export default function Home() {
  return (
    <>
    <Navbar />
    <div className="container">
      <h1>Multi-Tenant SaaS Platform</h1>
      <p>Project & Task Management System</p>
      <div>
        <Link to="/register" className="btn">Register Tenant</Link>
        <Link to="/login" className="btn secondary">Login</Link>
      </div>
    </div>
    </>
  );
}
