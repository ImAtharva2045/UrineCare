
const mongoose = require("mongoose");

const stripBatchSchema = new mongoose.Schema(
    {
        brand: {
            type: String,
            required: true,
            trim: true
        },
        manufacturer: {
            type: String,
            required: true,
            trim: true
        },
        batchNumber: {
            type: String,
            required: true,
            trim: true
        },
        expiryDate: {
            type: Date,
            required: true
        },
        receivedDate: {
            type: Date,
            default: Date.now
        },
        quantityReceived: {
            type: Number,
            required: true,
            min: 1
        },
        quantityRemaining: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ["Active", "Low Stock", "Expired"],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);

// A batch number must be unique for a manufacturer
stripBatchSchema.index(
    { manufacturer: 1, batchNumber: 1 },
    { unique: true }
);

module.exports = mongoose.model("StripBatch", stripBatchSchema);
