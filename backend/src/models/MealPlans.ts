import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import  sequelize  from '../database';

class MealPlans extends Model<
    InferAttributes<MealPlans>,
    InferCreationAttributes<MealPlans>
> {
    declare meal_plan_id: CreationOptional<number>;
    declare user_id: number;
    declare name: string;
    declare number_of_meals_per_day: number;
    declare total_days: number;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

MealPlans.init(
    {
        meal_plan_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        number_of_meals_per_day: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total_days: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'meal_plans',
    }
);

export default MealPlans;
