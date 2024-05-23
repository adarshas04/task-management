const express = require("express");
const project = require("../models/projects/Projects");
const projectMember = require("../models/projects/ProjectMembers");
const {verifyToken} = require("../helpers/authToken");
const projectRoutes = express.Router();

projectRoutes.get("/", (req, res) =>  {
    res.send("Welcome in the project section!");
});
//ToDo Add transaction control and rollback on errors for all operations
projectRoutes.post("/create", verifyToken, async (req, res) =>  {
    const transaction = await project.sequelize.transaction();
    try {
        const user = await project.sequelize.models.User.findOne({where: {username: req.user.username}, transaction});
        if(!user){
            return res.status(404).send("User id does not exist");
        }else if(user.profile !== 'project manager'){
            return res.status(403).send("User is not a project manager");
        }
        req.body.projectManagerId = user.dataValues.id;
        const newProject = await project.create(req.body, {transaction});
        await projectMember.create({
            userId: req.body.projectManagerId,
            teamId: newProject.id,
            profile: user.profile
        }, {transaction});
        await transaction.commit();
        return res.status(201).send(newProject);
    } catch (error) {
        await transaction.rollback();
        console.log(error.message);
        return res.status(500).send(error.message);
    }
});

projectRoutes.get("/all", verifyToken, async (req, res) =>  {
    try{
        const projects = await project.findAll();
        return res.status(200).send(projects);
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
})

projectRoutes.get("/myProjects", verifyToken, async (req, res) =>  {
    try{
        const projectMembers = await projectMember.findAll({where: {userId: req.user.id}});
        const projectIds = projectMembers.map(projectMember => projectMember.projectId);
        const projects = await team.findAll({where: {id: projectIds}, attributes: ['name','description']});
        return res.status(200).send(projects);
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
})


projectRoutes.get("/join/:projectId", verifyToken, async (req, res) =>  {
    try{
        const projectMembers = await projectMember.findAll({where: {userId: req.user.id, projectId: req.params.projectId}});
        if(projectMembers.length === 0){
            await projectMember.create({
                userId: req.user.id,
                teamId: req.params.teamId,
                profile: 'member'
            });
        }
        return res.status(200).send("Project joined successfully");
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
})

module.exports = {projectRoutes}