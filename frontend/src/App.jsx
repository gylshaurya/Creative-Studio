import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Core Authentication Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Main Application Workspace Pages
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TeamPage from './pages/TeamPage'; // ✨ IMPORTED THE NEW TEAM SCREEN COMPONENT

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Authentication Gateways */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Private Authenticated App Spaces */}
                    <Route element={<ProtectedRoute />}>
                        {/* Your Kanban board dashboard lives safely in this node block */}
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/projects" element={<ProjectsPage />} />
                        <Route path="/projects/:studioId/:projectId" element={<ProjectDetailPage />} />
                        
                        {/* ✨ ADDED TEAM MANAGEMENT ROUTE PATH NODES */}
                        <Route path="/studios/:studioId/team" element={<TeamPage />} />
                    </Route>

                    {/* Automatic Gateway Fallback: If unauthenticated, drop onto Login page context */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;