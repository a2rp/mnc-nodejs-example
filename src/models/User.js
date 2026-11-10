const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 80,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 254,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    location: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "New York",
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

UserSchema.pre("save", async function hashPassword() {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }
});

module.exports = mongoose.model("User", UserSchema);