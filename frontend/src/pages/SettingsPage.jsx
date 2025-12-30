import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export function SettingsPage() {
  const { user, token, logout, selectedTenantId } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenant, setTenant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    status: '',
    subscriptionPlan: '',
    maxUsers: '',
    maxProjects: ''
  });

  const tenantId = user?.role === 'super_admin' ? selectedTenantId : user?.tenantId;
  const isSuperAdmin = user?.role === 'super_admin';
  const isTenantAdmin = user?.role === 'tenant_admin';

  useEffect(() => {
    if (!tenantId) {
      setError('No tenant selected');
      setLoading(false);
      return;
    }

    setLoading(true);
    apiService.getTenant(token, tenantId)
      .then(data => {
        setTenant(data);
        setFormData({
          name: data.name || '',
          status: data.status || '',
          subscriptionPlan: data.subscriptionPlan || '',
          maxUsers: data.maxUsers || '',
          maxProjects: data.maxProjects || ''
        });
        setError('');
      })
      .catch(err => setError(err.message || 'Failed to load tenant details'))
      .finally(() => setLoading(false));
  }, [token, tenantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updateData = {};

      if (isTenantAdmin && formData.name !== tenant.name) {
        updateData.name = formData.name;
      }

      if (isSuperAdmin) {
        if (formData.name !== tenant.name) updateData.name = formData.name;
        if (formData.status !== tenant.status) updateData.status = formData.status;
        if (formData.subscriptionPlan !== tenant.subscriptionPlan) updateData.subscriptionPlan = formData.subscriptionPlan;
        if (+formData.maxUsers !== tenant.maxUsers) updateData.maxUsers = +formData.maxUsers;
        if (+formData.maxProjects !== tenant.maxProjects) updateData.maxProjects = +formData.maxProjects;
      }

      if (!Object.keys(updateData).length) {
        setError('No changes to save');
        return;
      }

      await apiService.updateTenant(token, tenantId, updateData);
      setSuccess('Tenant settings updated successfully');

      const updated = await apiService.getTenant(token, tenantId);
      setTenant(updated);
      setFormData({
        name: updated.name,
        status: updated.status,
        subscriptionPlan: updated.subscriptionPlan,
        maxUsers: updated.maxUsers,
        maxProjects: updated.maxProjects
      });
    } catch (err) {
      setError(err.message || 'Failed to update tenant');
    }
  };

  return (
    <div style={page}>
      {/* Topbar */}
      <nav style={topbar}>
        <h1>{isSuperAdmin ? 'Tenant Management' : 'Tenant Settings'}</h1>
        <div>
          <button onClick={() => navigate('/dashboard')} style={btnSecondary}>Dashboard</button>
          <button onClick={() => { logout(); navigate('/login'); }} style={btnSecondary}>Logout</button>
        </div>
      </nav>

      {isSuperAdmin && (
        <div style={infoAlert}>
          🔐 Super Admin Mode — Full tenant configuration enabled
        </div>
      )}

      {isTenantAdmin && (
        <div style={warningAlert}>
          ℹ️ Tenant Admin — Only tenant name can be updated
        </div>
      )}

      {error && <div style={errorAlert}>{error}</div>}
      {success && <div style={successAlert}>{success}</div>}

      {tenant && (
        <div style={card}>
          <h2>Tenant Information</h2>

          <form onSubmit={handleSubmit}>
            <div style={formGroup}>
              <label style={label}>Tenant Name</label>
              <input
                style={input}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div style={formGroup}>
              <label style={label}>Subdomain</label>
              <input style={{ ...input, background: '#f3f4f6' }} value={tenant.subdomain} disabled />
            </div>

            {isSuperAdmin && (
              <>
                <div style={twoCol}>
                  <div style={formGroup}>
                    <label style={label}>Status</label>
                    <select style={input} value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="trial">Trial</option>
                    </select>
                  </div>

                  <div style={formGroup}>
                    <label style={label}>Subscription Plan</label>
                    <select style={input} value={formData.subscriptionPlan}
                      onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}>
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <div style={twoCol}>
                  <div style={formGroup}>
                    <label style={label}>Max Users</label>
                    <input style={input} type="number" value={formData.maxUsers}
                      onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })} />
                  </div>

                  <div style={formGroup}>
                    <label style={label}>Max Projects</label>
                    <input style={input} type="number" value={formData.maxProjects}
                      onChange={(e) => setFormData({ ...formData, maxProjects: e.target.value })} />
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" style={btnPrimary}>
                {isSuperAdmin ? 'Update Tenant' : 'Update Name'}
              </button>
              <button type="button" onClick={() => navigate('/dashboard')} style={btnSecondary}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const page = {
  minHeight: '100vh',
  padding: 24,
  background: 'linear-gradient(135deg, #f8fafc, #eef2ff)'
};

const topbar = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'linear-gradient(90deg,#4f46e5,#6366f1)',
  padding: '16px 24px',
  borderRadius: 16,
  color: '#fff',
  marginBottom: 24
};

const card = {
  background: '#fff',
  padding: 24,
  borderRadius: 16,
  border: '1px solid #e5e7eb',
  boxShadow: '0 12px 30px rgba(0,0,0,.06)'
};

const formGroup = { marginBottom: 14 };
const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };

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
  fontWeight: 600
};

const btnSecondary = {
  ...btnPrimary,
  background: '#e0e7ff',
  color: '#3730a3'
};

const errorAlert = {
  background: '#fee2e2',
  color: '#991b1b',
  padding: 14,
  borderRadius: 12,
  marginBottom: 16
};

const successAlert = {
  background: '#ecfdf5',
  color: '#065f46',
  padding: 14,
  borderRadius: 12,
  marginBottom: 16
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
