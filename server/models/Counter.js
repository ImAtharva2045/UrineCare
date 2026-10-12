const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        lastPatientRecordedId: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Counter", counterSchema);
