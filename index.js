const express = require("express");

const app = express();
app.use(express.json());
app.use("/jiraclone/tut", require("./routes/get"));

app.listen(8000);
