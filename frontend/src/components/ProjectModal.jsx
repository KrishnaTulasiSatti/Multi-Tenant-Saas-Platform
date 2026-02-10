import { useState } from "react";
import api from "../api/client";
import "./ProjectModal.css";

export default function ProjectModal({ project, onClose, onSaved }) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [status, setStatus] = useState(project?.status || "active");

  async function save() {
    if (!name.trim()) return alert("Name required");

    if (project) {
      await api.put(`/projects/${project.id}`, {
        name,
        description,
        status
      });
    } else {
      await api.post("/projects", {
        name,
        description,
        status
      });
    }

    onSaved();
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{project ? "Edit Project" : "Create Project"}</h2>

        <input
          placeholder="Project name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="completed">Completed</option>
        </select>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
