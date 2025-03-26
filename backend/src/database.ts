import { Sequelize} from 'sequelize';
import dotenv from 'dotenv';


dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5433', 10),
        dialect: 'postgres',
        logging: true,
    }
);

sequelize.authenticate()
    .then(() => {
        console.log('Sequelize Connected');
    })
    .catch((err) => {
        console.error(err)
    });



export default sequelize;