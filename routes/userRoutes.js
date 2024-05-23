const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const User = require("../models/users/Users");
const {verifyToken} = require("../helpers/authToken");
const { userExists } = require("../helpers/userHelper");
const userRoutes = express.Router();

userRoutes.get("/", (req, res) =>  {
    res.send("Welcome in the user section!");
});

userRoutes.post("/register", async (req, res) =>  {
    try{
        const existingUser = await userExists(req.body.email);
        if(!existingUser){
            const hashedPassword = await bcrypt.hash(req.body.password, 8);
            const user = {
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                profile: req.body.profile,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            const insertedUser = await User.create(user);
            return res.status(201).send(insertedUser);
        }else{
            return res.status(409).send("User already exists");
        }
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
});

userRoutes.post("/login", async (req, res) =>  {
    try{
        userExists(req.body.usernameOrEmail)
            .then(async (user) => {
                console.log(user);
                const passwordMatch = await bcrypt.compare(req.body.password, user.password);
                if(!passwordMatch){
                    return res.status(401).send("Invalid password");
                }
                const token = jwt.sign({username: user.username, email: user.email, profile: user.profile}, process.env.JWT_SECRET, {expiresIn: "1h"});
                return res.status(200).send({user, token});
            })
            .catch((error) => {
                console.log(error);
                return res.status(401).send("Invalid username/email");
            })
    }catch(error){
        console.log(error);
        return res.status(500).send(error.message);
    }
});

userRoutes.get("/aboutMe", verifyToken, async (req, res) =>  {
    try{
        if(req.user){
            return res.status(200).send(req.user);
        }else{
            return res.status(req.statusCode).send(req.message);
        }
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
});

userRoutes.put("/updateInfo", verifyToken, async (req, res) =>  {
    try{
        console.log(req.user);
        if(req.user){
            const user = await userExists(req.user.username);
            const updatedUser = await User.update(req.body, {where: {id: user.id}});
            return res.status(200).send(updatedUser);
        }else{
            return res.status(req.statusCode).send(req.message);
        }
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
});

userRoutes.post("/logout", verifyToken, async (req, res) =>  {
    try{
        if(req.user){
            //https://medium.com/@byeduardoac/managing-jwt-token-expiration-bfb2bd6ea584
            const token = req.headers.authorization.split(' ')[1];
            const tokenBody = jwt.verify(token, process.env.JWT_SECRET);
            tokenBody.exp = Date.now();
            return res.status(200).clearCookie("jwt").send("Logout successful");
        }else{
            return res.status(req.statusCode).send(req.message);
        }
    }catch(error){
        console.log(error.message);
        return res.status(500).send(error.message);
    }
})

//ToDo Implement change password and generate a new token and delete the old token.
//ToDo Implement username changes and generate a new token.
//ToDo Maybe maintain a separate table to check tokens for a user id and maintain a valid flag for them.
module.exports = {userRoutes}