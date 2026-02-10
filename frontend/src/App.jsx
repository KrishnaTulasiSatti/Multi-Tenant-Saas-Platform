import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import RoleProtectedRoute from "./auth/RoleProtectedRoute";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Users from "./pages/Users";
import Tasks from "./pages/Tasks";
import Tenants from "./pages/Tenants";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";


export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/projects" element={<Projects />} />

        <Route
            path="/users"
            element={
                <RoleProtectedRoute allowedRoles={["tenant_admin"]}>
                <Users />
                </RoleProtectedRoute>
            }
        />

        <Route
            path="/tasks"
            element={
                <RoleProtectedRoute allowedRoles={["super_admin"]}>
                <Tasks />
                </RoleProtectedRoute>
            }
        />
        <Route
            path="/tenants"
            element={
                <RoleProtectedRoute allowedRoles={["super_admin"]}>
                <Tenants />
                </RoleProtectedRoute>
            }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
            path="/projects/:projectId"
            element={
                <ProtectedRoute>
                    <ProjectDetails />
                </ProtectedRoute>
            }
        />

        <Route path="/profile" element={<Profile />} />
        <Route
            path="/settings"
            element={
                <RoleProtectedRoute allowedRoles={["super_admin","tenant_admin","user"]}>
                <Settings />
                </RoleProtectedRoute>
            }
        />
      </Routes>

    </>
  );
}


