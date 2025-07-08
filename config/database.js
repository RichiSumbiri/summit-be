import dotenv from "dotenv";
import tedious from "tedious";
import { Sequelize } from "sequelize";
dotenv.config();
tedious.Connection;

const { DB_HR, HR_HOST, HR_USER, HR_PASS } = process.env;


const db = new Sequelize(`${DB_HR}`, `${HR_USER}`, `${HR_PASS}`, {
  host: `${HR_HOST}`,
  port: 3306,
  dialect: "mysql",
  logging: false,
  timezone: "+07:00",
  dialectOptions: {
    timezone: "local",
  },
});


export default db;
