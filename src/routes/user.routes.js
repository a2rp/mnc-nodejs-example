const express = require("express");
const {
    registerView,
    loginView,
    registerUser,
    loginUser,
    logoutUser,
} = require("../controllers/user.controller");
const { dashboardView } = require("../controllers/dashboard.controller");
const { protectRoute } = require("../auth/protect");
const requireSameOrigin = require("../auth/requireSameOrigin");

const router = express.Router();

router.get("/", (req, res) => res.redirect(req.isAuthenticated() ? "/dashboard" : "/login"));
router.get("/register", registerView);
router.get("/login", loginView);
router.get("/dashboard", protectRoute, dashboardView);
router.post("/register", requireSameOrigin, registerUser);
router.post("/login", requireSameOrigin, loginUser);
router.post("/logout", requireSameOrigin, protectRoute, logoutUser);

module.exports = router;