import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    PackagePlus,
    AlertCircle,
    CheckCircle
} from "lucide-react";

import api from "../api";
import "./AddBatch.css";

function AddBatch() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        brand: "",
        manufacturer: "",
        batchNumber: "",
        receivedDate: new Date().toISOString().slice(0, 10),
        expiryDate: "",
        quantityReceived: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (Number(form.quantityReceived) <= 0) {
            setError("Quantity received must be greater than zero.");
            return;
        }

        if (new Date(form.expiryDate) <= new Date(form.receivedDate)) {
            setError("Expiry date must be later than the received date.");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post("/batches", {
                brand: form.brand.trim(),
                manufacturer: form.manufacturer.trim(),
                batchNumber: form.batchNumber.trim(),
                receivedDate: form.receivedDate,
                expiryDate: form.expiryDate,
                quantityReceived: Number(form.quantityReceived),
                quantityRemaining: Number(form.quantityReceived)
            });

            setSuccess(
                response.data?.message || "Strip batch created successfully."
            );

            setTimeout(() => {
                navigate("/inventory");
            }, 900);
        } catch (err) {
            const validationErrors = err.response?.data?.errors;

            setError(
                Array.isArray(validationErrors)
                    ? validationErrors.join(", ")
                    : err.response?.data?.message ||
                      err.response?.data?.error ||
                      "Unable to create the strip batch."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-batch-page">
            <header className="add-batch-topbar">
                <button
                    type="button"
                    className="add-batch-back"
                    onClick={() => navigate("/inventory")}
                >
                    <ArrowLeft size={18} />
                    Strip Inventory
                </button>

                <div className="add-batch-brand">
                    <PackagePlus size={22} />
                    <span>UrineCare</span>
                </div>
            </header>

            <main className="add-batch-main">
                <section className="add-batch-heading">
                    <p className="add-batch-eyebrow">
                        INVENTORY MANAGEMENT
                    </p>

                    <h1>Add Strip Batch</h1>

                    <p>
                        Register a new batch of urine test strips in inventory.
                    </p>
                </section>

                <form className="add-batch-card" onSubmit={handleSubmit}>
                    {error && (
                        <div className="add-batch-alert error" role="alert">
                            <AlertCircle size={19} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="add-batch-alert success" role="status">
                            <CheckCircle size={19} />
                            <span>{success}</span>
                        </div>
                    )}

                    <div className="add-batch-form-grid">
                        <div className="add-batch-field">
                            <label htmlFor="brand">Brand</label>
                            <input
                                id="brand"
                                name="brand"
                                value={form.brand}
                                onChange={handleChange}
                                placeholder="Enter strip brand"
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="add-batch-field">
                            <label htmlFor="manufacturer">Manufacturer</label>
                            <input
                                id="manufacturer"
                                name="manufacturer"
                                value={form.manufacturer}
                                onChange={handleChange}
                                placeholder="Enter manufacturer"
                                maxLength={150}
                                required
                            />
                        </div>

                        <div className="add-batch-field">
                            <label htmlFor="batchNumber">Batch Number</label>
                            <input
                                id="batchNumber"
                                name="batchNumber"
                                value={form.batchNumber}
                                onChange={handleChange}
                                placeholder="Enter batch number"
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="add-batch-field">
                            <label htmlFor="quantityReceived">
                                Quantity Received
                            </label>
                            <input
                                id="quantityReceived"
                                name="quantityReceived"
                                type="number"
                                min="1"
                                step="1"
                                value={form.quantityReceived}
                                onChange={handleChange}
                                placeholder="Enter number of strips"
                                required
                            />
                        </div>

                        <div className="add-batch-field">
                            <label htmlFor="receivedDate">Received Date</label>
                            <input
                                id="receivedDate"
                                name="receivedDate"
                                type="date"
                                value={form.receivedDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="add-batch-field">
                            <label htmlFor="expiryDate">Expiry Date</label>
                            <input
                                id="expiryDate"
                                name="expiryDate"
                                type="date"
                                min={form.receivedDate}
                                value={form.expiryDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="add-batch-note">
                        <PackagePlus size={19} />
                        <p>
                            The remaining quantity will initially equal the
                            quantity received. Creating a batch does not
                            automatically make expired strips available for tests.
                        </p>
                    </div>

                    <div className="add-batch-actions">
                        <button
                            type="button"
                            className="add-batch-cancel"
                            onClick={() => navigate("/inventory")}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="add-batch-submit"
                            disabled={loading}
                        >
                            <PackagePlus size={18} />
                            {loading ? "Saving Batch..." : "Save Batch"}
                        </button>
                    </div>
                </form>

                <footer className="add-batch-footer">
                    UrineCare is an educational demonstration and is not
                    intended for clinical diagnosis.
                </footer>
            </main>
        </div>
    );
}

export default AddBatch;