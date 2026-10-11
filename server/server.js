
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const batchRoutes = require("./routes/batchRoutes");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const urineTestRoutes = require("./routes/urineTestRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const userRoutes = require("./routes/userRoutes");
const auditRoutes = require("./routes/auditRoutes");
const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));


app.use(express.json());


app.get("/", (req, res) => {
    res.send("UrineCare backend is running!");
});

app.use("/api/patients", patientRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/tests", urineTestRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/audit", auditRoutes);

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB Atlas connected successfully");

        const PORT = process.env.PORT || 5001;

        app.listen(PORT, () => {
            console.log(
                `Server running on http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Database connection failed:",
            error.message
        );
        process.exit(1);
    }
}

startServer();
