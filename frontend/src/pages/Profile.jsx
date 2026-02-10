import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/client";
import DashboardNavbar from "../components/DashboardNavbar";
import "./Profile.css";

export default function Profile() {
  const { user } = useAuth();

  const [tenantName, setTenantName] = useState("");
  const [tenantSubdomain, setTenantSubdomain] = useState("");
  const [subscriptionPlan, setSubscriptionPlan] = useState("");

  if (!user) return null;

  const isSuperAdmin = user.role === "super_admin";
  const isTenantAdmin = user.role === "tenant_admin";
  const isNormalUser = user.role === "user";

  //  Fetch tenant details for tenant users
  useEffect(() => {
    if (isSuperAdmin || !user.tenant_id) return;

    async function loadTenantDetails() {
      try {
        const res = await api.get(`/tenants/${user.tenant_id}`);
        const tenant = res.data.data;

        setTenantName(tenant.name);
        setTenantSubdomain(tenant.subdomain);
        setSubscriptionPlan(tenant.subscription_plan);
      } catch (err) {
        console.error("Failed to load tenant info", err);
      }
    }

    loadTenantDetails();
  }, [user, isSuperAdmin]);

  return (
    <>
      <DashboardNavbar />

      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">
              {user.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2>{user.full_name || "System User"}</h2>
              <span className={`role-badge ${user.role}`}>
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="profile-details">
            <ProfileItem label="User ID" value={user.id} />
            <ProfileItem label="Email" value={user.email} />

            {!isSuperAdmin && (
              <>
                <ProfileItem label="Tenant ID" value={user.tenant_id} />
                <ProfileItem label="Tenant Name" value={tenantName || "—"} />
                <ProfileItem label="Subdomain" value={tenantSubdomain || "—"} />
              </>
            )}

            {isTenantAdmin && (
              <ProfileItem
                label="Subscription Plan"
                value={subscriptionPlan || "—"}
              />
            )}

            <ProfileItem
              label="Status"
              value={user.is_active ? "Active" : "Inactive"}
              status={user.is_active}
            />

            {isSuperAdmin && (
              <>
                <div className="divider" />
                <h3 className="section-title">System Access</h3>
                <p className="system-note">
                  You have full system-wide administrative privileges.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ProfileItem({ label, value, status }) {
  return (
    <div className="profile-item">
      <span className="label">{label}</span>
      <span
        className={`value ${
          status !== undefined ? (status ? "active" : "inactive") : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
