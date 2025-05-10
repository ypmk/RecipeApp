import { Model, DataTypes, CreationOptional } from 'sequelize';
import sequelize from '../database';
import {ShoppingLists} from "./index";

class UserProducts extends Model {
    declare id: CreationOptional<number>;
    declare shopping_list_id: number;
    declare name: string;
    declare quantity: number;
    declare unit: string;
    declare bought: boolean;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

UserProducts.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    shopping_list_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 1 },
    unit: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    bought: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    sequelize,
    tableName: 'user_products',
});

UserProducts.belongsTo(ShoppingLists, { foreignKey: 'shopping_list_id' });

export default UserProducts;
