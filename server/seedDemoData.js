
require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/User");
const Patient = require("./models/Patient");
const StripBatch = require("./models/StripBatch");
const UrineTest = require("./models/UrineTest");
const AuditLog = require("./models/AuditLog");

const DEMO_REPORT_PREFIX = "UR-DEMO-";

const patientsData = [
  { patientId: "UC-P-1001", fullName: "Aarav Sharma", dateOfBirth: "1992-04-12", gender: "Male", contactNumber: "9000001001" },
  { patientId: "UC-P-1002", fullName: "Ananya Mehta", dateOfBirth: "1987-09-23", gender: "Female", contactNumber: "9000001002" },
  { patientId: "UC-P-1003", fullName: "Rohan Desai", dateOfBirth: "1978-02-08", gender: "Male", contactNumber: "9000001003" },
  { patientId: "UC-P-1004", fullName: "Isha Kulkarni", dateOfBirth: "2001-11-17", gender: "Female", contactNumber: "9000001004" },
  { patientId: "UC-P-1005", fullName: "Vikram Shah", dateOfBirth: "1969-06-05", gender: "Male", contactNumber: "9000001005" },
  { patientId: "UC-P-1006", fullName: "Kavya Nair", dateOfBirth: "1995-01-29", gender: "Female", contactNumber: "9000001006" },
  { patientId: "UC-P-1007", fullName: "Aditya Joshi", dateOfBirth: "1983-07-14", gender: "Male", contactNumber: "9000001007" },
  { patientId: "UC-P-1008", fullName: "Priya Iyer", dateOfBirth: "1999-03-21", gender: "Female", contactNumber: "9000001008" },
  { patientId: "UC-P-1009", fullName: "Sameer Patil", dateOfBirth: "1974-12-02", gender: "Male", contactNumber: "9000001009" },
  { patientId: "UC-P-1010", fullName: "Diya Kapoor", dateOfBirth: "2003-05-30", gender: "Female", contactNumber: "9000001010" },
  { patientId: "UC-P-1011", fullName: "Nikhil Rao", dateOfBirth: "1990-08-19", gender: "Male", contactNumber: "9000001011" },
  { patientId: "UC-P-1012", fullName: "Sneha Patil", dateOfBirth: "1985-10-11", gender: "Female", contactNumber: "9000001012" },
  { patientId: "UC-P-1013", fullName: "Rahul Verma", dateOfBirth: "1965-04-03", gender: "Male", contactNumber: "9000001013" },
  { patientId: "UC-P-1014", fullName: "Mira Fernandes", dateOfBirth: "1997-02-16", gender: "Female", contactNumber: "9000001014" },
  { patientId: "UC-P-1015", fullName: "Dev Malhotra", dateOfBirth: "2000-06-24", gender: "Male", contactNumber: "9000001015" }
];

const batchesData = [
  {
    brand: "Combur-Test",
    manufacturer: "Roche Diagnostics",
    batchNumber: "DEMO-ROC-2601",
    expiryDate: "2027-12-31",
    receivedDate: "2026-08-01",
    quantityReceived: 100,
    quantityRemaining: 76,
    status: "Active"
  },
  {
    brand: "Multistix 10 SG",
    manufacturer: "Siemens Healthineers",
    batchNumber: "DEMO-SIE-2602",
    expiryDate: "2027-09-30",
    receivedDate: "2026-08-12",
    quantityReceived: 100,
    quantityRemaining: 8,
    status: "Low Stock"
  },
  {
    brand: "URIT 10G",
    manufacturer: "Accurex Biomedical Pvt. Ltd.",
    batchNumber: "DEMO-ACC-2603",
    expiryDate: "2027-11-30",
    receivedDate: "2026-08-20",
    quantityReceived: 80,
    quantityRemaining: 54,
    status: "Active"
  },
  {
    brand: "Urine Reagent Strips",
    manufacturer: "Demo Laboratory Supplies",
    batchNumber: "DEMO-LAB-2604",
    expiryDate: "2027-06-30",
    receivedDate: "2026-09-01",
    quantityReceived: 60,
    quantityRemaining: 0,
    status: "Low Stock"
  },
  {
    brand: "Multistix 10 SG",
    manufacturer: "Siemens Healthineers",
    batchNumber: "DEMO-SIE-2501",
    expiryDate: "2026-03-31",
    receivedDate: "2025-10-01",
    quantityReceived: 50,
    quantityRemaining: 12,
    status: "Expired"
  }
];

const resultsData = [
  { glucose: "Negative", protein: "Negative", ph: 6.0, ketones: "Negative", blood: "Negative", bilirubin: "Negative", urobilinogen: "Normal", nitrite: "Negative", leucocytes: "Negative", specificGravity: 1.015 },
  { glucose: "Negative", protein: "Trace", ph: 6.5, ketones: "Negative", blood: "Negative", bilirubin: "Negative", urobilinogen: "Normal", nitrite: "Negative", leucocytes: "Trace", specificGravity: 1.020 },
  { glucose: "Trace", protein: "+", ph: 5.5, ketones: "Trace", blood: "Negative", bilirubin: "Negative", urobilinogen: "Normal", nitrite: "Positive", leucocytes: "++", specificGravity: 1.025 },
  { glucose: "Negative", protein: "Negative", ph: 7.0, ketones: "Negative", blood: "Trace", bilirubin: "Negative", urobilinogen: "Normal", nitrite: "Negative", leucocytes: "Negative", specificGravity: 1.010 },
  { glucose: "Negative", protein: "Trace", ph: 5.0, ketones: "Negative", blood: "+", bilirubin: "Negative", urobilinogen: "Normal", nitrite: "Negative", leucocytes: "Trace", specificGravity: 1.025 },
  { glucose: "Negative", protein: "Negative", ph: 6.0, ketones: "Negative", blood: "Negative", bilirubin: "Negative", urobilinogen: "Normal", nitrite: "Negative", leucocytes: "Negative", specificGravity: 1.005 },
  { glucose: "Negative", protein: "++", ph: 6.5, ketones: "Negative", blood: "+", bilirubin: "Negative", urobilinogen: "+", nitrite: "Negative", leucocytes: "Trace", specificGravity: 1.030 },
  { glucose: "Negative", protein: "Negative", ph: 7.5, ketones: "Negative", blood: "Negative", bilirubin: "Negative", urobilinogen: "Normal", nitrite: "Negative", leucocytes: "Negative", specificGravity: 1.010 },
  { glucose: "Trace", protein: "Trace", ph: 5.5, ketones: "+", blood: "Negative", bilirubin: "Negative", urobilinogen: "Normal", nitrite: "Negative", leucocytes: "Trace", specificGravity: 1.020 },
  { glucose: "Negative", protein: "Negative", ph: 6.0, ketones: "Negative", blood: "Negative", bilirubin: "Negative", urobilinogen: "Normal", nitrite: "Negative", leucocytes: "Negative", specificGravity: 1.015 },
  { glucose: "Negative", protein: "+", ph: 6.5, ketones: "Negative", blood: "Trace", bilirubin: "Negative", urobilinogen: "Normal", nitrite: "Positive", leucocytes: "++", specificGravity: 1.025 },
  { glucose: "Negative", protein: "Negative", ph: 7.0, ketones: "Negative", blood: "Negative", bilirubin: "Negative", urobilinogen: "Normal", nitrite: "Negative", leucocytes: "Negative", specificGravity: 1.010 }
];

const reportPlans = [
  { status: "Approved", technician: "riya.sharma@urinecare.demo", doctor: "neha.kulkarni@urinecare.demo", daysAgo: 12 },
  { status: "Approved", technician: "karan.patel@urinecare.demo", doctor: "arjun.desai@urinecare.demo", daysAgo: 10 },
  { status: "Approved", technician: "meera.shah@urinecare.demo", doctor: "neha.kulkarni@urinecare.demo", daysAgo: 9 },
  { status: "Approved", technician: "riya.sharma@urinecare.demo", doctor: "arjun.desai@urinecare.demo", daysAgo: 8 },
  { status: "Approved", technician: "karan.patel@urinecare.demo", doctor: "neha.kulkarni@urinecare.demo", daysAgo: 7 },
  { status: "Pending Review", technician: "meera.shah@urinecare.demo", daysAgo: 1 },
  { status: "Pending Review", technician: "riya.sharma@urinecare.demo", daysAgo: 1 },
  { status: "Revision Requested", technician: "karan.patel@urinecare.demo", doctor: "arjun.desai@urinecare.demo", daysAgo: 3, comments: "Please verify the recorded readings against the strip and correct the report if necessary." },
  { status: "Revision Requested", technician: "meera.shah@urinecare.demo", doctor: "neha.kulkarni@urinecare.demo", daysAgo: 2, comments: "Please confirm the specific gravity entry before resubmission." },
  { status: "Draft", technician: "riya.sharma@urinecare.demo", daysAgo: 0 },
  { status: "Draft", technician: "karan.patel@urinecare.demo", daysAgo: 0 },
  { status: "Pending Review", technician: "meera.shah@urinecare.demo", daysAgo: 0 }
];

function daysAgoDate(days, hour = 10) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function seedDemoData() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  try {
    const users = await User.find({
      email: {
        $in: [
          "admin@urinecare.demo",
          "neha.kulkarni@urinecare.demo",
          "arjun.desai@urinecare.demo",
          "riya.sharma@urinecare.demo",
          "karan.patel@urinecare.demo",
          "meera.shah@urinecare.demo"
        ]
      },
      isActive: true
    }).select("fullName email role");

    const userByEmail = Object.fromEntries(users.map(user => [user.email, user]));

    const requiredAccounts = [
      ["admin@urinecare.demo", "Admin"],
      ["neha.kulkarni@urinecare.demo", "Doctor"],
      ["arjun.desai@urinecare.demo", "Doctor"],
      ["riya.sharma@urinecare.demo", "Technician"],
      ["karan.patel@urinecare.demo", "Technician"],
      ["meera.shah@urinecare.demo", "Technician"]
    ];

    for (const [email, role] of requiredAccounts) {
      if (!userByEmail[email] || userByEmail[email].role !== role) {
        throw new Error(`Missing active account or incorrect role: ${email} should be ${role}. No demo data was added.`);
      }
    }

    const existingDemoReports = await UrineTest.countDocuments({
      reportId: { $regex: `^${DEMO_REPORT_PREFIX}` }
    });

    if (existingDemoReports > 0) {
      throw new Error("Demo reports already exist. To avoid duplicates, this seed script will not run again.");
    }

    const patients = await Patient.insertMany(patientsData);
    const batches = await StripBatch.insertMany(
      batchesData.map(batch => ({ ...batch }))
    );

    const reports = [];

    for (let i = 0; i < reportPlans.length; i++) {
      const plan = reportPlans[i];
      const technician = userByEmail[plan.technician];
      const doctor = plan.doctor ? userByEmail[plan.doctor] : null;
      const collectedAt = daysAgoDate(plan.daysAgo, 9 + (i % 7));
      const recordedAt = new Date(collectedAt.getTime() + 15 * 60 * 1000);

      const report = await UrineTest.create({
        reportId: `${DEMO_REPORT_PREFIX}${String(i + 1).padStart(4, "0")}`,
        patient: patients[i % patients.length]._id,
        stripBatch: batches[i % 3]._id,
        sampleCollectedAt: collectedAt,
        resultsRecordedAt: recordedAt,
        results: resultsData[i],
        status: plan.status,
        createdBy: technician._id,
        ...(doctor && plan.status !== "Pending Review" && plan.status !== "Draft"
          ? {
              reviewedBy: doctor._id,
              reviewedAt: daysAgoDate(Math.max(0, plan.daysAgo - 1), 14),
              reviewComments: plan.comments || ""
            }
          : {})
      });

      reports.push(report);
    }

    const auditEntries = [];

    for (let i = 0; i < reports.length; i++) {
      const report = reports[i];
      const plan = reportPlans[i];
      const technician = userByEmail[plan.technician];

      auditEntries.push({
        user: technician._id,
        action: "TEST_CREATED",
        report: report._id,
        details: `Report ${report.reportId} was created.`,
        createdAt: daysAgoDate(plan.daysAgo, 9 + (i % 7))
      });

      if (["Pending Review", "Approved", "Revision Requested"].includes(plan.status)) {
        auditEntries.push({
          user: technician._id,
          action: "REPORT_SUBMITTED",
          report: report._id,
          details: `Report ${report.reportId} was submitted for review.`,
          createdAt: daysAgoDate(plan.daysAgo, 11)
        });
      }

      if (plan.status === "Approved") {
        auditEntries.push({
          user: userByEmail[plan.doctor]._id,
          action: "REPORT_APPROVED",
          report: report._id,
          details: `Report ${report.reportId} was approved.`,
          createdAt: daysAgoDate(Math.max(0, plan.daysAgo - 1), 14)
        });
      }

      if (plan.status === "Revision Requested") {
        auditEntries.push({
          user: userByEmail[plan.doctor]._id,
          action: "REVISION_REQUESTED",
          report: report._id,
          details: `Revision requested for ${report.reportId}: ${plan.comments}`,
          createdAt: daysAgoDate(Math.max(0, plan.daysAgo - 1), 14)
        });
      }
    }

    await AuditLog.insertMany(auditEntries);

    console.log("Demo data added successfully.");
    console.log(`Patients: ${patients.length}`);
    console.log(`Strip batches: ${batches.length}`);
    console.log(`Urine reports: ${reports.length}`);
    console.log(`Audit entries: ${auditEntries.length}`);
    console.log("Your existing users were not modified.");
  } finally {
    await mongoose.disconnect();
  }
}

seedDemoData().catch(error => {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
});
