import dotenv from 'dotenv';
dotenv.config();
 
import Hapi from '@hapi/hapi';
import { AppDataSource } from './config/database.js';
 
const init = async () => {
    const server = Hapi.server({
      port: process.env.PORT ,
      host: process.env.DB_HOST,
    });
 
    try {
      await AppDataSource.initialize();
      console.log('Data Source initialized');
      await server.start();
      console.log(`Server running at: ${server.info.uri}`);
    } catch (error) {
      console.error('Failed to initialize Data Source or start server:', error);
    }
  };
 
  init();
 