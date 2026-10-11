import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Package,
    RefreshCw,
    Search,
    AlertCircle,
    Plus,
    CalendarDays,
    Boxes
} from "lucide-react";

import api from "../api";
import "./Inventory.css";

function Inventory() {
    const navigate = useNavigate();

    const user = JSON.parse(
        sessionStorage.getItem("urinecareUser") || "{}"
    );

    const isAdmin = user.role === "Admin";

    const dashboardPath =
        user.role === "Admin"
            ? "/admin"
            : user.role === "Technician"
            ? "/technician"
            : "/doctor";

    const [batches, setBatches] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchBatches = useCallback(async (manualRefresh = false) => {
        try {
            if (manualRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await api.get("/batches");
            const data = response.data;

            const records = Array.isArray(data)
                ? data
                : data.batches || [];

            if (!Array.isArray(records)) {
                throw new Error("Invalid inventory data received.");
            }

            setBatches(records);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Unable to load strip inventory."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchBatches();
    }, [fetchBatches]);

    const formatDate = (date) => {
        if (!date) return "—";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) return "—";

        return parsed.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const getStockStatus = (batch) => {
        if (batch.expiryDate && new Date(batch.expiryDate) < new Date()) {
            return "Expired";
        }

        if (Number(batch.quantityRemaining) <= 0) {
            return "Out of Stock";
        }

        if (
            batch.status === "Low Stock" ||
            Number(batch.quantityRemaining) <= 10
        ) {
            return "Low Stock";
        }

        return "Active";
    };

    const statusClass = (status) =>
        status.toLowerCase().replaceAll(" ", "-");

    const filteredBatches = batches.filter((batch) => {
        const query = search.trim().toLowerCase();

        if (!query) return true;

        return [
            batch.brand,
            batch.manufacturer,
            batch.batchNumber,
            batch.status
        ].some((value) =>
            String(value || "").toLowerCase().includes(query)
        );
    });

    const activeCount = batches.filter(
        (batch) => getStockStatus(batch) === "Active"
    ).length;

    const lowStockCount = batches.filter(
        (batch) => getStockStatus(batch) === "Low Stock"
    ).length;

    const expiredCount = batches.filter(
        (batch) => getStockStatus(batch) === "Expired"
    ).length;

    const totalRemaining = batches.reduce(
        (total, batch) =>
            total + Math.max(0, Number(batch.quantityRemaining) || 0),
        0
    );

    return (
        <div className="inventory-page">
            <header className="inventory-topbar">
                <button
                    type="button"
                    className="inventory-back-button"
                    onClick={() => navigate(dashboardPath)}
                >
                    <ArrowLeft size={18} />
                    Dashboard
                </button>

                <div className="inventory-brand">
                    <Package size={22} />
                    <span>UrineCare</span>
                </div>
            </header>

            <main className="inventory-main">
                <section className="inventory-heading">
                    <div>
                        <p className="inventory-eyebrow">
                            INVENTORY MANAGEMENT
                        </p>

                        <h1>Strip Inventory</h1>

                        <p>
                            View strip batches, remaining stock, and expiry dates.
                        </p>
                    </div>

                    <div className="inventory-actions">
                        <button
                            type="button"
                            className="inventory-refresh-button"
                            onClick={() => fetchBatches(true)}
                            disabled={loading || refreshing}
                        >
                            <RefreshCw
                                size={17}
                                className={refreshing ? "inventory-spinning" : ""}
                            />
                            {refreshing ? "Refreshing..." : "Refresh Inventory"}
                        </button>

                        {isAdmin && (
                            <button
                                type="button"
                                className="inventory-add-button"
                                onClick={() => navigate("/inventory/new")}
                            >
                                <Plus size={18} />
                                Add Batch
                            </button>
                        )}
                    </div>
                </section>

                <section className="inventory-stats">
                    <div className="inventory-stat-card">
                        <div className="inventory-stat-icon">
                            <Boxes size={22} />
                        </div>
                        <div>
                            <span>Total Remaining</span>
                            <h2>{totalRemaining}</h2>
                            <p>Strips available across batches</p>
                        </div>
                    </div>

                    <div className="inventory-stat-card">
                        <div className="inventory-stat-icon">
                            <Package size={22} />
                        </div>
                        <div>
                            <span>Active Batches</span>
                            <h2>{activeCount}</h2>
                            <p>Available for use</p>
                        </div>
                    </div>

                    <div className="inventory-stat-card">
                        <div className="inventory-stat-icon">
                            <AlertCircle size={22} />
                        </div>
                        <div>
                            <span>Low Stock</span>
                            <h2>{lowStockCount}</h2>
                            <p>Batches needing attention</p>
                        </div>
                    </div>

                    <div className="inventory-stat-card">
                        <div className="inventory-stat-icon">
                            <CalendarDays size={22} />
                        </div>
                        <div>
                            <span>Expired Batches</span>
                            <h2>{expiredCount}</h2>
                            <p>Not suitable for new tests</p>
                        </div>
                    </div>
                </section>

                <section className="inventory-list-card">
                    <div className="inventory-toolbar">
                        <div>
                            <h2>Inventory Batches</h2>
                            <p>Search by brand, manufacturer, batch number, or status.</p>
                        </div>

                        <div className="inventory-search">
                            <Search size={19} />
                            <input
                                type="search"
                                placeholder="Search inventory..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="inventory-message">
                            <RefreshCw size={22} />
                            Loading inventory...
                        </div>
                    ) : error ? (
                        <div className="inventory-error" role="alert">
                            <AlertCircle size={20} />
                            <span>{error}</span>

                            <button
                                type="button"
                                className="inventory-refresh-button"
                                onClick={() => fetchBatches(true)}
                                disabled={refreshing}
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredBatches.length === 0 ? (
                        <div className="inventory-empty">
                            <Package size={38} />
                            <h3>
                                {search
                                    ? "No matching batches"
                                    : "No inventory batches found"}
                            </h3>
                            <p>
                                {search
                                    ? "Try a different search term."
                                    : "Inventory batches will appear here when they are added."}
                            </p>
                        </div>
                    ) : (
                        <div className="inventory-table-container">
                            <table className="inventory-table">
                                <thead>
                                    <tr>
                                        <th>Brand</th>
                                        <th>Manufacturer</th>
                                        <th>Batch Number</th>
                                        <th>Received</th>
                                        <th>Expiry Date</th>
                                        <th>Quantity Received</th>
                                        <th>Remaining</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredBatches.map((batch) => {
                                        const status = getStockStatus(batch);

                                        return (
                                            <tr key={batch._id}>
                                                <td>
                                                    <strong>
                                                        {batch.brand || "—"}
                                                    </strong>
                                                </td>
                                                <td>
                                                    {batch.manufacturer || "—"}
                                                </td>
                                                <td>
                                                    {batch.batchNumber || "—"}
                                                </td>
                                                <td>
                                                    {formatDate(batch.receivedDate)}
                                                </td>
                                                <td>
                                                    {formatDate(batch.expiryDate)}
                                                </td>
                                                <td>
                                                    {batch.quantityReceived ?? "—"}
                                                </td>
                                                <td>
                                                    <strong>
                                                        {batch.quantityRemaining ?? "—"}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`inventory-status ${statusClass(status)}`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && !error && filteredBatches.length > 0 && (
                        <div className="inventory-results-count">
                            Showing {filteredBatches.length} of {batches.length} batches
                        </div>
                    )}
                </section>

                <footer className="inventory-footer">
                    UrineCare is an educational demonstration and is not intended
                    for clinical diagnosis.
                </footer>
            </main>
        </div>
    );
}

export default Inventory;