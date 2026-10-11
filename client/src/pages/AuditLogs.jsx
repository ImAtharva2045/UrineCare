import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Activity,
    ArrowLeft,
    RefreshCw,
    Search,
    ClipboardList,
    CheckCircle2,
    Clock,
    AlertCircle,
    UserRound,
    FileText
} from "lucide-react";

import api from "../api";
import "./AuditLogs.css";

const actionLabels = {
    TEST_CREATED: "Report Created",
    REPORT_SUBMITTED: "Submitted for Review",
    REPORT_APPROVED: "Report Approved",
    REVISION_REQUESTED: "Revision Requested"
};

const actionDescriptions = {
    TEST_CREATED: "A urine test report was created.",
    REPORT_SUBMITTED: "A report was submitted for doctor review.",
    REPORT_APPROVED: "A doctor approved a report.",
    REVISION_REQUESTED: "A report was sent back for revision."
};

const getActionLabel = (action) => {
    return actionLabels[action] || (action || "Unknown Action")
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getActionClass = (action) => {
    switch (action) {
        case "TEST_CREATED":
            return "created";
        case "REPORT_SUBMITTED":
            return "submitted";
        case "REPORT_APPROVED":
            return "approved";
        case "REVISION_REQUESTED":
            return "revision";
        default:
            return "default";
    }
};

const formatDate = (dateValue) => {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

function AuditLogs() {
    const navigate = useNavigate();

    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchLogs = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get("/audit");
            const receivedLogs = response.data?.logs;

            setLogs(Array.isArray(receivedLogs) ? receivedLogs : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load audit logs. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const filteredLogs = useMemo(() => {
        const searchTerm = search.trim().toLowerCase();

        return logs.filter((log) => {
            const user = log.user || {};
            const report = log.report || {};

            const searchableText = [
                getActionLabel(log.action),
                log.action,
                user.fullName,
                user.email,
                user.role,
                report.reportId,
                report.status,
                log.details
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !searchTerm || searchableText.includes(searchTerm);

            const matchesAction =
                actionFilter === "All" || log.action === actionFilter;

            return matchesSearch && matchesAction;
        });
    }, [logs, search, actionFilter]);

    const createdCount = logs.filter(
        (log) => log.action === "TEST_CREATED"
    ).length;

    const submittedCount = logs.filter(
        (log) => log.action === "REPORT_SUBMITTED"
    ).length;

    const approvedCount = logs.filter(
        (log) => log.action === "REPORT_APPROVED"
    ).length;

    const revisionCount = logs.filter(
        (log) => log.action === "REVISION_REQUESTED"
    ).length;

    const handleReportClick = (report) => {
        if (report?._id) {
            navigate(`/tests/${report._id}`);
        }
    };

    return (
        <div className="audit-page">
            <header className="audit-topbar">
                <button
                    type="button"
                    className="audit-back-button"
                    onClick={() => navigate("/admin")}
                >
                    <ArrowLeft size={18} />
                    Dashboard
                </button>

                <div className="audit-brand">
                    <Activity size={22} />
                    <span>UrineCare</span>
                </div>

                <div className="audit-admin-label">
                    <UserRound size={16} />
                    Administrator
                </div>
            </header>

            <main className="audit-main">
                <section className="audit-heading">
                    <div>
                        <p className="audit-eyebrow">SYSTEM MONITORING</p>
                        <h1>Audit Logs</h1>
                        <p className="audit-subtitle">
                            Track report activity and review actions across
                            the UrineCare system.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="audit-refresh-button"
                        onClick={() => fetchLogs(true)}
                        disabled={loading || refreshing}
                    >
                        <RefreshCw
                            size={17}
                            className={refreshing ? "audit-spinning" : ""}
                        />
                        {refreshing ? "Refreshing..." : "Refresh Logs"}
                    </button>
                </section>

                <section className="audit-stats">
                    <div className="audit-stat-card">
                        <div className="audit-stat-icon total">
                            <ClipboardList size={21} />
                        </div>
                        <div>
                            <p>Total Activities</p>
                            <h2>{logs.length}</h2>
                        </div>
                    </div>

                    <div className="audit-stat-card">
                        <div className="audit-stat-icon created">
                            <FileText size={21} />
                        </div>
                        <div>
                            <p>Reports Created</p>
                            <h2>{createdCount}</h2>
                        </div>
                    </div>

                    <div className="audit-stat-card">
                        <div className="audit-stat-icon submitted">
                            <Clock size={21} />
                        </div>
                        <div>
                            <p>Submitted for Review</p>
                            <h2>{submittedCount}</h2>
                        </div>
                    </div>

                    <div className="audit-stat-card">
                        <div className="audit-stat-icon approved">
                            <CheckCircle2 size={21} />
                        </div>
                        <div>
                            <p>Reports Approved</p>
                            <h2>{approvedCount}</h2>
                        </div>
                    </div>
                </section>

                <section className="audit-panel">
                    <div className="audit-panel-heading">
                        <div>
                            <h2>Activity History</h2>
                            <p>
                                {filteredLogs.length} of {logs.length} activities
                                displayed
                            </p>
                        </div>
                    </div>

                    <div className="audit-filters">
                        <div className="audit-search">
                            <Search size={18} />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search user, report ID or action..."
                                aria-label="Search audit logs"
                            />
                        </div>

                        <select
                            value={actionFilter}
                            onChange={(event) =>
                                setActionFilter(event.target.value)
                            }
                            aria-label="Filter by action"
                            className="audit-action-filter"
                        >
                            <option value="All">All Activities</option>
                            <option value="TEST_CREATED">Report Created</option>
                            <option value="REPORT_SUBMITTED">
                                Submitted for Review
                            </option>
                            <option value="REPORT_APPROVED">
                                Report Approved
                            </option>
                            <option value="REVISION_REQUESTED">
                                Revision Requested
                            </option>
                        </select>
                    </div>

                    {error && (
                        <div className="audit-error" role="alert">
                            <AlertCircle size={20} />
                            <div>
                                <strong>Could not load audit logs</strong>
                                <p>{error}</p>
                                <button
                                    type="button"
                                    onClick={() => fetchLogs()}
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="audit-state">
                            <RefreshCw size={25} className="audit-spinning" />
                            <p>Loading audit history...</p>
                        </div>
                    )}

                    {!loading && !error && logs.length === 0 && (
                        <div className="audit-state">
                            <ClipboardList size={38} />
                            <h3>No activities yet</h3>
                            <p>
                                Actions such as creating or reviewing reports
                                will appear here when recorded by the system.
                            </p>
                        </div>
                    )}

                    {!loading && !error && logs.length > 0 &&
                        filteredLogs.length === 0 && (
                            <div className="audit-state">
                                <Search size={34} />
                                <h3>No matching activities</h3>
                                <p>
                                    Try another search term or change the
                                    activity filter.
                                </p>
                            </div>
                        )}

                    {!loading && !error && filteredLogs.length > 0 && (
                        <div className="audit-table-wrapper">
                            <table className="audit-table">
                                <thead>
                                    <tr>
                                        <th>Activity</th>
                                        <th>User</th>
                                        <th>Report</th>
                                        <th>Date &amp; Time</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredLogs.map((log) => (
                                        <tr key={log._id}>
                                            <td>
                                                <div className="audit-activity-cell">
                                                    <span
                                                        className={`audit-action-badge ${getActionClass(log.action)}`}
                                                    >
                                                        {getActionLabel(log.action)}
                                                    </span>
                                                    <span className="audit-description">
                                                        {actionDescriptions[log.action] ||
                                                            log.details ||
                                                            "System activity recorded."}
                                                    </span>
                                                    {log.details &&
                                                        actionDescriptions[log.action] && (
                                                            <span className="audit-details">
                                                                {log.details}
                                                            </span>
                                                        )}
                                                </div>
                                            </td>

                                            <td>
                                                <div className="audit-user-cell">
                                                    <strong>
                                                        {log.user?.fullName ||
                                                            "Unknown User"}
                                                    </strong>
                                                    <span>
                                                        {log.user?.email || "—"}
                                                    </span>
                                                    <span className="audit-role">
                                                        {log.user?.role || "Role unavailable"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                {log.report ? (
                                                    <button
                                                        type="button"
                                                        className="audit-report-link"
                                                        onClick={() =>
                                                            handleReportClick(log.report)
                                                        }
                                                    >
                                                        {log.report.reportId ||
                                                            "View Report"}
                                                        <span>
                                                            {log.report.status || "Status unavailable"}
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <span className="audit-muted">
                                                        No report linked
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                <span className="audit-date">
                                                    {formatDate(log.createdAt)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="audit-extra-summary">
                            <span>
                                <AlertCircle size={16} />
                                Revision requests: <strong>{revisionCount}</strong>
                            </span>
                            <span>
                                Latest activities appear first.
                            </span>
                        </div>
                    )}
                </section>

                <footer className="audit-footer">
                    Audit history is read-only in this interface. Only
                    administrators can access this page.
                </footer>
            </main>
        </div>
    );
}

export default AuditLogs;