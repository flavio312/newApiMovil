import {Model, DataTypes} from 'sequelize';
import sequelize from "../config/db"

class User extends Model{}

User.init({
    id_User: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    sequelize,
    modelName: 'User',
    tableName: 'User',
    timestamps: false,
});

export default User;