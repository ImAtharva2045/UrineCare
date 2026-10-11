
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const demoUsers = [
    {
        fullName: "Atharva Sawale",
        email: "admin@urinecare.demo",
        password: "AdminDemo@2026Secure",
        role: "Admin"
    },
    {
        fullName: "Dr. Neha Kulkarni",
        email: "neha.kulkarni@urinecare.demo",
        password: "NehaDemo@2026Secure",
        role: "Doctor"
    },
    {
        fullName: "Dr. Arjun Desai",
        email: "arjun.desai@urinecare.demo",
        password: "ArjunDemo@2026Secure",
        role: "Doctor"
    },
    {
        fullName: "Riya Sharma",
        email: "riya.sharma@urinecare.demo",
        password: "RiyaDemo@2026Secure",
        role: "Technician"
    },
    {
        fullName: "Karan Patel",
        email: "karan.patel@urinecare.demo",
        password: "KaranDemo@2026Secure",
        role: "Technician"
    },
    {
        fullName: "Meera Shah",
        email: "meera.shah@urinecare.demo",
        password: "MeeraDemo@2026Secure",
        role: "Technician"
    }
];

async function seedDemoUsers() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing from server/.env");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        let created = 0;
        let skipped = 0;

        for (const demoUser of demoUsers) {
            const existingUser = await User.findOne({
                email: demoUser.email.toLowerCase()
            });

            if (existingUser) {
                console.log(`Skipped existing user: ${demoUser.email}`);
                skipped++;
                continue;
            }

            const hashedPassword = await bcrypt.hash(
                demoUser.password,
                12
            );

            await User.create({
                fullName: demoUser.fullName,
                email: demoUser.email.toLowerCase(),
                password: hashedPassword,
                role: demoUser.role,
                isActive: true
            });

            console.log(`Created ${demoUser.role}: ${demoUser.email}`);
            created++;
        }

        console.log("\nDemo user seeding completed.");
        console.log(`Created: ${created}`);
        console.log(`Skipped: ${skipped}`);
    } catch (error) {
        console.error("Failed to seed demo users:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedDemoUsers();
