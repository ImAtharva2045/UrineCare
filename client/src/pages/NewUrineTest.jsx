import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ClipboardList,
    Save,
    LoaderCircle,
    AlertCircle
} from "lucide-react";

import api from "../api";
import "./NewUrineTest.css";

const initialResults = {
    glucose: "Negative",
    protein: "Negative",
    ketones: "Negative",
    blood: "Negative",
    bilirubin: "Negative",
    leucocytes: "Negative",
    urobilinogen: "Normal",
    nitrite: "Negative",
    ph: "7",
    specificGravity: "1.020"
};

const resultOptions = [
    "Negative",
    "Trace",
    "+",
    "++",
    "+++",
    "++++"
];

function NewUrineTest() {
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [batches, setBatches] = useState([]);

    const [patient, setPatient] = useState("");
    const [stripBatch, setStripBatch] = useState("");
    const [sampleCollectedAt, setSampleCollectedAt] = useState("");
    const [results, setResults] = useState(initialResults);

    const [loadingOptions, setLoadingOptions] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchOptions = async () => {
            setLoadingOptions(true);
            setError("");

            try {
                const [patientResponse, batchResponse] = await Promise.all([
                    api.get("/patients"),
                    api.get("/batches")
                ]);

                const patientData = patientResponse.data;
                const batchData = batchResponse.data;

                setPatients(
                    Array.isArray(patientData)
                        ? patientData
                        : patientData.patients || []
                );

                const allBatches = Array.isArray(batchData)
                    ? batchData
                    : batchData.batches || [];

                const availableBatches = allBatches.filter((batch) => {
                    const notExpired =
                        new Date(batch.expiryDate) >= new Date();

                    return (
                        batch.quantityRemaining > 0 &&
                        notExpired &&
                        batch.status !== "Expired"
                    );
                });

                setBatches(availableBatches);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load patients or strip batches. Please try again."
                );
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchOptions();
    }, []);

    const handleResultChange = (e) => {
        const { name, value } = e.target;

        setResults((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!patient || !stripBatch || !sampleCollectedAt) {
            setError(
                "Please select a patient, strip batch, and collection date."
            );
            return;
        }

        const collectionDate = new Date(sampleCollectedAt);

        if (Number.isNaN(collectionDate.getTime())) {
            setError("Please enter a valid collection date and time.");
            return;
        }

        if (collectionDate > new Date()) {
            setError("The collection date and time cannot be in the future.");
            return;
        }

        const ph = Number(results.ph);
        const specificGravity = Number(results.specificGravity);

        if (!Number.isFinite(ph) || ph < 0 || ph > 14) {
            setError("pH must be between 0 and 14.");
            return;
        }

        if (
            !Number.isFinite(specificGravity) ||
            specificGravity < 1 ||
            specificGravity > 1.1
        ) {
            setError("Specific gravity must be between 1.000 and 1.100.");
            return;
        }

        setSaving(true);

        try {
            const response = await api.post("/tests", {
                patient,
                stripBatch,
                sampleCollectedAt: collectionDate.toISOString(),
                results: {
                    ...results,
                    ph,
                    specificGravity
                }
            });

            setSuccess(
              `Report ${
                  response.data.test?.reportId || response.data.reportId || ""
              } created successfully.`
          );

            setTimeout(() => {
                navigate("/tests");
            }, 900);
          } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Unable to save the urine test. Please check your entries."
            );
        } finally {
            setSaving(false);
        }
    };

    const renderResultSelect = (name, label, options = resultOptions) => (
        <div className="urine-field" key={name}>
            <label htmlFor={name}>{label}</label>
            <select
                id={name}
                name={name}
                value={results[name]}
                onChange={handleResultChange}
                required
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="new-test-page">
            <header className="new-test-header">
                <button
                    type="button"
                    className="new-test-back"
                    onClick={() => navigate("/tests")}
                >
                    <ArrowLeft size={18} />
                    Urine Test Reports
                </button>

                <div className="new-test-brand">
                    <ClipboardList size={22} />
                    <span>UrineCare</span>
                </div>
            </header>

            <main className="new-test-content">
                <div className="new-test-heading">
                    <p className="new-test-eyebrow">LABORATORY WORKFLOW</p>
                    <h1>Record Urine Test</h1>
                    <p>
                        Enter the sample details and manually record the strip results.
                    </p>
                </div>

                <form className="new-test-card" onSubmit={handleSubmit}>
                    <section className="test-form-section">
                        <div className="test-section-title">
                            <h2>Sample information</h2>
                            <p>Select the patient and the strip batch used.</p>
                        </div>

                        {loadingOptions ? (
                            <div className="test-loading">
                                <LoaderCircle size={20} />
                                Loading patients and batches...
                            </div>
                        ) : (
                            <div className="urine-form-grid">
                                <div className="urine-field">
                                    <label htmlFor="patient">Patient *</label>
                                    <select
                                        id="patient"
                                        value={patient}
                                        onChange={(e) => setPatient(e.target.value)}
                                        required
                                    >
                                        <option value="">Select patient</option>
                                        {patients.map((item) => (
                                            <option
                                                key={item._id}
                                                value={item._id}
                                            >
                                                {item.fullName} ({item.patientId})
                                            </option>
                                        ))}
                                    </select>
                                    {patients.length === 0 && (
                                        <small>
                                            Register a patient before recording a test.
                                        </small>
                                    )}
                                </div>

                                <div className="urine-field">
                                    <label htmlFor="stripBatch">Strip batch *</label>
                                    <select
                                        id="stripBatch"
                                        value={stripBatch}
                                        onChange={(e) => setStripBatch(e.target.value)}
                                        required
                                    >
                                        <option value="">Select available batch</option>
                                        {batches.map((batch) => (
                                            <option
                                                key={batch._id}
                                                value={batch._id}
                                            >
                                                {batch.brand} — {batch.batchNumber}
                                                {" "}({batch.quantityRemaining} remaining)
                                            </option>
                                        ))}
                                    </select>
                                    {batches.length === 0 && (
                                        <small>
                                            No unexpired batches with remaining stock were found.
                                        </small>
                                    )}
                                </div>

                                <div className="urine-field full-width">
                                    <label htmlFor="sampleCollectedAt">
                                        Sample collection date and time *
                                    </label>
                                    <input
                                        id="sampleCollectedAt"
                                        type="datetime-local"
                                        value={sampleCollectedAt}
                                        max={new Date().toISOString().slice(0, 16)}
                                        onChange={(e) =>
                                            setSampleCollectedAt(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="test-form-section">
                        <div className="test-section-title">
                            <h2>Strip results</h2>
                            <p>
                                Enter the observed readings from the strip.
                                These entries are not an automated interpretation.
                            </p>
                        </div>

                        <div className="urine-form-grid">
                            {renderResultSelect("glucose", "Glucose")}
                            {renderResultSelect("protein", "Protein")}
                            {renderResultSelect("ketones", "Ketones")}
                            {renderResultSelect("blood", "Blood")}
                            {renderResultSelect("bilirubin", "Bilirubin")}
                            {renderResultSelect("leucocytes", "Leucocytes")}

                            {renderResultSelect(
                                "urobilinogen",
                                "Urobilinogen",
                                ["Normal", "Trace", "+", "++", "+++", "++++"]
                            )}

                            {renderResultSelect(
                                "nitrite",
                                "Nitrite",
                                ["Negative", "Positive"]
                            )}

                            <div className="urine-field">
                                <label htmlFor="ph">pH *</label>
                                <input
                                    id="ph"
                                    name="ph"
                                    type="number"
                                    min="0"
                                    max="14"
                                    step="0.1"
                                    value={results.ph}
                                    onChange={handleResultChange}
                                    required
                                />
                            </div>

                            <div className="urine-field">
                                <label htmlFor="specificGravity">
                                    Specific gravity *
                                </label>
                                <input
                                    id="specificGravity"
                                    name="specificGravity"
                                    type="number"
                                    min="1"
                                    max="1.1"
                                    step="0.001"
                                    value={results.specificGravity}
                                    onChange={handleResultChange}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    <div className="test-demo-notice">
                        <AlertCircle size={19} />
                        <p>
                            Educational demo only. Recorded values require
                            appropriate professional review and must not be
                            treated as a diagnosis.
                        </p>
                    </div>

                    {error && (
                        <div className="test-form-error" role="alert">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="test-form-success" role="status">
                            {success}
                        </div>
                    )}

                    <div className="test-form-actions">
                        <button
                            type="button"
                            className="test-cancel-button"
                            onClick={() => navigate(-1)}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="test-save-button"
                            disabled={
                                saving ||
                                loadingOptions ||
                                patients.length === 0 ||
                                batches.length === 0
                            }
                        >
                            {saving ? (
                                <>
                                    <LoaderCircle size={17} />
                                    Saving report...
                                </>
                            ) : (
                                <>
                                    <Save size={17} />
                                    Save Draft
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default NewUrineTest;