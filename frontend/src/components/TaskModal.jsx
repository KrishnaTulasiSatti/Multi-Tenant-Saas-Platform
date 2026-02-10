import { useEffect, useState } from "react";
import api from "../api/client";

export default function TaskModal({ projectId, task, onClose, onSaved }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo || "");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(task?.due_date || "");
  
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const meRes = await api.get("/auth/me");
      const tenant_id = meRes.data.data.tenant_id;
      const res = await api.get(`/tenants/${tenant_id}/users`);
      setUsers(Array.isArray(res.data.data?.users) ? res.data.data.users : []);
    } catch (err) {
     alert(err.response?.data?.message || "Operation failed");
      console.error("User load error", err);
    } finally {
      setLoadingUsers(false);
    }
  }

  const handleSave = async () => {
    if (!title.trim()) return alert("Title is required");

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        assignedTo: assignedTo || null,
        priority,
        dueDate: dueDate || null
      };

      if (task) {
        // Update existing task
        await api.put(`/tasks/${task.id}`, payload);
      } else {
        // Create new task
        await api.post(`/projects/${projectId}/tasks`, payload);
      }

      if (onSaved) await onSaved(); 
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      alert(err.response?.data?.message || "Operation failed");
      alert("Failed to save task. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{task ? "Edit Task" : "Add Task"}</h2>
        
        <input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />

        <div className="form-group">
          <label>Assign To:</label>
          <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} disabled={loadingUsers}>
            <option value="">{loadingUsers ? "Loading..." : "Unassigned"}</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Priority:</label>
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="form-group">
          <label>Due Date:</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Task"}
          </button>
        </div>
      </div>
    </div>
  );
}