import { useEffect, useState } from "react";
import api from "../api/client";
import "./Tasks.css";
import DashboardNavbar from "../components/DashboardNavbar";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const res = await api.get("/tasks/all");
      setTasks(res.data.data || []);
    } catch (err) {
      console.error("Failed to load tasks", err);
      alert(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="loading">Loading tasks...</p>;
  if (!tasks.length) return <p className="empty">No tasks found</p>;

  return (
    <>
    <DashboardNavbar/>
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>All Tasks</h1>
        <p>System-wide view across all tenants & projects</p>
      </div>

      <div className="tasks-grid">
        {tasks.map(task => (
          <div key={task.id} className="tasks-card">
            
            {/* HEADER */}
            <div className="tasks-card-header">
              <h3>{task.title}</h3>
              <div className="tasks-badges">
                <span className={`badge status ${task.status}`}>
                  {task.status.replace("_", " ")}
                </span>
                <span className={`badge priority ${task.priority}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            {/* BODY */}
            <div className="tasks-card-body">
              <div className="info-block">
                <span className="label">Project</span>
                <span className="value">{task.project?.name}</span>
              </div>

              <div className="info-block">
                <span className="label">Tenant ID</span>
                <span className="value mono">{task.tenant_id}</span>
              </div>

              <div className="info-block">
                <span className="label">Assigned To</span>
                <span className="value">
                  {task.assignedto?.fullName || "Unassigned"}
                </span>
              </div>
            </div>

            {/* FOOTER */}
            <div className="tasks-card-footer">
              Created:{" "}
              {new Date(task.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
