
const UrineTest = require("../models/UrineTest");
const Patient = require("../models/Patient");
const StripBatch = require("../models/StripBatch");
const AuditLog = require("../models/AuditLog");

// Create a urine test
const createUrineTest = async (req, res) => {
    let reservedBatchId = null;
    let savedTestId = null;

    try {
        const {
            reportId,
            patient,
            stripBatch,
            sampleCollectedAt,
            results
        } = req.body;

        if (!patient || !stripBatch || !sampleCollectedAt || !results) {
            return res.status(400).json({
                message: "Patient, strip batch, sample date and results are required"
            });
        }

        const existingPatient = await Patient.findById(patient);

        if (!existingPatient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        const existingBatch = await StripBatch.findById(stripBatch);

        if (!existingBatch) {
            return res.status(404).json({
                message: "Strip batch not found"
            });
        }

        const now = new Date();

        // Reserve one strip only if the batch is not expired and has stock.
        const reservedBatch = await StripBatch.findOneAndUpdate(
            {
                _id: stripBatch,
                expiryDate: { $gte: now },
                quantityRemaining: { $gt: 0 }
            },
            {
                $inc: { quantityRemaining: -1 }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!reservedBatch) {
            if (new Date(existingBatch.expiryDate) < now) {
                return res.status(400).json({
                    message: "Cannot use an expired strip batch"
                });
            }

            return res.status(400).json({
                message: "No strips remaining in this batch"
            });
        }

        reservedBatchId = reservedBatch._id;

        // Generate a report ID if the frontend does not supply one.
        const finalReportId = reportId || `UR-${Date.now()}`;

        const test = new UrineTest({
            reportId: finalReportId,
            patient,
            stripBatch,
            sampleCollectedAt,
            results,
            createdBy: req.user.id
        });

        const savedTest = await test.save();
        savedTestId = savedTest._id;

        // Record who created the report.
        await AuditLog.create({
            user: req.user.id,
            action: "TEST_CREATED",
            report: savedTest._id,
            details: `Report ${savedTest.reportId} was created`
        });

        return res.status(201).json({
            message: "Urine test created successfully",
            test: savedTest
        });
    } catch (error) {
        // Undo changes if saving the report or audit log fails.
        try {
            if (savedTestId) {
                await UrineTest.findByIdAndDelete(savedTestId);
            }

            if (reservedBatchId) {
                await StripBatch.updateOne(
                    { _id: reservedBatchId },
                    { $inc: { quantityRemaining: 1 } }
                );
            }
        } catch (cleanupError) {
            console.error("Urine test cleanup failed:", cleanupError);
        }

        console.error("Create urine test error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Report ID already exists"
            });
        }

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return res.status(400).json({
                message: "Invalid urine test data",
                error: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to create urine test",
            error: error.message
        });
    }
};


// Get all urine tests
const getUrineTests = async (req, res) => {
    try {
        const tests = await UrineTest.find()
            .populate("patient", "patientId fullName")
            .populate(
                "stripBatch",
                "brand manufacturer batchNumber expiryDate"
            )
            .populate("createdBy", "fullName email role")
            .populate("reviewedBy", "fullName email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: tests.length,
            tests
        });
    } catch (error) {
        console.error("Fetch urine tests error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch urine tests"
        });
    }
};


// Get one urine test by MongoDB document ID
const getUrineTestById = async (req, res) => {
    try {
        const test = await UrineTest.findById(req.params.id)
            .populate("patient", "patientId fullName gender contactNumber dateOfBirth")
            .populate(
                "stripBatch",
                "brand manufacturer batchNumber expiryDate"
            )
            .populate("createdBy", "fullName email role")
            .populate("reviewedBy", "fullName email role");

        if (!test) {
            return res.status(404).json({
                message: "Urine test not found"
            });
        }

        return res.status(200).json({ test });
    } catch (error) {
        console.error("Fetch urine test error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid urine test ID"
            });
        }

        return res.status(500).json({
            message: "Failed to fetch urine test"
        });
    }
};


// Submit a report for Doctor review
const submitForReview = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await UrineTest.findById(id);

        if (!report) {
            return res.status(404).json({
                message: "Urine test report not found"
            });
        }

        // Only the original creator can submit the report.
        if (
            !report.createdBy ||
            report.createdBy.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "Only the original creator can submit this report"
            });
        }

        // Only drafts or reports needing revision can be submitted.
        if (
            report.status !== "Draft" &&
            report.status !== "Revision Requested"
        ) {
            return res.status(400).json({
                message: "Only draft or revision-requested reports can be submitted"
            });
        }

        report.status = "Pending Review";
        await report.save();

        // Record which user submitted the report for review.
        await AuditLog.create({
            user: req.user.id,
            action: "REPORT_SUBMITTED",
            report: report._id,
            details: `Report ${report.reportId} was submitted for review`
        });

        return res.status(200).json({
            message: "Report submitted for review successfully",
            report
        });
    } catch (error) {
        console.error("Submit report error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid report ID"
            });
        }

        return res.status(500).json({
            message: "Failed to submit report"
        });
    }
};


module.exports = {
    createUrineTest,
    getUrineTests,
    getUrineTestById,
    submitForReview
};
