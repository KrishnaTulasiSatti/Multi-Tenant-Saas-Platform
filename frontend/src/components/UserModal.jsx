import { useEffect, useState } from "react";
import api from "../api/client";
import "./UserModal.css";

export default function UserModal({ user, tenantId, onClose, onSaved }) {
  const isEdit = Boolean(user);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && user) {
      setEmail(user.email);
      setFullName(user.full_name);
      setRole(user.role);
      setIsActive(user.is_active === true || user.is_active === 1);
    }
  }, [isEdit, user]);

  async function handleSubmit(e) {
    e.preventDefault();

    if ((!isEdit && !email) || !fullName || (!isEdit && !password)) {
      alert("Please fill all required fields");
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        await api.put(`/users/${user.id}`, {
          full_name: fullName,
          role,
          is_active: isActive
        });
      } else {
        if (!tenantId) throw new Error("Tenant ID missing");

        await api.post(`/tenants/${tenantId}/users`, {
          email,
          password,
          full_name: fullName,
          role,
          is_active: true
        });
      }

      await onSaved();
      onClose();
    } catch (err) {
      if (err?.response) {
        console.error("Save user failed:", err);
        alert(err.response?.data?.message || "Operation failed");
        alert("Failed to save user");
      } else {
        await onSaved();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{isEdit ? "Edit User" : "Add User"}</h2>

        <form onSubmit={handleSubmit}>
          {!isEdit && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          )}

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />

          {!isEdit && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          )}

          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="tenant_admin">Tenant Admin</option>
          </select>

          {isEdit && (
            <div className="checkbox-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                />
                Active
              </label>
            </div>
          )}

          <div className="actions">
            <button type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
