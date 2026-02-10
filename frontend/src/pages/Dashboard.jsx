import { useEffect, useState } from "react";
import api from "../api/client";
import "./Dashboard.css";
import DashboardNavbar from "../components/DashboardNavbar";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tenantsCount, setTenantsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        //  Current user
        const meRes = await api.get("/auth/me");
        const currentUser = meRes.data.data;
        setUser(currentUser);

        /*SUPER ADMIN DASHBOARD*/
        if (currentUser.role === "super_admin") {
          const [projectsRes, tasksRes, tenantsRes] = await Promise.all([
            api.get("/projects/all"),
            api.get("/tasks/all"),
            api.get("/tenants")
          ]);

          // Projects
          const allProjects = Array.isArray(projectsRes.data.data)
            ? projectsRes.data.data
            : projectsRes.data.data.projects || [];

          //  Tasks
          const allTasks = Array.isArray(tasksRes.data.data)
            ? tasksRes.data.data
            : tasksRes.data.data.tasks || [];

          // Tenants 
          const tenantsData = tenantsRes.data.data || {};
          const count =
            typeof tenantsData.total === "number"
              ? tenantsData.total
              : Array.isArray(tenantsData.tenants)
              ? tenantsData.tenants.length
              : 0;

          setProjects(allProjects);
          setTasks(allTasks);
          setTenantsCount(count);
          return;
        }

        /*TENANT / USER DASHBOARD*/
        const userId = currentUser.id;

        const projRes = await api.get("/projects");
        const projectsArray = Array.isArray(projRes.data.data)
          ? projRes.data.data
          : projRes.data.data.projects || [];

        setProjects(projectsArray);

        let allTasks = [];
        for (const project of projectsArray) {
          const taskRes = await api.get(
            `/projects/${project.id}/tasks?assignedTo=${userId}`
          );

          const taskArray = Array.isArray(taskRes.data.data)
            ? taskRes.data.data
            : taskRes.data.data.tasks || [];

          allTasks = allTasks.concat(taskArray);
        }

        setTasks(allTasks);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        alert(err.response?.data?.message || "Operation failed");
        alert("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading || !user) return <p>Loading dashboard...</p>;

  /* Calculations*/
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const pendingTasks = tasks.filter(t => t.status !== "completed").length;

  return (
    <>
      <DashboardNavbar />
      <div className="dashboard">
        <h1>Dashboard</h1>

        {/*STATISTICS CARDS*/}
        <div className="cards">
          {user.role === "super_admin" ? (
            <>
              <div className="card">Tenants: {tenantsCount}</div>
              <div className="card">Projects: {projects.length}</div>
              <div className="card">Total Tasks: {tasks.length}</div>
              <div className="card">Completed: {completedTasks}</div>
            </>
          ) : (
            <>
              <div className="card">Projects: {projects.length}</div>
              <div className="card">My Tasks: {tasks.length}</div>
              <div className="card">Completed: {completedTasks}</div>
              <div className="card">Pending: {pendingTasks}</div>
            </>
          )}
        </div>

        {/*RECENT PROJECTS*/}
        <section className="section">
          <h2 style={{marginBottom:"10px"}}>Recent Projects</h2>
          {projects.length === 0 ? (
            <p>No projects found</p>
          ) : (
            projects.slice(0, 5).map(project => (
              <div key={project.id} className="list-item">
                <strong>{project.name}</strong> — {project.status}
              </div>
            ))
          )}
        </section>

        {/*MY TASKS (NON SUPER ADMIN)*/}
        {user.role !== "super_admin" && (
          <section className="section">
            <h2>My Tasks</h2>
            {tasks.length === 0 ? (
              <p>No tasks assigned</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="list-item">
                  {task.title} — {task.priority} — {task.status}
                </div>
              ))
            )}
          </section>
        )}
      </div>
    </>
  );
}
