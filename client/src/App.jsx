import { useState } from "react";
import {
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate
} from "react-router-dom";

import axios from "axios";
import { Activity, LockKeyhole, Mail } from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import AddPatient from "./pages/AddPatient";
import NewUrineTest from "./pages/NewUrineTest";
import Tests from "./pages/Tests";
import TestDetails from "./pages/TestDetails";
import Inventory from "./pages/Inventory";
import AddBatch from "./pages/AddBatch";
import AuditLogs from "./pages/AuditLogs";

import "./App.css";

const getSavedUser = () => {
    try {
        const savedUser = sessionStorage.getItem("urinecareUser");
        return savedUser ? JSON.parse(savedUser) : null;
    } catch {
        sessionStorage.removeItem("urinecareUser");
        sessionStorage.removeItem("urinecareToken");
        return null;
    }
};

const getDashboardPath = (role) => {
    if (role === "Admin") return "/admin";
    if (role === "Technician") return "/technician";
    if (role === "Doctor") return "/doctor";
    return "/";
};

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const response = await axios.post(
                "http://localhost:5001/api/auth/login",
                { email, password }
            );

            const { token, user } = response.data;

            if (!token || !user || !getDashboardPath(user.role).startsWith("/")) {
                throw new Error("The server returned invalid login details.");
            }

            if (!["Admin", "Technician", "Doctor"].includes(user.role)) {
                throw new Error("Your account does not have a valid role.");
            }

            sessionStorage.setItem("urinecareToken", token);
            sessionStorage.setItem("urinecareUser", JSON.stringify(user));

            navigate(getDashboardPath(user.role), { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Login failed. Please check your email and password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <Activity size={30} />
                </div>

                <h1>UrineCare</h1>

                <p className="login-subtitle">
                    Urine Test Strip Management System
                </p>

                <form onSubmit={handleLogin}>
                    <label htmlFor="login-email">Email Address</label>

                    <div className="login-input">
                        <Mail size={18} />
                        <input
                            id="login-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <label htmlFor="login-password">Password</label>

                    <div className="login-input">
                        <LockKeyhole size={18} />
                        <input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <p className="login-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="login-footer">
                    Educational demonstration only. Not for clinical diagnosis.
                </p>
            </div>
        </div>
    );
}

function RequireAuth({ allowedRoles, children }) {
    const token = sessionStorage.getItem("urinecareToken");
    const user = getSavedUser();

    if (!token || !user || !user.role) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <Navigate
                to={getDashboardPath(user.role)}
                replace
            />
        );
    }

    return children;
}

function LoginRoute() {
    const token = sessionStorage.getItem("urinecareToken");
    const user = getSavedUser();

    if (token && user?.role) {
        return (
            <Navigate
                to={getDashboardPath(user.role)}
                replace
            />
        );
    }

    return <Login />;
}

function App() {
    // Re-render when React Router's current location changes.
    useLocation();

    return (
        <Routes>
            <Route path="/" element={<LoginRoute />} />

            <Route
                path="/admin"
                element={
                    <RequireAuth allowedRoles={["Admin"]}>
                        <Dashboard />
                    </RequireAuth>
                }
            />

            <Route
                path="/technician"
                element={
                    <RequireAuth allowedRoles={["Technician"]}>
                        <Dashboard />
                    </RequireAuth>
                }
            />

            <Route
                path="/doctor"
                element={
                    <RequireAuth allowedRoles={["Doctor"]}>
                        <Dashboard />
                    </RequireAuth>
                }
            />

            <Route
                path="/patients"
                element={
                    <RequireAuth allowedRoles={["Admin", "Technician", "Doctor"]}>
                        <Patients />
                    </RequireAuth>
                }
            />

            <Route
                path="/patients/new"
                element={
                    <RequireAuth allowedRoles={["Admin", "Technician"]}>
                        <AddPatient />
                    </RequireAuth>
                }
            />

            <Route
                path="/tests"
                element={
                    <RequireAuth allowedRoles={["Admin", "Technician", "Doctor"]}>
                        <Tests />
                    </RequireAuth>
                }
            />

            <Route
                path="/tests/new"
                element={
                    <RequireAuth allowedRoles={["Admin", "Technician"]}>
                        <NewUrineTest />
                    </RequireAuth>
                }
            />

            <Route
                path="/tests/:id"
                element={
                    <RequireAuth allowedRoles={["Admin", "Technician", "Doctor"]}>
                        <TestDetails />
                    </RequireAuth>
                }
            />
            <Route
    path="/inventory"
    element={
        <RequireAuth allowedRoles={["Admin", "Technician", "Doctor"]}>
            <Inventory />
        </RequireAuth>
    }
/>
<Route
    path="/inventory/new"
    element={
        <RequireAuth allowedRoles={["Admin"]}>
            <AddBatch />
        </RequireAuth>
    }
/>
<Route
    path="/audit"
    element={
        <RequireAuth allowedRoles={["Admin"]}>
            <AuditLogs />
        </RequireAuth>
    }
/>
            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
}

export default App;