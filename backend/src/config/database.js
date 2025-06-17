import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
dotenv.config();
export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true, 
    logging: false,
    entities: ['src/entities/*.js'],
  });

  export const connectDB = async () => {
    try {
        await AppDataSource.initialize();
        console.log('Database connected successfully!');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); 
    }
};