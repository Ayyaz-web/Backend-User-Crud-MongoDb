const userRouter = require("./router/user_router");
const dotenv = require("dotenv");
const connectDb = require("./database/mongodb");
const express = require("express");
const app = express();
const PORT = 3000;

dotenv.config();
app.use(express.json());

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server is running on port:", PORT);
  connectDb()
    .then(() => console.log("Database Connected Successfully"))
    .catch((e) => console.log("Error", e));
});

app.use("/api/user", userRouter);
