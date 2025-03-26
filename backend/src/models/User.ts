import { Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    // 'CreationOptional' is a special type that marks the field as optional
    // when creating an instance of the model (such as using Model.create()).
    declare id: CreationOptional<number>;
    declare username: string;
    declare password: string;
    declare role: string;
    declare age: NonAttribute<string>;

    // createdAt can be undefined during creation
    declare createdAt: CreationOptional<Date>;
    // updatedAt can be undefined during creation
    declare updatedAt: CreationOptional<Date>;
}

export default User;