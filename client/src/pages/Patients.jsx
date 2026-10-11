import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    Search,
    Plus,
    RefreshCw,
    Pencil,
    Trash2,
    X,
    Save,
    LoaderCircle
} from "lucide-react";

import api from "../api";
import "./Patients.css";

function Patients() {
    const navigate = useNavigate();
    const location = useLocation();

    const user = JSON.parse(
        sessionStorage.getItem("urinecareUser") || "null"
    );

    const role = user?.role;
    const canManage = ["Admin", "Technician"].includes(role);
    const isAdmin = role === "Admin";

    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(location.state?.message || "");
    const [editingPatient, setEditingPatient] = useState(null);
    const [saving, setSaving] = useState(false);

    const [editForm, setEditForm] = useState({
        patientId: "",
        fullName: "",
        dateOfBirth: "",
        gender: "",
        contactNumber: ""
    });

    const fetchPatients = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await api.get("/patients");
            const data = response.data;

            setPatients(Array.isArray(data) ? data : data.patients || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load patients. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const filteredPatients = patients.filter((patient) => {
        const query = search.trim().toLowerCase();

        return (
            patient.fullName?.toLowerCase().includes(query) ||
            patient.patientId?.toLowerCase().includes(query) ||
            patient.contactNumber?.toLowerCase().includes(query)
        );
    });

    const startEditing = (patient) => {
        setError("");
        setSuccess("");
        setEditingPatient(patient);

        setEditForm({
            patientId: patient.patientId || "",
            fullName: patient.fullName || "",
            dateOfBirth: patient.dateOfBirth
                ? new Date(patient.dateOfBirth).toISOString().split("T")[0]
                : "",
            gender: patient.gender || "",
            contactNumber: patient.contactNumber || ""
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!editingPatient) return;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await api.put(
                `/patients/${editingPatient._id}`,
                editForm
            );

            setEditingPatient(null);
            setSuccess("Patient details updated successfully.");
            await fetchPatients();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update the patient. Please check the details."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (patient) => {
        const confirmed = window.confirm(
            `Delete the patient record for ${patient.fullName}? This action cannot be undone.`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await api.delete(`/patients/${patient._id}`);
            setPatients((previous) =>
                previous.filter((item) => item._id !== patient._id)
            );
            setSuccess("Patient deleted successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete the patient."
            );
        }
    };

    return (
        <div className="patients-page">
            <header className="patients-header">
                <button
                    className="back-button"
                    onClick={() => navigate(
                      user.role === "Admin"
                          ? "/admin"
                          : user.role === "Technician"
                          ? "/technician"
                          : "/doctor"
                  )}
                >
                    <ArrowLeft size={18} />
                    Dashboard
                </button>

                <div className="patients-brand">
                    <Users size={22} />
                    <span>UrineCare</span>
                </div>
            </header>

            <main className="patients-content">
                <div className="patients-title-row">
                    <div>
                        <p className="patients-eyebrow">
                            LABORATORY MANAGEMENT
                        </p>
                        <h1>Patients</h1>
                        <p className="patients-subtitle">
                            View and manage registered patient records.
                        </p>
                    </div>

                    {canManage && (
                        <button
                            className="add-patient-button"
                            onClick={() => navigate("/patients/new")}
                        >
                            <Plus size={18} />
                            Add Patient
                        </button>
                    )}
                </div>

                {success && (
                    <div className="patients-success" role="status">
                        <span>{success}</span>
                        <button
                            onClick={() => setSuccess("")}
                            aria-label="Dismiss message"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                {error && (
                    <div className="patients-error-banner" role="alert">
                        <span>{error}</span>
                        <button
                            onClick={() => setError("")}
                            aria-label="Dismiss error"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                <section className="patients-panel">
                    <div className="patients-panel-top">
                        <div>
                            <h2>All Patients</h2>
                            <p>
                                {patients.length} registered patient
                                {patients.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <button
                            className="refresh-button"
                            onClick={fetchPatients}
                            disabled={loading}
                            title="Refresh patients"
                        >
                            <RefreshCw size={17} />
                        </button>
                    </div>

                    <div className="patients-search">
                        <Search size={18} />
                        <input
                            type="search"
                            placeholder="Search by name, patient ID or contact..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="patients-message">
                            Loading patient records...
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="patients-empty">
                            <div className="patients-empty-icon">
                                <Users size={27} />
                            </div>
                            <h3>
                                {search
                                    ? "No matching patients"
                                    : "No patients yet"}
                            </h3>
                            <p>
                                {search
                                    ? "Try another name, ID or contact number."
                                    : "Registered patients will appear here."}
                            </p>
                        </div>
                    ) : (
                        <div className="patients-table-wrapper">
                            <table className="patients-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Patient ID</th>
                                        <th>Date of Birth</th>
                                        <th>Gender</th>
                                        <th>Contact</th>
                                        {canManage && <th>Actions</th>}
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredPatients.map((patient) => (
                                        <tr key={patient._id}>
                                            <td>
                                                <div className="patient-name">
                                                    <div className="patient-avatar">
                                                        {patient.fullName
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <strong>{patient.fullName}</strong>
                                                </div>
                                            </td>

                                            <td>{patient.patientId}</td>

                                            <td>
                                                {patient.dateOfBirth
                                                    ? new Date(
                                                        patient.dateOfBirth
                                                    ).toLocaleDateString()
                                                    : "—"}
                                            </td>

                                            <td>{patient.gender || "—"}</td>
                                            <td>{patient.contactNumber || "—"}</td>

                                            {canManage && (
                                                <td>
                                                    <div className="patient-actions">
                                                        <button
                                                            className="patient-action-edit"
                                                            onClick={() =>
                                                                startEditing(patient)
                                                            }
                                                            title="Edit patient"
                                                            aria-label={`Edit ${patient.fullName}`}
                                                        >
                                                            <Pencil size={16} />
                                                        </button>

                                                        {isAdmin && (
                                                            <button
                                                                className="patient-action-delete"
                                                                onClick={() =>
                                                                    handleDelete(patient)
                                                                }
                                                                title="Delete patient"
                                                                aria-label={`Delete ${patient.fullName}`}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <p className="patients-disclaimer">
                    Educational demonstration platform · Use fictional
                    patient data for demonstrations.
                </p>
            </main>

            {editingPatient && (
                <div
                    className="patient-modal-backdrop"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !saving) {
                            setEditingPatient(null);
                        }
                    }}
                >
                    <section
                        className="patient-edit-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-patient-title"
                    >
                        <div className="patient-modal-heading">
                            <div>
                                <p className="patients-eyebrow">
                                    PATIENT MANAGEMENT
                                </p>
                                <h2 id="edit-patient-title">Edit patient</h2>
                            </div>

                            <button
                                className="patient-modal-close"
                                onClick={() => setEditingPatient(null)}
                                disabled={saving}
                                aria-label="Close edit form"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="patient-edit-grid">
                                <div className="patient-form-field">
                                    <label htmlFor="edit-patientId">
                                        Patient ID *
                                    </label>
                                    <input
                                        id="edit-patientId"
                                        name="patientId"
                                        value={editForm.patientId}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>

                                <div className="patient-form-field">
                                    <label htmlFor="edit-fullName">
                                        Full name *
                                    </label>
                                    <input
                                        id="edit-fullName"
                                        name="fullName"
                                        value={editForm.fullName}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>

                                <div className="patient-form-field">
                                    <label htmlFor="edit-dateOfBirth">
                                        Date of birth *
                                    </label>
                                    <input
                                        id="edit-dateOfBirth"
                                        type="date"
                                        name="dateOfBirth"
                                        value={editForm.dateOfBirth}
                                        max={new Date().toISOString().split("T")[0]}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>

                                <div className="patient-form-field">
                                    <label htmlFor="edit-gender">
                                        Gender *
                                    </label>
                                    <select
                                        id="edit-gender"
                                        name="gender"
                                        value={editForm.gender}
                                        onChange={handleEditChange}
                                        required
                                    >
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="patient-form-field full-width">
                                    <label htmlFor="edit-contactNumber">
                                        Contact number *
                                    </label>
                                    <input
                                        id="edit-contactNumber"
                                        name="contactNumber"
                                        type="tel"
                                        value={editForm.contactNumber}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="patient-modal-actions">
                                <button
                                    type="button"
                                    className="form-secondary-button"
                                    onClick={() => setEditingPatient(null)}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="form-submit-button"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <LoaderCircle size={17} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={17} />
                                            Save changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Patients;