import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    FileText,
    UserRound,
    CalendarDays,
    Package,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    MessageSquareWarning,
    Send
} from "lucide-react";

import api from "../api";
import "./TestDetails.css";

function TestDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reviewMessage, setReviewMessage] = useState("");
    const [reviewError, setReviewError] = useState("");
    const [reviewComments, setReviewComments] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showRevisionForm, setShowRevisionForm] = useState(false);

    const user = JSON.parse(
        sessionStorage.getItem("urinecareUser") || "{}"
    );

    const isDoctor = user.role === "Doctor";
    const isTechnician = user.role === "Technician";
    const isAdmin = user.role === "Admin";

    const fetchTest = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/tests/${id}`);
            const data = response.data;
            const report = data.test || data.report || data;

            setTest(report);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to load this report."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTest();
    }, [id]);

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

    const resultLabels = {
        glucose: "Glucose",
        protein: "Protein",
        ketones: "Ketones",
        blood: "Blood",
        bilirubin: "Bilirubin",
        leucocytes: "Leucocytes",
        urobilinogen: "Urobilinogen",
        nitrite: "Nitrite",
        ph: "pH",
        specificGravity: "Specific Gravity"
    };

    const resultValue = (value) =>
        value === undefined || value === null || value === ""
            ? "—"
            : String(value);

    // Only the user who created the report can submit it.
    const creatorId =
        typeof test?.createdBy === "object"
            ? test?.createdBy?._id
            : test?.createdBy;

    const currentUserId = user.id || user._id;

    const isReportCreator =
        Boolean(creatorId) &&
        Boolean(currentUserId) &&
        String(creatorId) === String(currentUserId);

    const canSubmitForReview =
        (isTechnician || isAdmin) &&
        isReportCreator &&
        ["Draft", "Revision Requested"].includes(test?.status);

    const handleSubmitForReview = async () => {
        const confirmed = window.confirm(
            "Submit this report for Doctor review?"
        );

        if (!confirmed) return;

        try {
            setSubmitting(true);
            setReviewError("");
            setReviewMessage("");

            await api.patch(`/tests/${id}/submit`);

            setReviewMessage(
                "Report submitted successfully for Doctor review."
            );

            await fetchTest();
        } catch (err) {
            setReviewError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to submit this report for review."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to approve this report?"
        );

        if (!confirmed) return;

        try {
            setSubmitting(true);
            setReviewError("");
            setReviewMessage("");

            await api.patch(`/reviews/${id}/approve`);

            setReviewMessage("Report approved successfully.");
            setShowRevisionForm(false);

            await fetchTest();
        } catch (err) {
            setReviewError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to approve this report."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequestRevision = async (event) => {
        event.preventDefault();

        if (!reviewComments.trim()) {
            setReviewError(
                "Please enter comments explaining the requested revision."
            );
            return;
        }

        try {
            setSubmitting(true);
            setReviewError("");
            setReviewMessage("");

            await api.patch(`/reviews/${id}/revision`, {
                comments: reviewComments.trim()
            });

            setReviewMessage("Revision requested successfully.");
            setReviewComments("");
            setShowRevisionForm(false);

            await fetchTest();
        } catch (err) {
            setReviewError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to request a revision."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="test-details-page">
            <header className="test-details-topbar">
                <button
                    type="button"
                    className="test-details-back"
                    onClick={() => navigate("/tests")}
                >
                    <ArrowLeft size={18} />
                    Urine Test Reports
                </button>

                <div className="test-details-brand">
                    <FileText size={22} />
                    <span>UrineCare</span>
                </div>
            </header>

            <main className="test-details-main">
                {loading ? (
                    <div className="test-details-message">
                        <RefreshCw size={22} />
                        Loading report details...
                    </div>
                ) : error ? (
                    <div className="test-details-error">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                ) : test ? (
                    <>
                        <div className="test-details-heading">
                            <div>
                                <p className="test-details-eyebrow">
                                    LABORATORY / REPORT DETAILS
                                </p>

                                <h1>
                                    {test.reportId || "Urine Test Report"}
                                </h1>

                                <p>
                                    View the manually recorded strip readings
                                    and report information.
                                </p>
                            </div>

                            <span
                                className={`test-details-status ${statusClass(
                                    test.status
                                )}`}
                            >
                                {test.status || "Draft"}
                            </span>
                        </div>

                        {reviewMessage && (
                            <div
                                className="test-details-message"
                                role="status"
                            >
                                <CheckCircle size={20} />
                                <span>{reviewMessage}</span>
                            </div>
                        )}

                        {reviewError && (
                            <div
                                className="test-details-error"
                                role="alert"
                            >
                                <AlertCircle size={20} />
                                <span>{reviewError}</span>
                            </div>
                        )}

                        {canSubmitForReview && (
                            <section className="test-details-card">
                                <div className="test-details-section-heading">
                                    <Send size={21} />
                                    <h2>Submit Report for Review</h2>
                                </div>

                                <p className="test-details-description">
                                    Check the recorded information before
                                    submitting this report to the Doctor.
                                    Once submitted, its status will change
                                    to Pending Review.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleSubmitForReview}
                                    disabled={submitting}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        marginTop: "16px",
                                        padding: "12px 18px",
                                        border: "none",
                                        borderRadius: "8px",
                                        background: "#087f70",
                                        color: "#ffffff",
                                        fontWeight: 600,
                                        cursor: submitting
                                            ? "not-allowed"
                                            : "pointer",
                                        opacity: submitting ? 0.7 : 1
                                    }}
                                >
                                    <Send size={18} />
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit for Review"}
                                </button>
                            </section>
                        )}

                        {isDoctor &&
                            test.status === "Pending Review" && (
                                <section className="test-details-card">
                                    <div className="test-details-section-heading">
                                        <CheckCircle size={21} />
                                        <h2>Doctor Review</h2>
                                    </div>

                                    <p className="test-details-description">
                                        Review the recorded information before
                                        choosing an action. This workflow
                                        records a review decision; it does not
                                        independently interpret results or
                                        provide a medical diagnosis.
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: "12px",
                                            marginTop: "18px"
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={handleApprove}
                                            disabled={submitting}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                padding: "12px 18px",
                                                border: "none",
                                                borderRadius: "8px",
                                                background: "#16835d",
                                                color: "#ffffff",
                                                fontWeight: 600,
                                                cursor: submitting
                                                    ? "not-allowed"
                                                    : "pointer",
                                                opacity: submitting ? 0.7 : 1
                                            }}
                                        >
                                            <CheckCircle size={18} />
                                            {submitting
                                                ? "Processing..."
                                                : "Approve Report"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowRevisionForm(
                                                    !showRevisionForm
                                                );
                                                setReviewError("");
                                                setReviewMessage("");
                                            }}
                                            disabled={submitting}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                padding: "12px 18px",
                                                border: "1px solid #c77a23",
                                                borderRadius: "8px",
                                                background: "#ffffff",
                                                color: "#945415",
                                                fontWeight: 600,
                                                cursor: submitting
                                                    ? "not-allowed"
                                                    : "pointer"
                                            }}
                                        >
                                            <MessageSquareWarning size={18} />
                                            Request Revision
                                        </button>
                                    </div>

                                    {showRevisionForm && (
                                        <form
                                            onSubmit={handleRequestRevision}
                                            style={{
                                                display: "grid",
                                                gap: "12px",
                                                marginTop: "20px"
                                            }}
                                        >
                                            <label htmlFor="reviewComments">
                                                Revision comments (required)
                                            </label>

                                            <textarea
                                                id="reviewComments"
                                                value={reviewComments}
                                                onChange={(event) =>
                                                    setReviewComments(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Explain what needs to be checked or corrected..."
                                                rows={4}
                                                maxLength={1000}
                                                required
                                                disabled={submitting}
                                                style={{
                                                    width: "100%",
                                                    boxSizing: "border-box",
                                                    padding: "12px",
                                                    border: "1px solid #d4dedb",
                                                    borderRadius: "8px",
                                                    font: "inherit",
                                                    resize: "vertical"
                                                }}
                                            />

                                            <button
                                                type="submit"
                                                disabled={
                                                    submitting ||
                                                    !reviewComments.trim()
                                                }
                                                style={{
                                                    justifySelf: "start",
                                                    padding: "11px 16px",
                                                    border: "none",
                                                    borderRadius: "8px",
                                                    background: "#945415",
                                                    color: "#ffffff",
                                                    fontWeight: 600,
                                                    cursor: submitting
                                                        ? "not-allowed"
                                                        : "pointer",
                                                    opacity: submitting ? 0.7 : 1
                                                }}
                                            >
                                                {submitting
                                                    ? "Submitting..."
                                                    : "Submit Revision Request"}
                                            </button>
                                        </form>
                                    )}
                                </section>
                            )}

                        <section className="test-details-card">
                            <div className="test-details-section-heading">
                                <UserRound size={21} />
                                <h2>Patient Information</h2>
                            </div>

                            <div className="test-details-info-grid">
                                <div>
                                    <span>Full Name</span>
                                    <strong>
                                        {test.patient?.fullName ||
                                            test.patient?.name ||
                                            "—"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Patient ID</span>
                                    <strong>
                                        {test.patient?.patientId || "—"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Gender</span>
                                    <strong>
                                        {test.patient?.gender || "—"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Contact Number</span>
                                    <strong>
                                        {test.patient?.contactNumber || "—"}
                                    </strong>
                                </div>
                            </div>
                        </section>

                        <section className="test-details-card">
                            <div className="test-details-section-heading">
                                <CalendarDays size={21} />
                                <h2>Sample Information</h2>
                            </div>

                            <div className="test-details-info-grid">
                                <div>
                                    <span>Sample Collected</span>
                                    <strong>
                                        {formatDate(test.sampleCollectedAt)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Results Recorded</span>
                                    <strong>
                                        {formatDate(test.resultsRecordedAt)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Created By</span>
                                    <strong>
                                        {test.createdBy?.fullName || "—"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Reviewed By</span>
                                    <strong>
                                        {test.reviewedBy?.fullName ||
                                            "Not reviewed"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Review Date</span>
                                    <strong>
                                        {formatDate(test.reviewedAt)}
                                    </strong>
                                </div>
                            </div>

                            <div className="test-details-batch">
                                <Package size={20} />

                                <div>
                                    <span>Strip Batch</span>
                                    <strong>
                                        {test.stripBatch?.brand || "—"}
                                        {test.stripBatch?.batchNumber
                                            ? ` — ${test.stripBatch.batchNumber}`
                                            : ""}
                                    </strong>
                                </div>
                            </div>
                        </section>

                        <section className="test-details-card">
                            <div className="test-details-section-heading">
                                <FileText size={21} />
                                <h2>Recorded Strip Results</h2>
                            </div>

                            <p className="test-details-description">
                                These are the readings entered by the user.
                                They are not an automated diagnosis.
                            </p>

                            <div className="test-details-results">
                                {Object.entries(resultLabels).map(
                                    ([key, label]) => (
                                        <div
                                            className="test-details-result"
                                            key={key}
                                        >
                                            <span>{label}</span>
                                            <strong>
                                                {resultValue(
                                                    test.results?.[key]
                                                )}
                                            </strong>
                                        </div>
                                    )
                                )}
                            </div>
                        </section>

                        {test.reviewComments && (
                            <section className="test-details-card">
                                <div className="test-details-section-heading">
                                    <AlertCircle size={21} />
                                    <h2>Review Comments</h2>
                                </div>

                                <p className="test-details-comments">
                                    {test.reviewComments}
                                </p>
                            </section>
                        )}

                        <p className="test-details-footer">
                            Educational demonstration only. These recorded
                            values must not be treated as a medical diagnosis.
                        </p>
                    </>
                ) : (
                    <div className="test-details-message">
                        Report not found.
                    </div>
                )}
            </main>
        </div>
    );
}

export default TestDetails;