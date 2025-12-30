import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export function DashboardPage() {
  const { user, token, logout, selectedTenantId, setSelectedTenantId, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, projects: 0, tasks: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  useEffect(() => {
    if (!authLoading && user && user.role === 'super_admin' && !user.tenantId) {
      setLoadingTenants(true);
      apiService.listTenants(token)
        .then(response => {
          const tenantsList = Array.isArray(response) ? response : (response.tenants || []);
          setTenants(tenantsList);
          if (tenantsList.length > 0 && !selectedTenantId) {
            setSelectedTenantId(tenantsList[0].id);
          }
          setLoadingTenants(false);
        })
        .catch(err => {
          setError('Failed to load tenants: ' + err.message);
          setLoadingTenants(false);
        });
    }
  }, [authLoading, user, token, selectedTenantId, setSelectedTenantId]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const effectiveTenantId = user?.tenantId || selectedTenantId;
        if (!effectiveTenantId) {
          setStats({ users: 0, projects: 0, tasks: 0 });
          setLoading(false);
          return;
        }

        const usersResponse = await apiService.listTenantUsers(token, effectiveTenantId);
        const projectsResponse = await apiService.listProjects(token, effectiveTenantId);

        const usersList = Array.isArray(usersResponse) ? usersResponse : (usersResponse.users || []);
        const projectsList = Array.isArray(projectsResponse) ? projectsResponse : (projectsResponse.projects || []);

        let tasksCount = 0;
        if (projectsList.length > 0) {
          const allTasks = await Promise.all(
            projectsList.map(p => apiService.listTasks(token, p.id).catch(() => []))
          );
          tasksCount = allTasks.flatMap(t => Array.isArray(t) ? t : (t.tasks || [])).length;
        }

        setStats({
          users: usersList.length,
          projects: projectsList.length,
          tasks: tasksCount,
        });
      } catch (err) {
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    if (token && user) fetchStats();
  }, [token, user, selectedTenantId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ background: 'linear-gradient(135deg,#f8fafc,#eef2ff)', minHeight: '100vh', padding: 24 }}>
      
      {/* Top Bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(90deg,#4f46e5,#6366f1)',
        padding: '16px 24px',
        borderRadius: 16,
        color: '#fff',
        boxShadow: '0 10px 25px rgba(79,70,229,.3)',
        marginBottom: 28
      }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <div>
          {(user?.role === 'tenant_admin' || user?.role === 'super_admin') && (
            <button
              onClick={() => navigate('/settings')}
              style={btnSecondary}
            >
              Settings
            </button>
          )}
          <button onClick={handleLogout} style={btnSecondary}>Logout</button>
        </div>
      </nav>

      {/* Super Admin Tenant Selector */}
      {user?.role === 'super_admin' && !user.tenantId && (
        <div style={superAdminCard}>
          <h3>🔐 Super Admin Mode</h3>
          <p>Select a tenant to manage:</p>

          {loadingTenants ? <p>Loading tenants...</p> : (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {tenants.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTenantId(t.id)}
                  style={selectedTenantId === t.id ? btnPrimary : btnSecondary}
                >
                  {t.name} ({t.subdomain})
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? <p>Loading...</p> : error ? (
        <div style={alertError}>{error}</div>
      ) : (
        <>
          {(user?.tenantId || selectedTenantId) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
              {['Users', 'Projects', 'Tasks'].map((label, i) => (
                <div key={label} style={statCard}>
                  <p style={muted}>{label}</p>
                  <p style={statValue}>{Object.values(stats)[i]}</p>
                  <button
                    style={user?.role === 'super_admin' ? btnSecondary : btnPrimary}
                    onClick={() => navigate(`/${label.toLowerCase()}`)}
                  >
                    {user?.role === 'super_admin' ? 'View' : 'Manage'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Account Info */}
          <div style={{ ...card, marginTop: 24 }}>
            <h3>Account Info</h3>
            <p><b>Email:</b> {user?.email}</p>
            <p><b>Role:</b> {user?.role}</p>
            <p><b>Tenant:</b> {user?.tenantId || 'Super Admin'}</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Styles ---------- */

const card = {
  background: '#fff',
  padding: 20,
  borderRadius: 16,
  boxShadow: '0 12px 30px rgba(0,0,0,.06)',
  border: '1px solid #e5e7eb'
};

const statCard = { ...card, textAlign: 'center' };

const statValue = {
  fontSize: 36,
  fontWeight: 800,
  color: '#4f46e5',
  margin: '8px 0 16px'
};

const muted = {
  color: '#6b7280',
  textTransform: 'uppercase',
  fontSize: 13
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

const alertError = {
  background: '#fee2e2',
  color: '#991b1b',
  padding: 16,
  borderRadius: 12,
  marginBottom: 20
};

const superAdminCard = {
  ...card,
  background: 'linear-gradient(135deg,#ecfeff,#e0f2fe)',
  border: '1px solid #bae6fd',
  marginBottom: 24
};
