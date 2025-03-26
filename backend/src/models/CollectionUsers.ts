import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import  sequelize  from '../database';

class CollectionUsers extends Model<
    InferAttributes<CollectionUsers>,
    InferCreationAttributes<CollectionUsers>
> {
    declare collection_users_id: CreationOptional<number>;
    declare user_id: number;
    declare collection_id: number;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

CollectionUsers.init(
    {
        collection_users_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        collection_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        tableName: 'collection_users',
    }
);

export default CollectionUsers;
