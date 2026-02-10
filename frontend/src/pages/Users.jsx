import { useEffect, useState } from "react";
import api from "../api/client";
import DashboardNavbar from "../components/DashboardNavbar";
import UserModal from "../components/UserModal";
import "./Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [tenantId, setTenantId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const meRes = await api.get("/auth/me");
      const me = meRes.data.data;
      const tenant_id = me.tenant_id;

      if (!tenant_id) {
        throw new Error("Tenant ID missing from /auth/me response");
      }

      setTenantId(tenant_id);
      const res = await api.get(`/tenants/${tenant_id}/users`);
      const list = Array.isArray(res.data.data?.users) ? res.data.data.users : [];

      setUsers(list);
      setFiltered(list);
    } catch (err) {
      console.error("Failed to load users", err);
      setUsers([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let data = [...users];

    if (search) {
      data = data.filter(u =>
        `${u.full_name} ${u.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (role) {
      data = data.filter(u => u.role === role);
    }

    setFiltered(data);
  }, [search, role, users]);

  async function deleteUser(id) {
    if (!window.confirm("Delete this user?")) return;
    try {
        await api.delete(`/users/${id}`);
        loadUsers();
    } catch (err) {
        alert("Failed to delete user");
    }
  }

  if (loading) return <p>Loading users...</p>;

  return (
    <>
      <DashboardNavbar />

      <div className="users-page">
        <div className="users-header">
          <h1>Users</h1>
          <button
            className="primary-btn"
            onClick={() => {
              setEditingUser(null);
              setShowModal(true);
            }}
          >
            + Add User
          </button>
        </div>

        <div className="filters">
          <input
            placeholder="Search by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="tenant_admin">Tenant Admin</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="empty">No users found</p>
        ) : (
          <div className="users-grid">
            {filtered.map(user => (
              <div key={user.id} className="user-card">
                <h3>{user.full_name}</h3>
                <p className="email">{user.email}</p>
                
                <span className={`badge ${user.role}`}>
                    {user.role}
                </span>

                <p className={`status ${user.is_active ? "active" : "inactive"}`}>
                    Status: {user.is_active ? "Active" : "Inactive"}
                </p>

                <p className="created">
                    Created: {new Date(user.created_at).toLocaleDateString()}
                </p>

                <div className="actions">
                    <button
                    onClick={() => {
                        setEditingUser(user);
                        setShowModal(true);
                    }}
                    >
                    Edit
                    </button>
                    <button className="danger" onClick={() => deleteUser(user.id)}>
                    Delete
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <UserModal
            user={editingUser}
            tenantId={tenantId}
            onClose={() => setShowModal(false)}
            onSaved={loadUsers}
          />
        )}
      </div>
    </>
  );
}