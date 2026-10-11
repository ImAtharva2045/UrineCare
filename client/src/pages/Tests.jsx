import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
    Plus,
    Search,
    FileText,
    RefreshCw,
    ArrowLeft,
    AlertCircle
} from "lucide-react";

import api from "../api";
import "./Tests.css";

function Tests() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const requestedStatus = searchParams.get("status");
    const isPendingReview = requestedStatus === "Pending Review";

    const [tests, setTests] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const user = JSON.parse(
        sessionStorage.getItem("urinecareUser") || "{}"
    );

    const dashboardPath =
        user.role === "Admin"
            ? "/admin"
            : user.role === "Technician"
            ? "/technician"
            : "/doctor";

    const canCreateTest =
        user.role === "Admin" || user.role === "Technician";

    const fetchTests = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get("/tests");
            const data = response.data;

            const reports = Array.isArray(data)
                ? data
                : data.tests || data.reports || [];

            if (!Array.isArray(reports)) {
                throw new Error("The server returned an invalid report list.");
            }

            setTests(reports);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Unable to load urine test reports."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTests();
    }, [fetchTests]);

    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const statusClass = (status) =>
        (status || "Draft").toLowerCase().replaceAll(" ", "-");

    const filteredTests = tests.filter((test) => {
        const matchesStatus = isPendingReview
            ? test.status === "Pending Review"
            : true;

        const searchText = search.trim().toLowerCase();

        const matchesSearch =
            !searchText ||
            String(test.reportId || "")
                .toLowerCase()
                .includes(searchText) ||
            String(test.patient?.fullName || test.patient?.name || "")
                .toLowerCase()
                .includes(searchText) ||
            String(test.patient?.patientId || "")
                .toLowerCase()
                .includes(searchText) ||
            String(test.status || "")
                .toLowerCase()
                .includes(searchText);

        return matchesStatus && matchesSearch;
    });

    return (
        <div className="tests-page">
            <header className="tests-topbar">
                <button
                    type="button"
                    className="tests-back-button"
                    onClick={() => navigate(dashboardPath)}
                >
                    <ArrowLeft size={18} />
                    Dashboard
                </button>

                <div className="tests-brand">
                    <FileText size={22} />
                    <span>UrineCare</span>
                </div>
            </header>

            <main className="tests-main">
                <section className="tests-heading">
                    <div>
                        <p className="tests-eyebrow">
                            {isPendingReview
                                ? "DOCTOR WORKSPACE"
                                : "LABORATORY / RECORDS"}
                        </p>

                        <h1>
                            {isPendingReview
                                ? "Pending Reviews"
                                : "Urine Test Reports"}
                        </h1>

                        <p>
                            {isPendingReview
                                ? "Review reports submitted for doctor approval."
                                : "Search and view recorded urine test reports."}
                        </p>
                    </div>

                    <div className="tests-heading-actions">
                        <button
                            type="button"
                            className="tests-refresh-button"
                            onClick={() => fetchTests(true)}
                            disabled={loading || refreshing}
                        >
                            <RefreshCw
                                size={17}
                                className={refreshing ? "tests-spinning" : ""}
                            />
                            {refreshing ? "Refreshing..." : "Refresh Reports"}
                        </button>

                        {canCreateTest && (
                            <button
                                type="button"
                                className="tests-new-button"
                                onClick={() => navigate("/tests/new")}
                            >
                                <Plus size={18} />
                                New Urine Test
                            </button>
                        )}
                    </div>
                </section>

                <section className="tests-list-card">
                    <div className="tests-toolbar">
                        <div className="tests-search">
                            <Search size={19} />

                            <input
                                type="text"
                                placeholder="Search report ID, patient, or status..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </div>

                        {isPendingReview && (
                            <button
                                type="button"
                                className="tests-back-button"
                                onClick={() => navigate("/tests")}
                            >
                                View All Reports
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="tests-message">
                            <RefreshCw size={22} />
                            Loading urine test reports...
                        </div>
                    ) : error ? (
                        <div className="tests-error" role="alert">
                            <AlertCircle size={20} />
                            <span>{error}</span>

                            <button
                                type="button"
                                className="tests-refresh-button"
                                onClick={() => fetchTests(true)}
                                disabled={refreshing}
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredTests.length === 0 ? (
                        <div className="tests-empty">
                            <FileText size={35} />

                            <h3>
                                {isPendingReview
                                    ? "No pending reviews"
                                    : "No reports found"}
                            </h3>

                            <p>
                                {isPendingReview
                                    ? "There are currently no reports awaiting review, or no reports match your search."
                                    : "No urine test reports match your search."}
                            </p>

                            {search && (
                                <button
                                    type="button"
                                    className="tests-back-button"
                                    onClick={() => setSearch("")}
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="tests-table-container">
                            <table className="tests-table">
                                <thead>
                                    <tr>
                                        <th>Report ID</th>
                                        <th>Patient</th>
                                        <th>Patient ID</th>
                                        <th>Sample Collected</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredTests.map((test) => (
                                        <tr
                                            key={test._id}
                                            className="tests-clickable-row"
                                            onClick={() =>
                                                navigate(`/tests/${test._id}`)
                                            }
                                            tabIndex={0}
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === "Enter" ||
                                                    event.key === " "
                                                ) {
                                                    event.preventDefault();
                                                    navigate(`/tests/${test._id}`);
                                                }
                                            }}
                                        >
                                            <td>
                                                <div className="tests-report-id">
                                                    <FileText size={17} />
                                                    <strong>
                                                        {test.reportId || "—"}
                                                    </strong>
                                                </div>
                                            </td>

                                            <td>
                                                {test.patient?.fullName ||
                                                    test.patient?.name ||
                                                    "—"}
                                            </td>

                                            <td>
                                                {test.patient?.patientId || "—"}
                                            </td>

                                            <td>
                                                {formatDate(test.sampleCollectedAt)}
                                            </td>

                                            <td>
                                                <span
                                                    className={`tests-status ${statusClass(
                                                        test.status
                                                    )}`}
                                                >
                                                    {test.status || "Draft"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && !error && filteredTests.length > 0 && (
                        <div className="tests-results-count">
                            Showing {filteredTests.length} of{" "}
                            {isPendingReview
                                ? tests.filter(
                                      (test) =>
                                          test.status === "Pending Review"
                                  ).length
                                : tests.length}{" "}
                            reports
                        </div>
                    )}
                </section>

                <footer className="tests-footer">
                    Educational demonstration only. Recorded results are not
                    a medical diagnosis.
                </footer>
            </main>
        </div>
    );
}

export default Tests;