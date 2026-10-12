
const Patient = require("../models/Patient");
const Counter = require("../models/Counter");

// Helper function to calculate the next patient ID in UC-P-XXXX format
const getNextPatientIdValue = async () => {
    const counter = await Counter.findOne({ name: "patientId" });
    let lastId = counter ? counter.lastPatientRecordedId : null;

    if (!lastId) {
        // Fallback: check existing patients in database with UC-P-XXXX format
        const patients = await Patient.find({
            patientId: { $regex: /^UC-P-\d+$/ }
        }).select("patientId");

        if (patients.length > 0) {
            let maxNum = 0;
            for (const p of patients) {
                const match = p.patientId.match(/^UC-P-(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNum) {
                        maxNum = num;
                        lastId = p.patientId;
                    }
                }
            }
        }
    }

    let nextNum = 1001;
    if (lastId) {
        const match = lastId.match(/^UC-P-(\d+)$/);
        if (match) {
            nextNum = parseInt(match[1], 10) + 1;
        }
    }

    const nextPatientId = `UC-P-${String(nextNum).padStart(4, "0")}`;
    return { nextPatientId, lastPatientRecordedId: lastId };
};

// Get the next incremented patient ID
const getNextPatientId = async (req, res) => {
    try {
        const idInfo = await getNextPatientIdValue();
        res.status(200).json(idInfo);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch next patient ID"
        });
    }
};

// Create a patient
const createPatient = async (req, res) => {
    try {
        let patientData = { ...req.body };
        if (!patientData.patientId) {
            const { nextPatientId } = await getNextPatientIdValue();
            patientData.patientId = nextPatientId;
        }

        const patient = new Patient(patientData);
        const savedPatient = await patient.save();

        // Store the last patient recorded id in the database
        await Counter.findOneAndUpdate(
            { name: "patientId" },
            { lastPatientRecordedId: savedPatient.patientId },
            { upsert: true, new: true }
        );

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
    getNextPatientId,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient
};
