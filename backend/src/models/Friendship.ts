import sequelize from '../database';
import User from "./User";
import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
} from 'sequelize';

class Friendship extends Model<InferAttributes<Friendship>, InferCreationAttributes<Friendship>> {
    declare id: CreationOptional<number>;
    declare requesterId: ForeignKey<User['id']>;
    declare receiverId: ForeignKey<User['id']>;
    declare status: 'pending' | 'accepted' | 'rejected';

    // Для `include` в findAll
    declare Requester?: User;
    declare Receiver?: User;
}

Friendship.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        requesterId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        receiverId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
            defaultValue: 'pending',
        },
    },
    {
        sequelize,
        modelName: 'Friendship',
        tableName: 'friendships',
    }
);


Friendship.belongsTo(User, { foreignKey: 'requesterId', as: 'Requester' });
Friendship.belongsTo(User, { foreignKey: 'receiverId', as: 'Receiver' });


export default Friendship;
