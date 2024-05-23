const express = require("express");
const task = require("../models/tasks/Tasks");
const taskComment = require("../models/tasks/TaskComments");
const {verifyToken} = require("../helpers/authToken");
const projectMember = require("../models/projects/ProjectMembers");
const teamMember = require("../models/teams/TeamMembers");
const taskRoutes = express.Router();

taskRoutes.get("/", (req, res) =>  {
    res.send("Welcome in the task section!");
});

taskRoutes.post("/create", verifyToken, async (req, res) => {
    const { taskFor, projectId, teamId, assignedTo } = req.body;

    if (taskFor === 'project' && !projectId) {
        return res.status(400).send("Project id is required");
    }

    if (taskFor === 'team' && !teamId) {
        return res.status(400).send("Team id is required");
    }

    try {
        const memberRecord = taskFor === 'project'
            ? await projectMember.findOne({ where: { userId: assignedTo, projectId } })
            : await teamMember.findOne({ where: { userId: assignedTo, teamId } });

        if (!memberRecord) {
            const errorMessage = taskFor === 'project'
                ? 'Project member not found. Please assign the task to a project member'
                : 'Team member not found. Please assign the task to a team member';
            return res.status(404).send(errorMessage);
        }

        const newTask = await task.create(req.body);
        return res.status(201).send(newTask);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send(error.message);
    }
});

taskRoutes.put("/update/:id", verifyToken, async (req, res) =>  {
    try{
        const task = await task.findOne({where: {id: req.params.id}});
        if(!task){
            return res.status(404).send("Task id does not exist");
        }
        const updatedTask = await task.update(req.body, {where: {id: req.params.id}});
        return res.status(200).send(updatedTask);
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
});

taskRoutes.get("/myTasks", verifyToken, async (req, res) =>  {
    try{
        const projectMembers = await projectMember.findAll({where: {userId: req.user.id}});
        const projectIds = projectMembers.map(projectMember => projectMember.projectId);
        const teamMembers = await teamMember.findAll({where: {userId: req.user.id}});
        const teamIds = teamMembers.map(teamMember => teamMember.teamId);
        const tasks = await task.findAll({where: {$or: [{projectId: projectIds}, {teamId: teamIds}]}});
        return res.status(200).send(tasks);
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
});

taskRoutes.get("/:id", verifyToken, async (req, res) =>  {
    try{
        const task = await task.findOne({where: {id: req.params.id}});
        if(!task){
            return res.status(404).send("Task id does not exist");
        }
        return res.status(200).send(task);
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
})

taskRoutes.post("/:id/comment", verifyToken, async (req, res) =>  {
    try{
        const task = await task.findOne({where: {id: req.params.id}});
        if(!task){
            return res.status(404).send("Task id does not exist");
        }
        const newComment = await taskComment.create(req.body);
        return res.status(201).send(newComment);
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
})

taskRoutes.get("/filter/:status", verifyToken, async (req, res) =>  {
    try{
        const projectMembers = await projectMember.findAll({where: {userId: req.user.id}});
        const projectIds = projectMembers.map(projectMember => projectMember.projectId);
        const teamMembers = await teamMember.findAll({where: {userId: req.user.id}});
        const teamIds = teamMembers.map(teamMember => teamMember.teamId);
        const tasks = await task.findAll({where: {$or: [{projectId: projectIds}, {teamId: teamIds}], status: req.params.status}});
        return res.status(200).send(tasks);
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
})


taskRoutes.get("/search/:query", verifyToken, async (req, res) =>  {
    try{
        const projectMembers = await projectMember.findAll({where: {userId: req.user.id}});
        const projectIds = projectMembers.map(projectMember => projectMember.projectId);
        const teamMembers = await teamMember.findAll({where: {userId: req.user.id}});
        const teamIds = teamMembers.map(teamMember => teamMember.teamId);
        const tasks = await task.findAll({where: {$or: [{projectId: projectIds}, {teamId: teamIds}], $or: [{title: { $like: `%${req.params.query}%`}}, {description: { $like: `%${req.params.query}%`}}]}});
        return res.status(200).send(tasks);
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
})




module.exports = {taskRoutes}