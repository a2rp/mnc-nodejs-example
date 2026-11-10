const dashboardView = (req, res) => res.render("dashboard", {
    pageTitle: "Your dashboard",
    user: req.user,
});

module.exports = { dashboardView };