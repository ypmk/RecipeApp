import {Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute, DataTypes} from 'sequelize';
import sequelize from "../database";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>;
    declare username: string;
    declare password: string;
    declare role: string;
    declare age: NonAttribute<string>;
    declare identifier: string;


    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

User.init(
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        identifier: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'users'
    }
)

export default User;