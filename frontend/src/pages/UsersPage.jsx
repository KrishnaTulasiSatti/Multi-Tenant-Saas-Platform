import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export function UsersPage() {
  const { user, token, logout, loading: authLoading, selectedTenantId } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', fullName: '', role: 'user' });
  const [submitError, setSubmitError] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  useEffect(() => {
    if (!authLoading) {
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      if (token && user && effectiveTenantId) {
        fetchUsers();
      } else if (!token) {
        setLoading(false);
        setError('Not authenticated');
      } else if (token && user && !effectiveTenantId) {
        setLoading(false);
        setError('Please select a tenant to manage users');
      }
    }
  }, [authLoading, token, user, selectedTenantId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      const response = await apiService.listTenantUsers(token, effectiveTenantId);
      const usersList = Array.isArray(response) ? response : (response.users || []);
      setUsers(usersList);
    } catch (err) {
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const tempPassword = Math.random().toString(36).slice(-10) + 'T1!';
      const effectiveTenantId = user?.tenantId || selectedTenantId;
      await apiService.addUser(
        token,
        formData.email,
        tempPassword,
        formData.fullName,
        formData.role,
        effectiveTenantId
      );
      setNewUserPassword(tempPassword);
      setFormData({ email: '', fullName: '', role: 'user' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setSubmitError(err.message || 'Failed to add user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await apiService.deleteUser(token, userId);
      fetchUsers();
    } catch {
      alert('Failed to delete user');
    }
  };

  return (
    <div style={page}>
      {/* Topbar */}
      <nav style={topbar}>
        <h1>{user?.role === 'super_admin' ? 'View Users' : 'Manage Users'}</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} style={btnSecondary}>Dashboard</button>
          <button onClick={() => { logout(); navigate('/login'); }} style={btnSecondary}>Logout</button>
        </div>
      </nav>

      {newUserPassword && (
        <div style={successAlert}>
          <h3 style={{ marginTop: 0 }}>✓ User Created Successfully</h3>
          <div style={passwordCard}>
            <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>Temporary Password</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <code style={passwordCode}>{newUserPassword}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newUserPassword);
                  alert('Password copied!');
                }}
                style={btnPrimary}
              >
                Copy
              </button>
            </div>
          </div>
          <p style={{ fontSize: 14, color: '#065f46' }}>
            Share this password with the user. They must change it on first login.
          </p>
          <button onClick={() => setNewUserPassword('')} style={btnSecondary}>Dismiss</button>
        </div>
      )}

      {user?.role === 'super_admin' && (
        <div style={infoAlert}>
          📊 Read-only view — Super Admin cannot modify users
        </div>
      )}

      {user?.role !== 'super_admin' && user?.role !== 'tenant_admin' && (
        <div style={warningAlert}>
          Only tenant admins can manage users
        </div>
      )}

      {user?.role === 'tenant_admin' && !showForm && (
        <button onClick={() => setShowForm(true)} style={{ ...btnPrimary, marginBottom: 20 }}>
          + Add User
        </button>
      )}

      {user?.role !== 'super_admin' && showForm && (
        <form onSubmit={handleAddUser} style={card}>
          {submitError && <div style={errorAlert}>{submitError}</div>}

          <div style={formGroup}>
            <label style={label}>Email</label>
            <input
              style={input}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Full Name</label>
            <input
              style={input}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div style={formGroup}>
            <label style={label}>Role</label>
            <select
              style={input}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="user">user</option>
              <option value="tenant_admin">tenant_admin</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={btnPrimary}>Add User</button>
            <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>Cancel</button>
          </div>
        </form>
      )}

      {error && <div style={errorAlert}>{error}</div>}

      {loading ? <p>Loading...</p> : (
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.fullName}</td>
                  <td><span style={badge}>{u.role}</span></td>
                  <td>
                    {user?.role === 'tenant_admin' && (
                      <button onClick={() => handleDeleteUser(u.id)} style={btnDanger}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const page = {
  minHeight: '100vh',
  padding: 24,
  background: 'linear-gradient(135deg,#f8fafc,#eef2ff)'
};

const topbar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  background: 'linear-gradient(90deg,#4f46e5,#6366f1)',
  color: '#fff',
  borderRadius: 16,
  marginBottom: 24
};

const card = {
  background: '#fff',
  padding: 20,
  borderRadius: 16,
  border: '1px solid #e5e7eb',
  boxShadow: '0 12px 30px rgba(0,0,0,.06)',
  marginBottom: 20
};

const formGroup = { marginBottom: 12 };
const label = { fontWeight: 600, marginBottom: 6, display: 'block' };

const input = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #d1d5db'
};

const btnPrimary = {
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  background: 'linear-gradient(90deg,#4f46e5,#6366f1)',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer'
};

const btnSecondary = {
  ...btnPrimary,
  background: '#e0e7ff',
  color: '#3730a3',
  marginRight: 10
};

const btnDanger = {
  padding: '8px 14px',
  borderRadius: 10,
  border: 'none',
  background: '#fee2e2',
  color: '#991b1b',
  fontWeight: 600
};

const badge = {
  padding: '4px 10px',
  borderRadius: 999,
  background: '#e0e7ff',
  color: '#3730a3',
  fontWeight: 600,
  fontSize: 12
};

const tableWrap = {
  overflowX: 'auto',
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 12px 30px rgba(0,0,0,.06)'
};

const table = {
  width: '100%',
  borderCollapse: 'collapse'
};

const successAlert = {
  background: '#ecfdf5',
  color: '#065f46',
  padding: 16,
  borderRadius: 16,
  marginBottom: 20,
  border: '1px solid #86efac'
};

const infoAlert = {
  background: '#ecfeff',
  color: '#0369a1',
  border: '1px solid #bae6fd',
  padding: 14,
  borderRadius: 12,
  marginBottom: 16
};

const warningAlert = {
  background: '#fffbeb',
  color: '#92400e',
  border: '1px solid #fde68a',
  padding: 14,
  borderRadius: 12,
  marginBottom: 16
};

const errorAlert = {
  background: '#fee2e2',
  color: '#991b1b',
  padding: 14,
  borderRadius: 12,
  marginBottom: 16
};

const passwordCard = {
  background: '#f0fdf4',
  border: '1px dashed #86efac',
  padding: 14,
  borderRadius: 12,
  marginBottom: 10
};

const passwordCode = {
  background: '#ffffff',
  padding: '10px 12px',
  borderRadius: 8,
  fontFamily: 'monospace',
  fontSize: 15,
  flex: 1,
  wordBreak: 'break-all'
};
