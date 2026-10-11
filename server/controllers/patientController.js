
const Patient = require("../models/Patient");

// Create a patient
const createPatient = async (req, res) => {
    try {
        const patient = new Patient(req.body);
        const savedPatient = await patient.save();

        res.status(201).json({
            message: "Patient registered successfully",
            patient: savedPatient
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Patient ID already exists"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid patient data",
                errors: Object.values(error.errors).map(
                    err => err.message
                )
            });
        }

        res.status(500).json({
            message: "Failed to register patient"
        });
    }
};

// Get all patients
const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find().sort({
            createdAt: -1
        });

        res.status(200).json({
            count: patients.length,
            patients
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch patients"
        });
    }
};

// Get one patient by MongoDB ID
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        res.status(200).json({ patient });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid patient ID"
            });
        }

        res.status(500).json({
            message: "Failed to fetch patient"
        });
    }
};

// Update a patient
const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        res.status(200).json({
            message: "Patient updated successfully",
            patient
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Patient ID already exists"
            });
        }

        if (error.name === "ValidationError" ||
            error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid patient data"
            });
        }

        res.status(500).json({
            message: "Failed to update patient"
        });
    }
};

// Delete a patient (temporary development endpoint)
const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(
            req.params.id
        );

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        res.status(200).json({
            message: "Patient deleted successfully"
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid patient ID"
            });
        }

        res.status(500).json({
            message: "Failed to delete patient"
        });
    }
};

module.exports = {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient
};
