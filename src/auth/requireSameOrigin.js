const configuredOrigin = new URL(
    process.env.APP_ORIGIN || "http://localhost:" + (process.env.PORT || "4111")
).origin;

module.exports = (req, res, next) => {
    if (req.get("origin") !== configuredOrigin) {
        return res.status(403).send("This request origin is not allowed.");
    }
    return next();
};