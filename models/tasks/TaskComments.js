const { DataTypes } = require('sequelize');
const {sequelize} = require('../../config/databaseConfig');

const taskComment = sequelize.define('TaskComment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Tasks',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = taskComment;