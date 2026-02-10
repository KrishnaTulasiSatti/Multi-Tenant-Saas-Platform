import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import DashboardNavbar from "../components/DashboardNavbar";
import TaskModal from "../components/TaskModal";
import "./ProjectDetails.css";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignedto: ""
  });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const reloadTasks = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${projectId}/tasks`, { params: filters });
      setTasks(res.data.data.tasks || []);
    } catch (err) {
      console.error("Failed to reload tasks", err);
      alert(err.response?.data?.message || "Operation failed");
    }
  }, [projectId, filters]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        //  Get current user
        const meRes = await api.get("/auth/me");
        const user = meRes.data.data;

        //  Load projects
        const projectRes = user.role === "super_admin"
            ? await api.get("/projects/all")
            : await api.get("/projects");

        const projects = projectRes.data.data.projects || projectRes.data.data || [];
        const found = projects.find(p => p.id === projectId);

        if (!found) throw new Error("Project not found");
        setProject(found);

        //  Load tasks
        await reloadTasks();
      } catch (err) {
        console.error("Failed to load project details", err);
        alert(err.response?.data?.message || "Operation failed");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [projectId, reloadTasks]);

  async function updateStatus(taskId, status) {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      reloadTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
      alert("Failed to update status");
    }
  }

  async function deleteTask(taskId) {
    if (!window.confirm("Delete task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      reloadTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
      alert("Failed to delete task");
    }
  }

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div className="error">Project not found</div>;

  return (
    <>
      <DashboardNavbar />
      <div className="project-details">
        <div className="project-header">
          <div>
            <h1>{project.name}</h1>
            <span className={`badge ${project.status}`}>{project.status}</span>
            <p className="description">{project.description || "No description"}</p>
          </div>
        </div>

        <div className="filters">
          <select onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="true">All Status</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select onChange={e => setFilters({ ...filters, priority: e.target.value })}>
            <option value="true">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="tasks-header">
          <h2>Tasks</h2>
          <button className="primary" onClick={() => { setEditingTask(null); setShowTaskModal(true); }}>
            + Add Task
          </button>
        </div>

        <div className="task-list">
          {tasks.length === 0 ? (
            <p>No tasks found</p>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="task-card">
                <div>
                  <strong>{task.title}</strong>
                  <div className="meta">
                    <span className={`badge ${task.status}`}>{task.status}</span>
                    <span className={`badge ${task.priority}`}>{task.priority}</span>
                    {task.assignedto && <span>👤 {task.assignedto.fullName}</span>}
                    {task.due_date && <span>📅 {task.due_date}</span>}
                  </div>
                </div>
                <div className="task-actions">
                  <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}>
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button onClick={() => { setEditingTask(task); setShowTaskModal(true); }}>Edit</button>
                  <button className="danger" onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        {showTaskModal && (
          <TaskModal
            projectId={projectId}
            task={editingTask}
            onClose={() => setShowTaskModal(false)}
            onSaved={reloadTasks} 
          />
        )}
      </div>
    </>
  );
}