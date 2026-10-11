
const mongoose = require("mongoose");

const urineTestSchema = new mongoose.Schema(
    {
        reportId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        stripBatch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StripBatch",
            required: true
        },

        sampleCollectedAt: {
            type: Date,
            required: true
        },

        resultsRecordedAt: {
            type: Date,
            default: Date.now
        },

                
        results: {
          glucose: {
              type: String,
              required: true,
              enum: ["Negative", "Trace", "+", "++", "+++", "++++"]
          },
          protein: {
              type: String,
              required: true,
              enum: ["Negative", "Trace", "+", "++", "+++", "++++"]
          },
          ph: {
              type: Number,
              required: true,
              min: 0,
              max: 14
          },
          ketones: {
              type: String,
              required: true,
              enum: ["Negative", "Trace", "+", "++", "+++", "++++"]
          },
          blood: {
              type: String,
              required: true,
              enum: ["Negative", "Trace", "+", "++", "+++", "++++"]
          },
          bilirubin: {
              type: String,
              required: true,
              enum: ["Negative", "Trace", "+", "++", "+++", "++++"]
          },
          urobilinogen: {
              type: String,
              required: true,
              enum: ["Normal", "Trace", "+", "++", "+++", "++++"]
          },
          nitrite: {
              type: String,
              required: true,
              enum: ["Negative", "Positive"]
          },
          leucocytes: {
              type: String,
              required: true,
              enum: ["Negative", "Trace", "+", "++", "+++", "++++"]
          },
          specificGravity: {
              type: Number,
              required: true,
              min: 1.0,
              max: 1.1
          }
        },


        status: {
            type: String,
            enum: [
                "Draft",
                "Pending Review",
                "Revision Requested",
                "Approved"
            ],
            default: "Draft"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        reviewedAt: Date,
        reviewComments: String
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("UrineTest", urineTestSchema);
