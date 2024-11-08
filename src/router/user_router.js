const express = require("express");
const userRouter = express.Router();
const {
  signUp,
  loginUser,
  updateUserProfile,
  resetPassword,
  changeEmail,
} = require("../controllers/user_controller");

// api
userRouter.post("/SignUp", signUp);
userRouter.post("/login", loginUser);
userRouter.put("/change-email", changeEmail);
userRouter.put("/reset-password", resetPassword);
userRouter.put("/update-profile/:id", updateUserProfile);

module.exports = userRouter;
