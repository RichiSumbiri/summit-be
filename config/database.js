import dotenv from "dotenv";
import tedious from "tedious";
import { Sequelize } from "sequelize";
dotenv.config();
tedious.Connection;

const { DB_NAME, DB_HOST, DB_USER, DB_PASS } = process.env;


const db = new Sequelize(`${DB_NAME}`, `${DB_USER}`, `${DB_PASS}`, {
  host: `${DB_HOST}`,
  port: 3306,
  dialect: "mysql",
  logging: false,
  timezone: "+07:00",
  dialectOptions: {
    timezone: "local",
  },
});


export default db;
