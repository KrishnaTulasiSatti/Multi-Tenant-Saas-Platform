import { useState } from "react";
import api from "../api/client";
import "./EditTenantModal.css";

export default function EditTenantModal({ tenant, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: tenant.name || "",
    subdomain: tenant.subdomain || "",
    status: tenant.status || "active",
    subscription_plan: tenant.subscription_plan || "free"
  });

  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: typeof value === "string" ? value.toLowerCase() : value
    }));
  }

  async function handleSave() {
    try {
      setSaving(true);

      await api.put(`/tenants/${tenant.id}`, {
        name: form.name,
        subdomain: form.subdomain,
        status: form.status.toLowerCase(),
        subscription_plan: form.subscription_plan.toLowerCase()
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error("Failed to update tenant:", err);
      alert(err.response?.data?.message || "Operation failed");
      alert("Failed to update tenant");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Edit Tenant</h2>

        <div className="form-grid">
          <input
            name="name"
            placeholder="Tenant Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="subdomain"
            placeholder="Subdomain"
            value={form.subdomain}
            onChange={handleChange}
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            name="subscription_plan"
            value={form.subscription_plan}
            onChange={handleChange}
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
