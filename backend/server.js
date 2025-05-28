const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/routines", require("./routes/routines"));
app.use("/api/social", require("./routes/social"));
app.use("/api/nutrition", require("./routes/nutrition"));
app.use("/api/ai", require("./routes/ai"))

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
