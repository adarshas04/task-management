const express = require("express");
const {sequelize} = require('./config/databaseConfig');
const {userRoutes} = require("./routes/userRoutes");
const {teamRoutes} = require("./routes/teamRoutes");
const {projectRoutes} = require("./routes/projectRoutes");
const {taskRoutes} = require("./routes/taskRoutes");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbConnectionAndServerInitiation = async () => {
    try {
        await sequelize.authenticate();
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};

dbConnectionAndServerInitiation();

app.get("/", (req, res) =>  {
    res.send("Welcome in the task management section!");
});

app.use("/user", userRoutes);
app.use("/team", teamRoutes);
app.use("/project", projectRoutes);
app.use("/task", taskRoutes);