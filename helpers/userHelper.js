const User = require("../models/users/Users");
const { Op } = require("sequelize");

async function userExists(usernameOrEmail) {
    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: usernameOrEmail },
                    { username: usernameOrEmail }
                ]
            }
        });
        if (!user) {
            return null;
        }
        return user.dataValues;
    } catch (error) {
        console.error("Error checking user existence:", error);
        throw error;
    }
}

module.exports = {userExists}