import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Save, LoaderCircle } from "lucide-react";

import api from "../api";
import "./AddPatient.css";

function AddPatient() {
    const navigate = useNavigate();

    const user = JSON.parse(
        sessionStorage.getItem("urinecareUser") || "null"
    );
    const role = user?.role;

    const [formData, setFormData] = useState({
        patientId: "",
        fullName: "",
        dateOfBirth: "",
        gender: "",
        contactNumber: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!role || !["Admin", "Technician"].includes(role)) return;

        const fetchNextPatientId = async () => {
            try {
                const response = await api.get("/patients/next-id");
                if (response.data?.nextPatientId) {
                    setFormData((previous) => ({
                        ...previous,
                        patientId: response.data.nextPatientId
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch next patient ID:", err);
            }
        };

        fetchNextPatientId();
    }, [role]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!user || !["Admin", "Technician"].includes(user.role)) {
            setError("You do not have permission to register patients.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/patients", formData);

            navigate("/patients", {
                replace: true,
                state: {
                    message: "Patient registered successfully."
                }
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to register the patient. Please check the details."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!user || !["Admin", "Technician"].includes(user.role)) {
        return (
            <main className="add-patient-page">
                <div className="add-patient-card">
                    <h2>Access restricted</h2>
                    <p>Only Admins and Technicians can register patients.</p>
                    <button
                        className="form-secondary-button"
                        onClick={() => navigate(-1)}
                    >
                        Go back
                    </button>
                </div>
            </main>
        );
    }

    return (
        <div className="add-patient-page">
            <header className="add-patient-header">
                <button
                    type="button"
                    className="form-back-button"
                    onClick={() => navigate("/patients")}
                >
                    <ArrowLeft size={18} />
                    Back to Patients
                </button>

                <div className="form-brand">
                    <UserPlus size={22} />
                    <span>UrineCare</span>
                </div>
            </header>

            <main className="add-patient-content">
                <div className="add-patient-heading">
                    <p className="form-eyebrow">PATIENT MANAGEMENT</p>
                    <h1>Register a patient</h1>
                    <p>
                        Enter the patient's details to create a new record.
                    </p>
                </div>

                <form
                    className="add-patient-card"
                    onSubmit={handleSubmit}
                >
                    <div className="form-section-heading">
                        <div className="form-section-icon">
                            <UserPlus size={21} />
                        </div>

                        <div>
                            <h2>Patient information</h2>
                            <p>Fields marked with * are required.</p>
                        </div>
                    </div>

                    <div className="patient-form-grid">
                        <div className="patient-form-field">
                            <label htmlFor="patientId">
                                Patient ID *
                            </label>
                            <input
                                id="patientId"
                                name="patientId"
                                value={formData.patientId}
                                onChange={handleChange}
                                placeholder="Fetching ID..."
                                readOnly
                                required
                                maxLength={50}
                            />
                        </div>

                        <div className="patient-form-field">
                            <label htmlFor="fullName">
                                Full name *
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                required
                                maxLength={100}
                            />
                        </div>

                        <div className="patient-form-field">
                            <label htmlFor="dateOfBirth">
                                Date of birth *
                            </label>
                            <input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                max={new Date().toISOString().split("T")[0]}
                                required
                            />
                        </div>

                        <div className="patient-form-field">
                            <label htmlFor="gender">
                                Gender *
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="patient-form-field full-width">
                            <label htmlFor="contactNumber">
                                Contact number *
                            </label>
                            <input
                                id="contactNumber"
                                name="contactNumber"
                                type="tel"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder="Enter contact number"
                                required
                                maxLength={20}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="patient-form-error" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="patient-form-actions">
                        <button
                            type="button"
                            className="form-secondary-button"
                            onClick={() => navigate("/patients")}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="form-submit-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <LoaderCircle size={17} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={17} />
                                    Register Patient
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <p className="add-patient-disclaimer">
                    Educational demonstration platform. Use fictional
                    patient information for demonstrations.
                </p>
            </main>
        </div>
    );
}

export default AddPatient;