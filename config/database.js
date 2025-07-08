import dotenv from "dotenv";
import tedious from "tedious";
import { Sequelize } from "sequelize";
dotenv.config();
tedious.Connection;

const { DB_NAME, DBHOST, USER, PASS } = process.env;


console.log(process.env.DBHOST)

const db = new Sequelize(DB_NAME, USER, PASS, {
  host: '192.168.6.83',
  port: 3306,
  dialect: "mysql",
  logging: false,
  timezone: "+07:00",
  dialectOptions: {
    timezone: "local",
  },
});


export default db;
