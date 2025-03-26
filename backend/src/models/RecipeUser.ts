import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import sequelize from '../database';

class RecipeUser extends Model<InferAttributes<RecipeUser>, InferCreationAttributes<RecipeUser>> {
    declare id_recipe_user: CreationOptional<number>;
    declare user_id: number;
    declare recipe_id: number;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

RecipeUser.init(
    {
        id_recipe_user: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        recipe_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'recipes',
                key: 'recipe_id',
            },
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'recipe_user',
    }
);

export default RecipeUser;
