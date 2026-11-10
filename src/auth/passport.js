const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

const loginCheck = (passport) => {
    passport.use(new LocalStrategy(
        { usernameField: "email" },
        async (email, password, done) => {
            if (typeof email !== "string" || typeof password !== "string") {
                return done(null, false);
            }
            if (Buffer.byteLength(password, "utf8") > 72) return done(null, false);

            try {
                const user = await User.findOne({
                    email: email.trim().toLowerCase(),
                }).select("+password");

                if (!user || !(await bcrypt.compare(password, user.password))) {
                    return done(null, false);
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id).select("-password");
            return done(null, user || false);
        } catch (error) {
            return done(error);
        }
    });
};

module.exports = { loginCheck };