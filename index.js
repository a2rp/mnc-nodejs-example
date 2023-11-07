const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require('express-session');
dotenv.config();
const passport = require("passport");
const { loginCheck } = require("./src/auth/passport");
loginCheck(passport);

// Mongo DB conncetion
const database = process.env.MONGODB_URI;
mongoose
    .connect(database)
    .then(() => console.log("connected with database"))
    .catch((err) => console.log(err));

app.set("view engine", "ejs");

//BodyParsing
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'oneboy',
    saveUninitialized: true,
    resave: true
}));


app.use(passport.initialize());
app.use(passport.session());
//Routes
app.use("/", require("./src/routes/user.routes"));

const PORT = process.env.PORT || 4111;

app.listen(PORT, console.log("Server has started at port " + PORT));