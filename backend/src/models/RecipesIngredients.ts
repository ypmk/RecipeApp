import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import sequelize from '../database';

class RecipesIngredients extends Model<
    InferAttributes<RecipesIngredients>,
    InferCreationAttributes<RecipesIngredients>
> {
    declare id_recipe_ingredient: CreationOptional<number>;
    declare recipe_id: number;
    declare ingredient_id: number;
    declare quantity: number;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

RecipesIngredients.init(
    {
        id_recipe_ingredient: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        recipe_id: {
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
        tableName: 'recipes_ingredients',
    }
);

export default RecipesIngredients;
