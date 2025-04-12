import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import  sequelize  from '../database';

class ShoppingLists extends Model<
    InferAttributes<ShoppingLists>,
    InferCreationAttributes<ShoppingLists>
> {
    declare shopping_list_id: CreationOptional<number>;
    declare user_id: number;
    declare name: string;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

ShoppingLists.init(
    {
        shopping_list_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'shopping_lists',
    }
);

export default ShoppingLists;
