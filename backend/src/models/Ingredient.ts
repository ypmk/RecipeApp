import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import sequelize from '../database';

class Ingredient extends Model<InferAttributes<Ingredient>, InferCreationAttributes<Ingredient>> {
    declare ingredient_id: CreationOptional<number>;
    declare name: string;
    declare user_id: number;
    declare RecipesIngredients?: {
        quantity: number;
        unit_id: number;
    };

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Ingredient.init(
    {
        ingredient_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'ingredients',
    }
);

export default Ingredient;
