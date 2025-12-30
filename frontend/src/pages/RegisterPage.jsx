import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const [tenantName, setTenantName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerTenant } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerTenant(
        tenantName,
        subdomain,
        adminEmail,
        adminPassword,
        adminFullName
      );
      alert('Tenant registered successfully! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={shell}>
      <div style={authCard}>
        <h2 style={title}>Create Your Organization 🚀</h2>

        {error && (
          <div style={alertError} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formGrid}>
          <div style={formGroup}>
            <label style={label}>Tenant Name</label>
            <input
              style={input}
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              required
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Subdomain</label>
            <input
              style={input}
              type="text"
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              placeholder="e.g. demo, acme"
              required
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Admin Email</label>
            <input
              style={input}
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Admin Password</label>
            <input
              style={input}
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              minLength={8}
            />
            <small style={hint}>
              Password must be at least 8 characters long
            </small>
          </div>

          <div style={formGroup}>
            <label style={label}>Admin Full Name</label>
            <input
              style={input}
              type="text"
              value={adminFullName}
              onChange={(e) => setAdminFullName(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={btnPrimary}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={linkMuted}>
          <a href="/login" style={link}>
            Already have an account? Login
          </a>
        </p>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const shell = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #eef2ff, #f8fafc)',
  padding: 16
};

const authCard = {
  width: '100%',
  maxWidth: 460,
  background: '#ffffff',
  padding: 28,
  borderRadius: 20,
  boxShadow: '0 20px 45px rgba(0,0,0,0.08)',
  border: '1px solid #e5e7eb'
};

const title = {
  textAlign: 'center',
  marginBottom: 20,
  color: '#3730a3',
  fontWeight: 800
};

const formGrid = {
  display: 'grid',
  gap: 16
};

const formGroup = {
  display: 'flex',
  flexDirection: 'column'
};

const label = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 6,
  color: '#1f2937'
};

const input = {
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid #d1d5db',
  fontSize: 14,
  outline: 'none'
};

const btnPrimary = {
  marginTop: 10,
  padding: '12px',
  borderRadius: 12,
  border: 'none',
  background: 'linear-gradient(90deg, #4f46e5, #6366f1)',
  color: '#ffffff',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: 15
};

const alertError = {
  background: '#fee2e2',
  color: '#991b1b',
  padding: 12,
  borderRadius: 10,
  marginBottom: 14,
  fontWeight: 600
};

const linkMuted = {
  marginTop: 16,
  textAlign: 'center',
  fontSize: 14,
  color: '#6b7280'
};

const link = {
  color: '#4f46e5',
  fontWeight: 600,
  textDecoration: 'none'
};

const hint = {
  fontSize: 12,
  color: '#6b7280',
  marginTop: 6
};
