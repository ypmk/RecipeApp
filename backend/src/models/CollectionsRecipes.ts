import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import  sequelize  from '../database';

class CollectionsRecipes extends Model<
    InferAttributes<CollectionsRecipes>,
    InferCreationAttributes<CollectionsRecipes>
> {
    declare id_collection_recipe: CreationOptional<number>;
    declare collection_id: number;
    declare recipe_id: number;
}

CollectionsRecipes.init(
    {
        id_collection_recipe: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        collection_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        recipe_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'collections_recipes',
        timestamps: true,
    }
);

export default CollectionsRecipes;
