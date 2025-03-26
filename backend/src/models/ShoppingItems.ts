import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import  sequelize  from '../database';

class ShoppingItems extends Model<
    InferAttributes<ShoppingItems>,
    InferCreationAttributes<ShoppingItems>
> {
    declare shopping_item_id: CreationOptional<number>;
    declare shopping_list_id: number;
    declare ingredient_id: number;
    declare quantity: number;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

ShoppingItems.init(
    {
        shopping_item_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        shopping_list_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ingredient_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'shopping_items',
    }
);

export default ShoppingItems;
