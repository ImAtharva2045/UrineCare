
const AuditLog = require("../models/AuditLog");

const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate("user", "fullName email role")
            .populate("report", "reportId status")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: logs.length,
            logs
        });
    } catch (error) {
        console.error("Fetch audit logs error:", error.message);

        res.status(500).json({
            message: "Failed to fetch audit logs"
        });
    }
};

module.exports = { getAuditLogs };
