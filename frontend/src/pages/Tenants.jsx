import { useEffect, useState } from "react";
import api from "../api/client";
import EditTenantModal from "../components/EditTenantModal";
import "./Tenants.css";
import DashboardNavbar from "../components/DashboardNavbar";

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTenant, setEditingTenant] = useState(null);

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    try {
      const res = await api.get("/tenants");
      setTenants(res.data.data.tenants || []);
    } catch (err) {
      console.error("Failed to load tenants", err);
      alert(err.response?.data?.message || "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="tenant-loading">Loading tenants...</p>;
  if (!tenants.length) return <p className="tenant-empty">No tenants found</p>;

  return (
    <>
    <DashboardNavbar/>
    <div className="tenants-page">
      <div className="tenants-header">
        <h1>Tenants</h1>
        <p>System-wide tenant administration</p>
      </div>

      <div className="tenants-grid">
        {tenants.map(t => (
          <div key={t.id} className="tenant-card">
            <div className="tenant-card-header">
              <h3>{t.name}</h3>
              <span className={`tenant-status ${t.status}`}>
                {t.status}
              </span>
            </div>

            <div className="tenant-card-body">
              <div className="tenant-info">
                <span className="label">Tenant ID</span>
                <span className="value mono">{t.id}</span>
              </div>

              {t.subdomain && (
                <div className="tenant-info">
                  <span className="label">Domain</span>
                  <span className="value">{t.subdomain}</span>
                </div>
              )}

              {t.subscription_plan && (
                <div className="tenant-info">
                  <span className="label">Subscription Plan</span>
                  <span className="value">{t.subscription_plan}</span>
                </div>
              )}


              <div className="tenant-stats">
                <div className="stat">
                  <span className="stat-value">{t.total_users ?? "-"}</span>
                  <span className="stat-label">Users</span>
                </div>

                <div className="stat">
                  <span className="stat-value">{t.total_projects ?? "-"}</span>
                  <span className="stat-label">Projects</span>
                </div>
              </div>
            </div>
            <div className="tenant-card-footer">
              <button
                className="edit-btn"
                onClick={() => setEditingTenant(t)}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingTenant && (
        <EditTenantModal
          tenant={editingTenant}
          onClose={() => setEditingTenant(null)}
          onSaved={loadTenants}
        />
      )}
    </div>
    </>
  );
}
