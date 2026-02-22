const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const bankingRoutes = require("./routes/banking");
const chatRoutes = require("./routes/chat");

const app = express();
const prisma = require("./prismaClient");

const PORT = process.env.PORT || 5001;

/* ---------------- MIDDLEWARE ---------------- */

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5175"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.json());

/* ---------------- ROUTES ---------------- */

app.use("/api/auth", authRoutes);
app.use("/api/banking", bankingRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
    res.send("KodBank API is running...");
});

/* ---------------- START SERVER ---------------- */

async function startServer() {
    try {
        // connect DB first
        await prisma.$connect();
        console.log("✅ Database connected successfully.");

        // start express server
        app.listen(PORT, () => {
            console.log(`✅ Server running continuously on port ${PORT}`);
        });

    } catch (err) {
        console.error("❌ Failed to start server:", err);
    }
}

startServer();

/* ---------------- PREVENT AUTO EXIT ---------------- */

// Catch crashes
process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION:", err);
});

// keep process alive
setInterval(() => { }, 1000 * 60 * 60);