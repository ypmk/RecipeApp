import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import sequelize from '../database';
import Recipe from './Recipe';

class RecipeImage extends Model<InferAttributes<RecipeImage>, InferCreationAttributes<RecipeImage>> {
    declare id: CreationOptional<number>;
    declare recipe_id: number;
    declare image_path: string;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

RecipeImage.init(
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        recipe_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: Recipe,
                key: 'recipe_id',
            },
            onDelete: 'CASCADE',
        },
        image_path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'recipe_images',
    }
);

export default RecipeImage;
