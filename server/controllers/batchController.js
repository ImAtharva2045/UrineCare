
const StripBatch = require("../models/StripBatch");

const createBatch = async (req, res) => {
    try {
        const batch = new StripBatch(req.body);
        const savedBatch = await batch.save();

        res.status(201).json({
            message: "Strip batch created successfully",
            batch: savedBatch
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This manufacturer and batch number already exist"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid batch data",
                errors: Object.values(error.errors).map(
                    err => err.message
                )
            });
        }

        res.status(500).json({
            message: "Failed to create strip batch"
        });
    }
};

const getBatches = async (req, res) => {
    try {
        const batches = await StripBatch.find().sort({
            expiryDate: 1
        });

        res.status(200).json({
            count: batches.length,
            batches
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch strip batches"
        });
    }
};

module.exports = {
    createBatch,
    getBatches
};
