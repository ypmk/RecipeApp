import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
} from 'sequelize';
import sequelize from '../database';

class CookingTime extends Model<
    InferAttributes<CookingTime>,
    InferCreationAttributes<CookingTime>
> {
    declare id: CreationOptional<number>;
    declare label: string;
}


CookingTime.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'cooking_times',
        timestamps: false,
    }
);

export default CookingTime;
