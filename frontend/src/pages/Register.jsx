import { useState } from "react";
import { registerTenant } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Register() {
  const [form, setForm] = useState({
    tenantName: "",
    subdomain: "",
    adminEmail: "",
    adminFullName: "",
    adminPassword: ""
  });
  
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const inputStyle = {
    width: '100%',
    maxWidth: '300px', 
    padding: '8px',
    margin: '10px 0',
    display: 'block',
    boxSizing: 'border-box'
  };

  const submit = async () => {
    if (!form.tenantName || !form.subdomain || !form.adminEmail || !form.adminFullName || !form.adminPassword || !confirmPassword) {
      alert("Please fill in all the fields before registering.");
      return; 
    }

    if (form.adminPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await registerTenant(form);
      alert("Registered successfully");
      navigate("/login");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      alert(errorMessage);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>Tenant Registration</h2>
        <input 
          placeholder="Organization Name" 
          style={inputStyle}
          onChange={e => setForm({ ...form, tenantName: e.target.value })} 
        />
        <input 
          placeholder="Subdomain" 
          style={inputStyle}
          onChange={e => setForm({ ...form, subdomain: e.target.value })} 
        />
        <input 
          placeholder="Admin Email" 
          style={inputStyle}
          onChange={e => setForm({ ...form, adminEmail: e.target.value })} 
        />
        <input 
          placeholder="Admin Full Name" 
          style={inputStyle}
          onChange={e => setForm({ ...form, adminFullName: e.target.value })} 
        />
        
        <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            style={{ ...inputStyle, maxWidth: '100%', paddingRight: '40px' }}
            onChange={e => setForm({ ...form, adminPassword: e.target.value })} 
          />
          <span 
            onClick={() => setShowPassword(!showPassword)}
            style={{ 
              position: 'absolute', 
              right: '10px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </span>
        </div>

        <input 
          type="password" 
          placeholder="Confirm Password" 
          style={inputStyle}
          onChange={e => setConfirmPassword(e.target.value)} 
        />

        <button onClick={submit}>Register</button>
      </div>
    </>
  );
}