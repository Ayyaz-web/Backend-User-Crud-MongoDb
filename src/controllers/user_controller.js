const User = require("../models/user_model");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const signUp = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    if (!fullName || !email || !password || !phoneNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in SignUp API:", error);
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and Password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const { password: userPassword, ...userData } = user.toObject();

    res.status(200).json({
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    console.error("Error in Login API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullName, email, phoneNumber } = req.body;

    if (!fullName || !email || !phoneNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!/^\d{11}$/.test(phoneNumber)) {
      return res.status(400).json({ error: "Phone number must be 11 digits" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res
        .status(400)
        .json({ error: "Email is already registered with another account" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, email, phoneNumber },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...userData } = updatedUser.toObject();

    res.status(200).json({
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Error in Update Profile API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({ error: "New password cannot be the same as the old password" });
    }

    if (
      newPassword.length < 8 ||
      !/^(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)
    ) {
      return res.status(400).json({
        error:
          "New password must be at least 8 characters long and include both letters and numbers",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in Reset Password API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const changeEmail = async (req, res) => {
  try {
    const { userId, currentPassword, newEmail } = req.body;

    if (!userId || !currentPassword || !newEmail) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid current password" });
    }

    const existingEmailUser = await User.findOne({ email: newEmail });
    if (existingEmailUser && existingEmailUser._id.toString() !== userId) {
      return res
        .status(400)
        .json({ error: "Email is already registered with another account" });
    }

    if (!validator.isEmail(newEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    user.email = newEmail;
    await user.save();

    res.status(200).json({
      message: "Email address updated successfully",
      user: { email: user.email },
    });
  } catch (error) {
    console.error("Error in Change Email API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  signUp,
  loginUser,
  updateUserProfile,
  resetPassword,
  changeEmail,
};
