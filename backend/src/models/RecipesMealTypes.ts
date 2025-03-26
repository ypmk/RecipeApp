import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import  sequelize  from '../database';

class RecipesMealTypes extends Model<
    InferAttributes<RecipesMealTypes>,
    InferCreationAttributes<RecipesMealTypes>
> {
    declare id_recipe_mealtype: CreationOptional<number>;
    declare recipe_id: number;
    declare meal_type_id: number;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

RecipesMealTypes.init(
    {
        id_recipe_mealtype: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        recipe_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        meal_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'recipes_mealtypes',
    }
);

export default RecipesMealTypes;
