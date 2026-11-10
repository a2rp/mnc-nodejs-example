const passport = require("passport");
const User = require("../models/User");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,72}$/;
const validPassword = (password) =>
    typeof password === "string"
    && Buffer.byteLength(password, "utf8") <= 72
    && passwordPattern.test(password);

const registerView = (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/dashboard");
    return res.render("register", { pageTitle: "Create account" });
};

const registerUser = async (req, res, next) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const location = typeof req.body?.location === "string" ? req.body.location.trim() : "";
    const password = req.body?.password;
    const confirm = req.body?.confirm;
    const renderError = (message, status = 400) => res.status(status).render("register", {
        pageTitle: "Create account",
        error: message,
        name,
        email,
        location,
    });

    if (name.length < 2 || name.length > 80) {
        return renderError("Enter a name between 2 and 80 characters.");
    }
    if (email.length > 254 || !emailPattern.test(email)) {
        return renderError("Enter a valid email address.");
    }
    if (location.length > 100) {
        return renderError("Location must be 100 characters or fewer.");
    }
    if (!validPassword(password)) {
        return renderError("Use 12-72 characters with uppercase, lowercase, a number, and a symbol.");
    }
    if (password !== confirm) return renderError("The passwords do not match.");

    try {
        await User.create({
            name,
            email,
            location: location || undefined,
            password,
        });
        return res.redirect("/login?registered=1");
    } catch (error) {
        if (error.code === 11000) {
            return renderError("An account with that email already exists.", 409);
        }
        if (error.name === "ValidationError") {
            return renderError("Check the account details and try again.");
        }
        return next(error);
    }
};

const loginView = (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/dashboard");
    return res.render("login", {
        pageTitle: "Sign in",
        error: req.query.error === "1" ? "Email or password is incorrect." : "",
        success: req.query.registered === "1" ? "Account created. You can now sign in." : "",
    });
};

const loginUser = (req, res, next) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const password = req.body?.password;
    if (!emailPattern.test(email) || typeof password !== "string") {
        return res.redirect("/login?error=1");
    }

    return passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/login?error=1",
    })(req, res, next);
};

const logoutUser = (req, res, next) => {
    req.logout((logoutError) => {
        if (logoutError) return next(logoutError);
        req.session.destroy((sessionError) => {
            if (sessionError) return next(sessionError);
            res.clearCookie("mnc.sid", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
            });
            return res.redirect("/login");
        });
    });
};

module.exports = {
    registerView,
    loginView,
    registerUser,
    loginUser,
    logoutUser,
};