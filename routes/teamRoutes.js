const express = require("express");
const team = require("../models/teams/Teams");
const teamMember = require("../models/teams/TeamMembers");
const {verifyToken} = require("../helpers/authToken");
const teamRoutes = express.Router();

teamRoutes.get("/", (req, res) =>  {
    res.send("Welcome in the team section!");
});

teamRoutes.post("/create", verifyToken, async (req, res) =>  {
    const transaction = await team.sequelize.transaction();
    try{
        if(!req.user){
            await transaction.rollback();
            return res.status(req.statusCode).send(req.message);
        }
        const user = await team.sequelize.models.User.findOne({where: {username: req.user.username}, transaction});
        if(!user){
            await transaction.rollback();
            return res.status(404).send("User id does not exist");
        } else if(user.profile !== 'team manager'){
            await transaction.rollback();
            return res.status(403).send("User is not a team manager");
        }
        req.body.teamManagerId = user.dataValues.id;
        const newTeam = await team.create(req.body, {transaction});
        await teamMember.create({
            userId: req.body.teamManagerId,
            teamId: newTeam.id,
            profile: 'team manager'
        }, {transaction});
        await transaction.commit();
        return res.status(201).send(newTeam);
    }catch(error){
        await transaction.rollback();
        console.log(error);
        return res.status(500).send(error);
    }
});

teamRoutes.get("/:id", verifyToken, async (req, res) =>  {
    try{
        if(!req.user){
            return res.status(req.statusCode).send(req.message);
        }
        const teamById = await team.findAll({where: {id: req.params.id}});
        console.log(teamById);
        return res.status(200).send(teamById);
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
});

teamRoutes.get("/all", verifyToken, async (req, res) =>  {
    try{
        if(!req.user){
            return res.status(req.statusCode).send(req.message);
        }
        const teams = await team.findAll({attributes: ['id', 'name']});
        return res.status(200).json(teams);
    }catch(error){
        return res.status(500).send(error.message);
    }
});

teamRoutes.get("/my", verifyToken, async (req, res) =>  {
    console.log("inside my");
    try{
        console.log("req.user");
        const user = await team.sequelize.models.User.findOne({where: {username: req.user.username}});
        if(!user){
            return res.status(404).send("User id does not exist");
        }
        console.log((user.dataValues.id));
        const teamMembers = await teamMember.findAll({where: {userId: user.dataValues.id}});
        console.log(teamMembers);
        const teamIds = teamMembers.map(teamMember => teamMember.teamId);
        console.log(teamIds);
        const teams = await team.findAll({where: {id: {[Op.or]: teamIds}}, attributes: ['name']});
        return res.status(200).send(teams);
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
});


teamRoutes.post("/join/:teamId", verifyToken, async (req, res) =>  {
    try{
        console.log(req.user);
        const user = await team.sequelize.models.User.findOne({where: {username: req.user.username}});
        if(!user){
            return res.status(404).send("User id does not exist");
        }
        const teamMembers = await teamMember.findAll({where: {userId: user.dataValues.id, teamId: req.params.teamId}});
        if(teamMembers.length === 0){
            await teamMember.create({
                userId: user.dataValues.id,
                teamId: req.params.teamId,
                profile: 'member'
            });
        }
        return res.status(200).send("Team joined successfully");
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
});

module.exports = {teamRoutes}