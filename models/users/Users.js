const { DataTypes } = require('sequelize');
const {sequelize} = require('../../config/databaseConfig');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: 'Please enter a valid email address'
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    profile: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'team member',
        validate: {
            isIn: {
                args: [['project manager', 'team manager', 'member']],
                msg: 'Profile must be either project manager or team member'
            }
        }
    }
});

module.exports = User;
