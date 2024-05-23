const { DataTypes } = require('sequelize');
const {sequelize} = require('../../config/databaseConfig');

const teamMember = sequelize.define('TeamMember', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Teams',
            key: 'id'
        }
    },
    profile: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'team member',
        validate: {
            isIn: {
                args: [['team manager', 'member']],
                msg: 'Profile must be either team manager or team member'
            }
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
});

module.exports = teamMember;