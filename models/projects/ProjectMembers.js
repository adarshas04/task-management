const { DataTypes } = require('sequelize');
const {sequelize} = require('../../config/databaseConfig');

const projectMember = sequelize.define('ProjectMember', {
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
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Projects',
            key: 'id'
        }
    },
    profile: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'team member',
        validate: {
            isIn: {
                args: [['project manager', 'member']],
                msg: 'Profile must be either project manager or member'
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

module.exports = projectMember;