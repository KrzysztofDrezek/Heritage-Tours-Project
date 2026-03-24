const express = require("express");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const toursRoutes = require("./routes/toursRoutes");
require("./db/connection");
const availabilityRoutes = require("./routes/availabilityRoutes");
const bookingsRoutes = require("./routes/bookingsRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = 3000;

// app.use(helmet({
//     crossOriginResourcePolicy: false
// }));

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

app.use(session({
    secret: "heritage_tours_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}));

app.use("/api/tours", toursRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/auth", authRoutes);

const clientDistPath = path.join(__dirname, "../client/dist");

app.use(express.static(clientDistPath));

app.use((req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});