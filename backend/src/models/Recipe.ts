import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import sequelize from '../database';


class Recipe extends Model<InferAttributes<Recipe>, InferCreationAttributes<Recipe>> {
    declare recipe_id: CreationOptional<number>;
    declare name: string;
    declare instructions: string | null;
    declare time_cooking: number | null;
    declare number_of_servings: number | null;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}


Recipe.init(
    {
        recipe_id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(256),
            allowNull: false,
        },
        instructions: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        time_cooking: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        number_of_servings: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'recipes',
    }
);

export default Recipe;
