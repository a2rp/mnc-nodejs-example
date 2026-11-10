require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const { loginCheck } = require("./src/auth/passport");

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET || "";

if (Buffer.byteLength(sessionSecret, "utf8") < 32) {
    throw new Error("Set SESSION_SECRET to a random value of at least 32 bytes.");
}

if (isProduction) app.set("trust proxy", 1);

app.disable("x-powered-by");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("X-Frame-Options", "DENY");
    next();
});
app.use(session({
    name: "mnc.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 8 * 60 * 60 * 1000,
        path: "/",
    },
}));

loginCheck(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.use("/", require("./src/routes/user.routes"));
app.use((_req, res) => res.status(404).render("error", {
    pageTitle: "Page not found",
    message: "The page you requested could not be found.",
}));
app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error);
    console.error("Request failed:", error.name);
    const status = Number.isInteger(error.status) && error.status < 500 ? error.status : 500;
    return res.status(status).render("error", {
        pageTitle: "Request failed",
        message: status === 500 ? "Unable to complete this request right now." : error.message,
    });
});

const startServer = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("Set MONGODB_URI before starting the server.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const port = Number(process.env.PORT) || 4111;
    app.listen(port, () => console.log("Server listening on port " + port));
};

if (require.main === module) {
    startServer().catch((error) => {
        console.error("Server startup failed:", error.name);
        process.exitCode = 1;
    });
}

module.exports = app;