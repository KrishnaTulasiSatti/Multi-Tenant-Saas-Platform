import { useState } from "react";
import { loginUser } from "../api/auth.api";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Login() {
  const [form, setForm] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async () => {
    try{
        const res = await loginUser(form);
        await login(res.data.data.token);
        navigate("/dashboard");
    }catch (err) {
      console.error( err);
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
      alert(errorMessage);
    }
  };

  return (
    <>
    <Navbar />
    <div className="container">
      <h2>Login</h2>
      <input placeholder="Email" onChange={e=>setForm({...form,email:e.target.value})}/>
      <input type="password" placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})}/>
      <input placeholder="Tenant Subdomain" onChange={e=>setForm({...form,tenantSubdomain:e.target.value})}/>
      <button onClick={submit}>Login</button>
    </div>
    </>
  );
}
