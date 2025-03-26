import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import  sequelize  from '../database';

class MealPlanRecipes extends Model<
    InferAttributes<MealPlanRecipes>,
    InferCreationAttributes<MealPlanRecipes>
> {
    declare id_meal_plan_recipe: CreationOptional<number>;
    declare meal_plan_id: number;
    declare recipe_id: number;
    declare day: number;
    // По диаграмме "meal_type" — целое число (либо meal_type_id)
    declare meal_type: number;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

MealPlanRecipes.init(
    {
        id_meal_plan_recipe: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        meal_plan_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        recipe_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        day: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        meal_type: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'meal_plan_recipes',
    }
);

export default MealPlanRecipes;
