import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import DashboardNavbar from "../components/DashboardNavbar";
import ProjectModal from "../components/ProjectModal";
import "./Projects.css";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const me = await api.get("/auth/me");
      const currentUser = me.data.data;
      setUser(currentUser);

      const endpoint =
        currentUser.role === "super_admin"
          ? "/projects/all"
          : "/projects";

      const res = await api.get(endpoint);
      const list = res.data.data.projects || res.data.data || [];

      setProjects(list);
      setFiltered(list);
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let data = [...projects];

    if (status) data = data.filter(p => p.status === status);
    if (search)
      data = data.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );

    setFiltered(data);
  }, [status, search, projects]);

  const canEdit = (project) =>
    user.role === "tenant_admin" ||
    (user.role === "user" && project.createdby?.id === user.id);

  const canDelete = canEdit;

  const canView = (project) =>
    user.role === "tenant_admin" ||
    project.createdby?.id === user.id;

  async function deleteProject(id) {
    if (!window.confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`);
    loadProjects();
  }

  if (loading) return <p>Loading projects...</p>;

  return (
    <>
      <DashboardNavbar />
      <div className="projects-page">
        <div className="projects-header">
          <h1>Projects</h1>

          {(user.role === "tenant_admin" || user.role === "user") && (
            <button
              className="primary-btn"
              onClick={() => {
                setEditing(null);
                setShowModal(true);
              }}
            >
              + Create New Project
            </button>
          )}
        </div>

        <div className="filters">
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="completed">Completed</option>
          </select>

          <input
            placeholder="Search by name"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="empty">No projects found</p>
        ) : (
          <div className="projects-grid">
            {filtered.map(project => (
              <div key={project.id} className="project-card">
                <div className="card-header">
                  <h3>{project.name}</h3>
                  <span className={`badge ${project.status}`}>
                    {project.status}
                  </span>
                </div>

                <p className="desc">
                  {project.description || "No description"}
                </p>

                <div className="meta">
                  <span>Tasks: {project.taskcount || project.taskCount || 0}</span>
                  <span>
                    Created:{" "}
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                  <span>
                    By: {project.createdby?.fullName || project.createdBy?.fullName}
                  </span>
                </div>

                <div className="actions">
                  {canView(project) && (
                    <button
                      onClick={() =>
                        navigate(`/projects/${project.id}`)
                      }
                    >
                      View
                    </button>
                  )}

                  {canEdit(project) && (
                    <button
                      onClick={() => {
                        setEditing(project);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>
                  )}

                  {canDelete(project) && (
                    <button
                      className="danger"
                      onClick={() => deleteProject(project.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <ProjectModal
            project={editing}
            onClose={() => setShowModal(false)}
            onSaved={loadProjects}
          />
        )}
      </div>
    </>
  );
}
