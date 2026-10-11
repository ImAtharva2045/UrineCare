
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function createAdmin() {
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            throw new Error(
                "Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file"
            );
        }

        if (password.length < 12) {
            throw new Error(
                "Admin password must contain at least 12 characters"
            );
        }

        await mongoose.connect(process.env.MONGODB_URI);

        const existingAdmin = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingAdmin) {
            console.log("An account with this email already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            fullName: "UrineCare Administrator",
            email,
            password: hashedPassword,
            role: "Admin"
        });

        console.log("Admin account created successfully.");

    } catch (error) {
        console.error("Admin setup failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

createAdmin();
