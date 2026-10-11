
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        action: {
            type: String,
            required: true,
            enum: [
                "TEST_CREATED",
                "REPORT_SUBMITTED",
                "REPORT_APPROVED",
                "REVISION_REQUESTED"
            ]
        },

        report: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UrineTest",
            default: null
        },

        details: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
