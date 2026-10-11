
const UrineTest = require("../models/UrineTest");
const AuditLog = require("../models/AuditLog");

// Doctor approves a report
const approveReport = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await UrineTest.findById(id);

        if (!report) {
            return res.status(404).json({
                message: "Urine test report not found"
            });
        }

        if (report.status !== "Pending Review") {
            return res.status(400).json({
                message: "Only reports pending review can be approved"
            });
        }

        // Prevent a doctor from approving their own report
        if (
            report.createdBy &&
            report.createdBy.toString() === req.user.id
        ) {
            return res.status(403).json({
                message: "You cannot approve your own report"
            });
        }

        report.status = "Approved";
        report.reviewedBy = req.user.id;
        report.reviewedAt = new Date();
        report.reviewComments = "";

        await report.save();



        await AuditLog.create({
            user: req.user.id,
            action: "REPORT_APPROVED",
            report: report._id,
            details: `Report ${report.reportId} was approved`
        });


        return res.status(200).json({
            message: "Report approved successfully",
            report
        });

    } catch (error) {
        console.error("Approve report error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid report ID"
            });
        }

        return res.status(500).json({
            message: "Failed to approve report"
        });
    }
};

// Doctor requests corrections
const requestRevision = async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;

        if (!comments || !comments.trim()) {
            return res.status(400).json({
                message: "Please provide comments explaining the requested correction"
            });
        }

        const report = await UrineTest.findById(id);

        if (!report) {
            return res.status(404).json({
                message: "Urine test report not found"
            });
        }

        if (report.status !== "Pending Review") {
            return res.status(400).json({
                message: "Only reports pending review can be sent for revision"
            });
        }

        // Prevent a doctor from reviewing their own report
        if (
            report.createdBy &&
            report.createdBy.toString() === req.user.id
        ) {
            return res.status(403).json({
                message: "You cannot review your own report"
            });
        }

        report.status = "Revision Requested";
        report.reviewedBy = req.user.id;
        report.reviewedAt = new Date();
        report.reviewComments = comments.trim();

        await report.save();

        await AuditLog.create({
            user: req.user.id,
            action: "REVISION_REQUESTED",
            report: report._id,
            details: `Revision requested for report ${report.reportId}: ${comments}`
          });


        return res.status(200).json({
            message: "Revision requested successfully",
            report
        });

    } catch (error) {
        console.error("Request revision error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid report ID"
            });
        }

        return res.status(500).json({
            message: "Failed to request revision"
        });
    }
};

module.exports = {
    approveReport,
    requestRevision
};
