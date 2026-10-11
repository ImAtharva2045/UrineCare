import { useNavigate } from "react-router-dom";
import {
    Users,
    TestTube,
    Package,
    ClipboardCheck,
    FileText,
    LogOut,
    Activity,
    ShieldCheck,
    Clock
} from "lucide-react";

import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(
        sessionStorage.getItem("urinecareUser") || "{}"
    );

    const role = user.role || "User";

    const modules = {
        Admin: [
            {
                title: "Patients",
                description: "Manage patient records",
                icon: Users,
                path: "/patients"
            },
            {
                title: "Urine Tests",
                description: "View recorded test reports",
                icon: FileText,
                path: "/tests"
            },
            {
                title: "Strip Inventory",
                description: "Manage urine strip batches",
                icon: Package,
                path: "/inventory"
            },
            {
                title: "Audit Logs",
                description: "Review system activity",
                icon: ClipboardCheck,
                path: "/audit"
            }
        ],

        Technician: [
            {
                title: "Patients",
                description: "Find and manage patient records",
                icon: Users,
                path: "/patients"
            },
            {
                title: "New Urine Test",
                description: "Record a urine strip test",
                icon: TestTube,
                path: "/tests/new"
            },
            {
                title: "Urine Test Reports",
                description: "View reports and submit them for review",
                icon: FileText,
                path: "/tests"
            },
            {
                title: "Strip Inventory",
                description: "Check available strip batches",
                icon: Package,
                path: "/inventory"
            }
        ],

        Doctor: [
            {
                title: "Pending Reviews",
                description: "Review submitted test reports",
                icon: ClipboardCheck,
                path: "/tests?status=Pending%20Review"
            },
            {
                title: "Report History",
                description: "View recorded urine test reports",
                icon: FileText,
                path: "/tests"
            }
        ]
    };

    const handleLogout = () => {
        sessionStorage.removeItem("urinecareToken");
        sessionStorage.removeItem("urinecareUser");
        navigate("/");
    };

    const handleModuleClick = (module) => {
        navigate(module.path);
    };

    const currentModules = modules[role] || [];

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div className="dashboard-brand">
                    <div className="dashboard-logo">
                        <Activity size={24} />
                    </div>

                    <div>
                        <h2>UrineCare</h2>
                        <p>Urine Test Management</p>
                    </div>
                </div>

                <div className="dashboard-user">
                    <div className="dashboard-user-info">
                        <strong>{user.fullName || "User"}</strong>
                        <span>{role}</span>
                    </div>

                    <button
                        type="button"
                        className="dashboard-logout"
                        onClick={handleLogout}
                    >
                        <LogOut size={17} />
                        Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <section className="dashboard-welcome">
                    <div>
                        <p className="dashboard-eyebrow">
                            {role.toUpperCase()} WORKSPACE
                        </p>

                        <h1>
                            Welcome back, {user.fullName || "User"}
                        </h1>

                        <p>
                            Manage patients and urine test records from one place.
                        </p>
                    </div>

                    <div className="dashboard-welcome-icon">
                        <ShieldCheck size={38} />
                    </div>
                </section>

                <section className="dashboard-stats">
                    <div className="dashboard-stat-card">
                        <div className="dashboard-stat-icon">
                            <Users size={21} />
                        </div>

                        <div>
                            <span>Workspace</span>
                            <h3>{role}</h3>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="dashboard-stat-icon">
                            <TestTube size={21} />
                        </div>

                        <div>
                            <span>Available Modules</span>
                            <h3>{currentModules.length}</h3>
                        </div>
                    </div>

                    <div className="dashboard-stat-card">
                        <div className="dashboard-stat-icon">
                            <Clock size={21} />
                        </div>

                        <div>
                            <span>System Status</span>
                            <h3>Ready</h3>
                        </div>
                    </div>
                </section>

                <section className="dashboard-modules-section">
                    <div className="dashboard-section-heading">
                        <div>
                            <h2>Your Modules</h2>
                            <p>Choose a module to continue.</p>
                        </div>
                    </div>

                    <div className="dashboard-modules">
                        {currentModules.map((module) => {
                            const Icon = module.icon;

                            return (
                                <button
                                    type="button"
                                    className="dashboard-module-card"
                                    key={module.title}
                                    onClick={() => handleModuleClick(module)}
                                >
                                    <div className="dashboard-module-icon">
                                        <Icon size={25} />
                                    </div>

                                    <h3>{module.title}</h3>
                                    <p>{module.description}</p>

                                    <span className="dashboard-module-link">
                                        Open module →
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <footer className="dashboard-footer">
                    UrineCare is an educational demonstration and is not intended
                    for clinical diagnosis.
                </footer>
            </main>
        </div>
    );
}

export default Dashboard;