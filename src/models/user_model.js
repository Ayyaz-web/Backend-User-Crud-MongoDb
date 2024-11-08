const validator = require("validator");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    validate: {
      validator: (name) => /^[A-Za-z\s]{4,}$/.test(name),
      message:
        "Full Name must be at least 4 characters and only contain alphabetic characters",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: "Invalid email format",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: (password) => /^(?=.*[a-zA-Z])(?=.*\d)/.test(password),
      message:
        "Password must contain both letters and numbers and be at least 8 characters long",
    },
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: (phone) => /^\d{11}$/.test(phone),
      message: "Phone number must be 11 digits",
    },
  },
});

module.exports = mongoose.model("User", userSchema);
